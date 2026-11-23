<?php
/**
 * Site footer (replaces Elementor Pro Theme Builder footer) and the sticky mobile booking bar.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

$sable_contact = sable_contact();

if ( ! function_exists( 'elementor_theme_do_location' ) || ! elementor_theme_do_location( 'footer' ) ) :
	/**
	 * Fictional demo outlets shown in the footer. Filter to change.
	 *
	 * @var array<int, array{name: string, phone: string}> $sable_outlets
	 */
	$sable_outlets = (array) apply_filters(
		'sable_footer_outlets',
		array(
			array(
				'name'  => __( 'Tanjong Pagar', 'sable-hello-child' ),
				'phone' => '+65 6100 0000',
			),
			array(
				'name'  => __( 'Tiong Bahru', 'sable-hello-child' ),
				'phone' => '+65 6200 0000',
			),
			array(
				'name'  => __( 'Holland Village', 'sable-hello-child' ),
				'phone' => '+65 6300 0000',
			),
		)
	);
	?>
	<footer class="sable-footer" data-sable-footer>
		<div class="sable-container sable-footer__grid">
			<section class="sable-footer__col sable-footer__brand" aria-labelledby="sable-footer-brand">
				<h2 id="sable-footer-brand" class="sable-footer__wordmark"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></h2>
				<p><?php echo esc_html( get_bloginfo( 'description' ) ? get_bloginfo( 'description' ) : __( 'Cut with intent.', 'sable-hello-child' ) ); ?></p>
			</section>

			<section class="sable-footer__col" data-sable-accordion>
				<h2 class="sable-footer__heading"><?php esc_html_e( 'Services', 'sable-hello-child' ); ?></h2>
				<div class="sable-footer__panel">
				<?php
				wp_nav_menu(
					array(
						'theme_location'       => 'sable-services',
						'container'            => 'nav',
						'container_aria_label' => __( 'Services', 'sable-hello-child' ),
						'menu_class'           => 'sable-footer__list',
						'depth'                => 1,
						'fallback_cb'          => 'sable_services_menu_fallback',
					)
				);
				?>
				</div>
			</section>

			<section class="sable-footer__col" aria-labelledby="sable-footer-outlets">
				<h2 id="sable-footer-outlets" class="sable-footer__heading"><?php esc_html_e( 'Outlets', 'sable-hello-child' ); ?></h2>
				<ul class="sable-footer__list">
					<?php foreach ( $sable_outlets as $sable_outlet ) : ?>
						<?php
						if ( ! is_array( $sable_outlet ) || empty( $sable_outlet['name'] ) ) {
							continue;
						}
						$sable_tel = 'tel:' . preg_replace( '/[^\d+]+/', '', (string) ( $sable_outlet['phone'] ?? '' ) );
						?>
						<li>
							<span class="sable-footer__outlet"><?php echo esc_html( (string) $sable_outlet['name'] ); ?></span>
							<a href="<?php echo esc_url( $sable_tel ); ?>" data-contact="call" data-location="footer"><?php echo esc_html( (string) ( $sable_outlet['phone'] ?? '' ) ); ?></a>
						</li>
					<?php endforeach; ?>
				</ul>
			</section>

			<section class="sable-footer__col" data-sable-accordion>
				<h2 class="sable-footer__heading"><?php esc_html_e( 'Opening hours', 'sable-hello-child' ); ?></h2>
				<div class="sable-footer__panel">
				<dl class="sable-footer__hours">
					<dt><?php esc_html_e( 'Mon to Fri', 'sable-hello-child' ); ?></dt>
					<dd><?php esc_html_e( '10 am to 9 pm', 'sable-hello-child' ); ?></dd>
					<dt><?php esc_html_e( 'Sat and Sun', 'sable-hello-child' ); ?></dt>
					<dd><?php esc_html_e( '10 am to 7 pm', 'sable-hello-child' ); ?></dd>
				</dl>
				<p>
					<a class="sable-footer__offer" href="<?php echo esc_url( $sable_contact['book_url'] ); ?>" data-cta="footer_offer">
						<?php esc_html_e( 'First visit? Ask about S$10 off', 'sable-hello-child' ); ?>
					</a>
				</p>
				</div>
			</section>
		</div>

		<div class="sable-footer__bottom">
			<div class="sable-container sable-footer__bottom-inner">
				<p class="sable-footer__group">
					<?php esc_html_e( 'An Orrin Collective studio', 'sable-hello-child' ); ?>
					<span class="sable-footer__dot" aria-hidden="true"></span>
				</p>
				<?php sable_the_brand_switcher( __( 'Sister studios', 'sable-hello-child' ) ); ?>
				<?php
				wp_nav_menu(
					array(
						'theme_location'       => 'sable-legal',
						'container'            => 'nav',
						'container_aria_label' => __( 'Legal', 'sable-hello-child' ),
						'menu_class'           => 'sable-footer__legal',
						'depth'                => 1,
						'fallback_cb'          => false,
					)
				);
				?>
				<p class="sable-footer__copy">
					<?php
					/* translators: %s: year. */
					echo esc_html( sprintf( __( '© %s Orrin Collective (fictional demo). Phone numbers and addresses are not real. Photos: Unsplash/Pexels.', 'sable-hello-child' ), '2026' ) );
					?>
				</p>
			</div>
		</div>
	</footer>
<?php endif; ?>

<?php if ( sable_show_book_bar() ) : ?>
	<nav class="sable-bookbar" aria-label="<?php esc_attr_e( 'Quick booking', 'sable-hello-child' ); ?>" data-sable-bookbar>
		<a class="sable-bookbar__icon sable-button--whatsapp" href="<?php echo esc_url( sable_whatsapp_url( __( "Hi Sable & Shear, I'd like to book an appointment. (sent from website)", 'sable-hello-child' ) ) ); ?>" target="_blank" rel="noopener" data-contact="whatsapp" data-location="sticky">
			<?php sable_the_icon( 'chat', 20 ); ?>
			<span class="sable-bookbar__label"><?php esc_html_e( 'WhatsApp', 'sable-hello-child' ); ?></span>
		</a>
		<a class="sable-bookbar__icon sable-button--call" href="<?php echo esc_url( sable_tel_url() ); ?>" data-contact="call" data-location="sticky">
			<?php sable_the_icon( 'phone', 20 ); ?>
			<span class="sable-bookbar__label"><?php esc_html_e( 'Call', 'sable-hello-child' ); ?></span>
		</a>
		<a class="sable-button sable-bookbar__cta" href="<?php echo esc_url( $sable_contact['book_url'] ); ?>" data-cta="sticky_book">
			<?php esc_html_e( 'Book now', 'sable-hello-child' ); ?>
		</a>
	</nav>
<?php endif; ?>

<?php wp_footer(); ?>
</body>
</html>
