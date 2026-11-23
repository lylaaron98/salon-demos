<?php
/**
 * Settings > Salon enquiries: brand, structured data, FAQ, promo modal, rate limit and uninstall.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Admin;

use SalonBookingEnquiry\Data\Catalogue;
use SalonBookingEnquiry\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Settings API screen.
 */
final class SettingsPage {

	private const PAGE = 'sbe-settings';

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'admin_menu', array( $this, 'menu' ) );
		add_action( 'admin_init', array( $this, 'register' ) );
		add_filter( 'plugin_action_links_' . plugin_basename( \SalonBookingEnquiry\PLUGIN_FILE ), array( $this, 'action_links' ) );
	}

	/**
	 * Add the page.
	 */
	public function menu(): void {
		add_options_page(
			__( 'Salon enquiries', 'salon-booking-enquiry' ),
			__( 'Salon enquiries', 'salon-booking-enquiry' ),
			'manage_options',
			self::PAGE,
			array( $this, 'render' )
		);
	}

	/**
	 * Settings link on the Plugins screen.
	 *
	 * @param array<int|string, string> $links Links.
	 * @return array<int|string, string>
	 */
	public function action_links( array $links ): array {
		array_unshift(
			$links,
			sprintf( '<a href="%1$s">%2$s</a>', esc_url( admin_url( 'options-general.php?page=' . self::PAGE ) ), esc_html__( 'Settings', 'salon-booking-enquiry' ) )
		);
		return $links;
	}

	/**
	 * Register setting, sections and fields.
	 */
	public function register(): void {
		register_setting(
			self::PAGE,
			Settings::OPTION,
			array(
				'type'              => 'array',
				'sanitize_callback' => static fn( $input ): array => Settings::sanitize( is_array( $input ) ? $input : array() ),
				'default'           => Settings::defaults(),
				'show_in_rest'      => false,
			)
		);

		$sections = array(
			'sbe_brand'  => __( 'Studio and structured data', 'salon-booking-enquiry' ),
			'sbe_faq'    => __( 'FAQ', 'salon-booking-enquiry' ),
			'sbe_promo'  => __( 'Promo modal', 'salon-booking-enquiry' ),
			'sbe_safety' => __( 'Spam protection and data', 'salon-booking-enquiry' ),
		);
		foreach ( $sections as $id => $title ) {
			add_settings_section( $id, $title, '__return_false', self::PAGE );
		}

		$brands = array_map( static fn( array $b ): string => $b['name'], Catalogue::brands() );
		$types  = array_combine( Settings::SCHEMA_TYPES, Settings::SCHEMA_TYPES );

		$fields = array(
			array( 'brand', __( 'Brand on this site', 'salon-booking-enquiry' ), 'sbe_brand', 'select', $brands, '' ),
			array( 'schema_enabled', __( 'Print JSON-LD', 'salon-booking-enquiry' ), 'sbe_brand', 'checkbox', array(), __( 'LocalBusiness per outlet on the front page and on pages with the enquiry form.', 'salon-booking-enquiry' ) ),
			array( 'schema_type', __( 'Business type', 'salon-booking-enquiry' ), 'sbe_brand', 'select', $types, __( 'schema.org LocalBusiness subtype.', 'salon-booking-enquiry' ) ),
			array( 'faq_items', __( 'Questions and answers', 'salon-booking-enquiry' ), 'sbe_faq', 'textarea', array(), __( 'One per line: Question | Answer. Shown by [salon_faq] and printed as FAQPage JSON-LD on the same page.', 'salon-booking-enquiry' ) ),
			array( 'faq_on_front_page', __( 'FAQPage on front page', 'salon-booking-enquiry' ), 'sbe_faq', 'checkbox', array(), __( 'Only tick this if the front page shows the same questions.', 'salon-booking-enquiry' ) ),
			array( 'promo_enabled', __( 'Show promo modal', 'salon-booking-enquiry' ), 'sbe_promo', 'checkbox', array(), '' ),
			array( 'promo_id', __( 'Promo ID', 'salon-booking-enquiry' ), 'sbe_promo', 'text', array(), __( 'Change it to show a new promo to visitors who dismissed the old one.', 'salon-booking-enquiry' ) ),
			array( 'promo_heading', __( 'Heading', 'salon-booking-enquiry' ), 'sbe_promo', 'text', array(), '' ),
			array( 'promo_body', __( 'Text', 'salon-booking-enquiry' ), 'sbe_promo', 'textarea', array(), '' ),
			array( 'promo_cta_label', __( 'Button label', 'salon-booking-enquiry' ), 'sbe_promo', 'text', array(), '' ),
			array( 'promo_cta_url', __( 'Button link', 'salon-booking-enquiry' ), 'sbe_promo', 'text', array(), '' ),
			array( 'promo_delay', __( 'Delay (seconds)', 'salon-booking-enquiry' ), 'sbe_promo', 'number', array(), '' ),
			array( 'promo_exit_intent', __( 'Also on exit intent', 'salon-booking-enquiry' ), 'sbe_promo', 'checkbox', array(), __( 'Desktop: when the pointer leaves the top of the window.', 'salon-booking-enquiry' ) ),
			array( 'promo_frequency_days', __( 'Show again after (days)', 'salon-booking-enquiry' ), 'sbe_promo', 'number', array(), __( 'Per visitor, stored in their browser. 0 = every visit.', 'salon-booking-enquiry' ) ),
			array( 'rate_limit', __( 'Enquiries per visitor', 'salon-booking-enquiry' ), 'sbe_safety', 'number', array(), '' ),
			array( 'rate_window', __( 'Per window (minutes)', 'salon-booking-enquiry' ), 'sbe_safety', 'number', array(), '' ),
			array( 'delete_on_uninstall', __( 'Delete enquiries on uninstall', 'salon-booking-enquiry' ), 'sbe_safety', 'checkbox', array(), __( 'Settings are always removed. Tick to also delete every stored enquiry.', 'salon-booking-enquiry' ) ),
		);

		foreach ( $fields as [ $key, $label, $section, $type, $options, $help ] ) {
			add_settings_field(
				'sbe_' . $key,
				$label,
				array( $this, 'field' ),
				self::PAGE,
				$section,
				array(
					'key'       => $key,
					'type'      => $type,
					'options'   => $options,
					'help'      => $help,
					'label_for' => 'checkbox' === $type ? null : 'sbe_' . $key,
				)
			);
		}
	}

	/**
	 * Render one field.
	 *
	 * @param array{key: string, type: string, options: array<string, string>, help: string} $args Field args.
	 */
	public function field( array $args ): void {
		$settings = Settings::all();
		$key      = $args['key'];
		$value    = $settings[ $key ] ?? '';
		$name     = Settings::OPTION . '[' . $key . ']';
		$id       = 'sbe_' . $key;

		switch ( $args['type'] ) {
			case 'checkbox':
				// Hidden 0 first so an unticked box is saved as false.
				printf(
					'<input type="hidden" name="%1$s" value="0"><label><input type="checkbox" id="%2$s" name="%1$s" value="1" %3$s> %4$s</label>',
					esc_attr( $name ),
					esc_attr( $id ),
					checked( (bool) $value, true, false ),
					esc_html( $args['help'] )
				);
				return;
			case 'select':
				printf( '<select id="%1$s" name="%2$s">', esc_attr( $id ), esc_attr( $name ) );
				foreach ( $args['options'] as $option => $label ) {
					printf( '<option value="%1$s" %2$s>%3$s</option>', esc_attr( (string) $option ), selected( (string) $value, (string) $option, false ), esc_html( $label ) );
				}
				echo '</select>';
				break;
			case 'textarea':
				printf( '<textarea id="%1$s" name="%2$s" rows="5" class="large-text">%3$s</textarea>', esc_attr( $id ), esc_attr( $name ), esc_textarea( (string) $value ) );
				break;
			case 'number':
				printf( '<input type="number" id="%1$s" name="%2$s" value="%3$s" class="small-text" min="0">', esc_attr( $id ), esc_attr( $name ), esc_attr( (string) $value ) );
				break;
			default:
				printf( '<input type="text" id="%1$s" name="%2$s" value="%3$s" class="regular-text">', esc_attr( $id ), esc_attr( $name ), esc_attr( (string) $value ) );
		}
		if ( '' !== $args['help'] ) {
			printf( '<p class="description">%s</p>', esc_html( $args['help'] ) );
		}
	}

	/**
	 * Render the page.
	 */
	public function render(): void {
		if ( ! current_user_can( 'manage_options' ) ) {
			return;
		}
		?>
		<div class="wrap">
			<h1><?php esc_html_e( 'Salon enquiries', 'salon-booking-enquiry' ); ?></h1>
			<p>
				<?php esc_html_e( 'Enquiries are stored under Enquiries in the admin menu. This host cannot send email, so check there (or connect a webhook to the salon_booking_enquiry_stored action).', 'salon-booking-enquiry' ); ?>
			</p>
			<form action="options.php" method="post">
				<?php
				settings_fields( self::PAGE );
				do_settings_sections( self::PAGE );
				submit_button();
				?>
			</form>
		</div>
		<?php
	}
}
