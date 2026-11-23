<?php
/**
 * Elementor (free) integration: a widget category and the enquiry form widget.
 *
 * Custom widgets only need Elementor core, so this replaces the Pro Form widget at no cost.
 * Nothing here runs unless Elementor is active.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Elementor;

use Elementor\Elements_Manager;
use Elementor\Widgets_Manager;

defined( 'ABSPATH' ) || exit;

/**
 * Registers widgets with Elementor.
 */
final class Integration {

	public const CATEGORY = 'orrin-collective';

	/**
	 * Hook up (safe when Elementor is absent: the hooks never fire).
	 */
	public function register_hooks(): void {
		add_action( 'elementor/elements/categories_registered', array( $this, 'register_category' ) );
		add_action( 'elementor/widgets/register', array( $this, 'register_widgets' ) );
	}

	/**
	 * Widget panel category.
	 *
	 * @param Elements_Manager $elements_manager Elementor elements manager.
	 */
	public function register_category( $elements_manager ): void {
		$elements_manager->add_category(
			self::CATEGORY,
			array(
				'title' => __( 'Orrin Collective', 'salon-booking-enquiry' ),
				'icon'  => 'eicon-calendar',
			)
		);
	}

	/**
	 * Register widgets. The widget class extends Elementor's base, so it is only autoloaded here.
	 *
	 * @param Widgets_Manager $widgets_manager Elementor widgets manager.
	 */
	public function register_widgets( $widgets_manager ): void {
		$widgets_manager->register( new EnquiryFormWidget() );
	}
}
