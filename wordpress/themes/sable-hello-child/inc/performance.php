<?php
/**
 * Front-end performance hardening for shared hosting (InfinityFree).
 *
 * - Emoji detection script and styles removed (system emoji fonts are fine).
 * - oEmbed discovery and the wp-embed script removed (we do not embed this site elsewhere).
 * - jQuery Migrate dropped on the front end (kept in wp-admin and the Elementor editor).
 * - Theme and allow-listed scripts deferred.
 * - Elementor's Google Fonts requests disabled in favour of the self-hosted WOFF2 files.
 * - Head clutter (generator, RSD, WLW manifest, shortlink) removed.
 *
 * Every step can be switched off with the `sable_performance_features` filter.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Whether a hardening feature is on.
 *
 * @param string $feature emoji|oembed|jquery_migrate|defer|elementor_google_fonts|head_cleanup.
 */
function sable_perf_enabled( string $feature ): bool {
	$features = (array) apply_filters(
		'sable_performance_features',
		array(
			'emoji'                  => true,
			'oembed'                 => true,
			'jquery_migrate'         => true,
			'defer'                  => true,
			'elementor_google_fonts' => true,
			'head_cleanup'           => true,
		)
	);
	return ! empty( $features[ $feature ] );
}

/**
 * True while the Elementor editor or preview is loading, where nothing must be stripped.
 */
function sable_is_elementor_editing(): bool {
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only flag check.
	if ( isset( $_GET['elementor-preview'] ) || ( isset( $_GET['action'] ) && 'elementor' === $_GET['action'] ) ) {
		return true;
	}
	return false;
}

/**
 * Remove emoji, oEmbed and head clutter hooks.
 */
function sable_performance_init(): void {
	if ( sable_perf_enabled( 'emoji' ) ) {
		remove_action( 'wp_head', 'print_emoji_detection_script', 7 );
		remove_action( 'admin_print_scripts', 'print_emoji_detection_script' );
		remove_action( 'wp_print_styles', 'print_emoji_styles' );
		remove_action( 'admin_print_styles', 'print_emoji_styles' );
		remove_action( 'wp_enqueue_scripts', 'wp_enqueue_emoji_styles' );
		remove_action( 'admin_enqueue_scripts', 'wp_enqueue_emoji_styles' );
		remove_filter( 'the_content_feed', 'wp_staticize_emoji' );
		remove_filter( 'comment_text_rss', 'wp_staticize_emoji' );
		remove_filter( 'wp_mail', 'wp_staticize_emoji_for_email' );
		add_filter( 'emoji_svg_url', '__return_false' );
		add_filter(
			'tiny_mce_plugins',
			static function ( $plugins ) {
				return is_array( $plugins ) ? array_diff( $plugins, array( 'wpemoji' ) ) : array();
			}
		);
	}

	if ( sable_perf_enabled( 'oembed' ) ) {
		remove_action( 'wp_head', 'wp_oembed_add_discovery_links' );
		remove_action( 'wp_head', 'wp_oembed_add_host_js' );
		remove_filter( 'oembed_dataparse', 'wp_filter_oembed_result', 10 );
		add_filter( 'embed_oembed_discover', '__return_false' );
	}

	if ( sable_perf_enabled( 'head_cleanup' ) ) {
		remove_action( 'wp_head', 'wp_generator' );
		remove_action( 'wp_head', 'rsd_link' );
		remove_action( 'wp_head', 'wlwmanifest_link' );
		remove_action( 'wp_head', 'wp_shortlink_wp_head' );
		add_filter( 'the_generator', '__return_empty_string' );
	}

	if ( sable_perf_enabled( 'elementor_google_fonts' ) ) {
		// Elementor (free) loads Google Fonts for global/kit fonts unless told not to.
		add_filter( 'elementor/frontend/print_google_fonts', '__return_false' );
	}
}
add_action( 'init', 'sable_performance_init' );

/**
 * Drop wp-embed on the front end.
 */
function sable_dequeue_embed(): void {
	if ( sable_perf_enabled( 'oembed' ) && ! sable_is_elementor_editing() ) {
		wp_deregister_script( 'wp-embed' );
	}
}
add_action( 'wp_footer', 'sable_dequeue_embed', 1 );

/**
 * Remove jquery-migrate from jQuery's dependencies on the public front end.
 *
 * @param WP_Scripts $scripts Script registry.
 */
function sable_remove_jquery_migrate( WP_Scripts $scripts ): void {
	if ( is_admin() || ! sable_perf_enabled( 'jquery_migrate' ) || sable_is_elementor_editing() ) {
		return;
	}
	$jquery = $scripts->registered['jquery'] ?? null;
	if ( $jquery instanceof _WP_Dependency && is_array( $jquery->deps ) ) {
		$jquery->deps = array_values( array_diff( $jquery->deps, array( 'jquery-migrate' ) ) );
	}
}
add_action( 'wp_default_scripts', 'sable_remove_jquery_migrate' );

/**
 * Defer allow-listed scripts that have no inline dependants. jQuery is left alone because
 * Elementor prints inline scripts that expect it to be available.
 *
 * Uses the WordPress 6.3+ loading strategy API so WordPress itself checks the dependency tree.
 */
function sable_defer_scripts(): void {
	if ( is_admin() || ! sable_perf_enabled( 'defer' ) || sable_is_elementor_editing() ) {
		return;
	}
	/**
	 * Filters the script handles to defer.
	 *
	 * @param array<int, string> $handles Script handles.
	 */
	$handles = (array) apply_filters( 'sable_defer_script_handles', array( 'sable-site', 'comment-reply', 'wp-a11y' ) );
	foreach ( $handles as $handle ) {
		if ( is_string( $handle ) && wp_script_is( $handle, 'registered' ) ) {
			wp_script_add_data( $handle, 'strategy', 'defer' );
		}
	}
}
add_action( 'wp_enqueue_scripts', 'sable_defer_scripts', 100 );

/**
 * Elementor: prefer the inline font-icon and optimised markup paths where the site owner
 * has not chosen otherwise. These are Elementor (free) options, not Pro.
 */
function sable_elementor_defaults(): void {
	if ( ! did_action( 'elementor/loaded' ) ) {
		return;
	}
	// Font-display swap for any font Elementor itself prints.
	if ( false === get_option( 'elementor_font_display', false ) ) {
		update_option( 'elementor_font_display', 'swap' );
	}
	// Disable Google Fonts at the settings level as well (Elementor 3.x option).
	if ( false === get_option( 'elementor_google_font', false ) ) {
		update_option( 'elementor_google_font', '0' );
	}
}
add_action( 'after_switch_theme', 'sable_elementor_defaults' );
