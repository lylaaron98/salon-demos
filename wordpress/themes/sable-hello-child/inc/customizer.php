<?php
/**
 * Customizer: contact numbers, booking link and showcase URL.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Sanitise a phone number to digits, spaces and a leading plus.
 *
 * @param mixed $value Raw value.
 */
function sable_sanitize_phone( $value ): string {
	$value = is_string( $value ) ? $value : '';
	return trim( (string) preg_replace( '/[^\d+ ]+/', '', $value ) );
}

/**
 * Register Customizer settings.
 *
 * @param WP_Customize_Manager $wp_customize Customizer manager.
 */
function sable_customize_register( WP_Customize_Manager $wp_customize ): void {
	$wp_customize->add_section(
		'sable_contact',
		array(
			'title'       => __( 'Sable & Shear: contact and booking', 'sable-hello-child' ),
			'description' => __( 'Demo site: use fictional numbers only (+65 6xxx 0000 / +65 8xxx 0000).', 'sable-hello-child' ),
			'priority'    => 30,
		)
	);

	$fields = array(
		'sable_phone_display' => array( __( 'Phone (as displayed)', 'sable-hello-child' ), '+65 6000 0000', 'sable_sanitize_phone', 'text' ),
		'sable_phone_e164'    => array( __( 'Phone (E.164, for tel: links)', 'sable-hello-child' ), '+6560000000', 'sable_sanitize_phone', 'text' ),
		'sable_whatsapp'      => array( __( 'WhatsApp number (digits, with country code)', 'sable-hello-child' ), '6580000000', 'sable_sanitize_phone', 'text' ),
		'sable_book_url'      => array( __( 'Booking page URL', 'sable-hello-child' ), home_url( '/book/' ), 'esc_url_raw', 'url' ),
		'sable_book_label'    => array( __( 'Primary button label', 'sable-hello-child' ), __( 'Book a stylist', 'sable-hello-child' ), 'sanitize_text_field', 'text' ),
		'sable_showcase_url'  => array( __( 'Next.js showcase URL (sister brands)', 'sable-hello-child' ), 'https://salon-demos.vercel.app', 'esc_url_raw', 'url' ),
	);

	foreach ( $fields as $id => [ $label, $default, $sanitize, $type ] ) {
		$wp_customize->add_setting(
			$id,
			array(
				'default'           => $default,
				'sanitize_callback' => $sanitize,
				'transport'         => 'refresh',
			)
		);
		$wp_customize->add_control(
			$id,
			array(
				'label'   => $label,
				'section' => 'sable_contact',
				'type'    => $type,
			)
		);
	}
}
add_action( 'customize_register', 'sable_customize_register' );
