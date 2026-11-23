<?php
/**
 * Template helpers: brand, contact details, icons and navigation fallbacks.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

/**
 * Active token brand id (matches `[data-brand]` in tokens.css).
 */
function sable_brand(): string {
	/**
	 * Filters the token brand used on <html data-brand>.
	 *
	 * @param string $brand Brand id: sable, dewlab, rootwell or orrin.
	 */
	return (string) apply_filters( 'sable_brand', 'sable' );
}

/**
 * Header variant: `solid` (default) or `minimal` (campaign landing pages, design brief 4.1).
 */
function sable_header_variant(): string {
	$variant = is_page_template( 'templates/campaign-landing.php' ) ? 'minimal' : 'solid';
	/**
	 * Filters the header variant.
	 *
	 * @param string $variant `solid` or `minimal`.
	 */
	$variant = (string) apply_filters( 'sable_header_variant', $variant );
	return in_array( $variant, array( 'solid', 'minimal' ), true ) ? $variant : 'solid';
}

/**
 * Whether to print the sticky mobile "Book now" bar.
 */
function sable_show_book_bar(): bool {
	return (bool) apply_filters( 'sable_show_book_bar', ! is_404() );
}

/**
 * Contact and booking settings from the Customizer, with fictional demo defaults.
 *
 * @return array{phone_display: string, phone_e164: string, whatsapp: string, book_url: string, book_label: string, showcase_url: string}
 */
function sable_contact(): array {
	return array(
		'phone_display' => (string) get_theme_mod( 'sable_phone_display', '+65 6000 0000' ),
		'phone_e164'    => (string) get_theme_mod( 'sable_phone_e164', '+6560000000' ),
		'whatsapp'      => (string) get_theme_mod( 'sable_whatsapp', '6580000000' ),
		'book_url'      => (string) get_theme_mod( 'sable_book_url', home_url( '/book/' ) ),
		'book_label'    => (string) get_theme_mod( 'sable_book_label', __( 'Book a stylist', 'sable-hello-child' ) ),
		'showcase_url'  => (string) get_theme_mod( 'sable_showcase_url', 'https://salon-demos.vercel.app' ),
	);
}

/**
 * Click-to-chat link (design brief 6.4): plain link, no third-party widget script.
 *
 * @param string $message Optional prefilled message.
 */
function sable_whatsapp_url( string $message = '' ): string {
	$number = preg_replace( '/\D+/', '', sable_contact()['whatsapp'] ) ?? '';
	$url    = 'https://wa.me/' . $number;
	if ( '' !== $message ) {
		$url .= '?text=' . rawurlencode( $message );
	}
	return $url;
}

/**
 * The tel: link for the studio number.
 */
function sable_tel_url(): string {
	return 'tel:' . ( preg_replace( '/[^\d+]+/', '', sable_contact()['phone_e164'] ) ?? '' );
}

/**
 * Inline SVG icon (Lucide-style, 1.5px stroke, decorative: hidden from assistive tech).
 *
 * @param string $name Icon name.
 * @param int    $size Pixel size.
 */
function sable_icon( string $name, int $size = 24 ): string {
	$paths = array(
		'menu'     => '<path d="M4 6h16M4 12h16M4 18h16"/>',
		'close'    => '<path d="M18 6 6 18M6 6l12 12"/>',
		'phone'    => '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.91.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
		'chat'     => '<path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"/>',
		'calendar' => '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
		'chevron'  => '<path d="m6 9 6 6 6-6"/>',
		'pin'      => '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
	);
	if ( ! isset( $paths[ $name ] ) ) {
		return '';
	}
	return sprintf(
		'<svg class="sable-icon sable-icon--%1$s" width="%2$d" height="%2$d" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">%3$s</svg>',
		esc_attr( $name ),
		$size,
		$paths[ $name ] // Static markup defined above.
	);
}

/**
 * Allowed SVG markup for wp_kses when echoing sable_icon().
 *
 * @return array<string, array<string, bool>>
 */
function sable_svg_kses(): array {
	$common = array(
		'd'               => true,
		'x'               => true,
		'y'               => true,
		'cx'              => true,
		'cy'              => true,
		'r'               => true,
		'rx'              => true,
		'width'           => true,
		'height'          => true,
		'class'           => true,
		'viewbox'         => true,
		'fill'            => true,
		'stroke'          => true,
		'stroke-width'    => true,
		'stroke-linecap'  => true,
		'stroke-linejoin' => true,
		'aria-hidden'     => true,
		'focusable'       => true,
	);
	return array(
		'svg'    => $common,
		'path'   => $common,
		'rect'   => $common,
		'circle' => $common,
	);
}

/**
 * Echo an icon through wp_kses.
 *
 * @param string $name Icon name.
 * @param int    $size Pixel size.
 */
function sable_the_icon( string $name, int $size = 24 ): void {
	echo wp_kses( sable_icon( $name, $size ), sable_svg_kses() );
}

/**
 * Text wordmark used when no custom logo is set (no image request, no CLS).
 */
function sable_the_logo(): void {
	if ( has_custom_logo() ) {
		the_custom_logo();
		return;
	}
	printf(
		'<a class="sable-wordmark" href="%1$s" rel="home"><span class="sable-wordmark__name">%2$s</span><span class="screen-reader-text"> %3$s</span></a>',
		esc_url( home_url( '/' ) ),
		esc_html( get_bloginfo( 'name' ) ),
		esc_html__( '(home)', 'sable-hello-child' )
	);
}

/**
 * Primary navigation, rendered twice (desktop bar and mobile drawer) with distinct ids.
 *
 * @param string $context `header` or `drawer`.
 */
function sable_primary_menu( string $context ): void {
	wp_nav_menu(
		array(
			'theme_location' => 'sable-primary',
			'container'      => '',
			'menu_id'        => 'sable-menu-' . $context,
			'menu_class'     => 'sable-menu sable-menu--' . $context,
			'depth'          => 2,
			'fallback_cb'    => 'sable_menu_fallback',
			'sable_context'  => $context,
			'items_wrap'     => '<ul id="%1$s" class="%2$s">%3$s</ul>',
		)
	);
}

/**
 * Fallback menu with the brief's information architecture until a menu is assigned.
 *
 * @param array<string, mixed> $args wp_nav_menu() arguments.
 */
function sable_menu_fallback( array $args = array() ): void {
	$context = isset( $args['sable_context'] ) && is_string( $args['sable_context'] ) ? $args['sable_context'] : 'header';
	$items   = array(
		'/services/' => __( 'Services', 'sable-hello-child' ),
		'/pricing/'  => __( 'Pricing', 'sable-hello-child' ),
		'/team/'     => __( 'Our team', 'sable-hello-child' ),
		'/outlets/'  => __( 'Outlets', 'sable-hello-child' ),
		'/offers/'   => __( 'Offers', 'sable-hello-child' ),
	);
	$current = isset( $_SERVER['REQUEST_URI'] ) ? (string) wp_parse_url( sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ), PHP_URL_PATH ) : '';

	printf( '<ul id="%1$s" class="sable-menu sable-menu--%2$s">', esc_attr( 'sable-menu-' . $context ), esc_attr( $context ) );
	foreach ( $items as $path => $label ) {
		$url        = home_url( $path );
		$is_current = (string) wp_parse_url( $url, PHP_URL_PATH ) === $current;
		printf(
			'<li class="menu-item%1$s"><a href="%2$s"%3$s>%4$s</a></li>',
			$is_current ? ' current-menu-item' : '',
			esc_url( $url ),
			$is_current ? ' aria-current="page"' : '',
			esc_html( $label )
		);
	}
	echo '</ul>';
}

/**
 * Footer services list until a `sable-services` menu is assigned.
 */
function sable_services_menu_fallback(): void {
	$items = array(
		'cuts'     => __( 'Cuts and styling', 'sable-hello-child' ),
		'colour'   => __( 'Colour', 'sable-hello-child' ),
		'balayage' => __( 'Balayage', 'sable-hello-child' ),
		'bridal'   => __( 'Bridal hair', 'sable-hello-child' ),
	);
	printf( '<nav aria-label="%s"><ul class="sable-footer__list">', esc_attr__( 'Services', 'sable-hello-child' ) );
	foreach ( $items as $slug => $label ) {
		printf( '<li><a href="%1$s">%2$s</a></li>', esc_url( home_url( '/services/#' . $slug ) ), esc_html( $label ) );
	}
	echo '</ul></nav>';
}

/**
 * Cross-brand switcher (header utility bar, drawer and footer).
 *
 * @return array<string, array{label: string, url: string, current: bool}>
 */
function sable_brand_links(): array {
	$showcase = untrailingslashit( sable_contact()['showcase_url'] );
	return array(
		'sable'    => array(
			'label'   => __( 'Sable & Shear', 'sable-hello-child' ),
			'url'     => home_url( '/' ),
			'current' => true,
		),
		'dewlab'   => array(
			'label'   => __( 'Dewlab', 'sable-hello-child' ),
			'url'     => $showcase . '/dewlab',
			'current' => false,
		),
		'rootwell' => array(
			'label'   => __( 'Rootwell', 'sable-hello-child' ),
			'url'     => $showcase . '/rootwell',
			'current' => false,
		),
	);
}

/**
 * Print the brand switcher list.
 *
 * @param string $label Accessible name for the nav landmark.
 */
function sable_the_brand_switcher( string $label ): void {
	printf( '<nav class="sable-brands" aria-label="%s"><ul>', esc_attr( $label ) );
	foreach ( sable_brand_links() as $id => $brand ) {
		printf(
			'<li><a href="%1$s" data-brand-link="%2$s"%3$s>%4$s</a></li>',
			esc_url( $brand['url'] ),
			esc_attr( $id ),
			$brand['current'] ? ' aria-current="page"' : '',
			esc_html( $brand['label'] )
		);
	}
	echo '</ul></nav>';
}
