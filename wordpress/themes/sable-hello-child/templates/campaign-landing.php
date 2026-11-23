<?php
/**
 * Template Name: Campaign landing (minimal header)
 * Template Post Type: page
 *
 * Campaign / first-trial landing pages (design brief 5.3): minimal header with logo, call and
 * CTA only, no navigation. Content is built with Elementor; this template only frames it.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

get_header();
?>
<main id="content" class="site-main sable-campaign">
	<?php
	while ( have_posts() ) :
		the_post();
		the_content();
	endwhile;
	?>
</main>
<?php
get_footer();
