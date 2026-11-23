<?php
/**
 * Elementor widget: multi-step salon enquiry form (replaces Elementor Pro's Form widget).
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry\Elementor;

use Elementor\Controls_Manager;
use Elementor\Widget_Base;
use SalonBookingEnquiry\Data\Catalogue;
use SalonBookingEnquiry\Frontend\Assets;
use SalonBookingEnquiry\Frontend\FormRenderer;
use SalonBookingEnquiry\Settings;

defined( 'ABSPATH' ) || exit;

/**
 * Enquiry form widget.
 */
final class EnquiryFormWidget extends Widget_Base {

	/**
	 * Widget slug.
	 */
	public function get_name(): string {
		return 'sbe-enquiry-form';
	}

	/**
	 * Panel title.
	 *
	 * @return string
	 */
	public function get_title() {
		return __( 'Salon enquiry form', 'salon-booking-enquiry' );
	}

	/**
	 * Panel icon.
	 *
	 * @return string
	 */
	public function get_icon() {
		return 'eicon-form-horizontal';
	}

	/**
	 * Panel category.
	 *
	 * @return array<int, string>
	 */
	public function get_categories() {
		return array( Integration::CATEGORY, 'general' );
	}

	/**
	 * Search keywords.
	 *
	 * @return array<int, string>
	 */
	public function get_keywords() {
		return array( 'form', 'booking', 'enquiry', 'salon', 'appointment', 'contact' );
	}

	/**
	 * Front-end script dependency (Elementor loads it only where the widget is used).
	 *
	 * @return array<int, string>
	 */
	public function get_script_depends() {
		return array( Assets::FORM_SCRIPT );
	}

	/**
	 * Front-end style dependency.
	 *
	 * @return array<int, string>
	 */
	public function get_style_depends() {
		return array( Assets::FORM_STYLE );
	}

	/**
	 * Option list "Brand · Outlet" for SELECT2 controls.
	 *
	 * @param array<string, array{id: string, brand: string, name: string}> $records Records.
	 * @return array<string, string>
	 */
	private static function options( array $records ): array {
		$options = array();
		foreach ( $records as $id => $record ) {
			$brand          = Catalogue::brand( $record['brand'] );
			$options[ $id ] = ( null !== $brand ? $brand['name'] . ' · ' : '' ) . $record['name'];
		}
		return $options;
	}

	/**
	 * Controls.
	 *
	 * @return void
	 */
	protected function register_controls() {
		$defaults = FormRenderer::defaults();
		$brands   = array_map( static fn( array $b ): string => $b['name'], Catalogue::brands() );

		$this->start_controls_section(
			'section_studio',
			array(
				'label' => __( 'Studio', 'salon-booking-enquiry' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'brand',
			array(
				'label'   => __( 'Brand', 'salon-booking-enquiry' ),
				'type'    => Controls_Manager::SELECT,
				'options' => $brands,
				'default' => Settings::all()['brand'],
			)
		);

		$this->add_control(
			'outlets',
			array(
				'label'       => __( 'Outlets', 'salon-booking-enquiry' ),
				'description' => __( 'Leave empty to list every outlet of the brand. Outlets from another brand are ignored.', 'salon-booking-enquiry' ),
				'type'        => Controls_Manager::SELECT2,
				'multiple'    => true,
				'label_block' => true,
				'options'     => self::options( Catalogue::outlets() ),
				'default'     => array(),
			)
		);

		$this->add_control(
			'services',
			array(
				'label'       => __( 'Services', 'salon-booking-enquiry' ),
				'description' => __( 'Leave empty to list every service of the brand.', 'salon-booking-enquiry' ),
				'type'        => Controls_Manager::SELECT2,
				'multiple'    => true,
				'label_block' => true,
				'options'     => self::options( Catalogue::services() ),
				'default'     => array(),
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_form',
			array(
				'label' => __( 'Form', 'salon-booking-enquiry' ),
				'tab'   => Controls_Manager::TAB_CONTENT,
			)
		);

		$this->add_control(
			'heading',
			array(
				'label'       => __( 'Heading', 'salon-booking-enquiry' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => $defaults['heading'],
				'label_block' => true,
			)
		);

		$this->add_control(
			'intro',
			array(
				'label'   => __( 'Intro', 'salon-booking-enquiry' ),
				'type'    => Controls_Manager::TEXTAREA,
				'default' => $defaults['intro'],
				'rows'    => 3,
			)
		);

		$this->add_control(
			'submit_label',
			array(
				'label'   => __( 'Submit button label', 'salon-booking-enquiry' ),
				'type'    => Controls_Manager::TEXT,
				'default' => $defaults['submit_label'],
			)
		);

		$this->add_control(
			'show_schedule',
			array(
				'label'        => __( 'Ask for a date and time', 'salon-booking-enquiry' ),
				'type'         => Controls_Manager::SWITCHER,
				'return_value' => 'yes',
				'default'      => 'yes',
			)
		);

		$this->add_control(
			'ask_email',
			array(
				'label'        => __( 'Ask for email (optional field)', 'salon-booking-enquiry' ),
				'description'  => __( 'Off keeps the form to four fields (design brief 4.11).', 'salon-booking-enquiry' ),
				'type'         => Controls_Manager::SWITCHER,
				'return_value' => 'yes',
				'default'      => '',
			)
		);

		$this->add_control(
			'form_id',
			array(
				'label'       => __( 'Form ID (analytics)', 'salon-booking-enquiry' ),
				'description' => __( 'Sent as form_id with the enquiry_submit event.', 'salon-booking-enquiry' ),
				'type'        => Controls_Manager::TEXT,
				'default'     => 'enquiry',
			)
		);

		$this->end_controls_section();

		$this->start_controls_section(
			'section_style',
			array(
				'label' => __( 'Colours', 'salon-booking-enquiry' ),
				'tab'   => Controls_Manager::TAB_STYLE,
			)
		);

		$this->add_control(
			'note',
			array(
				'type' => Controls_Manager::RAW_HTML,
				'raw'  => esc_html__( 'The form uses the design tokens and Elementor global colours. Override only for special campaigns.', 'salon-booking-enquiry' ),
			)
		);

		$this->add_control(
			'accent',
			array(
				'label'     => __( 'Action colour', 'salon-booking-enquiry' ),
				'type'      => Controls_Manager::COLOR,
				'selectors' => array( '{{WRAPPER}} .sbe-form' => '--sbe-action: {{VALUE}};' ),
				'global'    => array( 'default' => 'globals/colors?id=primary' ),
			)
		);

		$this->end_controls_section();
	}

	/**
	 * Front-end and editor-preview render.
	 *
	 * @return void
	 */
	protected function render() {
		$settings = $this->get_settings_for_display();
		$html     = FormRenderer::render(
			array(
				'brand'         => $settings['brand'] ?? '',
				'outlets'       => $settings['outlets'] ?? array(),
				'services'      => $settings['services'] ?? array(),
				'heading'       => $settings['heading'] ?? '',
				'intro'         => $settings['intro'] ?? '',
				'submit_label'  => $settings['submit_label'] ?? '',
				'show_schedule' => 'yes' === ( $settings['show_schedule'] ?? '' ),
				'ask_email'     => 'yes' === ( $settings['ask_email'] ?? '' ),
				'form_id'       => $settings['form_id'] ?? 'enquiry',
			)
		);
		echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- FormRenderer escapes every value it prints.
	}
}
