<?php
/**
 * Uninstall: remove settings, transients and (if the site owner opted in) every stored enquiry.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

defined( 'WP_UNINSTALL_PLUGIN' ) || exit;

$salon_booking_enquiry_settings = get_option( 'sbe_settings', array() );
$salon_booking_enquiry_delete   = is_array( $salon_booking_enquiry_settings ) && ! empty( $salon_booking_enquiry_settings['delete_on_uninstall'] );

if ( $salon_booking_enquiry_delete ) {
	do {
		$salon_booking_enquiry_ids = get_posts(
			array(
				'post_type'        => 'sbe_enquiry',
				'post_status'      => 'any',
				'numberposts'      => 200, // phpcs:ignore WordPress.WP.PostsPerPage.posts_per_page_numberposts -- Batched deletion on uninstall.
				'fields'           => 'ids',
				'suppress_filters' => true,
			)
		);
		foreach ( $salon_booking_enquiry_ids as $salon_booking_enquiry_id ) {
			wp_delete_post( (int) $salon_booking_enquiry_id, true );
		}
		$salon_booking_enquiry_more = array() !== $salon_booking_enquiry_ids;
	} while ( $salon_booking_enquiry_more );
}

delete_option( 'sbe_settings' );

// Rate-limit and no-JS flash transients. There is no API to delete transients by prefix.
global $wpdb;
// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching -- One-off cleanup on uninstall.
$wpdb->query(
	$wpdb->prepare(
		"DELETE FROM {$wpdb->options} WHERE option_name LIKE %s OR option_name LIKE %s OR option_name LIKE %s OR option_name LIKE %s",
		$wpdb->esc_like( '_transient_sbe_' ) . '%',
		$wpdb->esc_like( '_transient_timeout_sbe_' ) . '%',
		$wpdb->esc_like( '_site_transient_sbe_' ) . '%',
		$wpdb->esc_like( '_site_transient_timeout_sbe_' ) . '%'
	)
);
