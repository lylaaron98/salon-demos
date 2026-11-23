<?php
/**
 * Title: Booking CTA with enquiry form
 * Slug: dewlab-block/booking-cta
 * Categories: dewlab, call-to-action
 * Keywords: book, booking, enquiry, form, contact
 * Viewport Width: 1440
 * Description: Closing CTA (design brief 5.1) with the salon-booking-enquiry block: outlet, treatment, date and time, details.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;

$dewlab_contact = dewlab_contact();
?>
<!-- wp:group {"align":"full","anchor":"book","className":"dewlab-book","backgroundColor":"bg-subtle","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div id="book" class="wp-block-group alignfull dewlab-book has-bg-subtle-background-color has-background" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
	<!-- wp:columns {"style":{"spacing":{"blockGap":{"left":"var:preset|spacing|16","top":"var:preset|spacing|10"}}}} -->
	<div class="wp-block-columns">
		<!-- wp:column {"width":"40%"} -->
		<div class="wp-block-column" style="flex-basis:40%">
			<!-- wp:paragraph {"className":"dewlab-eyebrow"} -->
			<p class="dewlab-eyebrow"><?php esc_html_e( 'Book', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:heading -->
			<h2 class="wp-block-heading"><?php esc_html_e( 'Your skin, studied properly.', 'dewlab-block' ); ?></h2>
			<!-- /wp:heading -->
			<!-- wp:paragraph -->
			<p><?php esc_html_e( 'Book your first facial with a skin analysis included, or ask a therapist on WhatsApp. We reply within one working hour.', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:list {"className":"dewlab-ticks"} -->
			<ul class="wp-block-list dewlab-ticks">
				<!-- wp:list-item --><li><?php esc_html_e( 'First trial S$48, usual price S$138', 'dewlab-block' ); ?></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><?php esc_html_e( 'No packages pushed, no commission', 'dewlab-block' ); ?></li><!-- /wp:list-item -->
				<!-- wp:list-item --><li><?php esc_html_e( 'Free rescheduling up to 24 hours before', 'dewlab-block' ); ?></li><!-- /wp:list-item -->
			</ul>
			<!-- /wp:list -->
			<!-- wp:buttons -->
			<div class="wp-block-buttons">
				<!-- wp:button {"className":"is-style-outline"} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( dewlab_whatsapp_url( $dewlab_contact['whatsapp'] ) ); ?>"><?php esc_html_e( 'Ask on WhatsApp', 'dewlab-block' ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:column -->

		<!-- wp:column {"width":"60%","className":"dewlab-book__form"} -->
		<div class="wp-block-column dewlab-book__form" style="flex-basis:60%">
			<!-- wp:salon-booking-enquiry/enquiry-form {"brand":"dewlab","heading":"<?php echo esc_attr__( 'Book my first facial', 'dewlab-block' ); ?>","intro":"<?php echo esc_attr__( 'Four short steps. We confirm by WhatsApp.', 'dewlab-block' ); ?>","submitLabel":"<?php echo esc_attr__( 'Send my booking request', 'dewlab-block' ); ?>","formId":"dewlab-home"} /-->
		</div>
		<!-- /wp:column -->
	</div>
	<!-- /wp:columns -->
</div>
<!-- /wp:group -->
