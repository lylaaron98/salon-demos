<?php
/**
 * Promo modal (replaces Elementor Pro Popups): one accessible <dialog>, shown after a delay or on
 * exit intent, frequency-capped per visitor with localStorage. Configured under
 * Settings > Salon enquiries.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Promo;

use SalonBookingEnquiry\Frontend\Assets;
use SalonBookingEnquiry\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Prints the modal markup and enqueues its script.
 */
final class PromoModal {

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'enqueue' ), 20 );
		add_action( 'wp_footer', array( $this, 'render' ), 20 );
	}

	/**
	 * Whether the modal should load on this request.
	 */
	private function active(): bool {
		$settings = Settings::all();
		if ( ! $settings['promo_enabled'] || is_admin() || is_customize_preview() ) {
			return false;
		}
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only flag check.
		if ( isset( $_GET['elementor-preview'] ) ) {
			return false;
		}
		// Never on the page the promo links to.
		$target = (string) wp_parse_url( $settings['promo_cta_url'], PHP_URL_PATH );
		$here   = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_parse_url( esc_url_raw( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH ) : '';
		if ( '' !== $target && untrailingslashit( $target ) === untrailingslashit( $here ) ) {
			return false;
		}
		/**
		 * Filters whether the promo modal loads on this request.
		 *
		 * @param bool $active Active.
		 */
		return (bool) apply_filters( 'salon_booking_enquiry_promo_active', true );
	}

	/**
	 * Enqueue assets.
	 */
	public function enqueue(): void {
		if ( $this->active() ) {
			wp_enqueue_style( Assets::PROMO_STYLE );
			wp_enqueue_script( Assets::PROMO_SCRIPT );
		}
	}

	/**
	 * Print the dialog.
	 */
	public function render(): void {
		if ( ! $this->active() ) {
			return;
		}
		$s = Settings::all();
		?>
		<dialog class="sbe-promo" id="sbe-promo" aria-labelledby="sbe-promo-title" aria-describedby="sbe-promo-body"
			data-sbe-promo
			data-platform="<?php echo esc_attr( Assets::platform() ); ?>"
			data-promo-id="<?php echo esc_attr( $s['promo_id'] ); ?>"
			data-delay="<?php echo esc_attr( (string) $s['promo_delay'] ); ?>"
			data-frequency-days="<?php echo esc_attr( (string) $s['promo_frequency_days'] ); ?>"
			data-exit-intent="<?php echo $s['promo_exit_intent'] ? 'true' : 'false'; ?>">
			<div class="sbe-promo__panel">
				<button type="button" class="sbe-promo__close" data-sbe-promo-dismiss aria-label="<?php esc_attr_e( 'Dismiss offer', 'salon-booking-enquiry' ); ?>">
					<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true" focusable="false"><path d="M18 6 6 18M6 6l12 12"/></svg>
				</button>
				<h2 class="sbe-promo__title" id="sbe-promo-title"><?php echo esc_html( $s['promo_heading'] ); ?></h2>
				<p class="sbe-promo__body" id="sbe-promo-body"><?php echo esc_html( $s['promo_body'] ); ?></p>
				<div class="sbe-promo__actions">
					<a class="sbe-btn" href="<?php echo esc_url( $s['promo_cta_url'] ); ?>" data-sbe-promo-cta><?php echo esc_html( $s['promo_cta_label'] ); ?></a>
					<button type="button" class="sbe-btn sbe-btn--text" data-sbe-promo-dismiss><?php esc_html_e( 'No thanks', 'salon-booking-enquiry' ); ?></button>
				</div>
			</div>
		</dialog>
		<?php
	}
}
