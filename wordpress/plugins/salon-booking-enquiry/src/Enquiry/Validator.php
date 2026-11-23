<?php
/**
 * Sanitises and validates enquiry input. Messages follow design brief 6.3.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Enquiry;

use SalonBookingEnquiry\Data\Catalogue;

defined( 'ABSPATH' ) || exit;

/**
 * Turns raw request data into a clean Enquiry array or a map of field errors.
 *
 * @phpstan-type Clean array{brand: string, outlet: string, service: string, date: string, time: string, first_name: string, mobile: string, mobile_display: string, email: string, message: string, consent: bool, marketing: bool}
 */
final class Validator {

	public const MAX_MESSAGE = 1000;

	/**
	 * Field errors from the last validate() call.
	 *
	 * @var array<string, string>
	 */
	private array $errors = array();

	/**
	 * Validate.
	 *
	 * @param array<string, mixed> $input Raw input.
	 * @return Clean|null Clean data, or null when there are errors (see errors()).
	 */
	public function validate( array $input ): ?array {
		$this->errors = array();
		$str          = static fn( string $key ): string => isset( $input[ $key ] ) && is_scalar( $input[ $key ] ) ? trim( (string) $input[ $key ] ) : '';
		$flag         = static fn( string $key ): bool => isset( $input[ $key ] ) && filter_var( $input[ $key ], FILTER_VALIDATE_BOOLEAN );

		$brand = sanitize_key( $str( 'brand' ) );
		if ( null === Catalogue::brand( $brand ) ) {
			$this->errors['brand'] = __( 'Please choose a studio.', 'salon-booking-enquiry' );
		}

		$outlet = sanitize_key( $str( 'outlet' ) );
		$record = Catalogue::outlet_by_id( $outlet );
		if ( null === $record || $record['brand'] !== $brand ) {
			$this->errors['outlet'] = __( 'Please choose an outlet.', 'salon-booking-enquiry' );
		}

		$service = sanitize_key( $str( 'service' ) );
		if ( '' !== $service ) {
			$svc = Catalogue::service_by_id( $service );
			if ( null === $svc || $svc['brand'] !== $brand ) {
				$this->errors['service'] = __( 'Please choose a service from the list.', 'salon-booking-enquiry' );
			}
		}

		$date = $str( 'date' );
		$time = $str( 'time' );
		if ( '' !== $date && ! preg_match( '/^\d{4}-\d{2}-\d{2}$/', $date ) ) {
			$this->errors['date'] = __( 'Please choose a date from the list.', 'salon-booking-enquiry' );
		}
		if ( '' !== $time && ( '' === $date || ! preg_match( '/^([01]\d|2[0-3]):[0-5]\d$/', $time ) ) ) {
			$this->errors['time'] = __( 'Choose a time to continue.', 'salon-booking-enquiry' );
		}

		$first_name = sanitize_text_field( $str( 'first_name' ) );
		if ( ! self::valid_name( $first_name ) ) {
			$this->errors['first_name'] = __( 'Please enter your first name.', 'salon-booking-enquiry' );
		}

		$mobile = self::normalise_mobile( $str( 'mobile' ) );
		if ( null === $mobile ) {
			$digits                 = preg_replace( '/\D+/', '', $str( 'mobile' ) ) ?? '';
			$digits                 = (string) preg_replace( '/^65(?=\d{8}$)/', '', $digits );
			$this->errors['mobile'] = ( 8 === strlen( $digits ) && str_starts_with( $digits, '6' ) )
				? __( "This looks like a landline. We'll need a mobile number to send your confirmation.", 'salon-booking-enquiry' )
				: __( 'Enter an 8-digit Singapore mobile number, e.g. 9123 4567.', 'salon-booking-enquiry' );
		}

		$email = sanitize_email( $str( 'email' ) );
		if ( '' !== $str( 'email' ) && ( '' === $email || ! is_email( $email ) ) ) {
			$this->errors['email'] = __( 'Enter an email like name@example.com.', 'salon-booking-enquiry' );
		}

		$message = sanitize_textarea_field( $str( 'message' ) );
		if ( mb_strlen( $message ) > self::MAX_MESSAGE ) {
			$this->errors['message'] = sprintf(
				/* translators: %d: maximum characters. */
				__( 'Please keep your message under %d characters.', 'salon-booking-enquiry' ),
				self::MAX_MESSAGE
			);
		}

		$consent = $flag( 'consent' );
		if ( ! $consent ) {
			$this->errors['consent'] = __( 'Please agree so we can contact you about your enquiry.', 'salon-booking-enquiry' );
		}

		if ( array() !== $this->errors || null === $mobile ) {
			return null;
		}

		return array(
			'brand'          => $brand,
			'outlet'         => $outlet,
			'service'        => $service,
			'date'           => $date,
			'time'           => $time,
			'first_name'     => $first_name,
			'mobile'         => $mobile,
			'mobile_display' => substr( $mobile, 3, 4 ) . ' ' . substr( $mobile, 7 ),
			'email'          => $email,
			'message'        => $message,
			'consent'        => true,
			'marketing'      => $flag( 'marketing' ),
		);
	}

	/**
	 * Errors keyed by field name.
	 *
	 * @return array<string, string>
	 */
	public function errors(): array {
		return $this->errors;
	}

	/**
	 * 1-50 characters: letters (any script, including CJK), marks, spaces and ' - .
	 *
	 * @param string $name Name.
	 */
	public static function valid_name( string $name ): bool {
		return 1 === preg_match( "/^[\p{L}\p{M}][\p{L}\p{M}\s'.\-]{0,49}$/u", $name );
	}

	/**
	 * Singapore mobile to E.164 (+65 then 8 digits starting 8 or 9), or null. Accepts spaces,
	 * dashes and an optional +65 / 65 prefix.
	 *
	 * @param string $raw Raw input.
	 */
	public static function normalise_mobile( string $raw ): ?string {
		$digits = preg_replace( '/[\s\-()]+/', '', $raw ) ?? '';
		$digits = (string) preg_replace( '/^(\+?65)(?=\d{8}$)/', '', $digits );
		return 1 === preg_match( '/^[89]\d{7}$/', $digits ) ? '+65' . $digits : null;
	}
}
