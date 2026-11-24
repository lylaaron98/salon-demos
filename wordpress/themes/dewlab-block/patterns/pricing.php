<?php
/**
 * Title: Pricing tiers
 * Slug: dewlab-block/pricing
 * Categories: dewlab, services
 * Keywords: pricing, packages, membership
 * Viewport Width: 1440
 * Description: Three tiers (single, course, membership) with the middle one featured (design brief 4.4 "tiers").
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;

$dewlab_tiers = array(
	array(
		'name'     => __( 'Single', 'dewlab-block' ),
		'price'    => 'S$138',
		'unit'     => __( 'per session', 'dewlab-block' ),
		'desc'     => __( 'One Hydra-Glow facial with skin analysis.', 'dewlab-block' ),
		'features' => array( __( '75 minutes', 'dewlab-block' ), __( 'Skin analysis included', 'dewlab-block' ), __( 'Aftercare notes by email', 'dewlab-block' ) ),
		'cta'      => __( 'Book a single', 'dewlab-block' ),
		'featured' => false,
	),
	array(
		'name'     => __( '3-session course', 'dewlab-block' ),
		'price'    => 'S$368',
		'unit'     => __( 'for 3 sessions', 'dewlab-block' ),
		'desc'     => __( 'For visible change over six to eight weeks.', 'dewlab-block' ),
		'features' => array( __( 'Save S$46', 'dewlab-block' ), __( 'Progress photos (kept private)', 'dewlab-block' ), __( 'Free rescheduling', 'dewlab-block' ) ),
		'cta'      => __( 'Start a course', 'dewlab-block' ),
		'featured' => true,
	),
	array(
		'name'     => __( 'Membership', 'dewlab-block' ),
		'price'    => 'S$118',
		'unit'     => __( 'a month', 'dewlab-block' ),
		'desc'     => __( 'One facial every month. Pause or cancel any time.', 'dewlab-block' ),
		'features' => array( __( "Members' prices on add-ons", 'dewlab-block' ), __( 'Priority weekend booking', 'dewlab-block' ) ),
		'cta'      => __( 'Join', 'dewlab-block' ),
		'featured' => false,
	),
);
?>
<!-- wp:group {"align":"full","anchor":"prices","backgroundColor":"bg-surface","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div id="prices" class="wp-block-group alignfull has-bg-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|3"}},"layout":{"type":"constrained","contentSize":"760px","justifyContent":"left"}} -->
	<div class="wp-block-group">
		<!-- wp:paragraph {"className":"dewlab-eyebrow"} -->
		<p class="dewlab-eyebrow"><?php esc_html_e( 'Prices', 'dewlab-block' ); ?></p>
		<!-- /wp:paragraph -->
		<!-- wp:heading -->
		<h2 class="wp-block-heading"><?php esc_html_e( 'Signature facial packages', 'dewlab-block' ); ?></h2>
		<!-- /wp:heading -->
		<!-- wp:paragraph {"textColor":"text-muted"} -->
		<p class="has-text-muted-color has-text-color"><?php esc_html_e( 'Start with one. Courses and membership are there if you want them, never required.', 'dewlab-block' ); ?></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->

	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|6","margin":{"top":"var:preset|spacing|10"}}},"layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
	<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--10)">
		<?php foreach ( $dewlab_tiers as $dewlab_tier ) : ?>
			<?php if ( $dewlab_tier['featured'] ) : ?>
		<!-- wp:group {"className":"dewlab-card dewlab-card--featured","backgroundColor":"bg-accent-blush","style":{"spacing":{"blockGap":"var:preset|spacing|3"}},"layout":{"type":"flow"}} -->
		<div class="wp-block-group dewlab-card dewlab-card--featured has-bg-accent-blush-background-color has-background">
			<!-- wp:paragraph {"className":"dewlab-chip dewlab-chip--inverse"} -->
			<p class="dewlab-chip dewlab-chip--inverse"><?php esc_html_e( 'Best value', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
			<?php else : ?>
		<!-- wp:group {"className":"dewlab-card","backgroundColor":"bg-page","style":{"spacing":{"blockGap":"var:preset|spacing|3"}},"layout":{"type":"flow"}} -->
		<div class="wp-block-group dewlab-card has-bg-page-background-color has-background">
			<?php endif; ?>
			<!-- wp:heading {"level":3,"fontSize":"xl"} -->
			<h3 class="wp-block-heading has-xl-font-size"><?php echo esc_html( $dewlab_tier['name'] ); ?></h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph {"className":"dewlab-price dewlab-price--large"} -->
			<p class="dewlab-price dewlab-price--large"><?php echo esc_html( $dewlab_tier['price'] ); ?> <span class="dewlab-price__unit"><?php echo esc_html( $dewlab_tier['unit'] ); ?></span></p>
			<!-- /wp:paragraph -->
			<!-- wp:paragraph {"fontSize":"sm"} -->
			<p class="has-sm-font-size"><?php echo esc_html( $dewlab_tier['desc'] ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:list {"className":"dewlab-ticks","fontSize":"sm"} -->
			<ul class="wp-block-list dewlab-ticks has-sm-font-size">
				<?php foreach ( $dewlab_tier['features'] as $dewlab_feature ) : ?>
				<!-- wp:list-item --><li><?php echo esc_html( $dewlab_feature ); ?></li><!-- /wp:list-item -->
				<?php endforeach; ?>
			</ul>
			<!-- /wp:list -->
			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<?php if ( $dewlab_tier['featured'] ) : ?>
				<!-- wp:button -->
				<div class="wp-block-button">
				<?php else : ?>
				<!-- wp:button {"className":"is-style-outline"} -->
				<div class="wp-block-button is-style-outline">
				<?php endif; ?>
				<a class="wp-block-button__link wp-element-button" href="#book"><?php echo esc_html( $dewlab_tier['cta'] ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
		<?php endforeach; ?>
	</div>
	<!-- /wp:group -->

	<!-- wp:paragraph {"textColor":"text-muted","fontSize":"sm"} -->
	<p class="has-text-muted-color has-text-color has-sm-font-size"><?php esc_html_e( 'Prices include 9% GST. Demo prices for a fictional studio.', 'dewlab-block' ); ?></p>
	<!-- /wp:paragraph -->
</div>
<!-- /wp:group -->
