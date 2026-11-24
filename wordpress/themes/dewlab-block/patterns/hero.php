<?php
/**
 * Title: Hero: Skin, studied.
 * Slug: dewlab-block/hero
 * Categories: dewlab, banner
 * Keywords: hero, intro, book
 * Viewport Width: 1440
 * Description: Image-split hero with eyebrow, H1, lead, primary and secondary CTA and a trust row.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"align":"full","className":"dewlab-hero","style":{"spacing":{"padding":{"top":"var:preset|spacing|12","bottom":"var:preset|spacing|16"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull dewlab-hero" style="padding-top:var(--wp--preset--spacing--12);padding-bottom:var(--wp--preset--spacing--16)">
	<!-- wp:columns {"verticalAlignment":"center","style":{"spacing":{"blockGap":{"left":"var:preset|spacing|16","top":"var:preset|spacing|10"}}}} -->
	<div class="wp-block-columns are-vertically-aligned-center">
		<!-- wp:column {"verticalAlignment":"center","width":"55%"} -->
		<div class="wp-block-column is-vertically-aligned-center" style="flex-basis:55%">
			<!-- wp:paragraph {"className":"dewlab-eyebrow"} -->
			<p class="dewlab-eyebrow"><?php esc_html_e( 'Skin studio · Singapore', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->

			<!-- wp:heading {"level":1} -->
			<h1 class="wp-block-heading"><?php esc_html_e( 'Skin, studied.', 'dewlab-block' ); ?></h1>
			<!-- /wp:heading -->

			<!-- wp:paragraph {"fontSize":"lg","className":"dewlab-lead"} -->
			<p class="dewlab-lead has-lg-font-size"><?php esc_html_e( 'We analyse first, then recommend. Evidence-led facials with a first trial at S$48 and no packages pushed.', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->

			<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|8"}}}} -->
			<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--8)">
				<!-- wp:button {"className":"dewlab-hero-cta"} -->
				<div class="wp-block-button dewlab-hero-cta"><a class="wp-block-button__link wp-element-button" href="#book"><?php esc_html_e( 'Book my first facial', 'dewlab-block' ); ?></a></div>
				<!-- /wp:button -->
				<!-- wp:button {"className":"is-style-outline"} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="#prices"><?php esc_html_e( 'See prices', 'dewlab-block' ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->

			<!-- wp:list {"className":"dewlab-trust","fontSize":"sm"} -->
			<ul class="wp-block-list dewlab-trust has-sm-font-size">
				<!-- wp:list-item --><li><?php esc_html_e( '4.9 ★ from 900+ reviews (demo)', 'dewlab-block' ); ?></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><?php esc_html_e( 'No hard-selling', 'dewlab-block' ); ?></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><?php esc_html_e( 'Skin analysis included', 'dewlab-block' ); ?></li><!-- /wp:list-item -->
			</ul>
			<!-- /wp:list -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"width":"45%","className":"dewlab-hero__media"} -->
		<div class="wp-block-column dewlab-hero__media" style="flex-basis:45%">
			<!-- wp:image {"aspectRatio":"4/5","scale":"cover","sizeSlug":"full","linkDestination":"none","className":"dewlab-hero__image","style":{"border":{"radius":"var(--radius-card)"}}} -->
			<figure class="wp-block-image size-full has-custom-border dewlab-hero__image"><img src="<?php echo esc_url( get_theme_file_uri( 'assets/images/hero-dew.svg' ) ); ?>" alt="" width="600" height="750" style="border-radius:var(--radius-card);aspect-ratio:4/5;object-fit:cover"/></figure>
			<!-- /wp:image -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
