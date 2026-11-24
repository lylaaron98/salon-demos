<?php
/**
 * Title: Footer
 * Slug: dewlab-block/footer
 * Categories: footer
 * Block Types: core/template-part/footer
 * Inserter: no
 * Description: Four columns on the inverse surface, group lockup, demo disclaimer and the mobile booking bar.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;

$dewlab_contact = dewlab_contact();
?>
<!-- wp:group {"align":"full","className":"dewlab-footer","style":{"spacing":{"padding":{"top":"var:preset|spacing|16","bottom":"var:preset|spacing|8"}},"elements":{"link":{"color":{"text":"var:preset|color|bg-surface"}}}},"backgroundColor":"bg-inverse","textColor":"bg-surface","layout":{"type":"constrained","contentSize":"1200px"}} -->
<div class="wp-block-group alignfull dewlab-footer has-bg-surface-color has-bg-inverse-background-color has-text-color has-background has-link-color" style="padding-top:var(--wp--preset--spacing--16);padding-bottom:var(--wp--preset--spacing--8)">
	<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|10","top":"var:preset|spacing|8"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:paragraph {"className":"dewlab-footer__brand","fontFamily":"display","fontSize":"2xl"} -->
			<p class="dewlab-footer__brand has-display-font-family has-2-xl-font-size"><?php echo esc_html( $dewlab_contact['name'] ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:paragraph {"fontSize":"sm"} -->
			<p class="has-sm-font-size"><?php esc_html_e( 'A skin studio that analyses first and recommends second. A fictional demo brand.', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":2,"fontSize":"sm","className":"dewlab-footer__heading"} -->
			<h2 class="wp-block-heading dewlab-footer__heading has-sm-font-size"><?php esc_html_e( 'Treatments', 'dewlab-block' ); ?></h2>
			<!-- /wp:heading -->
			<!-- wp:list {"className":"dewlab-plain-list","fontSize":"sm"} -->
			<ul class="wp-block-list dewlab-plain-list has-sm-font-size">
				<!-- wp:list-item --><li><a href="<?php echo esc_url( home_url( '/#services' ) ); ?>"><?php esc_html_e( 'Hydra-Glow Signature Facial', 'dewlab-block' ); ?></a></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><a href="<?php echo esc_url( home_url( '/#services' ) ); ?>"><?php esc_html_e( 'LED calming facial', 'dewlab-block' ); ?></a></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><a href="<?php echo esc_url( home_url( '/#services' ) ); ?>"><?php esc_html_e( 'Skin analysis', 'dewlab-block' ); ?></a></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><a href="<?php echo esc_url( home_url( '/#prices' ) ); ?>"><?php esc_html_e( 'Prices and packages', 'dewlab-block' ); ?></a></li><!-- /wp:list-item -->
			</ul>
			<!-- /wp:list -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":2,"fontSize":"sm","className":"dewlab-footer__heading"} -->
			<h2 class="wp-block-heading dewlab-footer__heading has-sm-font-size"><?php esc_html_e( 'Contact', 'dewlab-block' ); ?></h2>
			<!-- /wp:heading -->
			<!-- wp:list {"className":"dewlab-plain-list","fontSize":"sm"} -->
			<ul class="wp-block-list dewlab-plain-list has-sm-font-size">
				<!-- wp:list-item --><li><a href="<?php echo esc_url( dewlab_tel_url( $dewlab_contact['phone'] ) ); ?>"><?php echo esc_html( $dewlab_contact['phone'] ); ?></a></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><a href="<?php echo esc_url( dewlab_whatsapp_url( $dewlab_contact['whatsapp'] ) ); ?>"><?php esc_html_e( 'WhatsApp us', 'dewlab-block' ); ?></a></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><a href="<?php echo esc_url( home_url( '/#outlets' ) ); ?>"><?php esc_html_e( 'Find an outlet', 'dewlab-block' ); ?></a></li><!-- /wp:list-item -->
			</ul>
			<!-- /wp:list -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column -->
		<div class="wp-block-column">
			<!-- wp:heading {"level":2,"fontSize":"sm","className":"dewlab-footer__heading"} -->
			<h2 class="wp-block-heading dewlab-footer__heading has-sm-font-size"><?php esc_html_e( 'Opening hours', 'dewlab-block' ); ?></h2>
			<!-- /wp:heading -->
			<!-- wp:paragraph {"fontSize":"sm"} -->
			<p class="has-sm-font-size"><?php esc_html_e( 'Mon to Fri: 10 am to 9 pm', 'dewlab-block' ); ?><br><?php esc_html_e( 'Sat and Sun: 10 am to 7 pm', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->

	<!-- wp:separator {"className":"is-style-wide","style":{"spacing":{"margin":{"top":"var:preset|spacing|10","bottom":"var:preset|spacing|6"}}}} -->
	<hr class="wp-block-separator has-alpha-channel-opacity is-style-wide" style="margin-top:var(--wp--preset--spacing--10);margin-bottom:var(--wp--preset--spacing--6)"/>
	<!-- /wp:separator -->

	<!-- wp:group {"className":"dewlab-footer__legal","layout":{"type":"flex","flexWrap":"wrap","justifyContent":"space-between"},"fontSize":"xs"} -->
	<div class="wp-block-group dewlab-footer__legal has-xs-font-size">
		<!-- wp:paragraph -->
		<p><?php esc_html_e( 'An Orrin Collective studio. Sister studios: Sable & Shear (hair) and Rootwell (scalp care).', 'dewlab-block' ); ?></p>
		<!-- /wp:paragraph -->
		<!-- wp:paragraph -->
		<p><?php esc_html_e( '© 2026 Orrin Collective (fictional demo). Fictional brands created for a portfolio demonstration. Not affiliated with any real business.', 'dewlab-block' ); ?></p>
		<!-- /wp:paragraph -->
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->

<!-- wp:group {"tagName":"nav","className":"dewlab-bookbar","ariaLabel":"<?php echo esc_attr__( 'Quick booking', 'dewlab-block' ); ?>","layout":{"type":"flex","flexWrap":"nowrap"}} -->
<nav class="wp-block-group dewlab-bookbar" aria-label="<?php echo esc_attr__( 'Quick booking', 'dewlab-block' ); ?>">
	<!-- wp:buttons {"layout":{"type":"flex","flexWrap":"nowrap"},"style":{"spacing":{"blockGap":"var:preset|spacing|2"}}} -->
	<div class="wp-block-buttons">
		<!-- wp:button {"className":"is-style-outline dewlab-bookbar__secondary"} -->
		<div class="wp-block-button is-style-outline dewlab-bookbar__secondary"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( dewlab_whatsapp_url( $dewlab_contact['whatsapp'] ) ); ?>"><?php esc_html_e( 'WhatsApp', 'dewlab-block' ); ?></a></div>
		<!-- /wp:button -->
		<!-- wp:button {"className":"is-style-outline dewlab-bookbar__secondary"} -->
		<div class="wp-block-button is-style-outline dewlab-bookbar__secondary"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( dewlab_tel_url( $dewlab_contact['phone'] ) ); ?>"><?php esc_html_e( 'Call', 'dewlab-block' ); ?></a></div>
		<!-- /wp:button -->
		<!-- wp:button {"className":"dewlab-bookbar__primary"} -->
		<div class="wp-block-button dewlab-bookbar__primary"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( home_url( '/#book' ) ); ?>"><?php esc_html_e( 'Book now', 'dewlab-block' ); ?></a></div>
		<!-- /wp:button -->
	</div>
	<!-- /wp:buttons -->
</nav>
<!-- /wp:group -->
