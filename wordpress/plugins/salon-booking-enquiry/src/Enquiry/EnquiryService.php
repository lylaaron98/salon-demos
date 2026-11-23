<?php
/**
 * Enquiry use case shared by the REST endpoint and the no-JS admin-post fallback:
 * honeypot -> rate limit -> validate -> slot check -> store.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Enquiry;

use SalonBookingEnquiry\Availability\SlotGenerator;
use SalonBookingEnquiry\Data\Catalogue;
use SalonBookingEnquiry\PostType\EnquiryPostType;
use SalonBookingEnquiry\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Submits enquiries.
 *
 * @phpstan-import-type Clean from Validator
 */
final class EnquiryService {

	/** Name of the honeypot input. Real people never see or fill it. */
	public const HONEYPOT = 'website';

	/**
	 * Constructor.
	 *
	 * @param SlotGenerator|null $slots Slot generator (injectable for tests).
	 */
	public function __construct( private ?SlotGenerator $slots = null ) {}

	/**
	 * Submit an enquiry.
	 *
	 * @param array<string, mixed> $input  Raw input.
	 * @param string               $source `rest` or `form`.
	 */
	public function submit( array $input, string $source ): Result {
		// Honeypot: pretend success so bots learn nothing, store nothing.
		$trap = $input[ self::HONEYPOT ] ?? '';
		if ( is_scalar( $trap ) && '' !== trim( (string) $trap ) ) {
			return Result::created( self::reference(), __( 'Thanks. We will be in touch soon.', 'salon-booking-enquiry' ), '' );
		}

		$settings = Settings::all();
		$limiter  = new RateLimiter( $settings['rate_limit'], $settings['rate_window'] * MINUTE_IN_SECONDS );
		$wait     = $limiter->hit( RateLimiter::client_ip() );
		if ( $wait > 0 ) {
			return Result::error(
				429,
				'sbe_rate_limited',
				__( "You've sent a few enquiries already. Please wait a few minutes, or WhatsApp us and we'll help straight away.", 'salon-booking-enquiry' ),
				array( 'retry_after' => $wait )
			);
		}

		$validator = new Validator();
		$clean     = $validator->validate( $input );
		if ( null === $clean ) {
			$errors = $validator->errors();
			return Result::error(
				422,
				'sbe_invalid',
				sprintf(
					/* translators: %d: number of fields with errors. */
					_n( '%d field needs attention.', '%d fields need attention.', count( $errors ), 'salon-booking-enquiry' ),
					count( $errors )
				),
				array( 'fields' => $errors )
			);
		}

		if ( '' !== $clean['date'] && '' !== $clean['time'] ) {
			$conflict = $this->slot_conflict( $clean );
			if ( null !== $conflict ) {
				return $conflict;
			}
		}

		$ref     = self::reference();
		$post_id = $this->store( $clean, $ref, $source );
		if ( 0 === $post_id ) {
			return Result::error( 500, 'sbe_store_failed', __( "We couldn't send that. Check your connection and try again, or WhatsApp us and we'll book it for you.", 'salon-booking-enquiry' ) );
		}

		/**
		 * Fires after an enquiry is stored. Hook here for a webhook (Make/Zapier) on hosts that allow
		 * outbound HTTP. No email is sent: InfinityFree blocks outbound mail.
		 *
		 * @param int    $post_id Enquiry post id.
		 * @param Clean  $clean   Sanitised data (contains personal data: do not log it).
		 * @param string $ref     Reference.
		 */
		do_action( 'salon_booking_enquiry_stored', $post_id, $clean, $ref );

		$message = sprintf(
			/* translators: 1: first name, 2: mobile number. */
			__( "Thanks, %1\$s. We'll WhatsApp you at %2\$s within 1 working hour.", 'salon-booking-enquiry' ),
			$clean['first_name'],
			$clean['mobile_display']
		);

		return Result::created( $ref, $message, $this->whatsapp_url( $clean, $ref ) );
	}

	/**
	 * 409 with the nearest alternatives when the chosen slot is not (or no longer) free.
	 *
	 * @param Clean $clean Clean data.
	 */
	private function slot_conflict( array $clean ): ?Result {
		$outlet   = Catalogue::outlet_by_id( $clean['outlet'] );
		$service  = Catalogue::service_by_id( $clean['service'] );
		$duration = null !== $service ? $service['duration'] : 60;
		if ( null === $outlet ) {
			return null;
		}
		$slots = $this->slots ?? new SlotGenerator();
		if ( $slots->is_available( $outlet['id'], $outlet['hours'], $duration, $clean['date'], $clean['time'] ) ) {
			return null;
		}
		$time_label = $clean['time'];
		$parsed     = $slots->parse_date( $clean['date'] );
		if ( null !== $parsed ) {
			[ $h, $m ]  = array_map( 'intval', explode( ':', $clean['time'] ) );
			$time_label = SlotGenerator::label( $parsed->setTime( $h, $m ) );
		}
		return Result::error(
			409,
			'sbe_slot_taken',
			sprintf(
				/* translators: %s: time, e.g. 2:30 pm. */
				__( 'Sorry, %s was just booked. Here are the nearest times:', 'salon-booking-enquiry' ),
				$time_label
			),
			array( 'alternatives' => $slots->nearest( $outlet['id'], $outlet['hours'], $duration, $clean['date'], $clean['time'] ) )
		);
	}

	/**
	 * Store as a private sbe_enquiry post. Returns the post id or 0.
	 *
	 * @param Clean  $clean  Clean data.
	 * @param string $ref    Reference.
	 * @param string $source Source.
	 */
	private function store( array $clean, string $ref, string $source ): int {
		$meta = array(
			EnquiryPostType::META['ref']        => $ref,
			EnquiryPostType::META['brand']      => $clean['brand'],
			EnquiryPostType::META['outlet']     => $clean['outlet'],
			EnquiryPostType::META['service']    => $clean['service'],
			EnquiryPostType::META['date']       => $clean['date'],
			EnquiryPostType::META['time']       => $clean['time'],
			EnquiryPostType::META['first_name'] => $clean['first_name'],
			EnquiryPostType::META['mobile']     => $clean['mobile'],
			EnquiryPostType::META['email']      => $clean['email'],
			EnquiryPostType::META['consent_at'] => gmdate( 'c' ),
			EnquiryPostType::META['marketing']  => $clean['marketing'],
			EnquiryPostType::META['source']     => 'form' === $source ? 'form' : 'rest',
		);

		$post_id = wp_insert_post(
			array(
				'post_type'    => EnquiryPostType::POST_TYPE,
				'post_status'  => 'private',
				'post_title'   => $ref . ' · ' . $clean['first_name'],
				'post_content' => $clean['message'],
				'post_author'  => 0,
				'meta_input'   => $meta,
			),
			true
		);
		return is_int( $post_id ) ? $post_id : 0;
	}

	/**
	 * Prefilled WhatsApp link for the success state (no personal data in the text).
	 *
	 * @param Clean  $clean Clean data.
	 * @param string $ref   Reference.
	 */
	private function whatsapp_url( array $clean, string $ref ): string {
		$outlet = Catalogue::outlet_by_id( $clean['outlet'] );
		$brand  = Catalogue::brand( $clean['brand'] );
		if ( null === $outlet || null === $brand ) {
			return '';
		}
		$text = sprintf(
			/* translators: 1: brand, 2: outlet, 3: reference. */
			__( 'Hi %1$s %2$s, about my enquiry %3$s. (sent from website)', 'salon-booking-enquiry' ),
			$brand['name'],
			$outlet['name'],
			$ref
		);
		return 'https://wa.me/' . preg_replace( '/\D+/', '', $outlet['whatsapp'] ) . '?text=' . rawurlencode( $text );
	}

	/**
	 * Short human reference, e.g. ORN-7K3Q (no ambiguous 0/O, 1/I).
	 */
	public static function reference(): string {
		$alphabet = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
		$ref      = '';
		for ( $i = 0; $i < 4; $i++ ) {
			$ref .= $alphabet[ random_int( 0, strlen( $alphabet ) - 1 ) ];
		}
		return 'ORN-' . $ref;
	}
}
