<?php
/**
 * Title: First-trial promo band
 * Slug: dewlab-block/first-trial-promo
 * Categories: dewlab, call-to-action
 * Keywords: promo, offer, trial
 * Viewport Width: 1440
 * Description: Inline promo band on the blush accent: one offer, one CTA (design brief 4.5).
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"align":"full","className":"dewlab-promo","style":{"spacing":{"padding":{"top":"var:preset|spacing|10","bottom":"var:preset|spacing|10"}}},"backgroundColor":"bg-accent-blush","textColor":"text-primary","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull dewlab-promo has-text-primary-color has-bg-accent-blush-background-color has-text-color has-background" style="padding-top:var(--wp--preset--spacing--10);padding-bottom:var(--wp--preset--spacing--10)">
	<!-- wp:group {"layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between","verticalAlignment":"center"}} -->
	<div class="wp-block-group">
		<!-- wp:group {"className":"dewlab-promo__copy","style":{"spacing":{"blockGap":"var:preset|spacing|2"}},"layout":{"type":"flow"}} -->
		<div class="wp-block-group dewlab-promo__copy">
			<!-- wp:paragraph {"className":"dewlab-eyebrow dewlab-eyebrow--ink"} -->
			<p class="dewlab-eyebrow dewlab-eyebrow--ink"><?php esc_html_e( 'First trial', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:heading {"fontSize":"3xl"} -->
			<h2 class="wp-block-heading has-3-xl-font-size"><?php esc_html_e( 'Your first signature facial, S$48.', 'dewlab-block' ); ?></h2>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p><?php esc_html_e( 'Usual price S$138. Includes a skin analysis. One trial per person. Demo offer.', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:group -->
		<!-- wp:buttons -->
		<div class="wp-block-buttons">
			<!-- wp:button -->
			<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#book"><?php esc_html_e( 'Claim the S$48 trial', 'dewlab-block' ); ?></a></div>
			<!-- /wp:button -->
		</div>
		<!-- /wp:buttons -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
