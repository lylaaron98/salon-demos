<?php
/**
 * Registers front-end scripts and styles. They are only enqueued by whatever renders the form
 * (widget, shortcode, block) or the promo modal, so pages without them load nothing.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Frontend;

use const SalonBookingEnquiry\PLUGIN_FILE;
use const SalonBookingEnquiry\VERSION;

defined( 'ABSPATH' ) || exit;

/**
 * Asset handles and registration.
 */
final class Assets {

	public const FORM_SCRIPT  = 'sbe-enquiry-form';
	public const FORM_STYLE   = 'sbe-enquiry-form';
	public const PROMO_SCRIPT = 'sbe-promo';
	public const PROMO_STYLE  = 'sbe-promo';

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'wp_enqueue_scripts', array( $this, 'register' ), 5 );
		// Elementor editor preview renders widgets outside wp_enqueue_scripts.
		add_action( 'elementor/frontend/after_register_scripts', array( $this, 'register' ) );
		add_action( 'enqueue_block_assets', array( $this, 'register' ), 5 );
	}

	/**
	 * Public URL of a plugin file.
	 *
	 * @param string $path Relative path.
	 */
	public static function url( string $path ): string {
		return plugins_url( $path, PLUGIN_FILE );
	}

	/**
	 * Version for cache busting: file mtime when available.
	 *
	 * @param string $path Relative path.
	 */
	private static function version( string $path ): string {
		$file  = dirname( PLUGIN_FILE ) . '/' . $path;
		$mtime = file_exists( $file ) ? filemtime( $file ) : false;
		return false === $mtime ? VERSION : VERSION . '.' . $mtime;
	}

	/**
	 * Register handles (idempotent).
	 */
	public function register(): void {
		if ( wp_script_is( self::FORM_SCRIPT, 'registered' ) ) {
			return;
		}
		$defer = array(
			'in_footer' => true,
			'strategy'  => 'defer',
		);

		wp_register_style( self::FORM_STYLE, self::url( 'assets/css/enquiry-form.css' ), array(), self::version( 'assets/css/enquiry-form.css' ) );
		wp_register_script( self::FORM_SCRIPT, self::url( 'assets/js/enquiry-form.js' ), array(), self::version( 'assets/js/enquiry-form.js' ), $defer );
		wp_localize_script(
			self::FORM_SCRIPT,
			'sbeForm',
			array(
				// Full URLs: with plain permalinks rest_url() is "?rest_route=..." so paths cannot be appended.
				'availabilityUrl' => esc_url_raw( rest_url( 'sbe/v1/availability' ) ),
				'enquiryUrl'      => esc_url_raw( rest_url( 'sbe/v1/enquiry' ) ),
				'nonce'           => wp_create_nonce( 'wp_rest' ),
				'platform'        => self::platform(),
				'i18n'            => array(
					/* translators: 1: current step number, 2: total steps. */
					'step'       => __( 'Step %1$d of %2$d', 'salon-booking-enquiry' ),
					'loading'    => __( 'Loading times…', 'salon-booking-enquiry' ),
					'noSlots'    => __( 'No times left on this day. Try another date, or WhatsApp us and we will find one.', 'salon-booking-enquiry' ),
					'chooseTime' => __( 'Choose a time to continue.', 'salon-booking-enquiry' ),
					'anyTime'    => __( 'No preference', 'salon-booking-enquiry' ),
					'morning'    => __( 'Morning', 'salon-booking-enquiry' ),
					'afternoon'  => __( 'Afternoon', 'salon-booking-enquiry' ),
					'evening'    => __( 'Evening', 'salon-booking-enquiry' ),
					'oneError'   => __( '1 field needs attention.', 'salon-booking-enquiry' ),
					/* translators: %d: number of fields with errors. */
					'manyErrors' => __( '%d fields need attention.', 'salon-booking-enquiry' ),
					'network'    => __( "We couldn't send that. Check your connection and try again, or WhatsApp us and we'll book it for you.", 'salon-booking-enquiry' ),
					'sending'    => __( 'Sending…', 'salon-booking-enquiry' ),
					'whatsapp'   => __( 'WhatsApp us', 'salon-booking-enquiry' ),
					/* translators: %s: suggested email address. */
					'didYouMean' => __( 'Did you mean %s?', 'salon-booking-enquiry' ),
					'useThis'    => __( 'Use this', 'salon-booking-enquiry' ),
					'required'   => array(
						'outlet'     => __( 'Please choose an outlet.', 'salon-booking-enquiry' ),
						'first_name' => __( 'Please enter your first name.', 'salon-booking-enquiry' ),
						'mobile'     => __( 'Enter an 8-digit Singapore mobile number, e.g. 9123 4567.', 'salon-booking-enquiry' ),
						'landline'   => __( "This looks like a landline. We'll need a mobile number to send your confirmation.", 'salon-booking-enquiry' ),
						'email'      => __( 'Enter an email like name@example.com.', 'salon-booking-enquiry' ),
						'consent'    => __( 'Please agree so we can contact you about your enquiry.', 'salon-booking-enquiry' ),
					),
				),
			)
		);

		wp_register_style( self::PROMO_STYLE, self::url( 'assets/css/promo.css' ), array(), self::version( 'assets/css/promo.css' ) );
		wp_register_script( self::PROMO_SCRIPT, self::url( 'assets/js/promo.js' ), array(), self::version( 'assets/js/promo.js' ), $defer );
	}

	/**
	 * `site_platform` analytics parameter (design brief 6.7): elementor, divi or WordPress.
	 */
	public static function platform(): string {
		$platform = did_action( 'elementor/loaded' ) ? 'elementor' : ( defined( 'ET_CORE_VERSION' ) ? 'divi' : 'WordPress' );
		/**
		 * Filters the site_platform value pushed with analytics events.
		 *
		 * @param string $platform Platform id.
		 */
		return (string) apply_filters( 'salon_booking_enquiry_platform', $platform );
	}

	/**
	 * Enqueue the form assets (called by renderers).
	 */
	public static function enqueue_form(): void {
		( new self() )->register();
		wp_enqueue_style( self::FORM_STYLE );
		wp_enqueue_script( self::FORM_SCRIPT );
	}
}
