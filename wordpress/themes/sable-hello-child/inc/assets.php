<?php
/**
 * Styles, scripts, self-hosted fonts and preloads.
 *
 * Load order: parent (Hello Elementor) -> generated fonts.css + tokens.css -> child theme.css.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Path or URL of a generated asset in assets/build/ (see wordpress/scripts/build-theme-assets.mjs).
 *
 * @param string $file Relative file name.
 * @param bool   $url  Return a URL instead of a path.
 */
function sable_build_asset( string $file, bool $url = false ): string {
	return ( $url ? SABLE_THEME_URI : SABLE_THEME_DIR ) . '/assets/build/' . ltrim( $file, '/' );
}

/**
 * Version string for an asset file: its mtime, so FTP deploys bust caches without a manifest.
 *
 * @param string $path Absolute path.
 */
function sable_asset_version( string $path ): string {
	$mtime = file_exists( $path ) ? filemtime( $path ) : false;
	return false === $mtime ? SABLE_THEME_VERSION : (string) $mtime;
}

/**
 * Enqueue parent and child styles, tokens, fonts and the site script.
 */
function sable_enqueue_assets(): void {
	// Parent: Hello Elementor registers `hello-elementor` itself; enqueue defensively for older versions.
	if ( ! wp_style_is( 'hello-elementor', 'registered' ) ) {
		wp_register_style(
			'hello-elementor',
			get_template_directory_uri() . '/style.css',
			array(),
			(string) wp_get_theme( get_template() )->get( 'Version' )
		);
	}
	wp_enqueue_style( 'hello-elementor' );

	// The parent's header/footer stylesheet styles markup we no longer print.
	wp_dequeue_style( 'hello-elementor-header-footer' );

	$deps = array( 'hello-elementor' );

	foreach ( array(
		'sable-fonts'  => 'fonts.css',
		'sable-tokens' => 'tokens.css',
	) as $handle => $file ) {
		$path = sable_build_asset( $file );
		if ( file_exists( $path ) ) {
			wp_enqueue_style( $handle, sable_build_asset( $file, true ), array(), sable_asset_version( $path ) );
			$deps[] = $handle;
		}
	}

	$theme_css = SABLE_THEME_DIR . '/assets/css/theme.css';
	wp_enqueue_style( 'sable-theme', SABLE_THEME_URI . '/assets/css/theme.css', $deps, sable_asset_version( $theme_css ) );

	$site_js = SABLE_THEME_DIR . '/assets/js/site.js';
	wp_enqueue_script(
		'sable-site',
		SABLE_THEME_URI . '/assets/js/site.js',
		array(),
		sable_asset_version( $site_js ),
		array(
			'in_footer' => true,
			'strategy'  => 'defer',
		)
	);
}
add_action( 'wp_enqueue_scripts', 'sable_enqueue_assets', 20 );

/**
 * Preload the two critical font files (body regular, hero display weight). Max two per page.
 */
function sable_preload_fonts(): void {
	$manifest_path = sable_build_asset( 'manifest.json' );
	if ( ! file_exists( $manifest_path ) ) {
		return;
	}
	$manifest = json_decode( (string) file_get_contents( $manifest_path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local theme file.
	if ( ! is_array( $manifest ) || ! isset( $manifest['preload'] ) || ! is_array( $manifest['preload'] ) ) {
		return;
	}
	foreach ( array_slice( $manifest['preload'], 0, 2 ) as $file ) {
		if ( is_string( $file ) ) {
			printf(
				'<link rel="preload" href="%s" as="font" type="font/woff2" crossorigin>' . "\n",
				esc_url( sable_build_asset( $file, true ) )
			);
		}
	}
}
add_action( 'wp_head', 'sable_preload_fonts', 1 );

/**
 * Admin notice when the generated assets are missing (theme copied without running the build).
 */
function sable_missing_build_notice(): void {
	if ( file_exists( sable_build_asset( 'tokens.css' ) ) || ! current_user_can( 'switch_themes' ) ) {
		return;
	}
	printf(
		'<div class="notice notice-warning"><p>%s</p></div>',
		esc_html__( 'Sable & Shear: generated assets (tokens, fonts, Elementor kit) are missing. Run "pnpm build" in the repository and upload themes/sable-hello-child/assets/build/.', 'sable-hello-child' )
	);
}
add_action( 'admin_notices', 'sable_missing_build_notice' );
