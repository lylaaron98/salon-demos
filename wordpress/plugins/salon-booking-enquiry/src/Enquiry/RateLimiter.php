<?php
/**
 * Fixed-window rate limiter backed by transients (works without object cache or cron).
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Enquiry;

defined( 'ABSPATH' ) || exit;

/**
 * Counts attempts per client in a time window. The client key is a salted hash of the IP, so
 * no raw IP address is stored.
 */
final class RateLimiter {

	public const PREFIX = 'sbe_rl_';

	/**
	 * Constructor.
	 *
	 * @param int $limit          Allowed attempts per window.
	 * @param int $window_seconds Window length.
	 */
	public function __construct(
		private readonly int $limit,
		private readonly int $window_seconds
	) {}

	/**
	 * Transient key for a client.
	 *
	 * @param string $client Client identifier (IP address).
	 */
	public static function key( string $client ): string {
		return self::PREFIX . substr( hash_hmac( 'sha256', $client, wp_salt( 'nonce' ) ), 0, 32 );
	}

	/**
	 * Record an attempt. Returns seconds to wait when over the limit, or 0 when allowed.
	 *
	 * @param string $client Client identifier.
	 */
	public function hit( string $client ): int {
		$key   = self::key( $client );
		$now   = time();
		$state = get_transient( $key );
		$state = is_array( $state ) && isset( $state['count'], $state['reset'] ) && $state['reset'] > $now
			? $state
			: array(
				'count' => 0,
				'reset' => $now + $this->window_seconds,
			);

		if ( (int) $state['count'] >= $this->limit ) {
			return max( 1, (int) $state['reset'] - $now );
		}

		$state['count'] = (int) $state['count'] + 1;
		set_transient( $key, $state, max( 1, (int) $state['reset'] - $now ) );
		return 0;
	}

	/**
	 * The requesting client's IP. REMOTE_ADDR only: forwarded headers are spoofable unless a
	 * trusted proxy sets them, so a site behind one can opt in with the filter.
	 */
	public static function client_ip(): string {
		$ip = isset( $_SERVER['REMOTE_ADDR'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REMOTE_ADDR'] ) ) : '';
		/**
		 * Filters the client IP used for rate limiting.
		 *
		 * @param string $ip REMOTE_ADDR.
		 */
		$ip = (string) apply_filters( 'salon_booking_enquiry_client_ip', $ip );
		return false !== filter_var( $ip, FILTER_VALIDATE_IP ) ? $ip : 'unknown';
	}
}
