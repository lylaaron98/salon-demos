<?php
/**
 * Dewlab Skin Studio Divi child theme.
 *
 * Load order: Divi parent stylesheet -> generated divi-child.css (token variables, base styles,
 * button/form presets) -> generated fonts.css (self-hosted DM Sans / DM Serif Display and the
 * metric-matched fallbacks, which re-point the token font stacks).
 *
 * @package DewlabDiviChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

define( 'DEWLAB_DIVI_VERSION', '1.0.0' );

/**
 * Version string for a theme file: its mtime, so FTP deploys bust caches without a manifest.
 *
 * @param string $path Absolute path.
 */
function dewlab_divi_asset_version( string $path ): string {
	$mtime = file_exists( $path ) ? filemtime( $path ) : false;
	return false === $mtime ? DEWLAB_DIVI_VERSION : (string) $mtime;
}

/**
 * Enqueue the parent stylesheet (only if Divi did not already), then the generated styles.
 */
function dewlab_divi_enqueue_assets(): void {
	// Divi 4.10+ enqueues its own stylesheet as `divi-style-parent` when a child theme is active.
	$parent = 'divi-style-parent';
	if ( ! wp_style_is( $parent, 'registered' ) ) {
		wp_register_style(
			$parent,
			get_template_directory_uri() . '/style.css',
			array(),
			(string) wp_get_theme( get_template() )->get( 'Version' )
		);
	}
	wp_enqueue_style( $parent );

	$deps = array( $parent );
	foreach ( array(
		'dewlab-divi-child' => 'assets/build/divi-child.css',
		'dewlab-divi-fonts' => 'assets/build/fonts.css',
	) as $handle => $file ) {
		$path = get_theme_file_path( $file );
		if ( ! file_exists( $path ) ) {
			continue;
		}
		wp_enqueue_style( $handle, get_theme_file_uri( $file ), $deps, dewlab_divi_asset_version( $path ) );
		$deps = array( $handle );
	}
}
add_action( 'wp_enqueue_scripts', 'dewlab_divi_enqueue_assets', 20 );

/**
 * Fonts are self-hosted: drop Divi's Google Fonts requests (design brief 2.5 and 3.3).
 */
function dewlab_divi_dequeue_google_fonts(): void {
	foreach ( array( 'et-builder-googlefonts', 'et-builder-googlefonts-cached', 'divi-fonts' ) as $handle ) {
		wp_dequeue_style( $handle );
	}
}
add_action( 'wp_enqueue_scripts', 'dewlab_divi_dequeue_google_fonts', 100 );

/**
 * List the self-hosted families as web-safe fonts, so the Divi font pickers offer them without
 * loading them from Google.
 *
 * @param array<string, array<string, mixed>> $fonts Web-safe fonts known to Divi.
 * @return array<string, array<string, mixed>>
 */
function dewlab_divi_websafe_fonts( $fonts ): array {
	$fonts = is_array( $fonts ) ? $fonts : array();

	$fonts['DM Sans']          = array(
		'styles'        => '400,500,700',
		'character_set' => 'latin',
		'type'          => 'sans-serif',
	);
	$fonts['DM Serif Display'] = array(
		'styles'        => '400',
		'character_set' => 'latin',
		'type'          => 'serif',
	);
	return $fonts;
}
add_filter( 'et_websafe_fonts', 'dewlab_divi_websafe_fonts' );

/**
 * Preload the two fonts the first viewport needs (assets/build/manifest.json, max two).
 */
function dewlab_divi_preload_fonts(): void {
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
add_action( 'wp_head', 'dewlab_divi_preload_fonts', 1 );
