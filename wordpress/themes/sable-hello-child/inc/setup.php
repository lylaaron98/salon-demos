<?php
/**
 * Theme supports, menus, translations and document attributes.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Register theme supports, menus and the text domain.
 */
function sable_setup(): void {
	load_child_theme_textdomain( 'sable-hello-child', SABLE_THEME_DIR . '/languages' );

	add_theme_support( 'title-tag' );
	add_theme_support( 'responsive-embeds' );
	add_theme_support(
		'custom-logo',
		array(
			'height'      => 40,
			'width'       => 200,
			'flex-height' => true,
			'flex-width'  => true,
		)
	);
	add_theme_support(
		'html5',
		array( 'search-form', 'gallery', 'caption', 'style', 'script', 'navigation-widgets' )
	);

	register_nav_menus(
		array(
			'sable-primary'  => __( 'Primary navigation (header and mobile drawer)', 'sable-hello-child' ),
			'sable-services' => __( 'Footer: services', 'sable-hello-child' ),
			'sable-legal'    => __( 'Footer: legal links', 'sable-hello-child' ),
		)
	);
}
add_action( 'after_setup_theme', 'sable_setup', 20 );

/**
 * Put `data-brand="sable"` on <html> so tokens.css resolves the Sable & Shear theme.
 *
 * @param string $output Existing language attributes.
 */
function sable_language_attributes( string $output ): string {
	if ( is_admin() ) {
		return $output;
	}
	return $output . ' data-brand="' . esc_attr( sable_brand() ) . '"';
}
add_filter( 'language_attributes', 'sable_language_attributes' );

/**
 * Body classes for header variant and the sticky bar (reserves bottom padding on mobile).
 *
 * @param array<int, string> $classes Body classes.
 * @return array<int, string>
 */
function sable_body_class( array $classes ): array {
	$classes[] = 'sable-header--' . sable_header_variant();
	if ( sable_show_book_bar() ) {
		$classes[] = 'has-sable-book-bar';
	}
	return $classes;
}
add_filter( 'body_class', 'sable_body_class' );
