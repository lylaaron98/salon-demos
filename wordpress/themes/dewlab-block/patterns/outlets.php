<?php
/**
 * Title: Outlets
 * Slug: dewlab-block/outlets
 * Categories: dewlab, contact
 * Keywords: outlets, locations, address, map
 * Viewport Width: 1440
 * Description: Outlet cards with address, MRT, hours, and Book, Call and WhatsApp actions. Reads the salon-booking-enquiry catalogue when the plugin is active.
 *
 * @package DewlabBlock
 */

defined( 'ABSPATH' ) || exit;

$dewlab_outlets = dewlab_outlets();
if ( array() === $dewlab_outlets ) {
	$dewlab_outlets = array(
		array(
			'name'     => 'Tanjong Pagar',
			'street'   => '1 Fictional Lane #02-16',
			'mrt'      => 'Tanjong Pagar MRT (EW15)',
			'phone'    => '+65 6400 0000',
			'whatsapp' => '6581000000',
		),
		array(
			'name'     => 'Bugis',
			'street'   => '1 Fictional Lane #04-02',
			'mrt'      => 'Bugis MRT (EW12)',
			'phone'    => '+65 6500 0000',
			'whatsapp' => '6581000000',
		),
	);
}
?>
<!-- wp:group {"align":"full","anchor":"outlets","style":{"spacing":{"padding":{"top":"var:preset|spacing|20","bottom":"var:preset|spacing|20"}}},"layout":{"type":"constrained","contentSize":"1200px"}} -->
<div id="outlets" class="wp-block-group alignfull" style="padding-top:var(--wp--preset--spacing--20);padding-bottom:var(--wp--preset--spacing--20)">
	<!-- wp:paragraph {"className":"dewlab-eyebrow"} -->
	<p class="dewlab-eyebrow"><?php esc_html_e( 'Outlets', 'dewlab-block' ); ?></p>
	<!-- /wp:paragraph -->
	<!-- wp:heading -->
	<h2 class="wp-block-heading"><?php esc_html_e( 'Find a studio', 'dewlab-block' ); ?></h2>
	<!-- /wp:heading -->

	<!-- wp:group {"style":{"spacing":{"blockGap":"var:preset|spacing|6","margin":{"top":"var:preset|spacing|8"}}},"layout":{"type":"grid","minimumColumnWidth":"20rem"}} -->
	<div class="wp-block-group" style="margin-top:var(--wp--preset--spacing--8)">
		<?php foreach ( $dewlab_outlets as $dewlab_outlet ) : ?>
		<!-- wp:group {"className":"dewlab-card","backgroundColor":"bg-surface","style":{"spacing":{"blockGap":"var:preset|spacing|2"}},"layout":{"type":"flow"}} -->
		<div class="wp-block-group dewlab-card has-bg-surface-background-color has-background">
			<!-- wp:heading {"level":3,"fontSize":"xl"} -->
			<h3 class="wp-block-heading has-xl-font-size"><?php echo esc_html( $dewlab_outlet['name'] ); ?></h3>
			<!-- /wp:heading -->
			<!-- wp:paragraph {"fontSize":"sm"} -->
			<p class="has-sm-font-size"><?php echo esc_html( $dewlab_outlet['street'] ); ?><br><?php echo esc_html( $dewlab_outlet['mrt'] ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:paragraph {"textColor":"text-muted","fontSize":"sm"} -->
			<p class="has-text-muted-color has-text-color has-sm-font-size"><?php esc_html_e( 'Mon to Fri 10 am to 9 pm · Sat and Sun 10 am to 7 pm', 'dewlab-block' ); ?></p>
			<!-- /wp:paragraph -->
			<!-- wp:buttons {"style":{"spacing":{"margin":{"top":"var:preset|spacing|4"},"blockGap":"var:preset|spacing|2"}}} -->
			<div class="wp-block-buttons" style="margin-top:var(--wp--preset--spacing--4)">
				<!-- wp:button -->
				<div class="wp-block-button"><a class="wp-block-button__link wp-element-button" href="#book"><?php esc_html_e( 'Book here', 'dewlab-block' ); ?></a></div>
				<!-- /wp:button -->
				<!-- wp:button {"className":"is-style-outline"} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( dewlab_tel_url( $dewlab_outlet['phone'] ) ); ?>"><?php esc_html_e( 'Call', 'dewlab-block' ); ?></a></div>
				<!-- /wp:button -->
				<!-- wp:button {"className":"is-style-outline"} -->
				<div class="wp-block-button is-style-outline"><a class="wp-block-button__link wp-element-button" href="<?php echo esc_url( dewlab_whatsapp_url( $dewlab_outlet['whatsapp'] ) ); ?>"><?php esc_html_e( 'WhatsApp', 'dewlab-block' ); ?></a></div>
				<!-- /wp:button -->
			</div>
			<!-- /wp:buttons -->
		</div>
		<!-- /wp:group -->
		<?php endforeach; ?>
	</div>
	<!-- /wp:group -->
</div>
<!-- /wp:group -->
