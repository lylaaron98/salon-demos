<?php
/**
 * Plugin Name:       Salon Booking Enquiry
 * Plugin URI:        https://github.com/lylaaron98/salon-demos
 * Description:       Multi-step salon enquiry form (Elementor widget, shortcode and block), enquiry storage as a private post type, REST availability and enquiry endpoints, promo modal and LocalBusiness/FAQ JSON-LD. Built for the fictional Orrin Collective demo; works with free Elementor and hosts without outbound email.
 * Version:           1.0.0
 * Requires at least: 6.5
 * Requires PHP:      8.1
 * Author:            Aaron Lee
 * Author URI:        https://github.com/lylaaron98
 * License:           GPL-2.0-or-later
 * License URI:       https://www.gnu.org/licenses/gpl-2.0.html
 * Text Domain:       salon-booking-enquiry
 * Domain Path:       /languages
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry;

defined( 'ABSPATH' ) || exit;

const VERSION     = '1.0.0';
const PLUGIN_FILE = __FILE__;

require_once __DIR__ . '/src/Autoloader.php';
Autoloader::register( __DIR__ . '/src' );

register_activation_hook( __FILE__, array( Plugin::class, 'activate' ) );

add_action(
	'plugins_loaded',
	static function (): void {
		Plugin::instance()->boot();
	}
);
