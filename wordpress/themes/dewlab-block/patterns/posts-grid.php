<?php
/**
 * Title: Posts grid
 * Slug: dewlab-block/posts-grid
 * Inserter: no
 * Description: Query loop used by the index and journal templates.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:query {"query":{"perPage":9,"inherit":true},"layout":{"type":"default"}} -->
<div class="wp-block-query">
	<!-- wp:post-template {"style":{"spacing":{"blockGap":"var:preset|spacing|6"}},"layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
		<!-- wp:group {"className":"dewlab-card","backgroundColor":"bg-surface","style":{"spacing":{"blockGap":"var:preset|spacing|3"}},"layout":{"type":"flow"}} -->
		<div class="wp-block-group dewlab-card has-bg-surface-background-color has-background">
			<!-- wp:post-featured-image {"isLink":true,"aspectRatio":"4/3","style":{"border":{"radius":"12px"}}} /-->
			<!-- wp:post-title {"level":2,"isLink":true,"fontSize":"xl"} /-->
			<!-- wp:post-date /-->
			<!-- wp:post-excerpt {"excerptLength":24,"fontSize":"sm"} /-->
		</div>
		<!-- /wp:group -->
	<!-- /wp:post-template -->

	<!-- wp:query-pagination {"style":{"spacing":{"margin":{"top":"var:preset|spacing|10"}}},"layout":{"type":"flex","justifyContent":"space-between"}} -->
		<!-- wp:query-pagination-previous /-->
		<!-- wp:query-pagination-numbers /-->
		<!-- wp:query-pagination-next /-->
	<!-- /wp:query-pagination -->

	<!-- wp:query-no-results -->
		<!-- wp:paragraph -->
		<p><?php esc_html_e( 'Nothing here yet.', 'dewlab-block' ); ?></p>
		<!-- /wp:paragraph -->
	<!-- /wp:query-no-results -->
</div>
<!-- /wp:query -->
