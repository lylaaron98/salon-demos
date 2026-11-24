<?php
/**
 * Playground demo content for Sable & Shear (Hello Elementor child + free Elementor). Run by
 * sable-elementor.json after Elementor, Hello Elementor, the child theme and the plugin are
 * installed; also works on any WordPress with them active:
 *   wp eval-file sable-elementor.php
 * Idempotent. All content is fictional.
 *
 * @package SalonDemosPlayground
 */

defined( 'ABSPATH' ) || exit;

update_option( 'blogname', 'Sable & Shear' );
update_option( 'blogdescription', 'Cut with intent. A fictional demo brand.' );

// Skip Elementor's onboarding redirect, keep Google Fonts off, use swap.
delete_transient( 'elementor_activation_redirect' );
update_option( 'elementor_onboarded', true );
update_option( 'elementor_google_font', '0' );
update_option( 'elementor_font_display', 'swap' );

// Global colours, fonts and Theme Style from the token kit (theme helper, same as the admin button).
if ( class_exists( '\Elementor\Plugin' ) ) {
	if ( ! (int) get_option( 'elementor_active_kit' ) ) {
		\Elementor\Plugin::$instance->kits_manager->create_default();
	}
	if ( function_exists( 'sable_apply_kit' ) ) {
		$salon_demo_error = sable_apply_kit();
		echo 'Kit: ' . ( null === $salon_demo_error ? 'applied' : esc_html( $salon_demo_error ) ) . "\n";
	}
}

$salon_demo_settings = get_option( 'sbe_settings', array() );
$salon_demo_settings = is_array( $salon_demo_settings ) ? $salon_demo_settings : array();
update_option(
	'sbe_settings',
	array_merge(
		$salon_demo_settings,
		array(
			'brand'         => 'sable',
			'schema_type'   => 'HairSalon',
			'promo_enabled' => false,
		)
	)
);

/**
 * Elementor element with a stable id.
 *
 * @param string               $id       7-character hex id.
 * @param string               $type     'container' or a widget type.
 * @param array<string, mixed> $settings Settings.
 * @param array<int, mixed>    $children Child elements (containers only).
 * @return array<string, mixed>
 */
function salon_demo_el( string $id, string $type, array $settings = array(), array $children = array() ): array {
	if ( 'container' === $type ) {
		return array(
			'id'       => $id,
			'elType'   => 'container',
			'settings' => $settings,
			'elements' => $children,
		);
	}
	return array(
		'id'         => $id,
		'elType'     => 'widget',
		'widgetType' => $type,
		'settings'   => $settings,
		'elements'   => array(),
	);
}

$salon_demo_pad = static fn( int $px ): array => array(
	'unit'     => 'px',
	'top'      => (string) $px,
	'right'    => '16',
	'bottom'   => (string) $px,
	'left'     => '16',
	'isLinked' => false,
);

// Home page built in Elementor: hero, promo band, services, the plugin's enquiry widget, FAQ.
$salon_demo_data = array(
	salon_demo_el(
		'5a0e001',
		'container',
		array(
			'content_width'  => 'boxed',
			'flex_direction' => 'column',
			'padding'        => $salon_demo_pad( 96 ),
		),
		array(
			salon_demo_el(
				'5a0e002',
				'text-editor',
				array(
					'editor'      => '<p>HAIR ATELIER · SINGAPORE</p>',
					'__globals__' => array(
						'text_color'            => 'globals/colors?id=accent',
						'typography_typography' => 'globals/typography?id=4244fe6',
					),
				)
			),
			salon_demo_el(
				'5a0e003',
				'heading',
				array(
					'title'       => 'Cut with intent.',
					'header_size' => 'h1',
				)
			),
			salon_demo_el( '5a0e004', 'text-editor', array( 'editor' => '<p>Precision cuts and considered colour from stylists who listen first. Seniority-tiered, fixed prices. Your colour, considered.</p>' ) ),
			salon_demo_el(
				'5a0e005',
				'button',
				array(
					'text'         => 'Book a stylist',
					'link'         => array( 'url' => '#book' ),
					'_css_classes' => 'sable-hero-cta',
				)
			),
			salon_demo_el( '5a0e006', 'text-editor', array( 'editor' => '<p>4.9 ★ from 1,200+ reviews (demo) · No hard-selling · 3 outlets</p>' ) ),
		)
	),
	salon_demo_el(
		'5a0e010',
		'container',
		array(
			'content_width'         => 'boxed',
			'flex_direction'        => 'column',
			'padding'               => $salon_demo_pad( 48 ),
			'background_background' => 'classic',
			'__globals__'           => array( 'background_color' => 'globals/colors?id=55ce906' ),
		),
		array(
			salon_demo_el(
				'5a0e011',
				'heading',
				array(
					'title'       => 'First visit? 20% off colour services.',
					'header_size' => 'h2',
					'__globals__' => array( 'title_color' => 'globals/colors?id=3c8a475' ),
				)
			),
			salon_demo_el(
				'5a0e012',
				'text-editor',
				array(
					'editor'      => '<p>New clients only, any stylist level. Demo offer, not a real promotion.</p>',
					'__globals__' => array( 'text_color' => 'globals/colors?id=3c8a475' ),
				)
			),
		)
	),
	salon_demo_el(
		'5a0e020',
		'container',
		array(
			'content_width'  => 'boxed',
			'flex_direction' => 'column',
			'padding'        => $salon_demo_pad( 80 ),
		),
		array(
			salon_demo_el(
				'5a0e021',
				'heading',
				array(
					'title'       => 'Signature services',
					'header_size' => 'h2',
				)
			),
			salon_demo_el( '5a0e022', 'text-editor', array( 'editor' => '<ul><li><strong>Cut and finish</strong>: 60 min, from S$88</li><li><strong>Full colour</strong>: 120 min, from S$168</li><li><strong>Balayage</strong>: 180 min, from S$288</li><li><strong>Bridal hair trial</strong>: 90 min, from S$188</li></ul><p>Prices include 9% GST.</p>' ) ),
		)
	),
	salon_demo_el(
		'5a0e030',
		'container',
		array(
			'content_width'  => 'boxed',
			'flex_direction' => 'column',
			'padding'        => $salon_demo_pad( 80 ),
			'_element_id'    => 'book',
		),
		array(
			salon_demo_el(
				'5a0e031',
				'sbe-enquiry-form',
				array(
					'brand'         => 'sable',
					'heading'       => 'Book a stylist',
					'show_schedule' => 'yes',
					'form_id'       => 'playground-home',
				)
			),
		)
	),
	salon_demo_el(
		'5a0e040',
		'container',
		array(
			'content_width'  => 'boxed',
			'flex_direction' => 'column',
			'padding'        => $salon_demo_pad( 80 ),
		),
		array(
			salon_demo_el( '5a0e041', 'shortcode', array( 'shortcode' => '[salon_faq]' ) ),
		)
	),
);

$salon_demo_existing = get_page_by_path( 'home' );
$salon_demo_home     = (int) wp_insert_post(
	array(
		'ID'          => $salon_demo_existing ? $salon_demo_existing->ID : 0,
		'post_type'   => 'page',
		'post_status' => 'publish',
		'post_title'  => 'Home',
		'post_name'   => 'home',
	)
);
update_post_meta( $salon_demo_home, '_elementor_edit_mode', 'builder' );
update_post_meta( $salon_demo_home, '_elementor_template_type', 'wp-page' );
update_post_meta( $salon_demo_home, '_elementor_version', defined( 'ELEMENTOR_VERSION' ) ? ELEMENTOR_VERSION : '3.25.0' );
update_post_meta( $salon_demo_home, '_wp_page_template', 'elementor_header_footer' );
update_post_meta( $salon_demo_home, '_elementor_data', wp_slash( (string) wp_json_encode( $salon_demo_data ) ) );
if ( class_exists( '\Elementor\Plugin' ) ) {
	\Elementor\Plugin::$instance->files_manager->clear_cache();
}

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $salon_demo_home );

echo 'Sable demo ready: front page ' . (int) $salon_demo_home . "\n";
