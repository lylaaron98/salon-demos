<?php
/**
 * Title: Page not found
 * Slug: dewlab-block/404
 * Inserter: no
 * Description: 404 content with search and a way home.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:paragraph {"className":"dewlab-eyebrow"} -->
<p class="dewlab-eyebrow"><?php esc_html_e( 'Error 404', 'dewlab-block' ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:heading {"level":1} -->
<h1 class="wp-block-heading"><?php esc_html_e( 'This page has moved on.', 'dewlab-block' ); ?></h1>
<!-- /wp:heading -->
<!-- wp:paragraph -->
<p><?php esc_html_e( 'The link may be old or mistyped. Search the site, or head back to the home page to book.', 'dewlab-block' ); ?></p>
<!-- /wp:paragraph -->
<!-- wp:search {"label":"<?php echo esc_attr__( 'Search', 'dewlab-block' ); ?>","buttonText":"<?php echo esc_attr__( 'Search', 'dewlab-block' ); ?>"} /-->
<!-- wp:buttons -->
<div class="wp-block-buttons">
	<!-- wp:button -->
	<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( home_url( '/' ) ); ?>"><?php esc_html_e( 'Back to the home page', 'dewlab-block' ); ?></a></div>
	<!-- /wp:button -->
</div>
<!-- /wp:buttons -->
