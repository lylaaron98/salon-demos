<?php
/**
 * Brands, outlets and services for the fictional Orrin Collective studios.
 *
 * Every name, address and phone number is fictional (design brief "originality rule"):
 * generic Singapore neighbourhoods, "Fictional Lane" addresses and +65 6xxx 0000 numbers.
 * Replace or extend through the `salon_booking_enquiry_catalogue` filter.
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Data;

defined( 'ABSPATH' ) || exit;

/**
 * Static catalogue.
 *
 * @phpstan-type Hours array<int, array{0: string, 1: string}|null>
 * @phpstan-type Outlet array{id: string, brand: string, name: string, street: string, postal_code: string, locality: string, mrt: string, phone: string, whatsapp: string, hours: Hours}
 * @phpstan-type Service array{id: string, brand: string, name: string, category: string, duration: int, price_from: int}
 * @phpstan-type Brand array{id: string, name: string, tagline: string, schema_type: string, phone: string, whatsapp: string}
 * @phpstan-type CatalogueShape array{brands: array<string, Brand>, outlets: array<string, Outlet>, services: array<string, Service>}
 */
final class Catalogue {

	/**
	 * Cached, filtered catalogue.
	 *
	 * @var CatalogueShape|null
	 */
	private static ?array $data = null;

	/**
	 * Opening hours by ISO weekday (1 = Monday): [open, close] in 24h, or null when closed.
	 *
	 * @return Hours
	 */
	private static function standard_hours(): array {
		$weekday = array( '10:00', '21:00' );
		$weekend = array( '10:00', '19:00' );
		return array(
			1 => $weekday,
			2 => $weekday,
			3 => $weekday,
			4 => $weekday,
			5 => $weekday,
			6 => $weekend,
			7 => $weekend,
		);
	}

	/**
	 * Build one outlet record.
	 *
	 * @param string $brand    Brand id.
	 * @param string $id       Outlet slug.
	 * @param string $locality Neighbourhood.
	 * @param string $unit     Fictional unit number.
	 * @param string $mrt      Nearest MRT (public transit info).
	 * @param string $phone    Fictional phone.
	 * @return Outlet
	 */
	private static function outlet( string $brand, string $id, string $locality, string $unit, string $mrt, string $phone ): array {
		return array(
			'id'          => $id,
			'brand'       => $brand,
			'name'        => $locality,
			'street'      => '1 Fictional Lane ' . $unit,
			'postal_code' => '000000',
			'locality'    => $locality,
			'mrt'         => $mrt,
			'phone'       => $phone,
			'whatsapp'    => '6580000000',
			'hours'       => self::standard_hours(),
		);
	}

	/**
	 * Build one service record.
	 *
	 * @param string $brand    Brand id.
	 * @param string $id       Service slug.
	 * @param string $name     Display name.
	 * @param string $category Category label.
	 * @param int    $duration Minutes.
	 * @param int    $price    From-price in whole S$ (GST inclusive).
	 * @return Service
	 */
	private static function service( string $brand, string $id, string $name, string $category, int $duration, int $price ): array {
		return array(
			'id'         => $id,
			'brand'      => $brand,
			'name'       => $name,
			'category'   => $category,
			'duration'   => $duration,
			'price_from' => $price,
		);
	}

	/**
	 * Full catalogue.
	 *
	 * @return CatalogueShape
	 */
	public static function all(): array {
		if ( null !== self::$data ) {
			return self::$data;
		}

		$brands = array(
			'sable'    => array(
				'id'          => 'sable',
				'name'        => 'Sable & Shear',
				'tagline'     => __( 'Cut with intent.', 'salon-booking-enquiry' ),
				'schema_type' => 'HairSalon',
				'phone'       => '+65 6000 0000',
				'whatsapp'    => '6580000000',
			),
			'dewlab'   => array(
				'id'          => 'dewlab',
				'name'        => 'Dewlab Skin Studio',
				'tagline'     => __( 'Skin, studied.', 'salon-booking-enquiry' ),
				'schema_type' => 'BeautySalon',
				'phone'       => '+65 6400 0000',
				'whatsapp'    => '6581000000',
			),
			'rootwell' => array(
				'id'          => 'rootwell',
				'name'        => 'Rootwell',
				'tagline'     => __( 'Healthy hair starts at the root.', 'salon-booking-enquiry' ),
				'schema_type' => 'HairSalon',
				'phone'       => '+65 6700 0000',
				'whatsapp'    => '6582000000',
			),
		);

		$outlets = array(
			self::outlet( 'sable', 'sable-tanjong-pagar', 'Tanjong Pagar', '#02-14', 'Tanjong Pagar MRT (EW15)', '+65 6100 0000' ),
			self::outlet( 'sable', 'sable-tiong-bahru', 'Tiong Bahru', '#01-08', 'Tiong Bahru MRT (EW17)', '+65 6200 0000' ),
			self::outlet( 'sable', 'sable-holland-village', 'Holland Village', '#03-21', 'Holland Village MRT (CC21)', '+65 6300 0000' ),
			self::outlet( 'dewlab', 'dewlab-tanjong-pagar', 'Tanjong Pagar', '#02-16', 'Tanjong Pagar MRT (EW15)', '+65 6400 0000' ),
			self::outlet( 'dewlab', 'dewlab-bugis', 'Bugis', '#04-02', 'Bugis MRT (EW12)', '+65 6500 0000' ),
			self::outlet( 'rootwell', 'rootwell-novena', 'Novena', '#05-11', 'Novena MRT (NS20)', '+65 6700 0000' ),
			self::outlet( 'rootwell', 'rootwell-paya-lebar', 'Paya Lebar', '#02-30', 'Paya Lebar MRT (EW8)', '+65 6800 0000' ),
		);

		$services = array(
			self::service( 'sable', 'sable-cut-finish', __( 'Cut and finish', 'salon-booking-enquiry' ), __( 'Cuts', 'salon-booking-enquiry' ), 60, 88 ),
			self::service( 'sable', 'sable-full-colour', __( 'Full colour', 'salon-booking-enquiry' ), __( 'Colour', 'salon-booking-enquiry' ), 120, 168 ),
			self::service( 'sable', 'sable-balayage', __( 'Balayage', 'salon-booking-enquiry' ), __( 'Colour', 'salon-booking-enquiry' ), 180, 288 ),
			self::service( 'sable', 'sable-bridal-trial', __( 'Bridal hair trial', 'salon-booking-enquiry' ), __( 'Bridal', 'salon-booking-enquiry' ), 90, 188 ),
			self::service( 'dewlab', 'dewlab-hydra-glow', __( 'Hydra-Glow Signature Facial', 'salon-booking-enquiry' ), __( 'Facials', 'salon-booking-enquiry' ), 75, 138 ),
			self::service( 'dewlab', 'dewlab-led-calm', __( 'LED calming facial', 'salon-booking-enquiry' ), __( 'Facials', 'salon-booking-enquiry' ), 45, 98 ),
			self::service( 'dewlab', 'dewlab-skin-analysis', __( 'Skin analysis', 'salon-booking-enquiry' ), __( 'Consultation', 'salon-booking-enquiry' ), 30, 48 ),
			self::service( 'rootwell', 'rootwell-scalp-check', __( 'Scalp check (20 min)', 'salon-booking-enquiry' ), __( 'Consultation', 'salon-booking-enquiry' ), 20, 0 ),
			self::service( 'rootwell', 'rootwell-head-spa', __( 'Head spa', 'salon-booking-enquiry' ), __( 'Treatments', 'salon-booking-enquiry' ), 60, 98 ),
			self::service( 'rootwell', 'rootwell-scalp-detox', __( 'Scalp detox', 'salon-booking-enquiry' ), __( 'Treatments', 'salon-booking-enquiry' ), 75, 128 ),
		);

		$data = array(
			'brands'   => $brands,
			'outlets'  => array_column( $outlets, null, 'id' ),
			'services' => array_column( $services, null, 'id' ),
		);

		/**
		 * Filters the catalogue of brands, outlets and services.
		 *
		 * @param CatalogueShape $data Catalogue.
		 */
		$filtered   = apply_filters( 'salon_booking_enquiry_catalogue', $data );
		self::$data = is_array( $filtered ) && isset( $filtered['brands'], $filtered['outlets'], $filtered['services'] ) ? $filtered : $data;
		return self::$data;
	}

	/**
	 * Reset the cache (tests, or after changing the filter at runtime).
	 */
	public static function flush(): void {
		self::$data = null;
	}

	/**
	 * Brands keyed by id.
	 *
	 * @return array<string, Brand>
	 */
	public static function brands(): array {
		return self::all()['brands'];
	}

	/**
	 * One brand or null.
	 *
	 * @param string $id Brand id.
	 * @return Brand|null
	 */
	public static function brand( string $id ): ?array {
		return self::brands()[ $id ] ?? null;
	}

	/**
	 * Outlets for a brand, optionally limited to the given ids (keeps the given order).
	 *
	 * @param string       $brand Brand id ('' for all brands).
	 * @param list<string> $only  Limit to these ids (empty for all).
	 * @return array<string, Outlet>
	 */
	public static function outlets( string $brand = '', array $only = array() ): array {
		return self::pick( self::all()['outlets'], $brand, $only );
	}

	/**
	 * Services for a brand, optionally limited to the given ids.
	 *
	 * @param string       $brand Brand id ('' for all brands).
	 * @param list<string> $only  Limit to these ids (empty for all).
	 * @return array<string, Service>
	 */
	public static function services( string $brand = '', array $only = array() ): array {
		return self::pick( self::all()['services'], $brand, $only );
	}

	/**
	 * One outlet or null.
	 *
	 * @param string $id Outlet id.
	 * @return Outlet|null
	 */
	public static function outlet_by_id( string $id ): ?array {
		return self::all()['outlets'][ $id ] ?? null;
	}

	/**
	 * One service or null.
	 *
	 * @param string $id Service id.
	 * @return Service|null
	 */
	public static function service_by_id( string $id ): ?array {
		return self::all()['services'][ $id ] ?? null;
	}

	/**
	 * Filter records by brand and an optional id allow-list.
	 *
	 * @template T of array{id: string, brand: string}
	 * @param array<string, T> $records Records keyed by id.
	 * @param string           $brand   Brand id or ''.
	 * @param list<string>     $only    Id allow-list.
	 * @return array<string, T>
	 */
	private static function pick( array $records, string $brand, array $only ): array {
		$records = array_filter(
			$records,
			static fn( array $r ): bool => '' === $brand || $r['brand'] === $brand
		);
		if ( array() === $only ) {
			return $records;
		}
		$picked = array();
		foreach ( $only as $id ) {
			if ( isset( $records[ $id ] ) ) {
				$picked[ $id ] = $records[ $id ];
			}
		}
		return $picked;
	}
}
