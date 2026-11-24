<?php
/**
 * Dynamic block `salon-booking-enquiry/enquiry-form` for block themes (Dewlab) and the classic
 * editor-less WordPress. Server-rendered through FormRenderer; the editor shows a live preview
 * with ServerSideRender. No build step: the editor script is plain ES5 using wp.* globals.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Block;

use SalonBookingEnquiry\Data\Catalogue;
use SalonBookingEnquiry\Frontend\Assets;
use SalonBookingEnquiry\Frontend\FormRenderer;

use const SalonBookingEnquiry\PLUGIN_FILE;
use const SalonBookingEnquiry\VERSION;

defined( 'ABSPATH' ) || exit;

/**
 * Block registration and render callback.
 */
final class EnquiryBlock {

	public const EDITOR_SCRIPT = 'sbe-enquiry-block-editor';

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'init', array( $this, 'register' ) );
	}

	/**
	 * Register the editor script and the block type.
	 */
	public function register(): void {
		( new Assets() )->register();

		wp_register_script(
			self::EDITOR_SCRIPT,
			plugins_url( 'assets/js/block-editor.js', PLUGIN_FILE ),
			array( 'wp-blocks', 'wp-element', 'wp-components', 'wp-block-editor', 'wp-server-side-render', 'wp-i18n' ),
			VERSION,
			true
		);
		wp_set_script_translations( self::EDITOR_SCRIPT, 'salon-booking-enquiry', dirname( PLUGIN_FILE ) . '/languages' );

		// Options for the inspector controls, from the same catalogue the server validates against.
		wp_add_inline_script(
			self::EDITOR_SCRIPT,
			'window.sbeBlockData = ' . wp_json_encode(
				array(
					'brands'   => array_values(
						array_map(
							static fn( array $b ): array => array(
								'value' => $b['id'],
								'label' => $b['name'],
							),
							Catalogue::brands()
						)
					),
					'outlets'  => array_values(
						array_map(
							static fn( array $o ): array => array(
								'value' => $o['id'],
								'label' => $o['name'],
								'brand' => $o['brand'],
							),
							Catalogue::outlets()
						)
					),
					'services' => array_values(
						array_map(
							static fn( array $s ): array => array(
								'value' => $s['id'],
								'label' => $s['name'],
								'brand' => $s['brand'],
							),
							Catalogue::services()
						)
					),
				)
			) . ';',
			'before'
		);

		register_block_type(
			dirname( PLUGIN_FILE ) . '/blocks/enquiry-form',
			array( 'render_callback' => array( $this, 'render' ) )
		);
	}

	/**
	 * Server render.
	 *
	 * @param array<string, mixed> $attributes Block attributes.
	 */
	public function render( array $attributes ): string {
		$config = array(
			'brand'         => $attributes['brand'] ?? 'sable',
			'outlets'       => $attributes['outlets'] ?? array(),
			'services'      => $attributes['services'] ?? array(),
			'show_schedule' => $attributes['showSchedule'] ?? true,
			'ask_email'     => $attributes['askEmail'] ?? false,
			'form_id'       => $attributes['formId'] ?? 'enquiry',
		);
		foreach ( array(
			'heading'      => 'heading',
			'intro'        => 'intro',
			'submit_label' => 'submitLabel',
		) as $key => $attr ) {
			if ( isset( $attributes[ $attr ] ) && is_string( $attributes[ $attr ] ) && '' !== $attributes[ $attr ] ) {
				$config[ $key ] = $attributes[ $attr ];
			}
		}
		$html = FormRenderer::render( $config );
		if ( '' === $html ) {
			return '';
		}
		return sprintf( '<div %1$s>%2$s</div>', get_block_wrapper_attributes(), $html );
	}
}
