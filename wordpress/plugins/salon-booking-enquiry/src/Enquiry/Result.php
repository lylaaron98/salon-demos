<?php
/**
 * Outcome of an enquiry submission, independent of transport (REST or admin-post).
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Enquiry;

defined( 'ABSPATH' ) || exit;

/**
 * Immutable result value.
 */
final class Result {

	/**
	 * Constructor.
	 *
	 * @param int                  $status  HTTP status.
	 * @param string               $code    Machine code (`sbe_created`, `sbe_invalid`, ...).
	 * @param string               $message Human message, safe to show.
	 * @param array<string, mixed> $data    Extra data (ref, fields, alternatives, ...).
	 */
	private function __construct(
		public readonly int $status,
		public readonly string $code,
		public readonly string $message,
		public readonly array $data = array()
	) {}

	/**
	 * 201 Created.
	 *
	 * @param string $ref          Reference.
	 * @param string $message      Success message.
	 * @param string $whatsapp_url Follow-up link.
	 */
	public static function created( string $ref, string $message, string $whatsapp_url ): self {
		return new self(
			201,
			'sbe_created',
			$message,
			array(
				'ref'          => $ref,
				'whatsapp_url' => $whatsapp_url,
			)
		);
	}

	/**
	 * Error result.
	 *
	 * @param int                  $status  HTTP status.
	 * @param string               $code    Code.
	 * @param string               $message Message.
	 * @param array<string, mixed> $data    Extra data.
	 */
	public static function error( int $status, string $code, string $message, array $data = array() ): self {
		return new self( $status, $code, $message, $data );
	}

	/**
	 * Whether the enquiry was accepted.
	 */
	public function ok(): bool {
		return $this->status < 300;
	}
}
