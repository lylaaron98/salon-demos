<?php
/**
 * Title: Service cards
 * Slug: dewlab-block/service-cards
 * Categories: dewlab, services
 * Keywords: services, facials, treatments, cards
 * Viewport Width: 1440
 * Description: Three service cards (duration chip, summary, from-price, book link). Prices match the salon-booking-enquiry catalogue.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;

$dewlab_services = array(
	array(
		'badge'    => __( 'Most booked', 'dewlab-block' ),
		'title'    => __( 'Hydra-Glow Signature Facial', 'dewlab-block' ),
		'duration' => __( '75 min', 'dewlab-block' ),
		'summary'  => __( 'Deep cleanse, gentle exfoliation and layered hydration for skin that looks rested.', 'dewlab-block' ),
		'price'    => __( 'from S$138', 'dewlab-block' ),
	),
	array(
		'badge'    => '',
		'title'    => __( 'LED calming facial', 'dewlab-block' ),
		'duration' => __( '45 min', 'dewlab-block' ),
		'summary'  => __( 'Red and near-infrared light for redness and recovery, with a soothing mask.', 'dewlab-block' ),
		'price'    => __( 'from S$98', 'dewlab-block' ),
	),
	array(
		'badge'    => '',
		'title'    => __( 'Skin analysis', 'dewlab-block' ),
		'duration' => __( '30 min', 'dewlab-block' ),
		'summary'  => __( 'Time under the scope with a therapist, then a plain-English plan. No obligation.', 'dewlab-block' ),
		'price'    => __( 'S$48', 'dewlab-block' ),
	),
);
?>
<!-- wp:group {"align":"full","anchor":"services","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div id="services" class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|3"}},"layout":{"type":"constrained","contentSize":"760px","justifyContent":"left"}} -->
	<div class="wp-block-group">
		<!-- wp:paragraph {"className":"dewlab-eyebrow"} -->
		<p class="dewlab-eyebrow"><?php esc_html_e( 'Treatments', 'dewlab-block' ); ?></p>
		<!-- /wp:paragraph -->
		<!-- wp:heading -->
		<h2 class="wp-block-heading"><?php esc_html_e( 'Facials, explained', 'dewlab-block' ); ?></h2>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"textColor":"text-muted"} -->
		<p class="has-text-muted-color has-text-color"><?php esc_html_e( 'Every first visit starts with a skin analysis, so we recommend for your skin, not from a script.', 'dewlab-block' ); ?></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|6","margin":{"top":"var:preset|spacing|10"}}},"layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
	<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--10)">
		<?php foreach ( $dewlab_services as $dewlab_service ) : ?>
		<!-- wp:group {"className":"dewlab-card","backgroundColor":"bg-surface","style":{"spacing":{"blockGap":"var:preset|spacing|3"}},"layout":{"type":"flow"}} -->
		<div class="wp-block-group dewlab-card has-bg-surface-background-color has-background">
			<!-- wp:paragraph {"className":"dewlab-chip"} -->
			<p class="dewlab-chip"><?php echo esc_html( $dewlab_service['duration'] ); ?><?php echo '' !== $dewlab_service['badge'] ? ' · ' . esc_html( $dewlab_service['badge'] ) : ''; ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:heading {"level":3} -->
			<h3 class="wp-block-heading"><?php echo esc_html( $dewlab_service['title'] ); ?></h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph {"textColor":"text-muted","fontSize":"sm"} -->
			<p class="has-text-muted-color has-text-color has-sm-font-size"><?php echo esc_html( $dewlab_service['summary'] ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:paragraph {"className":"dewlab-price"} -->
			<p class="dewlab-price"><?php echo esc_html( $dewlab_service['price'] ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:paragraph {"className":"dewlab-card__link"} -->
			<p class="dewlab-card__link"><a href="#book"><?php esc_html_e( 'Book this treatment', 'dewlab-block' ); ?></a></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->
		<?php endforeach; ?>
	</div>
	<!-- /wp:group -->

	<!-- wp:paragraph {"textColor":"text-muted","fontSize":"sm"} -->
	<p class="has-text-muted-color has-text-color has-sm-font-size"><?php esc_html_e( 'Prices include 9% GST.', 'dewlab-block' ); ?></p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
