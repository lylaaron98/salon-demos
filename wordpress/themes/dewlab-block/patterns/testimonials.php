<?php
/**
 * Title: Testimonials
 * Slug: dewlab-block/testimonials
 * Categories: dewlab, testimonials
 * Keywords: reviews, quotes, testimonials
 * Viewport Width: 1440
 * Description: Three quotes (first name and initial, treatment). Content only, no Review schema (design brief 4.6).
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;

$dewlab_quotes = array(
	array(
		'quote' => __( 'No upselling at all. They explained what my skin needed and, just as usefully, what it did not.', 'dewlab-block' ),
		'cite'  => __( 'Nadia R. · Hydra-Glow Signature Facial', 'dewlab-block' ),
	),
	array(
		'quote' => __( 'The analysis showed my redness was barrier damage, not acne. Changed how I shop for skincare.', 'dewlab-block' ),
		'cite'  => __( 'Wen Y. · Skin analysis', 'dewlab-block' ),
	),
	array(
		'quote' => __( 'Calm room, gentle hands, and I left with notes I could actually follow at home.', 'dewlab-block' ),
		'cite'  => __( 'Aisha M. · LED calming facial', 'dewlab-block' ),
	),
);
?>
<!-- wp:group {"align":"full","className":"dewlab-testimonials","backgroundColor":"bg-subtle","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull dewlab-testimonials has-bg-subtle-background-color has-background" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
	<!-- wp:heading -->
	<h2 class="wp-block-heading"><?php esc_html_e( 'In their words', 'dewlab-block' ); ?></h2>
	<!-- /wp:heading -->
	<!-- wp:paragraph {"textColor":"text-primary","fontSize":"sm"} -->
	<p class="has-text-primary-color has-text-color has-sm-font-size"><?php esc_html_e( 'Demo reviews for a fictional studio.', 'dewlab-block' ); ?></p>
	<!-- /wp:paragraph -->

	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|6","margin":{"top":"var:preset|spacing|8"}}},"layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
	<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--8)">
		<?php foreach ( $dewlab_quotes as $dewlab_quote ) : ?>
		<!-- wp:quote {"className":"dewlab-card","backgroundColor":"bg-surface"} -->
		<blockquote class="wp-block-quote dewlab-card has-bg-surface-background-color has-background">
			<!-- wp:paragraph -->
			<p><?php echo esc_html( $dewlab_quote['quote'] ); ?></p>
			<!-- /wp:paragraph -->
			<cite><?php echo esc_html( $dewlab_quote['cite'] ); ?></cite>
		</blockquote>
		<!-- /wp:quote -->
		<?php endforeach; ?>
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
