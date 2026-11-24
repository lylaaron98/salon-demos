<?php
/**
 * Renders the multi-step enquiry form. Shared by the Elementor widget, the shortcode and the block.
 *
 * Progressive enhancement: without JavaScript every step is visible and the form posts to
 * admin-post.php (FallbackHandler). With JavaScript (assets/js/enquiry-form.js) it becomes a
 * stepper that loads live availability and submits to the REST endpoint.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Frontend;

use SalonBookingEnquiry\Availability\SlotGenerator;
use SalonBookingEnquiry\Data\Catalogue;
use SalonBookingEnquiry\Enquiry\EnquiryService;

defined( 'ABSPATH' ) || exit;

/**
 * Form markup.
 *
 * @phpstan-type FormConfig array{brand: string, outlets: list<string>, services: list<string>, heading: string, intro: string, submit_label: string, show_schedule: bool, ask_email: bool, form_id: string}
 */
final class FormRenderer {

	/**
	 * Running counter so several forms on one page get unique ids.
	 *
	 * @var int
	 */
	private static int $instance = 0;

	/**
	 * Defaults.
	 *
	 * @return FormConfig
	 */
	public static function defaults(): array {
		return array(
			'brand'         => 'sable',
			'outlets'       => array(),
			'services'      => array(),
			'heading'       => __( 'Send an enquiry', 'salon-booking-enquiry' ),
			'intro'         => __( "Tell us what you're after and we'll WhatsApp you within 1 working hour.", 'salon-booking-enquiry' ),
			'submit_label'  => __( 'Send enquiry', 'salon-booking-enquiry' ),
			'show_schedule' => true,
			'ask_email'     => false,
			'form_id'       => 'enquiry',
		);
	}

	/**
	 * Normalise loose input (shortcode attributes, block attributes, widget settings).
	 *
	 * @param array<string, mixed> $raw Raw config.
	 * @return FormConfig
	 */
	public static function normalise( array $raw ): array {
		$config = self::defaults();
		$list   = static function ( $value ): array {
			if ( is_string( $value ) ) {
				$value = explode( ',', $value );
			}
			if ( ! is_array( $value ) ) {
				return array();
			}
			return array_values( array_filter( array_map( static fn( $v ): string => is_scalar( $v ) ? sanitize_key( (string) $v ) : '', $value ) ) );
		};
		$bool   = static fn( $value, bool $fallback ): bool => null === $value ? $fallback : filter_var( $value, FILTER_VALIDATE_BOOLEAN );

		$brand              = isset( $raw['brand'] ) && is_string( $raw['brand'] ) ? sanitize_key( $raw['brand'] ) : $config['brand'];
		$config['brand']    = null !== Catalogue::brand( $brand ) ? $brand : $config['brand'];
		$config['outlets']  = $list( $raw['outlets'] ?? array() );
		$config['services'] = $list( $raw['services'] ?? array() );
		foreach ( array( 'heading', 'intro', 'submit_label' ) as $key ) {
			if ( isset( $raw[ $key ] ) && is_string( $raw[ $key ] ) ) {
				$config[ $key ] = sanitize_text_field( $raw[ $key ] );
			}
		}
		$config['submit_label']  = '' === $config['submit_label'] ? self::defaults()['submit_label'] : $config['submit_label'];
		$config['show_schedule'] = $bool( $raw['show_schedule'] ?? null, true );
		$config['ask_email']     = $bool( $raw['ask_email'] ?? null, false );
		$form_id                 = isset( $raw['form_id'] ) && is_string( $raw['form_id'] ) ? sanitize_key( $raw['form_id'] ) : '';
		$config['form_id']       = '' === $form_id ? 'enquiry' : $form_id;
		return $config;
	}

	/**
	 * Render to a string and enqueue assets.
	 *
	 * @param array<string, mixed> $raw Raw config.
	 */
	public static function render( array $raw ): string {
		$config   = self::normalise( $raw );
		$brand    = Catalogue::brand( $config['brand'] );
		$outlets  = Catalogue::outlets( $config['brand'], $config['outlets'] );
		$services = Catalogue::services( $config['brand'], $config['services'] );
		if ( null === $brand || array() === $outlets ) {
			return '';
		}

		Assets::enqueue_form();
		++self::$instance;
		$uid = 'sbe-' . $config['form_id'] . '-' . self::$instance;

		// Preselect an outlet arriving from an outlet page (?outlet=sable-tanjong-pagar).
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only preselection.
		$preselect = isset( $_GET['outlet'] ) ? sanitize_key( wp_unslash( $_GET['outlet'] ) ) : '';
		if ( ! isset( $outlets[ $preselect ] ) ) {
			$preselect = 1 === count( $outlets ) ? (string) array_key_first( $outlets ) : '';
		}

		$flash = FallbackHandler::flash();

		$steps = array( 'outlet' => __( 'Outlet', 'salon-booking-enquiry' ) );
		if ( array() !== $services ) {
			$steps['service'] = __( 'Service', 'salon-booking-enquiry' );
		}
		if ( $config['show_schedule'] ) {
			$steps['time'] = __( 'Date and time', 'salon-booking-enquiry' );
		}
		$steps['details'] = __( 'Your details', 'salon-booking-enquiry' );

		$client = array(
			'formId'       => $config['form_id'],
			'brand'        => $config['brand'],
			'brandName'    => $brand['name'],
			'whatsapp'     => $brand['whatsapp'],
			'showSchedule' => $config['show_schedule'],
			'steps'        => array_keys( $steps ),
			'stepLabels'   => array_values( $steps ),
			'services'     => array_map(
				static fn( array $s ): array => array(
					'id'       => $s['id'],
					'duration' => $s['duration'],
					'price'    => $s['price_from'],
				),
				array_values( $services )
			),
		);

		ob_start();
		?>
		<div class="sbe-form" id="<?php echo esc_attr( $uid ); ?>" data-sbe-form data-config="<?php echo esc_attr( (string) wp_json_encode( $client ) ); ?>">
			<?php if ( null !== $flash && 'sent' === $flash['status'] ) : ?>
				<div class="sbe-success" role="status" tabindex="-1">
					<h3 class="sbe-success__title"><?php esc_html_e( 'Thanks. Your enquiry is in.', 'salon-booking-enquiry' ); ?></h3>
					<p><?php echo esc_html( $flash['message'] ); ?></p>
				</div>
			<?php else : ?>
			<form class="sbe-form__form" method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>" novalidate aria-labelledby="<?php echo esc_attr( $uid ); ?>-title">
				<h2 class="sbe-form__title" id="<?php echo esc_attr( $uid ); ?>-title"><?php echo esc_html( $config['heading'] ); ?></h2>
				<?php if ( '' !== $config['intro'] ) : ?>
					<p class="sbe-form__intro"><?php echo esc_html( $config['intro'] ); ?></p>
				<?php endif; ?>

				<?php if ( null !== $flash && '' !== $flash['message'] ) : ?>
					<div class="sbe-form__alert" role="alert"><?php echo esc_html( $flash['message'] ); ?></div>
				<?php endif; ?>

				<ol class="sbe-progress" data-sbe-progress hidden>
					<?php foreach ( $steps as $key => $label ) : ?>
						<li class="sbe-progress__step" data-step="<?php echo esc_attr( $key ); ?>"><span><?php echo esc_html( $label ); ?></span></li>
					<?php endforeach; ?>
				</ol>
				<p class="sbe-progress__text" data-sbe-progress-text hidden></p>

				<input type="hidden" name="action" value="<?php echo esc_attr( FallbackHandler::ACTION ); ?>">
				<input type="hidden" name="brand" value="<?php echo esc_attr( $config['brand'] ); ?>">
				<input type="hidden" name="form_id" value="<?php echo esc_attr( $config['form_id'] ); ?>">
				<input type="hidden" name="redirect_to" value="<?php echo esc_url( self::current_url() . '#' . $uid ); ?>">
				<?php wp_nonce_field( FallbackHandler::ACTION, '_sbe_nonce' ); ?>

				<fieldset class="sbe-step" data-step="outlet">
					<legend class="sbe-step__title" tabindex="-1"><?php esc_html_e( 'Which outlet suits you?', 'salon-booking-enquiry' ); ?></legend>
					<div class="sbe-cards" data-field="outlet">
						<?php foreach ( $outlets as $outlet ) : ?>
							<label class="sbe-card">
								<input type="radio" name="outlet" value="<?php echo esc_attr( $outlet['id'] ); ?>" <?php checked( $preselect, $outlet['id'] ); ?> required>
								<span class="sbe-card__body">
									<span class="sbe-card__title"><?php echo esc_html( $outlet['name'] ); ?></span>
									<span class="sbe-card__meta"><?php echo esc_html( $outlet['street'] ); ?></span>
									<span class="sbe-card__meta"><?php echo esc_html( $outlet['mrt'] ); ?></span>
								</span>
							</label>
						<?php endforeach; ?>
					</div>
					<?php self::error_slot( $uid, 'outlet', $flash ); ?>
				</fieldset>

				<?php if ( array() !== $services ) : ?>
					<fieldset class="sbe-step" data-step="service">
						<legend class="sbe-step__title" tabindex="-1"><?php esc_html_e( 'What would you like?', 'salon-booking-enquiry' ); ?></legend>
						<div class="sbe-cards sbe-cards--list" data-field="service">
							<?php foreach ( $services as $service ) : ?>
								<label class="sbe-card sbe-card--row">
									<input type="radio" name="service" value="<?php echo esc_attr( $service['id'] ); ?>">
									<span class="sbe-card__body">
										<span class="sbe-card__title"><?php echo esc_html( $service['name'] ); ?></span>
										<span class="sbe-card__meta">
											<?php
											echo esc_html(
												sprintf(
													/* translators: %d: minutes. */
													__( '%d min', 'salon-booking-enquiry' ),
													$service['duration']
												)
											);
											?>
										</span>
									</span>
									<span class="sbe-card__price"><?php echo esc_html( self::price( $service['price_from'] ) ); ?></span>
								</label>
							<?php endforeach; ?>
							<label class="sbe-card sbe-card--row">
								<input type="radio" name="service" value="" checked>
								<span class="sbe-card__body"><span class="sbe-card__title"><?php esc_html_e( 'Not sure yet', 'salon-booking-enquiry' ); ?></span></span>
							</label>
						</div>
						<p class="sbe-note"><?php esc_html_e( 'Prices include 9% GST. You pay at the outlet.', 'salon-booking-enquiry' ); ?></p>
						<?php self::error_slot( $uid, 'service', $flash ); ?>
					</fieldset>
				<?php endif; ?>

				<?php if ( $config['show_schedule'] ) : ?>
					<fieldset class="sbe-step" data-step="time">
						<legend class="sbe-step__title" tabindex="-1"><?php esc_html_e( 'Pick a date and time', 'salon-booking-enquiry' ); ?></legend>
						<p class="sbe-note"><?php esc_html_e( 'Optional. We will confirm the exact time with you.', 'salon-booking-enquiry' ); ?></p>
						<div class="sbe-schedule" data-sbe-schedule></div>
						<div class="sbe-schedule-fallback" data-sbe-schedule-fallback>
							<?php self::schedule_fallback( $uid ); ?>
						</div>
						<?php self::error_slot( $uid, 'time', $flash ); ?>
					</fieldset>
				<?php endif; ?>

				<fieldset class="sbe-step" data-step="details">
					<legend class="sbe-step__title" tabindex="-1"><?php esc_html_e( 'Your details', 'salon-booking-enquiry' ); ?></legend>

					<div class="sbe-field" data-field="first_name">
						<label for="<?php echo esc_attr( $uid ); ?>-first_name"><?php esc_html_e( 'First name', 'salon-booking-enquiry' ); ?></label>
						<input id="<?php echo esc_attr( $uid ); ?>-first_name" name="first_name" type="text" autocomplete="given-name" maxlength="50" required aria-describedby="<?php echo esc_attr( $uid ); ?>-first_name-error" value="<?php echo esc_attr( self::old( $flash, 'first_name' ) ); ?>">
						<?php self::error_slot( $uid, 'first_name', $flash ); ?>
					</div>

					<div class="sbe-field" data-field="mobile">
						<label for="<?php echo esc_attr( $uid ); ?>-mobile"><?php esc_html_e( 'Mobile number', 'salon-booking-enquiry' ); ?></label>
						<p class="sbe-field__help" id="<?php echo esc_attr( $uid ); ?>-mobile-help"><?php esc_html_e( "We'll WhatsApp or SMS you.", 'salon-booking-enquiry' ); ?></p>
						<div class="sbe-prefix">
							<span class="sbe-prefix__label" aria-hidden="true">+65</span>
							<input id="<?php echo esc_attr( $uid ); ?>-mobile" name="mobile" type="tel" inputmode="tel" autocomplete="tel-national" maxlength="14" required aria-describedby="<?php echo esc_attr( $uid ); ?>-mobile-help <?php echo esc_attr( $uid ); ?>-mobile-error" value="<?php echo esc_attr( self::old( $flash, 'mobile' ) ); ?>">
						</div>
						<?php self::error_slot( $uid, 'mobile', $flash ); ?>
					</div>

					<?php if ( $config['ask_email'] ) : ?>
						<div class="sbe-field" data-field="email">
							<label for="<?php echo esc_attr( $uid ); ?>-email"><?php esc_html_e( 'Email (optional)', 'salon-booking-enquiry' ); ?></label>
							<p class="sbe-field__help" id="<?php echo esc_attr( $uid ); ?>-email-help"><?php esc_html_e( 'For your receipt and reminders.', 'salon-booking-enquiry' ); ?></p>
							<input id="<?php echo esc_attr( $uid ); ?>-email" name="email" type="email" autocomplete="email" maxlength="254" aria-describedby="<?php echo esc_attr( $uid ); ?>-email-help <?php echo esc_attr( $uid ); ?>-email-error" value="<?php echo esc_attr( self::old( $flash, 'email' ) ); ?>">
							<?php self::error_slot( $uid, 'email', $flash ); ?>
						</div>
					<?php endif; ?>

					<div class="sbe-field" data-field="message">
						<label for="<?php echo esc_attr( $uid ); ?>-message"><?php esc_html_e( 'Anything we should know? (optional)', 'salon-booking-enquiry' ); ?></label>
						<textarea id="<?php echo esc_attr( $uid ); ?>-message" name="message" rows="3" maxlength="1000" aria-describedby="<?php echo esc_attr( $uid ); ?>-message-error"><?php echo esc_textarea( self::old( $flash, 'message' ) ); ?></textarea>
						<?php self::error_slot( $uid, 'message', $flash ); ?>
					</div>

					<div class="sbe-field sbe-field--check" data-field="consent">
						<input id="<?php echo esc_attr( $uid ); ?>-consent" name="consent" type="checkbox" value="1" required aria-describedby="<?php echo esc_attr( $uid ); ?>-consent-error">
						<label for="<?php echo esc_attr( $uid ); ?>-consent">
							<?php
							$privacy = get_privacy_policy_url();
							if ( '' !== $privacy ) {
								printf(
									/* translators: %s: privacy policy link. */
									esc_html__( 'I agree to Orrin Collective contacting me about this enquiry, in line with the %s.', 'salon-booking-enquiry' ),
									'<a href="' . esc_url( $privacy ) . '">' . esc_html__( 'privacy policy', 'salon-booking-enquiry' ) . '</a>'
								);
							} else {
								esc_html_e( 'I agree to Orrin Collective contacting me about this enquiry, in line with the privacy policy.', 'salon-booking-enquiry' );
							}
							?>
						</label>
						<?php self::error_slot( $uid, 'consent', $flash ); ?>
					</div>

					<div class="sbe-field sbe-field--check" data-field="marketing">
						<input id="<?php echo esc_attr( $uid ); ?>-marketing" name="marketing" type="checkbox" value="1">
						<label for="<?php echo esc_attr( $uid ); ?>-marketing"><?php esc_html_e( 'Send me occasional offers (optional).', 'salon-booking-enquiry' ); ?></label>
					</div>

					<div class="sbe-hp" aria-hidden="true">
						<label for="<?php echo esc_attr( $uid ); ?>-hp"><?php esc_html_e( 'Leave this field empty', 'salon-booking-enquiry' ); ?></label>
						<input id="<?php echo esc_attr( $uid ); ?>-hp" name="<?php echo esc_attr( EnquiryService::HONEYPOT ); ?>" type="text" tabindex="-1" autocomplete="off">
					</div>
				</fieldset>

				<p class="sbe-status" aria-live="assertive" aria-atomic="true" data-sbe-status></p>

				<div class="sbe-actions">
					<button type="button" class="sbe-btn sbe-btn--text" data-sbe-back hidden><?php esc_html_e( 'Back', 'salon-booking-enquiry' ); ?></button>
					<button type="button" class="sbe-btn" data-sbe-next hidden><?php esc_html_e( 'Continue', 'salon-booking-enquiry' ); ?></button>
					<button type="submit" class="sbe-btn" data-sbe-submit><?php echo esc_html( $config['submit_label'] ); ?></button>
				</div>

				<p class="sbe-fallback-contact">
					<?php esc_html_e( 'Prefer to chat?', 'salon-booking-enquiry' ); ?>
					<a href="<?php echo esc_url( 'https://wa.me/' . preg_replace( '/\D+/', '', $brand['whatsapp'] ) ); ?>" target="_blank" rel="noopener" data-contact="whatsapp" data-location="enquiry_form"><?php esc_html_e( 'WhatsApp us (opens WhatsApp)', 'salon-booking-enquiry' ); ?></a>
				</p>
			</form>
			<div class="sbe-success" data-sbe-success hidden tabindex="-1" aria-live="polite"></div>
			<?php endif; ?>
		</div>
		<?php
		return (string) ob_get_clean();
	}

	/**
	 * Date + time inputs used when JavaScript is unavailable.
	 *
	 * @param string $uid Form id.
	 */
	private static function schedule_fallback( string $uid ): void {
		$today = ( new SlotGenerator() )->parse_date( (string) wp_date( 'Y-m-d', null, new \DateTimeZone( 'Asia/Singapore' ) ) );
		$min   = null !== $today ? $today->format( 'Y-m-d' ) : '';
		$max   = null !== $today ? $today->modify( '+' . ( SlotGenerator::DAYS_AHEAD - 1 ) . ' days' )->format( 'Y-m-d' ) : '';
		?>
		<div class="sbe-field">
			<label for="<?php echo esc_attr( $uid ); ?>-date"><?php esc_html_e( 'Preferred date (optional)', 'salon-booking-enquiry' ); ?></label>
			<input id="<?php echo esc_attr( $uid ); ?>-date" name="date" type="date" min="<?php echo esc_attr( $min ); ?>" max="<?php echo esc_attr( $max ); ?>">
		</div>
		<div class="sbe-field">
			<label for="<?php echo esc_attr( $uid ); ?>-time"><?php esc_html_e( 'Preferred time (optional)', 'salon-booking-enquiry' ); ?></label>
			<select id="<?php echo esc_attr( $uid ); ?>-time" name="time">
				<option value=""><?php esc_html_e( 'No preference', 'salon-booking-enquiry' ); ?></option>
				<?php
				for ( $minutes = 600; $minutes <= 1230; $minutes += SlotGenerator::STEP_MINUTES ) {
					$value = sprintf( '%02d:%02d', intdiv( $minutes, 60 ), $minutes % 60 );
					$label = SlotGenerator::label( new \DateTimeImmutable( '2000-01-01 ' . $value ) );
					printf( '<option value="%1$s">%2$s</option>', esc_attr( $value ), esc_html( $label ) );
				}
				?>
			</select>
		</div>
		<?php
	}

	/**
	 * Error message slot linked from its field with aria-describedby.
	 *
	 * @param string                                                                                                 $uid   Form id.
	 * @param string                                                                                                 $field Field name.
	 * @param array{status: string, message: string, fields: array<string, string>, old: array<string, string>}|null $flash Fallback flash data.
	 */
	private static function error_slot( string $uid, string $field, ?array $flash ): void {
		$message = $flash['fields'][ $field ] ?? '';
		printf(
			'<p class="sbe-field__error" id="%1$s" %2$s>%3$s</p>',
			esc_attr( $uid . '-' . $field . '-error' ),
			'' === $message ? 'hidden' : '',
			esc_html( $message )
		);
	}

	/**
	 * Previously entered value from the no-JS fallback.
	 *
	 * @param array{status: string, message: string, fields: array<string, string>, old: array<string, string>}|null $flash Flash data.
	 * @param string                                                                                                 $field Field.
	 */
	private static function old( ?array $flash, string $field ): string {
		return $flash['old'][ $field ] ?? '';
	}

	/**
	 * Price label: "from S$88", or "Free" for S$0.
	 *
	 * @param int $price Whole dollars.
	 */
	public static function price( int $price ): string {
		if ( 0 === $price ) {
			return __( 'Free', 'salon-booking-enquiry' );
		}
		/* translators: %d: price in Singapore dollars. */
		return sprintf( __( 'from S$%d', 'salon-booking-enquiry' ), $price );
	}

	/**
	 * Current URL without our fallback query args (validated again by wp_safe_redirect()).
	 */
	private static function current_url(): string {
		$host = isset( $_SERVER['HTTP_HOST'] ) ? sanitize_text_field( wp_unslash( $_SERVER['HTTP_HOST'] ) ) : '';
		$uri  = isset( $_SERVER['REQUEST_URI'] ) ? esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '/';
		$url  = '' === $host ? home_url( '/' ) : set_url_scheme( 'http://' . $host . $uri );
		return remove_query_arg( array( 'sbe_status', 'sbe_t' ), $url );
	}
}
