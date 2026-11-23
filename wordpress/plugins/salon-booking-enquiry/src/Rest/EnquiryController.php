<?php
/**
 * POST /wp-json/sbe/v1/enquiry
 *
 * Auth: REST cookie nonce. The form sends `X-WP-Nonce` (action `wp_rest`), which the permission
 * callback verifies for visitors too (core only checks it for logged-in cookies).
 * Then honeypot, rate limit (transients), validation, slot check and storage as `sbe_enquiry`.
 * No email is sent: the host blocks outbound mail.
 *
 * Responses: 201 {ref, message, whatsapp_url} | 422 {fields} | 409 {alternatives} | 429 | 403.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Rest;

use SalonBookingEnquiry\Enquiry\EnquiryService;
use WP_Error;
use WP_REST_Request;
use WP_REST_Response;
use WP_REST_Server;

defined( 'ABSPATH' ) || exit;

/**
 * Enquiry endpoint.
 */
final class EnquiryController {

	/**
	 * Constructor.
	 *
	 * @param EnquiryService $service Enquiry use case.
	 */
	public function __construct( private EnquiryService $service ) {}

	/**
	 * Register the route.
	 */
	public function register_routes(): void {
		$string = static fn( int $max ): array => array(
			'type'      => 'string',
			'required'  => false,
			'maxLength' => $max,
		);

		register_rest_route(
			AvailabilityController::NAMESPACE,
			'/enquiry',
			array(
				'methods'             => WP_REST_Server::CREATABLE,
				'callback'            => array( $this, 'create' ),
				'permission_callback' => array( $this, 'permission' ),
				'args'                => array(
					'brand'                  => $string( 32 ),
					'outlet'                 => $string( 64 ),
					'service'                => $string( 64 ),
					'date'                   => $string( 10 ),
					'time'                   => $string( 5 ),
					'first_name'             => $string( 200 ),
					'mobile'                 => $string( 32 ),
					'email'                  => $string( 254 ),
					'message'                => $string( 4000 ),
					'consent'                => array(
						'type'     => array( 'boolean', 'string' ),
						'required' => false,
					),
					'marketing'              => array(
						'type'     => array( 'boolean', 'string' ),
						'required' => false,
					),
					EnquiryService::HONEYPOT => $string( 500 ),
				),
			)
		);
	}

	/**
	 * Require a valid REST nonce (CSRF protection for cookie-based requests, logged in or not).
	 *
	 * @param WP_REST_Request<array<string, mixed>> $request Request.
	 * @return true|WP_Error
	 */
	public function permission( WP_REST_Request $request ) {
		$nonce = $request->get_header( 'X-WP-Nonce' );
		if ( is_string( $nonce ) && false !== wp_verify_nonce( $nonce, 'wp_rest' ) ) {
			return true;
		}
		return new WP_Error(
			'sbe_bad_nonce',
			__( 'This form has expired. Please refresh the page and try again.', 'salon-booking-enquiry' ),
			array( 'status' => 403 )
		);
	}

	/**
	 * Create an enquiry.
	 *
	 * @param WP_REST_Request<array<string, mixed>> $request Request.
	 * @return WP_REST_Response|WP_Error
	 */
	public function create( WP_REST_Request $request ) {
		$params = $request->get_params();
		$result = $this->service->submit( is_array( $params ) ? $params : array(), 'rest' );

		if ( ! $result->ok() ) {
			$error = new WP_Error( $result->code, $result->message, array_merge( array( 'status' => $result->status ), $result->data ) );
			if ( 429 === $result->status && isset( $result->data['retry_after'] ) && is_int( $result->data['retry_after'] ) ) {
				$response = rest_convert_error_to_response( $error );
				$response->header( 'Retry-After', (string) $result->data['retry_after'] );
				return $response;
			}
			return $error;
		}

		$response = new WP_REST_Response(
			array_merge( array( 'message' => $result->message ), $result->data ),
			201
		);
		$response->header( 'Cache-Control', 'no-store' );
		return $response;
	}
}
