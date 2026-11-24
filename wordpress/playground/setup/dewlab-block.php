<?php
/**
 * Playground demo content for Dewlab Skin Studio (block theme). Run by dewlab-block.json after
 * the theme and plugin are installed; also works on any WordPress with both active:
 *   wp eval-file dewlab-block.php
 * Idempotent. All content is fictional.
 *
 * @package SalonDemosPlayground
 */

defined( 'ABSPATH' ) || exit;

// Brand settings for salon-booking-enquiry: form defaults, JSON-LD and the FAQ shown by [salon_faq].
$salon_demo_settings = get_option( 'sbe_settings', array() );
$salon_demo_settings = is_array( $salon_demo_settings ) ? $salon_demo_settings : array();
update_option(
	'sbe_settings',
	array_merge(
		$salon_demo_settings,
		array(
			'brand'         => 'dewlab',
			'schema_type'   => 'BeautySalon',
			'promo_enabled' => false,
			'faq_items'     => implode(
				"\n",
				array(
					'What happens at my first visit? | A skin analysis with a therapist, then your facial. We explain what we found and suggest a plan. You decide.',
					'Will I be asked to buy a package? | No. Therapists earn no commission, and a single session is always an option at the listed price.',
					'Is there any downtime? | The Hydra-Glow facial and LED have none. If anything might leave skin pink for a few hours, we tell you before we start.',
					'Do prices include GST? | Yes. Every price shown includes 9% GST.',
				)
			),
		)
	)
);

update_option( 'blogname', 'Dewlab Skin Studio' );
update_option( 'blogdescription', 'Skin, studied. A fictional demo brand.' );

/**
 * Create or update a page by slug.
 *
 * @param string $slug     Slug.
 * @param string $title    Title.
 * @param string $content  Block markup.
 * @param string $template Page template slug ('' for default).
 */
function salon_demo_page( string $slug, string $title, string $content, string $template = '' ): int {
	$existing = get_page_by_path( $slug );
	$postarr  = array(
		'post_type'    => 'page',
		'post_status'  => 'publish',
		'post_title'   => $title,
		'post_name'    => $slug,
		'post_content' => $content,
	);
	if ( $existing ) {
		$postarr['ID'] = $existing->ID;
	}
	$id = (int) wp_insert_post( wp_slash( $postarr ) );
	update_post_meta( $id, '_wp_page_template', $template );
	return $id;
}

// Home: the theme's page-starter pattern (hero, promo, services, prices, testimonials, outlets,
// FAQ, booking), rendered from the theme so it always matches the installed version.
$salon_demo_home = salon_demo_page( 'home', 'Home', '<!-- wp:pattern {"slug":"dewlab-block/home"} /-->', 'page-landing' );

// A booking page built from two patterns, and a journal with one post.
salon_demo_page(
	'book',
	'Book a facial',
	'<!-- wp:pattern {"slug":"dewlab-block/booking-cta"} /-->' . "\n" . '<!-- wp:pattern {"slug":"dewlab-block/faq"} /-->',
	'page-landing'
);
$salon_demo_journal = salon_demo_page( 'journal', 'Journal', '' );

if ( ! get_page_by_path( 'what-a-skin-analysis-looks-for', OBJECT, 'post' ) ) {
	wp_insert_post(
		wp_slash(
			array(
				'post_type'    => 'post',
				'post_status'  => 'publish',
				'post_title'   => 'What a skin analysis looks for',
				'post_name'    => 'what-a-skin-analysis-looks-for',
				'post_content' => "<!-- wp:paragraph -->\n<p>Hydration, oil, redness and barrier health, in plain English. A demo post for a fictional studio.</p>\n<!-- /wp:paragraph -->",
			)
		)
	);
}
$salon_demo_hello = get_page_by_path( 'hello-world', OBJECT, 'post' );
if ( $salon_demo_hello ) {
	wp_delete_post( $salon_demo_hello->ID, true );
}

update_option( 'show_on_front', 'page' );
update_option( 'page_on_front', $salon_demo_home );
update_option( 'page_for_posts', $salon_demo_journal );

echo 'Dewlab demo ready: front page ' . (int) $salon_demo_home . "\n";
