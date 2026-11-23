<?php
/**
 * Title: FAQ
 * Slug: dewlab-block/faq
 * Categories: dewlab, text
 * Keywords: faq, questions, accordion
 * Viewport Width: 1440
 * Description: The salon-booking-enquiry [salon_faq] accordion (native details/summary), which matches the plugin's FAQPage JSON-LD. Edit the questions in Settings > Salon enquiries.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;
?>
<!-- wp:group {"align":"full","anchor":"faq","className":"dewlab-faq","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"backgroundColor":"bg-surface","layout":{"type":"constrained","contentSize":"760px"}} -->
<div id="faq" class="wp-block-group alignfull dewlab-faq has-bg-surface-background-color has-background" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
	<!-- wp:shortcode -->
	[salon_faq heading="<?php echo esc_attr__( 'Questions, answered', 'dewlab-block' ); ?>"]
	<!-- /wp:shortcode -->
</div>
<!-- /wp:group -->
