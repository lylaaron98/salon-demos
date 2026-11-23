<?php
/**
 * Plugin settings stored in one option, with defaults and sanitisation.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry;

defined( 'ABSPATH' ) || exit;

/**
 * Typed access to the `sbe_settings` option.
 *
 * @phpstan-type SettingsShape array{
 *   brand: string,
 *   schema_enabled: bool,
 *   schema_type: string,
 *   faq_items: string,
 *   faq_on_front_page: bool,
 *   promo_enabled: bool,
 *   promo_id: string,
 *   promo_heading: string,
 *   promo_body: string,
 *   promo_cta_label: string,
 *   promo_cta_url: string,
 *   promo_delay: int,
 *   promo_frequency_days: int,
 *   promo_exit_intent: bool,
 *   rate_limit: int,
 *   rate_window: int,
 *   delete_on_uninstall: bool
 * }
 */
final class Settings {

	public const OPTION = 'sbe_settings';

	public const SCHEMA_TYPES = array( 'HairSalon', 'BeautySalon', 'DaySpa', 'HealthAndBeautyBusiness' );

	/**
	 * Defaults (fictional demo copy).
	 *
	 * @return SettingsShape
	 */
	public static function defaults(): array {
		return array(
			'brand'                => 'sable',
			'schema_enabled'       => true,
			'schema_type'          => 'HairSalon',
			'faq_items'            => implode(
				"\n",
				array(
					__( 'Do I need to book ahead? | Yes, we work by appointment. Same-day slots open up often, so WhatsApp us if you cannot see one.', 'salon-booking-enquiry' ),
					__( 'How do I pay? | You pay at the outlet after your appointment. Prices include 9% GST.', 'salon-booking-enquiry' ),
					__( 'Can I change my appointment? | Yes, free of charge up to 24 hours before. Reply to your confirmation or WhatsApp us.', 'salon-booking-enquiry' ),
				)
			),
			'faq_on_front_page'    => true,
			'promo_enabled'        => false,
			'promo_id'             => 'first-visit',
			'promo_heading'        => __( 'First visit? S$10 off your cut', 'salon-booking-enquiry' ),
			'promo_body'           => __( 'Tell us it is your first visit when you enquire. Demo offer, not a real promotion.', 'salon-booking-enquiry' ),
			'promo_cta_label'      => __( 'Book a stylist', 'salon-booking-enquiry' ),
			'promo_cta_url'        => '/book/',
			'promo_delay'          => 8,
			'promo_frequency_days' => 7,
			'promo_exit_intent'    => true,
			'rate_limit'           => 5,
			'rate_window'          => 15,
			'delete_on_uninstall'  => false,
		);
	}

	/**
	 * Current settings merged over defaults.
	 *
	 * @return SettingsShape
	 */
	public static function all(): array {
		$stored = get_option( self::OPTION, array() );
		return self::sanitize( is_array( $stored ) ? $stored : array() );
	}

	/**
	 * Read one setting.
	 *
	 * @param key-of<SettingsShape> $key Setting key.
	 * @return string|int|bool
	 */
	public static function get( string $key ) {
		return self::all()[ $key ];
	}

	/**
	 * Sanitise raw input (Settings API callback and reads).
	 *
	 * @param array<mixed> $input Raw values.
	 * @return SettingsShape
	 */
	public static function sanitize( array $input ): array {
		$defaults = self::defaults();
		$out      = $defaults;

		$text = static fn( string $key ): string => isset( $input[ $key ] ) && is_scalar( $input[ $key ] ) ? sanitize_text_field( (string) $input[ $key ] ) : $defaults[ $key ];
		$bool = static fn( string $key ): bool => array_key_exists( $key, $input ) ? filter_var( $input[ $key ], FILTER_VALIDATE_BOOLEAN ) : (bool) $defaults[ $key ];
		$int  = static function ( string $key, int $min, int $max ) use ( $input, $defaults ): int {
			$value = isset( $input[ $key ] ) && is_numeric( $input[ $key ] ) ? (int) $input[ $key ] : (int) $defaults[ $key ];
			return max( $min, min( $max, $value ) );
		};

		$brand        = $text( 'brand' );
		$out['brand'] = array_key_exists( $brand, Data\Catalogue::brands() ) ? $brand : $defaults['brand'];

		$out['schema_enabled'] = $bool( 'schema_enabled' );
		$type                  = $text( 'schema_type' );
		$out['schema_type']    = in_array( $type, self::SCHEMA_TYPES, true ) ? $type : $defaults['schema_type'];
		$out['faq_items']      = isset( $input['faq_items'] ) && is_string( $input['faq_items'] ) ? sanitize_textarea_field( $input['faq_items'] ) : $defaults['faq_items'];

		$out['faq_on_front_page'] = $bool( 'faq_on_front_page' );

		$out['promo_enabled']        = $bool( 'promo_enabled' );
		$out['promo_id']             = sanitize_key( $text( 'promo_id' ) );
		$out['promo_id']             = '' === $out['promo_id'] ? $defaults['promo_id'] : $out['promo_id'];
		$out['promo_heading']        = $text( 'promo_heading' );
		$out['promo_body']           = isset( $input['promo_body'] ) && is_string( $input['promo_body'] ) ? sanitize_textarea_field( $input['promo_body'] ) : $defaults['promo_body'];
		$out['promo_cta_label']      = $text( 'promo_cta_label' );
		$out['promo_cta_url']        = isset( $input['promo_cta_url'] ) && is_string( $input['promo_cta_url'] ) ? esc_url_raw( $input['promo_cta_url'] ) : $defaults['promo_cta_url'];
		$out['promo_delay']          = $int( 'promo_delay', 0, 120 );
		$out['promo_frequency_days'] = $int( 'promo_frequency_days', 0, 365 );
		$out['promo_exit_intent']    = $bool( 'promo_exit_intent' );

		$out['rate_limit']          = $int( 'rate_limit', 1, 100 );
		$out['rate_window']         = $int( 'rate_window', 1, 1440 );
		$out['delete_on_uninstall'] = $bool( 'delete_on_uninstall' );

		return $out;
	}

	/**
	 * FAQ items parsed from "Question | Answer" lines.
	 *
	 * @return list<array{question: string, answer: string}>
	 */
	public static function faq_items(): array {
		$items = array();
		$lines = preg_split( '/\R/', self::all()['faq_items'] );
		foreach ( false === $lines ? array() : $lines as $line ) {
			$parts = array_map( 'trim', explode( '|', $line, 2 ) );
			if ( 2 === count( $parts ) && '' !== $parts[0] && '' !== $parts[1] ) {
				$items[] = array(
					'question' => $parts[0],
					'answer'   => $parts[1],
				);
			}
		}
		return $items;
	}
}
