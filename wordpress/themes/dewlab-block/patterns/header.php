<?php
/**
 * Title: Header
 * Slug: dewlab-block/header
 * Categories: header
 * Block Types: core/template-part/header
 * Inserter: no
 * Description: Site title, primary navigation (hamburger overlay below 600px) and the Book now button.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"align":"full","className":"dewlab-header","style":{"spacing":{"padding":{"top":"var:preset|spacing|3","bottom":"var:preset|spacing|3"}}},"backgroundColor":"bg-page","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull dewlab-header has-bg-page-background-color has-background" style="padding-top:var(--wp--preset--spacing--3);padding-bottom:var(--wp--preset--spacing--3)">
	<!-- wp:group {"className":"dewlab-header__bar","layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"space-between"}} -->
	<div class="wp-block-group dewlab-header__bar">
		<!-- wp:site-title {"level":0} /-->

		<!-- wp:group {"className":"dewlab-header__nav","style":{"spacing":{"blockGap":"var:preset|spacing|6"}},"layout":{"type":"flex","flexWrap":"nowrap","justifyContent":"right"}} -->
		<div class="wp-block-group dewlab-header__nav">
			<!-- wp:navigation {"ariaLabel":"<?php echo esc_attr__( 'Primary', 'dewlab-block' ); ?>","overlayMenu":"mobile","overlayBackgroundColor":"bg-page","overlayTextColor":"text-primary","layout":{"type":"flex","justifyContent":"right"},"style":{"spacing":{"blockGap":"var:preset|spacing|6"}}} -->
				<!-- wp:navigation-link {"label":"<?php echo esc_attr__( 'Services', 'dewlab-block' ); ?>","url":"<?php echo esc_url( home_url( '/#services' ) ); ?>","kind":"custom"} /-->
				<!-- wp:navigation-link {"label":"<?php echo esc_attr__( 'Prices', 'dewlab-block' ); ?>","url":"<?php echo esc_url( home_url( '/#prices' ) ); ?>","kind":"custom"} /-->
				<!-- wp:navigation-link {"label":"<?php echo esc_attr__( 'Outlets', 'dewlab-block' ); ?>","url":"<?php echo esc_url( home_url( '/#outlets' ) ); ?>","kind":"custom"} /-->
				<!-- wp:navigation-link {"label":"<?php echo esc_attr__( 'FAQ', 'dewlab-block' ); ?>","url":"<?php echo esc_url( home_url( '/#faq' ) ); ?>","kind":"custom"} /-->
			<!-- /wp:navigation -->

			<!-- wp:buttons {"className":"dewlab-header__cta"} -->
			<div class="wp-block-buttons dewlab-header__cta">
				<!-- wp:button -->
				<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( home_url( '/#book' ) ); ?>"><?php esc_html_e( 'Book now', 'dewlab-block' ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
