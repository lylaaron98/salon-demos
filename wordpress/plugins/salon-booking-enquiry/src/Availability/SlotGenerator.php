<?php
/**
 * Mock, deterministic appointment slots that behave like a real salon diary.
 *
 * - 30-minute grid inside each outlet's opening hours; the last start leaves room for the service.
 * - About a third of slots are "taken", chosen by a hash of outlet + date + time, so the same
 *   request always returns the same answer (cache friendly, testable, no database).
 * - Roughly one day in eleven is fully booked, to exercise the empty state (design brief 6.1).
 * - Slots earlier than now + lead time are never offered. Dates run for the next 14 days.
 *
 * Pure PHP with no WordPress calls, so it can be unit-tested in isolation.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Availability;

use DateInterval;
use DateTimeImmutable;
use DateTimeZone;

defined( 'ABSPATH' ) || exit;

/**
 * Generates slots for an outlet and service.
 *
 * @phpstan-type Slot array{time: string, label: string, daypart: string}
 * @phpstan-type Day array{date: string, label: string, weekday: string, count: int}
 */
final class SlotGenerator {

	public const DAYS_AHEAD    = 14;
	public const STEP_MINUTES  = 30;
	public const LEAD_MINUTES  = 60;
	public const TAKEN_PERCENT = 35;

	/**
	 * Reference "now" in Asia/Singapore.
	 *
	 * @var DateTimeImmutable
	 */
	private DateTimeImmutable $now;

	/**
	 * Constructor.
	 *
	 * @param DateTimeImmutable|null $now Current time (injected for tests). Defaults to now in Singapore.
	 */
	public function __construct( ?DateTimeImmutable $now = null ) {
		$this->now = $now ?? new DateTimeImmutable( 'now', new DateTimeZone( 'Asia/Singapore' ) );
	}

	/**
	 * Bookable dates from today for DAYS_AHEAD days, with the number of free slots.
	 *
	 * @param string                                       $outlet_id Outlet id.
	 * @param array<int, array{0: string, 1: string}|null> $hours     Opening hours by ISO weekday.
	 * @param int                                          $duration  Service minutes.
	 * @return list<Day>
	 */
	public function days( string $outlet_id, array $hours, int $duration ): array {
		$days  = array();
		$today = $this->now->setTime( 0, 0 );
		for ( $i = 0; $i < self::DAYS_AHEAD; $i++ ) {
			$date   = $today->add( new DateInterval( 'P' . $i . 'D' ) );
			$days[] = array(
				'date'    => $date->format( 'Y-m-d' ),
				'label'   => $date->format( 'D j M' ),
				'weekday' => $date->format( 'D' ),
				'count'   => count( $this->slots( $outlet_id, $hours, $duration, $date->format( 'Y-m-d' ) ) ),
			);
		}
		return $days;
	}

	/**
	 * Free slots on one date. Unavailable slots are omitted, never returned greyed out.
	 *
	 * @param string                                       $outlet_id Outlet id.
	 * @param array<int, array{0: string, 1: string}|null> $hours     Opening hours by ISO weekday.
	 * @param int                                          $duration  Service minutes.
	 * @param string                                       $date      Y-m-d.
	 * @return list<Slot>
	 */
	public function slots( string $outlet_id, array $hours, int $duration, string $date ): array {
		$day = $this->parse_date( $date );
		if ( null === $day || ! $this->in_range( $day ) ) {
			return array();
		}

		$opening = $hours[ (int) $day->format( 'N' ) ] ?? null;
		if ( null === $opening || $this->fully_booked( $outlet_id, $date ) ) {
			return array();
		}

		[ $open, $close ] = $opening;
		$start            = $this->at( $day, $open );
		$last_start       = $this->at( $day, $close )->sub( new DateInterval( 'PT' . max( self::STEP_MINUTES, $duration ) . 'M' ) );
		$earliest         = $this->now->add( new DateInterval( 'PT' . self::LEAD_MINUTES . 'M' ) );

		$slots = array();
		for ( $t = $start; $t <= $last_start; $t = $t->add( new DateInterval( 'PT' . self::STEP_MINUTES . 'M' ) ) ) {
			if ( $t < $earliest || $this->taken( $outlet_id, $date, $t->format( 'H:i' ) ) ) {
				continue;
			}
			$slots[] = array(
				'time'    => $t->format( 'H:i' ),
				'label'   => self::label( $t ),
				'daypart' => self::daypart( (int) $t->format( 'G' ) ),
			);
		}
		return $slots;
	}

	/**
	 * Whether a specific slot is free.
	 *
	 * @param string                                       $outlet_id Outlet id.
	 * @param array<int, array{0: string, 1: string}|null> $hours     Opening hours.
	 * @param int                                          $duration  Service minutes.
	 * @param string                                       $date      Y-m-d.
	 * @param string                                       $time      H:i.
	 */
	public function is_available( string $outlet_id, array $hours, int $duration, string $date, string $time ): bool {
		foreach ( $this->slots( $outlet_id, $hours, $duration, $date ) as $slot ) {
			if ( $slot['time'] === $time ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Up to $limit free slots nearest to the requested time, searching the same day then later days.
	 *
	 * @param string                                       $outlet_id Outlet id.
	 * @param array<int, array{0: string, 1: string}|null> $hours     Opening hours.
	 * @param int                                          $duration  Service minutes.
	 * @param string                                       $date      Y-m-d.
	 * @param string                                       $time      H:i.
	 * @param int                                          $limit     Max alternatives.
	 * @return list<array{date: string, time: string, label: string}>
	 */
	public function nearest( string $outlet_id, array $hours, int $duration, string $date, string $time, int $limit = 3 ): array {
		$day = $this->parse_date( $date ) ?? $this->now->setTime( 0, 0 );
		$out = array();
		for ( $i = 0; $i < self::DAYS_AHEAD; $i++ ) {
			if ( count( $out ) >= $limit ) {
				break;
			}
			$current = $day->add( new DateInterval( 'P' . $i . 'D' ) )->format( 'Y-m-d' );
			$slots   = $this->slots( $outlet_id, $hours, $duration, $current );
			if ( 0 === $i ) {
				$target = $this->minutes( $time );
				usort(
					$slots,
					fn( array $a, array $b ): int => abs( $this->minutes( $a['time'] ) - $target ) <=> abs( $this->minutes( $b['time'] ) - $target )
				);
			}
			foreach ( $slots as $slot ) {
				if ( count( $out ) >= $limit ) {
					break;
				}
				$out[] = array(
					'date'  => $current,
					'time'  => $slot['time'],
					'label' => $slot['label'],
				);
			}
		}
		return $out;
	}

	/**
	 * 12-hour UI label, e.g. "2:30 pm" or "10 am" (design brief microcopy).
	 *
	 * @param DateTimeImmutable $t Time.
	 */
	public static function label( DateTimeImmutable $t ): string {
		return '00' === $t->format( 'i' ) ? $t->format( 'g a' ) : $t->format( 'g:i a' );
	}

	/**
	 * Morning (< 12:00), afternoon (< 17:00) or evening.
	 *
	 * @param int $hour 0-23.
	 */
	public static function daypart( int $hour ): string {
		if ( $hour < 12 ) {
			return 'morning';
		}
		return $hour < 17 ? 'afternoon' : 'evening';
	}

	/**
	 * Strictly parse Y-m-d in the generator's timezone.
	 *
	 * @param string $date Date string.
	 */
	public function parse_date( string $date ): ?DateTimeImmutable {
		$parsed = DateTimeImmutable::createFromFormat( '!Y-m-d', $date, $this->now->getTimezone() );
		return ( false !== $parsed && $parsed->format( 'Y-m-d' ) === $date ) ? $parsed : null;
	}

	/**
	 * Whether a date is within today .. today + DAYS_AHEAD - 1.
	 *
	 * @param DateTimeImmutable $day Midnight of the date.
	 */
	private function in_range( DateTimeImmutable $day ): bool {
		$today = $this->now->setTime( 0, 0 );
		$last  = $today->add( new DateInterval( 'P' . ( self::DAYS_AHEAD - 1 ) . 'D' ) );
		return $day >= $today && $day <= $last;
	}

	/**
	 * Combine a date with an H:i time.
	 *
	 * @param DateTimeImmutable $day  Date.
	 * @param string            $time H:i.
	 */
	private function at( DateTimeImmutable $day, string $time ): DateTimeImmutable {
		[ $h, $m ] = array_map( 'intval', explode( ':', $time ) + array( 1 => '0' ) );
		return $day->setTime( $h, $m );
	}

	/**
	 * Minutes since midnight for H:i.
	 *
	 * @param string $time H:i.
	 */
	private function minutes( string $time ): int {
		[ $h, $m ] = array_map( 'intval', explode( ':', $time ) + array( 1 => '0' ) );
		return $h * 60 + $m;
	}

	/**
	 * Deterministic "already booked" flag for one slot.
	 *
	 * @param string $outlet_id Outlet id.
	 * @param string $date      Y-m-d.
	 * @param string $time      H:i.
	 */
	private function taken( string $outlet_id, string $date, string $time ): bool {
		return crc32( $outlet_id . '|' . $date . '|' . $time ) % 100 < self::TAKEN_PERCENT;
	}

	/**
	 * Deterministic fully booked day.
	 *
	 * @param string $outlet_id Outlet id.
	 * @param string $date      Y-m-d.
	 */
	private function fully_booked( string $outlet_id, string $date ): bool {
		return 0 === crc32( 'full|' . $outlet_id . '|' . $date ) % 11;
	}
}
