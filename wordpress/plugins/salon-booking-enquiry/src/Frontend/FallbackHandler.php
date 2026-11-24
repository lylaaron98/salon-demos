<?php
/**
 * No-JavaScript path: the enquiry form posts to admin-post.php, we run the same EnquiryService
 * and redirect back (Post/Redirect/Get) with a short-lived flash message.
 *
 * The flash holds only status text and field error messages, never the visitor's personal data.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Frontend;

use SalonBookingEnquiry\Enquiry\EnquiryService;

defined( 'ABSPATH' ) || exit;

/**
 * Handler for the admin-post.php fallback.
 *
 * @phpstan-type Flash array{status: string, message: string, fields: array<string, string>, old: array<string, string>}
 */
final class FallbackHandler {

	public const ACTION = 'sbe_enquiry';

	/**
	 * Constructor.
	 *
	 * @param EnquiryService $service Enquiry use case.
	 */
	public function __construct( private EnquiryService $service ) {}

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'admin_post_nopriv_' . self::ACTION, array( $this, 'handle' ) );
		add_action( 'admin_post_' . self::ACTION, array( $this, 'handle' ) );
	}

	/**
	 * Handle the POST.
	 */
	public function handle(): void {
		$redirect = isset( $_POST['redirect_to'] ) ? esc_url_raw( wp_unslash( $_POST['redirect_to'] ) ) : '';
		$redirect = '' !== $redirect ? $redirect : ( wp_get_referer() ? wp_get_referer() : home_url( '/' ) );

		$nonce = isset( $_POST['_sbe_nonce'] ) ? sanitize_text_field( wp_unslash( $_POST['_sbe_nonce'] ) ) : '';
		if ( false === wp_verify_nonce( $nonce, self::ACTION ) ) {
			$this->redirect(
				$redirect,
				array(
					'status'  => 'error',
					'message' => __( 'This form has expired. Please refresh the page and try again.', 'salon-booking-enquiry' ),
					'fields'  => array(),
					'old'     => array(),
				)
			);
		}

		$fields = array( 'brand', 'outlet', 'service', 'date', 'time', 'first_name', 'mobile', 'email', 'message', 'consent', 'marketing', EnquiryService::HONEYPOT );
		$input  = array();
		foreach ( $fields as $field ) {
			// Sanitised and validated field by field in Validator; nonce checked above.
			if ( isset( $_POST[ $field ] ) && is_string( $_POST[ $field ] ) ) {
				$input[ $field ] = 'message' === $field
					? sanitize_textarea_field( wp_unslash( $_POST[ $field ] ) )
					: sanitize_text_field( wp_unslash( $_POST[ $field ] ) );
			}
		}

		$result = $this->service->submit( $input, 'form' );
		$errors = isset( $result->data['fields'] ) && is_array( $result->data['fields'] ) ? array_map( 'strval', $result->data['fields'] ) : array();

		$message = $result->message;
		if ( $result->ok() ) {
			// Generic text: the success message names the visitor, and the flash must hold no personal data.
			$message = sprintf(
				/* translators: %s: enquiry reference, e.g. ORN-7K3Q. */
				__( "We'll WhatsApp you within 1 working hour. Your reference is %s.", 'salon-booking-enquiry' ),
				is_string( $result->data['ref'] ?? null ) ? $result->data['ref'] : ''
			);
		} elseif ( 409 === $result->status && isset( $result->data['alternatives'] ) && is_array( $result->data['alternatives'] ) ) {
			$labels = array();
			foreach ( $result->data['alternatives'] as $alt ) {
				if ( is_array( $alt ) && isset( $alt['date'], $alt['label'] ) ) {
					$labels[] = $alt['date'] . ' ' . $alt['label'];
				}
			}
			$message .= ' ' . implode( ', ', $labels );
		}

		$this->redirect(
			$redirect,
			array(
				'status'  => $result->ok() ? 'sent' : 'error',
				'message' => $message,
				'fields'  => $errors,
				'old'     => array(),
			)
		);
	}

	/**
	 * Store the flash and redirect back.
	 *
	 * @param string $url   Target.
	 * @param Flash  $flash Flash data.
	 * @return never
	 */
	private function redirect( string $url, array $flash ) {
		$token = bin2hex( random_bytes( 8 ) );
		set_transient( 'sbe_flash_' . $token, $flash, 10 * MINUTE_IN_SECONDS );
		$fragment = (string) wp_parse_url( $url, PHP_URL_FRAGMENT );
		$base     = strtok( $url, '#' );
		$url      = false === $base ? home_url( '/' ) : $base;
		$url      = add_query_arg(
			array(
				'sbe_status' => $flash['status'],
				'sbe_t'      => $token,
			),
			$url
		);
		$url      = wp_validate_redirect( $url . ( '' !== $fragment ? '#' . $fragment : '' ), home_url( '/' ) );
		wp_safe_redirect( $url, 303 );
		exit;
	}

	/**
	 * Flash for the current request, if any.
	 *
	 * @return Flash|null
	 */
	public static function flash(): ?array {
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Token lookup only; the token is random and expires after 10 minutes.
		$token = isset( $_GET['sbe_t'] ) ? sanitize_key( wp_unslash( $_GET['sbe_t'] ) ) : '';
		if ( '' === $token ) {
			return null;
		}
		$flash = get_transient( 'sbe_flash_' . $token );
		if ( ! is_array( $flash ) || ! isset( $flash['status'], $flash['message'] ) ) {
			return null;
		}
		return array(
			'status'  => (string) $flash['status'],
			'message' => (string) $flash['message'],
			'fields'  => isset( $flash['fields'] ) && is_array( $flash['fields'] ) ? array_map( 'strval', $flash['fields'] ) : array(),
			'old'     => array(),
		);
	}
}
