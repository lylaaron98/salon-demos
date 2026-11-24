<?php
/**
 * GET /wp-json/sbe/v1/availability
 *
 *   ?brand=sable&outlet=sable-tanjong-pagar[&service=sable-cut-finish]
 *       -> next 14 days with free-slot counts
 *   ...&date=2026-11-26
 *       -> free slots that day grouped morning / afternoon / evening
 *
 * Public and read-only: the data is a deterministic mock (see SlotGenerator).
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Rest;

use SalonBookingEnquiry\Availability\SlotGenerator;
use SalonBookingEnquiry\Data\Catalogue;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * Availability endpoint.
 */
final class AvailabilityController {

	public const NAMESPACE = 'sbe/v1';

	/**
	 * Register the route.
	 */
	public function register_routes(): void {
		register_rest_route(
			self::NAMESPACE,
			'/availability',
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => array( $this, 'get' ),
				'permission_callback' => '__return_true',
				'args'                => array(
					'brand'   => array(
						'type'              => 'string',
						'required'          => true,
						'enum'              => array_keys( Catalogue::brands() ),
						'sanitize_callback' => 'sanitize_key',
					),
					'outlet'  => array(
						'type'              => 'string',
						'required'          => true,
						'sanitize_callback' => 'sanitize_key',
					),
					'service' => array(
						'type'              => 'string',
						'required'          => false,
						'default'           => '',
						'sanitize_callback' => 'sanitize_key',
					),
					'date'    => array(
						'type'     => 'string',
						'required' => false,
						'pattern'  => '^\d{4}-\d{2}-\d{2}$',
					),
				),
				'schema'              => array( $this, 'schema' ),
			)
		);
	}

	/**
	 * Handle the request.
	 *
	 * @param WP_REST_Request<array<string, mixed>> $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function get( WP_REST_Request $request ) {
		$brand   = (string) $request->get_param( 'brand' );
		$outlet  = Catalogue::outlet_by_id( (string) $request->get_param( 'outlet' ) );
		$service = Catalogue::service_by_id( (string) $request->get_param( 'service' ) );

		if ( null === $outlet || $outlet['brand'] !== $brand ) {
			return new WP_Error( 'sbe_unknown_outlet', __( 'Please choose an outlet.', 'salon-booking-enquiry' ), array( 'status' => 404 ) );
		}
		if ( null !== $service && $service['brand'] !== $brand ) {
			return new WP_Error( 'sbe_unknown_service', __( 'Please choose a service from the list.', 'salon-booking-enquiry' ), array( 'status' => 404 ) );
		}

		$duration  = null !== $service ? $service['duration'] : 60;
		$generator = new SlotGenerator();
		$date      = $request->get_param( 'date' );

		if ( ! is_string( $date ) || '' === $date ) {
			$response = new WP_REST_Response(
				array(
					'outlet'   => $outlet['id'],
					'service'  => null !== $service ? $service['id'] : null,
					'timezone' => 'Asia/Singapore',
					'days'     => $generator->days( $outlet['id'], $outlet['hours'], $duration ),
				)
			);
		} else {
			if ( null === $generator->parse_date( $date ) ) {
				return new WP_Error( 'sbe_bad_date', __( 'Please choose a date from the list.', 'salon-booking-enquiry' ), array( 'status' => 400 ) );
			}
			$slots   = $generator->slots( $outlet['id'], $outlet['hours'], $duration, $date );
			$grouped = array(
				'morning'   => array(),
				'afternoon' => array(),
				'evening'   => array(),
			);
			foreach ( $slots as $slot ) {
				$grouped[ $slot['daypart'] ][] = array(
					'time'  => $slot['time'],
					'label' => $slot['label'],
				);
			}
			$response = new WP_REST_Response(
				array(
					'outlet'   => $outlet['id'],
					'service'  => null !== $service ? $service['id'] : null,
					'date'     => $date,
					'timezone' => 'Asia/Singapore',
					'count'    => count( $slots ),
					'slots'    => $grouped,
				)
			);
		}

		// Deterministic and anonymous: safe for short shared caching.
		$response->header( 'Cache-Control', 'public, max-age=60' );
		return $response;
	}

	/**
	 * JSON schema for the response (discoverable via OPTIONS).
	 *
	 * @return array<string, mixed>
	 */
	public function schema(): array {
		return array(
			'$schema'    => 'http://json-schema.org/draft-04/schema#',
			'title'      => 'sbe-availability',
			'type'       => 'object',
			'properties' => array(
				'outlet'   => array( 'type' => 'string' ),
				'service'  => array( 'type' => array( 'string', 'null' ) ),
				'timezone' => array( 'type' => 'string' ),
				'date'     => array( 'type' => 'string' ),
				'count'    => array( 'type' => 'integer' ),
				'days'     => array( 'type' => 'array' ),
				'slots'    => array( 'type' => 'object' ),
			),
		);
	}
}
