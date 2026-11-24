<?php
/**
 * Title: Journal heading
 * Slug: dewlab-block/journal-heading
 * Inserter: no
 * Description: Heading for the posts page.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|3","margin":{"bottom":"var:preset|spacing|10"}}},"layout":{"type":"constrained","contentSize":"760px","justifyContent":"left"}} -->
<div class="wp-block-group" style="margin-bottom:var(--wp--preset--spacing--10)">
	<!-- wp:paragraph {"className":"dewlab-eyebrow"} -->
	<p class="dewlab-eyebrow"><?php esc_html_e( 'Journal', 'dewlab-block' ); ?></p>
	<!-- /wp:paragraph -->
	<!-- wp:heading {"level":1} -->
	<h1 class="wp-block-heading"><?php esc_html_e( 'Skin notes, in plain English', 'dewlab-block' ); ?></h1>
	<!-- /wp:heading -->
</div>
<!-- /wp:group -->
