<?php
/**
 * Dewlab Skin Studio block theme.
 *
 * Almost everything lives in theme.json (generated from the design tokens), templates/, parts/
 * and patterns/. This file only enqueues two small stylesheets (inlined by WordPress), preloads
 * two fonts, registers the pattern category and trims front-end bloat. No jQuery, no theme JS.
 *
 * @package DewlabBlock
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

define( 'DEWLAB_THEME_VERSION', '1.0.0' );

/**
 * Brand id in the salon-booking-enquiry catalogue.
 */
const DEWLAB_BRAND = 'dewlab';

/**
 * Theme supports, editor styles, text domain.
 */
function dewlab_setup(): void {
	load_theme_textdomain( 'dewlab-block', get_template_directory() . '/languages' );
	add_theme_support( 'editor-styles' );
	add_editor_style( array( 'assets/build/tokens.css', 'assets/css/theme.css' ) );
	remove_theme_support( 'core-block-patterns' );
}
add_action( 'after_setup_theme', 'dewlab_setup' );

/**
 * Version string for a theme file: its mtime, so deploys bust caches without a manifest.
 *
 * @param string $path Absolute path.
 */
function dewlab_asset_version( string $path ): string {
	$mtime = file_exists( $path ) ? filemtime( $path ) : false;
	return false === $mtime ? DEWLAB_THEME_VERSION : (string) $mtime;
}

/**
 * Enqueue the token variables and the theme stylesheet. Both carry `path` data, so WordPress
 * inlines them (wp_maybe_inline_styles, 40 KB budget) instead of adding two requests.
 */
function dewlab_enqueue_assets(): void {
	$files = array(
		'dewlab-tokens' => 'assets/build/tokens.css',
		'dewlab-theme'  => 'assets/css/theme.css',
	);
	$deps  = array();
	foreach ( $files as $handle => $file ) {
		$path = get_theme_file_path( $file );
		if ( ! file_exists( $path ) ) {
			continue;
		}
		wp_enqueue_style( $handle, get_theme_file_uri( $file ), $deps, dewlab_asset_version( $path ) );
		wp_style_add_data( $handle, 'path', $path );
		$deps = array( $handle );
	}
}
add_action( 'wp_enqueue_scripts', 'dewlab_enqueue_assets' );

/**
 * Preload the two fonts the first viewport needs (body regular and the hero display face),
 * as listed by the build in assets/build/manifest.json. Design brief 2.5 rule 4: max two.
 */
function dewlab_preload_fonts(): void {
	$manifest_path = get_theme_file_path( 'assets/build/manifest.json' );
	if ( ! file_exists( $manifest_path ) ) {
		return;
	}
	$manifest = json_decode( (string) file_get_contents( $manifest_path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local file.
	if ( ! is_array( $manifest ) || ! isset( $manifest['preload'] ) || ! is_array( $manifest['preload'] ) ) {
		return;
	}
	foreach ( array_slice( $manifest['preload'], 0, 2 ) as $file ) {
		if ( is_string( $file ) ) {
			printf(
				'<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
				esc_url( get_theme_file_uri( 'assets/build/' . $file ) )
			);
		}
	}
}
add_action( 'wp_head', 'dewlab_preload_fonts', 1 );

/**
 * Pattern category for the Dewlab sections.
 */
function dewlab_register_pattern_category(): void {
	register_block_pattern_category(
		'dewlab',
		array(
			'label'       => __( 'Dewlab Skin Studio', 'dewlab-block' ),
			'description' => __( 'Sections for the Dewlab home and landing pages.', 'dewlab-block' ),
		)
	);
}
add_action( 'init', 'dewlab_register_pattern_category' );

/**
 * Brand contact details for patterns: from the salon-booking-enquiry catalogue when the plugin
 * is active (one source of truth with the form and JSON-LD), otherwise fictional defaults.
 *
 * @return array{name: string, phone: string, whatsapp: string}
 */
function dewlab_contact(): array {
	$contact = array(
		'name'     => 'Dewlab Skin Studio',
		'phone'    => '+65 6400 0000',
		'whatsapp' => '6581000000',
	);
	if ( class_exists( '\SalonBookingEnquiry\Data\Catalogue' ) ) {
		$brand = \SalonBookingEnquiry\Data\Catalogue::brand( DEWLAB_BRAND );
		if ( null !== $brand ) {
			$contact = array(
				'name'     => $brand['name'],
				'phone'    => $brand['phone'],
				'whatsapp' => $brand['whatsapp'],
			);
		}
	}
	/**
	 * Filters the contact details printed by the header, footer and CTA patterns.
	 *
	 * @param array{name: string, phone: string, whatsapp: string} $contact Contact details.
	 */
	return apply_filters( 'dewlab_contact', $contact );
}

/**
 * `tel:` URL for a display phone number.
 *
 * @param string $phone Display number, e.g. "+65 6400 0000".
 */
function dewlab_tel_url( string $phone ): string {
	return 'tel:' . preg_replace( '/[^\d+]/', '', $phone );
}

/**
 * WhatsApp chat URL for a number in international format without "+".
 *
 * @param string $number e.g. "6581000000".
 */
function dewlab_whatsapp_url( string $number ): string {
	return 'https://wa.me/' . preg_replace( '/\D/', '', $number );
}

/**
 * Outlets for the outlets pattern: the plugin catalogue when available, otherwise none (the
 * pattern then prints its fictional fallback copy).
 *
 * @return list<array{name: string, street: string, mrt: string, phone: string, whatsapp: string}>
 */
function dewlab_outlets(): array {
	if ( ! class_exists( '\SalonBookingEnquiry\Data\Catalogue' ) ) {
		return array();
	}
	$outlets = array();
	foreach ( \SalonBookingEnquiry\Data\Catalogue::outlets( DEWLAB_BRAND ) as $outlet ) {
		$outlets[] = array(
			'name'     => $outlet['name'],
			'street'   => $outlet['street'],
			'mrt'      => $outlet['mrt'],
			'phone'    => $outlet['phone'],
			'whatsapp' => $outlet['whatsapp'],
		);
	}
	return $outlets;
}

/**
 * Hide plugin shortcodes when the plugin is inactive, instead of printing "[salon_faq]".
 *
 * @param string $content Rendered shortcode block.
 */
function dewlab_hide_missing_shortcodes( string $content ): string {
	if ( preg_match( '/\[(salon_[a-z_]+)/', $content, $match ) && ! shortcode_exists( $match[1] ) ) {
		return '';
	}
	return $content;
}
add_filter( 'render_block_core/shortcode', 'dewlab_hide_missing_shortcodes' );

/**
 * Front-end trimming: emoji script and styles, oEmbed host JS, generator tag. Never in wp-admin.
 */
function dewlab_trim_head(): void {
	if ( is_admin() ) {
		return;
	}
	remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
	remove_action( 'wp_print_styles', 'print_emoji_styles' );
	remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
	remove_action( 'wp_head', 'wp_oembed_add_host_js' );
	remove_action( 'wp_head', 'wp_generator' );
	remove_action( 'wp_head', 'wlwmanifest_link' );
	remove_action( 'wp_head', 'rsd_link' );
}
add_action( 'init', 'dewlab_trim_head' );
