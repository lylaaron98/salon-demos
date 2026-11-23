<?php
/**
 * `sbe_enquiry` post type: private storage for enquiries (the host blocks outbound email).
 *
 * Not public, not queryable, not in REST, no front-end view. Staff read enquiries in wp-admin,
 * where the list table shows the fields they need to follow up on WhatsApp.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\PostType;

use SalonBookingEnquiry\Data\Catalogue;
use WP_Post;
use WP_Query;

defined( 'ABSPATH' ) || exit;

/**
 * Registers the CPT, its meta and admin list columns.
 */
final class EnquiryPostType {

	public const POST_TYPE = 'sbe_enquiry';

	/**
	 * Meta keys (underscore-prefixed: hidden from the Custom Fields box).
	 */
	public const META = array(
		'ref'        => '_sbe_ref',
		'brand'      => '_sbe_brand',
		'outlet'     => '_sbe_outlet',
		'service'    => '_sbe_service',
		'date'       => '_sbe_date',
		'time'       => '_sbe_time',
		'first_name' => '_sbe_first_name',
		'mobile'     => '_sbe_mobile',
		'email'      => '_sbe_email',
		'consent_at' => '_sbe_consent_at',
		'marketing'  => '_sbe_marketing',
		'source'     => '_sbe_source',
	);

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'init', array( $this, 'register' ) );
		add_filter( 'manage_' . self::POST_TYPE . '_posts_columns', array( $this, 'columns' ) );
		add_action( 'manage_' . self::POST_TYPE . '_posts_custom_column', array( $this, 'render_column' ), 10, 2 );
		add_filter( 'manage_edit-' . self::POST_TYPE . '_sortable_columns', array( $this, 'sortable_columns' ) );
		add_action( 'pre_get_posts', array( $this, 'sort_query' ) );
		add_filter( 'post_row_actions', array( $this, 'row_actions' ), 10, 2 );
		add_action( 'add_meta_boxes_' . self::POST_TYPE, array( $this, 'meta_boxes' ) );
	}

	/**
	 * Register the post type and its meta.
	 */
	public function register(): void {
		register_post_type(
			self::POST_TYPE,
			array(
				'labels'              => array(
					'name'               => __( 'Enquiries', 'salon-booking-enquiry' ),
					'singular_name'      => __( 'Enquiry', 'salon-booking-enquiry' ),
					'menu_name'          => __( 'Enquiries', 'salon-booking-enquiry' ),
					'all_items'          => __( 'All enquiries', 'salon-booking-enquiry' ),
					'edit_item'          => __( 'Enquiry', 'salon-booking-enquiry' ),
					'search_items'       => __( 'Search enquiries', 'salon-booking-enquiry' ),
					'not_found'          => __( 'No enquiries yet.', 'salon-booking-enquiry' ),
					'not_found_in_trash' => __( 'No enquiries in the bin.', 'salon-booking-enquiry' ),
				),
				'public'              => false,
				'publicly_queryable'  => false,
				'exclude_from_search' => true,
				'show_ui'             => true,
				'show_in_menu'        => true,
				'show_in_nav_menus'   => false,
				'show_in_admin_bar'   => false,
				'show_in_rest'        => false,
				'has_archive'         => false,
				'rewrite'             => false,
				'query_var'           => false,
				'menu_icon'           => 'dashicons-email-alt2',
				'menu_position'       => 26,
				'supports'            => array( 'title' ),
				'capability_type'     => 'post',
				'capabilities'        => array( 'create_posts' => 'do_not_allow' ),
				'map_meta_cap'        => true,
			)
		);

		foreach ( self::META as $key ) {
			register_post_meta(
				self::POST_TYPE,
				$key,
				array(
					'type'          => '_sbe_marketing' === $key ? 'boolean' : 'string',
					'single'        => true,
					'show_in_rest'  => false,
					'auth_callback' => static fn(): bool => current_user_can( 'edit_posts' ),
				)
			);
		}
	}

	/**
	 * List table columns.
	 *
	 * @param array<string, string> $columns Default columns.
	 * @return array<string, string>
	 */
	public function columns( array $columns ): array {
		return array(
			'cb'            => $columns['cb'] ?? '<input type="checkbox" />',
			'title'         => __( 'Reference', 'salon-booking-enquiry' ),
			'sbe_name'      => __( 'First name', 'salon-booking-enquiry' ),
			'sbe_mobile'    => __( 'Mobile', 'salon-booking-enquiry' ),
			'sbe_outlet'    => __( 'Outlet', 'salon-booking-enquiry' ),
			'sbe_service'   => __( 'Service', 'salon-booking-enquiry' ),
			'sbe_slot'      => __( 'Preferred slot', 'salon-booking-enquiry' ),
			'sbe_marketing' => __( 'Marketing opt-in', 'salon-booking-enquiry' ),
			'date'          => __( 'Received', 'salon-booking-enquiry' ),
		);
	}

	/**
	 * Render one custom column.
	 *
	 * @param string $column  Column id.
	 * @param int    $post_id Post id.
	 */
	public function render_column( string $column, int $post_id ): void {
		$meta = static fn( string $field ): string => (string) get_post_meta( $post_id, self::META[ $field ], true );

		switch ( $column ) {
			case 'sbe_name':
				echo esc_html( $meta( 'first_name' ) );
				break;
			case 'sbe_mobile':
				$mobile = $meta( 'mobile' );
				if ( '' !== $mobile ) {
					printf(
						'<a href="%1$s">%2$s</a> · <a href="%3$s" target="_blank" rel="noopener">%4$s</a>',
						esc_url( 'tel:' . $mobile ),
						esc_html( $mobile ),
						esc_url( 'https://wa.me/' . ltrim( $mobile, '+' ) ),
						esc_html__( 'WhatsApp', 'salon-booking-enquiry' )
					);
				}
				break;
			case 'sbe_outlet':
				$outlet = Catalogue::outlet_by_id( $meta( 'outlet' ) );
				$brand  = null !== $outlet ? Catalogue::brand( $outlet['brand'] ) : null;
				echo esc_html( null !== $outlet ? ( null !== $brand ? $brand['name'] . ' · ' : '' ) . $outlet['name'] : $meta( 'outlet' ) );
				break;
			case 'sbe_service':
				$service = Catalogue::service_by_id( $meta( 'service' ) );
				echo esc_html( null !== $service ? $service['name'] : '—' );
				break;
			case 'sbe_slot':
				$date = $meta( 'date' );
				$time = $meta( 'time' );
				echo esc_html( '' === $date ? __( 'No preference', 'salon-booking-enquiry' ) : trim( $date . ' ' . $time ) );
				break;
			case 'sbe_marketing':
				echo esc_html( $meta( 'marketing' ) ? __( 'Yes', 'salon-booking-enquiry' ) : __( 'No', 'salon-booking-enquiry' ) );
				break;
		}
	}

	/**
	 * Sortable columns.
	 *
	 * @param array<string, string> $columns Sortable columns.
	 * @return array<string, string>
	 */
	public function sortable_columns( array $columns ): array {
		$columns['sbe_outlet'] = 'sbe_outlet';
		$columns['sbe_slot']   = 'sbe_slot';
		return $columns;
	}

	/**
	 * Apply meta sorting in the admin list.
	 *
	 * @param WP_Query $query Query.
	 */
	public function sort_query( WP_Query $query ): void {
		if ( ! is_admin() || ! $query->is_main_query() || self::POST_TYPE !== $query->get( 'post_type' ) ) {
			return;
		}
		$orderby = $query->get( 'orderby' );
		if ( 'sbe_outlet' === $orderby ) {
			$query->set( 'meta_key', self::META['outlet'] );
			$query->set( 'orderby', 'meta_value' );
		} elseif ( 'sbe_slot' === $orderby ) {
			$query->set( 'meta_key', self::META['date'] );
			$query->set( 'orderby', 'meta_value' );
		}
	}

	/**
	 * Remove Quick Edit; enquiries are records, not content.
	 *
	 * @param array<string, string> $actions Row actions.
	 * @param WP_Post               $post    Post.
	 * @return array<string, string>
	 */
	public function row_actions( array $actions, WP_Post $post ): array {
		if ( self::POST_TYPE === $post->post_type ) {
			unset( $actions['inline hide-if-no-js'], $actions['view'] );
		}
		return $actions;
	}

	/**
	 * Read-only details box on the edit screen.
	 */
	public function meta_boxes(): void {
		add_meta_box( 'sbe-enquiry-details', __( 'Enquiry details', 'salon-booking-enquiry' ), array( $this, 'render_details' ), self::POST_TYPE, 'normal', 'high' );
	}

	/**
	 * Render the details box.
	 *
	 * @param WP_Post $post Post.
	 */
	public function render_details( WP_Post $post ): void {
		$rows = array(
			__( 'Reference', 'salon-booking-enquiry' )  => 'ref',
			__( 'First name', 'salon-booking-enquiry' ) => 'first_name',
			__( 'Mobile', 'salon-booking-enquiry' )     => 'mobile',
			__( 'Email', 'salon-booking-enquiry' )      => 'email',
			__( 'Outlet', 'salon-booking-enquiry' )     => 'outlet',
			__( 'Service', 'salon-booking-enquiry' )    => 'service',
			__( 'Preferred date', 'salon-booking-enquiry' ) => 'date',
			__( 'Preferred time', 'salon-booking-enquiry' ) => 'time',
			__( 'PDPA consent at', 'salon-booking-enquiry' ) => 'consent_at',
			__( 'Marketing opt-in', 'salon-booking-enquiry' ) => 'marketing',
			__( 'Source', 'salon-booking-enquiry' )     => 'source',
		);
		echo '<table class="widefat striped"><tbody>';
		foreach ( $rows as $label => $field ) {
			$value = get_post_meta( $post->ID, self::META[ $field ], true );
			if ( 'marketing' === $field ) {
				$value = $value ? __( 'Yes', 'salon-booking-enquiry' ) : __( 'No', 'salon-booking-enquiry' );
			}
			printf( '<tr><th scope="row">%1$s</th><td>%2$s</td></tr>', esc_html( $label ), esc_html( is_scalar( $value ) ? (string) $value : '' ) );
		}
		printf(
			'<tr><th scope="row">%1$s</th><td>%2$s</td></tr>',
			esc_html__( 'Message', 'salon-booking-enquiry' ),
			nl2br( esc_html( $post->post_content ) )
		);
		echo '</tbody></table>';
	}
}
