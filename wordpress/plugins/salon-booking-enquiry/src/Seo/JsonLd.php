<?php
/**
 * Structured data in wp_head:
 *
 * - Organization (Orrin Collective) + one LocalBusiness subtype (HairSalon / BeautySalon / ...)
 *   per outlet of the configured brand, with address, phone, opening hours and parentOrganization.
 *   Printed on the front page and on pages that contain the enquiry form.
 * - FAQPage from the settings' FAQ list, printed where the same FAQ is visible ([salon_faq] or the
 *   front page when enabled). Google treats FAQ rich results as informational only since 2023.
 *
 * Testimonials are deliberately not marked up as Review (self-serving reviews, design brief 4.6).
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Seo;

use SalonBookingEnquiry\Data\Catalogue;
use SalonBookingEnquiry\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * JSON-LD builder and printer.
 *
 * @phpstan-import-type Outlet from Catalogue
 */
final class JsonLd {

	private const DAYS = array(
		1 => 'Monday',
		2 => 'Tuesday',
		3 => 'Wednesday',
		4 => 'Thursday',
		5 => 'Friday',
		6 => 'Saturday',
		7 => 'Sunday',
	);

	/**
	 * Hook up.
	 */
	public function register_hooks(): void {
		add_action( 'wp_head', array( $this, 'print' ), 30 );
	}

	/**
	 * Print the scripts that apply to this request.
	 */
	public function print(): void {
		$settings = Settings::all();
		if ( ! $settings['schema_enabled'] || is_admin() ) {
			return;
		}

		$content = '';
		if ( is_singular() ) {
			$post    = get_post();
			$content = null !== $post ? $post->post_content : '';
		}
		$has_form = str_contains( $content, '[salon_enquiry' )
			|| str_contains( $content, 'wp:salon-booking-enquiry/enquiry-form' );
		$has_faq  = str_contains( $content, '[salon_faq' );

		if ( is_front_page() || $has_form || $this->elementor_has_widget() ) {
			self::output( $this->business_graph( $settings['brand'], $settings['schema_type'] ) );
		}

		$faq = Settings::faq_items();
		if ( array() !== $faq && ( $has_faq || ( $settings['faq_on_front_page'] && is_front_page() ) ) ) {
			self::output( self::faq_page( $faq ) );
		}
	}

	/**
	 * Whether the current Elementor page uses the enquiry widget (Elementor stores data in meta).
	 */
	private function elementor_has_widget(): bool {
		if ( ! is_singular() ) {
			return false;
		}
		$data = get_post_meta( (int) get_the_ID(), '_elementor_data', true );
		return is_string( $data ) && str_contains( $data, '"widgetType":"sbe-enquiry-form"' );
	}

	/**
	 * Organization + LocalBusiness per outlet.
	 *
	 * @param string $brand_id    Brand id.
	 * @param string $schema_type LocalBusiness subtype.
	 * @return array<string, mixed>
	 */
	public function business_graph( string $brand_id, string $schema_type ): array {
		$brand = Catalogue::brand( $brand_id );
		$home  = home_url( '/' );
		$org   = $home . '#organization';
		$graph = array(
			array(
				'@type' => 'Organization',
				'@id'   => $org,
				'name'  => 'Orrin Collective',
				'url'   => $home,
			),
		);
		if ( null === $brand ) {
			return self::wrap( $graph );
		}

		foreach ( Catalogue::outlets( $brand_id ) as $outlet ) {
			$graph[] = array(
				'@type'                     => $schema_type,
				'@id'                       => $home . '#' . $outlet['id'],
				'name'                      => $brand['name'] . ' · ' . $outlet['name'],
				'url'                       => $home,
				'telephone'                 => $outlet['phone'],
				'priceRange'                => 'S$$',
				'currenciesAccepted'        => 'SGD',
				'address'                   => array(
					'@type'           => 'PostalAddress',
					'streetAddress'   => $outlet['street'],
					'addressLocality' => $outlet['locality'],
					'postalCode'      => $outlet['postal_code'],
					'addressCountry'  => 'SG',
				),
				'openingHoursSpecification' => self::opening_hours( $outlet ),
				'parentOrganization'        => array( '@id' => $org ),
				'brand'                     => array(
					'@type' => 'Brand',
					'name'  => $brand['name'],
				),
			);
		}

		/**
		 * Filters the LocalBusiness graph before output.
		 *
		 * @param array<int, array<string, mixed>> $graph    Nodes.
		 * @param string                           $brand_id Brand id.
		 */
		$graph = (array) apply_filters( 'salon_booking_enquiry_jsonld_business', $graph, $brand_id );
		return self::wrap( $graph );
	}

	/**
	 * Group identical hours into OpeningHoursSpecification entries.
	 *
	 * @param Outlet $outlet Outlet.
	 * @return list<array<string, mixed>>
	 */
	public static function opening_hours( array $outlet ): array {
		$groups = array();
		foreach ( $outlet['hours'] as $day => $range ) {
			if ( null === $range || ! isset( self::DAYS[ $day ] ) ) {
				continue;
			}
			$key = $range[0] . '-' . $range[1];
			if ( ! isset( $groups[ $key ] ) ) {
				$groups[ $key ] = array(
					'@type'     => 'OpeningHoursSpecification',
					'dayOfWeek' => array(),
					'opens'     => $range[0],
					'closes'    => $range[1],
				);
			}
			$groups[ $key ]['dayOfWeek'][] = self::DAYS[ $day ];
		}
		return array_values( $groups );
	}

	/**
	 * FAQPage node.
	 *
	 * @param list<array{question: string, answer: string}> $items FAQ items.
	 * @return array<string, mixed>
	 */
	public static function faq_page( array $items ): array {
		return array(
			'@context'   => 'https://schema.org',
			'@type'      => 'FAQPage',
			'mainEntity' => array_map(
				static fn( array $item ): array => array(
					'@type'          => 'Question',
					'name'           => $item['question'],
					'acceptedAnswer' => array(
						'@type' => 'Answer',
						'text'  => $item['answer'],
					),
				),
				$items
			),
		);
	}

	/**
	 * Wrap nodes in a @graph document.
	 *
	 * @param array<int, mixed> $graph Nodes.
	 * @return array<string, mixed>
	 */
	private static function wrap( array $graph ): array {
		return array(
			'@context' => 'https://schema.org',
			'@graph'   => array_values( $graph ),
		);
	}

	/**
	 * Print one JSON-LD script. JSON_HEX_TAG stops "</script>" in data from closing the tag.
	 *
	 * @param array<string, mixed> $data Document.
	 */
	public static function output( array $data ): void {
		$json = wp_json_encode( $data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_HEX_TAG | JSON_HEX_AMP );
		if ( false === $json ) {
			return;
		}
		echo '<script type="application/ld+json">' . $json . "</script>\n"; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON encoded with JSON_HEX_TAG.
	}
}
