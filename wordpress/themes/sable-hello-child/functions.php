<?php
/**
 * Sable & Shear child theme bootstrap.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

define( 'SABLE_THEME_VERSION', '1.0.0' );
define( 'SABLE_THEME_DIR', get_stylesheet_directory() );
define( 'SABLE_THEME_URI', get_stylesheet_directory_uri() );

require_once SABLE_THEME_DIR . '/inc/template-tags.php';
require_once SABLE_THEME_DIR . '/inc/setup.php';
require_once SABLE_THEME_DIR . '/inc/assets.php';
require_once SABLE_THEME_DIR . '/inc/performance.php';
require_once SABLE_THEME_DIR . '/inc/customizer.php';
require_once SABLE_THEME_DIR . '/inc/elementor-kit.php';
