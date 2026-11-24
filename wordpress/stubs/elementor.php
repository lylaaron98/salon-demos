<?php
/**
 * Minimal Elementor stubs for PHPStan: only the classes and members this repo touches.
 * Elementor ships no official stubs package; signatures follow Elementor 3.2x.
 *
 * @package SalonDemos
 */

namespace Elementor {

	class Controls_Manager {
		const TAB_CONTENT  = 'content';
		const TAB_STYLE    = 'style';
		const TEXT         = 'text';
		const TEXTAREA     = 'textarea';
		const SELECT       = 'select';
		const SELECT2      = 'select2';
		const SWITCHER     = 'switcher';
		const URL          = 'url';
		const HEADING      = 'heading';
		const COLOR        = 'color';
		const RAW_HTML     = 'raw_html';
	}

	class Files_Manager {
		public function clear_cache(): void {}
	}

	class Widgets_Manager {
		public function register( Widget_Base $widget ): bool {
			return true;
		}
	}

	class Elements_Manager {
		/**
		 * @param array<string, mixed> $properties
		 */
		public function add_category( string $name, array $properties ): void {}
	}

	class Plugin {
		/** @var Plugin */
		public static $instance;
		/** @var Files_Manager|null */
		public $files_manager;
		/** @var Widgets_Manager */
		public $widgets_manager;
		/** @var Elements_Manager */
		public $elements_manager;
	}

	abstract class Controls_Stack {
		/**
		 * @param array<string, mixed> $args
		 */
		public function start_controls_section( string $section_id, array $args = array() ): void {}

		public function end_controls_section(): void {}

		/**
		 * @param array<string, mixed> $args
		 * @param array<string, mixed> $options
		 */
		public function add_control( string $id, array $args, array $options = array() ): bool {
			return true;
		}

		/**
		 * @return array<string, mixed>
		 */
		public function get_settings_for_display( ?string $setting_key = null ) {
			return array();
		}

		/**
		 * @return string
		 */
		public function get_id() {
			return '';
		}
	}

	abstract class Element_Base extends Controls_Stack {
		/**
		 * @param array<string, mixed>|string $element
		 * @param array<string, mixed>|string|null $key
		 * @param array<int|string, mixed>|string|null $value
		 */
		public function add_render_attribute( $element, $key = null, $value = null, bool $overwrite = false ): self {
			return $this;
		}

		public function get_render_attribute_string( string $element ): string {
			return '';
		}
	}

	abstract class Widget_Base extends Element_Base {
		/**
		 * @param array<string, mixed> $data
		 * @param array<string, mixed>|null $args
		 */
		public function __construct( array $data = array(), ?array $args = null ) {}

		abstract public function get_name(): string;

		/** @return string */
		public function get_title() {
			return '';
		}

		/** @return string */
		public function get_icon() {
			return '';
		}

		/** @return array<int, string> */
		public function get_categories() {
			return array();
		}

		/** @return array<int, string> */
		public function get_keywords() {
			return array();
		}

		/** @return array<int, string> */
		public function get_script_depends() {
			return array();
		}

		/** @return array<int, string> */
		public function get_style_depends() {
			return array();
		}

		/** @return void */
		protected function register_controls() {}

		/** @return void */
		protected function render() {}
	}
}

namespace {
	/**
	 * Elementor Pro Theme Builder location (only defined when Pro is active).
	 */
	function elementor_theme_do_location( string $location ): bool {
		return false;
	}
}
