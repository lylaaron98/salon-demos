<?php
/**
 * Shortcodes for builders and themes without the Elementor widget (Dewlab block theme, Divi).
 *
 *   [salon_enquiry brand="sable" outlets="sable-tanjong-pagar,sable-tiong-bahru"
 *                  services="sable-cut-finish" heading="Ask us anything" show_schedule="yes"
 *                  ask_email="no" form_id="contact"]
 *   [salon_faq heading="Questions"]   Visible FAQ that matches the FAQPage JSON-LD.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Frontend;

use SalonBookingEnquiry\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Shortcode registration.
 */
final class Shortcodes {

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'init', array( $this, 'register' ) );
	}

	/**
	 * Register shortcodes.
	 */
	public function register(): void {
		add_shortcode( 'salon_enquiry', array( $this, 'enquiry' ) );
		add_shortcode( 'salon_faq', array( $this, 'faq' ) );
	}

	/**
	 * [salon_enquiry].
	 *
	 * @param array<string, string>|string $atts Attributes.
	 */
	public function enquiry( $atts ): string {
		$defaults = FormRenderer::defaults();
		$atts     = shortcode_atts(
			array(
				'brand'         => Settings::all()['brand'],
				'outlets'       => '',
				'services'      => '',
				'heading'       => $defaults['heading'],
				'intro'         => $defaults['intro'],
				'submit_label'  => $defaults['submit_label'],
				'show_schedule' => 'yes',
				'ask_email'     => 'no',
				'form_id'       => 'enquiry',
			),
			is_array( $atts ) ? $atts : array(),
			'salon_enquiry'
		);
		return FormRenderer::render( $atts );
	}

	/**
	 * [salon_faq]: native <details>/<summary> accordion (design brief 4.9).
	 *
	 * @param array<string, string>|string $atts Attributes.
	 */
	public function faq( $atts ): string {
		$atts  = shortcode_atts(
			array( 'heading' => __( 'Questions, answered', 'salon-booking-enquiry' ) ),
			is_array( $atts ) ? $atts : array(),
			'salon_faq'
		);
		$items = Settings::faq_items();
		if ( array() === $items ) {
			return '';
		}
		wp_enqueue_style( Assets::FORM_STYLE );

		$html = '<section class="sbe-faq">';
		if ( '' !== $atts['heading'] ) {
			$html .= '<h2 class="sbe-faq__title">' . esc_html( $atts['heading'] ) . '</h2>';
		}
		foreach ( $items as $i => $item ) {
			$html .= sprintf(
				'<details class="sbe-faq__item" data-question-id="faq-%1$d"><summary>%2$s</summary><div class="sbe-faq__answer"><p>%3$s</p></div></details>',
				$i + 1,
				esc_html( $item['question'] ),
				esc_html( $item['answer'] )
			);
		}
		return $html . '</section>';
	}
}
