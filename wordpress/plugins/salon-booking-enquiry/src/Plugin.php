<?php
/**
 * Composition root: builds the services and registers their hooks.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry;

use SalonBookingEnquiry\Admin\SettingsPage;
use SalonBookingEnquiry\Block\EnquiryBlock;
use SalonBookingEnquiry\Elementor\Integration as ElementorIntegration;
use SalonBookingEnquiry\Enquiry\EnquiryService;
use SalonBookingEnquiry\Frontend\Assets;
use SalonBookingEnquiry\Frontend\FallbackHandler;
use SalonBookingEnquiry\Frontend\Shortcodes;
use SalonBookingEnquiry\PostType\EnquiryPostType;
use SalonBookingEnquiry\Promo\PromoModal;
use SalonBookingEnquiry\Rest\AvailabilityController;
use SalonBookingEnquiry\Rest\EnquiryController;
use SalonBookingEnquiry\Seo\JsonLd;

defined( 'ABSPATH' ) || exit;

/**
 * Plugin bootstrap.
 */
final class Plugin {

	/**
	 * Singleton instance.
	 *
	 * @var Plugin|null
	 */
	private static ?Plugin $instance = null;

	/**
	 * Whether boot() already ran.
	 *
	 * @var bool
	 */
	private bool $booted = false;

	/**
	 * Get the instance.
	 */
	public static function instance(): self {
		if ( null === self::$instance ) {
			self::$instance = new self();
		}
		return self::$instance;
	}

	/**
	 * Register every hook. Runs on plugins_loaded.
	 */
	public function boot(): void {
		if ( $this->booted ) {
			return;
		}
		$this->booted = true;

		add_action( 'init', array( $this, 'load_textdomain' ), 0 );

		$service = new EnquiryService();

		( new EnquiryPostType() )->register_hooks();
		( new Assets() )->register_hooks();
		( new Shortcodes() )->register_hooks();
		( new EnquiryBlock() )->register_hooks();
		( new FallbackHandler( $service ) )->register_hooks();
		( new ElementorIntegration() )->register_hooks();
		( new PromoModal() )->register_hooks();
		( new JsonLd() )->register_hooks();

		add_action(
			'rest_api_init',
			static function () use ( $service ): void {
				( new AvailabilityController() )->register_routes();
				( new EnquiryController( $service ) )->register_routes();
			}
		);

		if ( is_admin() ) {
			( new SettingsPage() )->register_hooks();
		}
	}

	/**
	 * Load translations from /languages (wp.org language packs take precedence automatically).
	 */
	public function load_textdomain(): void {
		load_plugin_textdomain( 'salon-booking-enquiry', false, dirname( plugin_basename( PLUGIN_FILE ) ) . '/languages' );
	}

	/**
	 * Activation: store defaults once.
	 */
	public static function activate(): void {
		add_option( Settings::OPTION, Settings::defaults() );
	}
}
