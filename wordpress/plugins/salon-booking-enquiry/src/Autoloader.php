<?php
/**
 * PSR-4 autoloader for the SalonBookingEnquiry namespace (no Composer needed at runtime).
 *
 * @package SalonBookingEnquiry
 */

declare( strict_types = 1 );

namespace SalonBookingEnquiry;

defined( 'ABSPATH' ) || exit;

/**
 * Maps SalonBookingEnquiry\Foo\Bar to src/Foo/Bar.php.
 */
final class Autoloader {

	private const PREFIX = __NAMESPACE__ . '\\';

	/**
	 * Register the autoloader.
	 *
	 * @param string $base_dir Absolute path to src/.
	 */
	public static function register( string $base_dir ): void {
		spl_autoload_register(
			static function ( string $class_name ) use ( $base_dir ): void {
				if ( ! str_starts_with( $class_name, self::PREFIX ) ) {
					return;
				}
				$relative = substr( $class_name, strlen( self::PREFIX ) );
				$file     = $base_dir . '/' . str_replace( '\\', '/', $relative ) . '.php';
				if ( is_readable( $file ) ) {
					require_once $file;
				}
			}
		);
	}
}
