<?php
/**
 * Site header (replaces Elementor Pro Theme Builder header).
 *
 * Desktop (>=1024): utility bar (brand switcher, outlets, phone) + main bar (logo, nav, Book now).
 * Mobile (<1024): 60px bar (menu button, logo, call button) + slide-in drawer (<dialog>).
 * If Elementor Pro is active and a Theme Builder header exists, that one wins.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$sable_contact = sable_contact();
$sable_variant = sable_header_variant();
?>
<!doctype html>
<html <?php language_attributes(); ?>>
<head>
	<meta charset="<?php bloginfo( 'charset' ); ?>">
	<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
	<?php wp_head(); ?>
</head>
<body <?php body_class(); ?>>
<?php wp_body_open(); ?>
<a class="sable-skip-link" href="#sable-content"><?php esc_html_e( 'Skip to content', 'sable-hello-child' ); ?></a>
<?php
if ( function_exists( 'elementor_theme_do_location' ) && elementor_theme_do_location( 'header' ) ) {
	echo '<div id="sable-content" tabindex="-1"></div>';
	return;
}
?>
<header class="sable-header sable-header--<?php echo esc_attr( $sable_variant ); ?>" data-sable-header>
	<?php if ( 'minimal' !== $sable_variant ) : ?>
		<div class="sable-utility">
			<div class="sable-container sable-utility__inner">
				<p class="sable-utility__group">
					<span class="sable-utility__orrin"><?php esc_html_e( 'Orrin Collective', 'sable-hello-child' ); ?></span>
				</p>
				<?php sable_the_brand_switcher( __( 'Orrin Collective studios', 'sable-hello-child' ) ); ?>
				<p class="sable-utility__links">
					<a href="<?php echo esc_url( home_url( '/outlets/' ) ); ?>"><?php esc_html_e( 'Find an outlet', 'sable-hello-child' ); ?></a>
					<a href="<?php echo esc_url( sable_tel_url() ); ?>" data-contact="call" data-location="header"><?php echo esc_html( $sable_contact['phone_display'] ); ?></a>
				</p>
			</div>
		</div>
	<?php endif; ?>

	<div class="sable-mainbar">
		<div class="sable-container sable-mainbar__inner">
			<?php if ( 'minimal' !== $sable_variant ) : ?>
				<button type="button" class="sable-icon-button sable-menu-toggle" aria-expanded="false" aria-controls="sable-drawer" data-sable-drawer-open>
					<?php sable_the_icon( 'menu' ); ?>
					<span class="screen-reader-text"><?php esc_html_e( 'Open menu', 'sable-hello-child' ); ?></span>
				</button>
			<?php endif; ?>

			<div class="sable-mainbar__logo"><?php sable_the_logo(); ?></div>

			<?php if ( 'minimal' !== $sable_variant ) : ?>
				<nav class="sable-nav" aria-label="<?php esc_attr_e( 'Main', 'sable-hello-child' ); ?>">
					<?php sable_primary_menu( 'header' ); ?>
				</nav>
			<?php endif; ?>

			<div class="sable-mainbar__actions">
				<a class="sable-icon-button sable-mainbar__call" href="<?php echo esc_url( sable_tel_url() ); ?>" data-contact="call" data-location="header">
					<?php sable_the_icon( 'phone' ); ?>
					<span class="screen-reader-text">
						<?php
						/* translators: %s: phone number. */
						echo esc_html( sprintf( __( 'Call us on %s', 'sable-hello-child' ), $sable_contact['phone_display'] ) );
						?>
					</span>
				</a>
				<a class="sable-button sable-mainbar__cta" href="<?php echo esc_url( $sable_contact['book_url'] ); ?>" data-cta="header_book">
					<?php echo esc_html( $sable_contact['book_label'] ); ?>
				</a>
			</div>
		</div>
	</div>
</header>

<?php if ( 'minimal' !== $sable_variant ) : ?>
	<dialog id="sable-drawer" class="sable-drawer" aria-labelledby="sable-drawer-title" data-sable-drawer>
		<div class="sable-drawer__panel">
			<div class="sable-drawer__head">
				<h2 id="sable-drawer-title" class="sable-drawer__title"><?php esc_html_e( 'Menu', 'sable-hello-child' ); ?></h2>
				<button type="button" class="sable-icon-button" data-sable-drawer-close>
					<?php sable_the_icon( 'close' ); ?>
					<span class="screen-reader-text"><?php esc_html_e( 'Close menu', 'sable-hello-child' ); ?></span>
				</button>
			</div>
			<nav class="sable-drawer__nav" aria-label="<?php esc_attr_e( 'Main', 'sable-hello-child' ); ?>">
				<?php sable_primary_menu( 'drawer' ); ?>
			</nav>
			<div class="sable-drawer__actions">
				<a class="sable-button sable-button--block" href="<?php echo esc_url( $sable_contact['book_url'] ); ?>" data-cta="drawer_book">
					<?php echo esc_html( $sable_contact['book_label'] ); ?>
				</a>
				<a class="sable-button sable-button--whatsapp sable-button--block" href="<?php echo esc_url( sable_whatsapp_url( __( "Hi Sable & Shear, I'd like to book an appointment. (sent from website)", 'sable-hello-child' ) ) ); ?>" target="_blank" rel="noopener" data-contact="whatsapp" data-location="drawer">
					<?php sable_the_icon( 'chat', 20 ); ?>
					<?php esc_html_e( 'WhatsApp us (opens WhatsApp)', 'sable-hello-child' ); ?>
				</a>
				<a class="sable-button sable-button--secondary sable-button--block" href="<?php echo esc_url( sable_tel_url() ); ?>" data-contact="call" data-location="drawer">
					<?php sable_the_icon( 'phone', 20 ); ?>
					<?php
					/* translators: %s: phone number. */
					echo esc_html( sprintf( __( 'Call %s', 'sable-hello-child' ), $sable_contact['phone_display'] ) );
					?>
				</a>
			</div>
			<?php sable_the_brand_switcher( __( 'Orrin Collective studios (menu)', 'sable-hello-child' ) ); ?>
		</div>
	</dialog>
<?php endif; ?>
<?php
// Skip-link target. Elementor's full-width templates have no #content element, so the theme owns one.
?>
<div id="sable-content" class="sable-content-start" tabindex="-1"></div>
