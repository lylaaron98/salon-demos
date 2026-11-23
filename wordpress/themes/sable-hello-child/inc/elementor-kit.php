<?php
/**
 * "Apply token kit" admin screen: writes the generated Elementor kit (global colours, global
 * fonts, Theme Style, layout, breakpoints) into the active Elementor kit.
 *
 * This is the version-independent alternative to Elementor > Tools > Import/Export Kit and works
 * with free Elementor. Source: assets/build/elementor-kit/site-settings.json, generated from
 * packages/tokens by wordpress/scripts/build-theme-assets.mjs.
 *
 * @package SableHelloChild
 */

declare( strict_types = 1 );

defined( 'ABSPATH' ) || exit;

const SABLE_KIT_META = '_elementor_page_settings';

/**
 * Register the Appearance submenu.
 */
function sable_kit_menu(): void {
	add_theme_page(
		__( 'Sable & Shear kit', 'sable-hello-child' ),
		__( 'Sable & Shear kit', 'sable-hello-child' ),
		'manage_options',
		'sable-kit',
		'sable_kit_page'
	);
}
add_action( 'admin_menu', 'sable_kit_menu' );

/**
 * Load the generated kit settings.
 *
 * @return array<string, mixed>|null
 */
function sable_kit_settings(): ?array {
	$path = sable_build_asset( 'elementor-kit/site-settings.json' );
	if ( ! file_exists( $path ) ) {
		return null;
	}
	$data = json_decode( (string) file_get_contents( $path ), true ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local theme file.
	if ( ! is_array( $data ) || ! isset( $data['settings'] ) || ! is_array( $data['settings'] ) ) {
		return null;
	}
	return $data['settings'];
}

/**
 * Merge generated settings into the existing kit settings. Global lists are replaced
 * (they are owned by the tokens); `__globals__` is merged key by key so unrelated choices survive.
 *
 * @param array<string, mixed> $current   Existing kit settings.
 * @param array<string, mixed> $generated Generated settings.
 * @return array<string, mixed>
 */
function sable_merge_kit_settings( array $current, array $generated ): array {
	$globals_current   = isset( $current['__globals__'] ) && is_array( $current['__globals__'] ) ? $current['__globals__'] : array();
	$globals_generated = isset( $generated['__globals__'] ) && is_array( $generated['__globals__'] ) ? $generated['__globals__'] : array();

	$merged                = array_merge( $current, $generated );
	$merged['__globals__'] = array_merge( $globals_current, $globals_generated );
	return $merged;
}

/**
 * Apply the kit. Returns an error message or null on success.
 */
function sable_apply_kit(): ?string {
	$kit_id = (int) get_option( 'elementor_active_kit', 0 );
	if ( $kit_id <= 0 || ! get_post( $kit_id ) ) {
		return __( 'No active Elementor kit found. Activate Elementor and open the editor once so it creates the default kit.', 'sable-hello-child' );
	}
	$generated = sable_kit_settings();
	if ( null === $generated ) {
		return __( 'Generated kit not found. Run "pnpm build" and upload assets/build/.', 'sable-hello-child' );
	}

	$current = get_post_meta( $kit_id, SABLE_KIT_META, true );
	$current = is_array( $current ) ? $current : array();

	update_post_meta( $kit_id, SABLE_KIT_META, sable_merge_kit_settings( $current, $generated ) );

	// Elementor caches generated CSS (post-<kit>.css); regenerate on next view.
	if ( class_exists( '\Elementor\Plugin' ) && isset( \Elementor\Plugin::$instance->files_manager ) ) {
		\Elementor\Plugin::$instance->files_manager->clear_cache();
	}
	return null;
}

/**
 * Handle the form post.
 */
function sable_kit_handle_post(): void {
	if ( ! current_user_can( 'manage_options' ) ) {
		wp_die( esc_html__( 'You are not allowed to change the Elementor kit.', 'sable-hello-child' ), 403 );
	}
	check_admin_referer( 'sable_apply_kit' );

	$error = sable_apply_kit();
	$args  = null === $error ? array( 'sable-kit' => 'applied' ) : array( 'sable-kit' => 'error' );
	if ( null !== $error ) {
		set_transient( 'sable_kit_error_' . get_current_user_id(), $error, MINUTE_IN_SECONDS );
	}
	wp_safe_redirect( add_query_arg( $args, admin_url( 'themes.php?page=sable-kit' ) ) );
	exit;
}
add_action( 'admin_post_sable_apply_kit', 'sable_kit_handle_post' );

/**
 * Render the admin page.
 */
function sable_kit_page(): void {
	$kit_id   = (int) get_option( 'elementor_active_kit', 0 );
	$settings = sable_kit_settings();
	// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Display-only status flag set by our own redirect.
	$status = isset( $_GET['sable-kit'] ) ? sanitize_key( wp_unslash( $_GET['sable-kit'] ) ) : '';
	?>
	<div class="wrap">
		<h1><?php esc_html_e( 'Sable & Shear Elementor kit', 'sable-hello-child' ); ?></h1>
		<?php if ( 'applied' === $status ) : ?>
			<div class="notice notice-success"><p><?php esc_html_e( 'Kit applied. Global colours, fonts and Theme Style now match the design tokens.', 'sable-hello-child' ); ?></p></div>
		<?php elseif ( 'error' === $status ) : ?>
			<div class="notice notice-error"><p><?php echo esc_html( (string) get_transient( 'sable_kit_error_' . get_current_user_id() ) ); ?></p></div>
		<?php endif; ?>

		<p><?php esc_html_e( 'Writes the generated Global Colors, Global Fonts, Theme Style (buttons, links, form fields, images), layout width and breakpoints into the active Elementor kit. Works with free Elementor. Re-run after the tokens change.', 'sable-hello-child' ); ?></p>
		<table class="widefat striped" style="max-width:640px">
			<tbody>
				<tr>
					<th scope="row"><?php esc_html_e( 'Elementor active', 'sable-hello-child' ); ?></th>
					<td><?php echo did_action( 'elementor/loaded' ) ? esc_html__( 'Yes', 'sable-hello-child' ) : esc_html__( 'No', 'sable-hello-child' ); ?></td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Active kit ID', 'sable-hello-child' ); ?></th>
					<td><?php echo $kit_id > 0 ? esc_html( (string) $kit_id ) : esc_html__( 'None', 'sable-hello-child' ); ?></td>
				</tr>
				<tr>
					<th scope="row"><?php esc_html_e( 'Generated kit', 'sable-hello-child' ); ?></th>
					<td><?php echo null === $settings ? esc_html__( 'Missing (run pnpm build)', 'sable-hello-child' ) : esc_html__( 'Found', 'sable-hello-child' ); ?></td>
				</tr>
			</tbody>
		</table>
		<form method="post" action="<?php echo esc_url( admin_url( 'admin-post.php' ) ); ?>">
			<input type="hidden" name="action" value="sable_apply_kit">
			<?php wp_nonce_field( 'sable_apply_kit' ); ?>
			<?php submit_button( __( 'Apply token kit to Elementor', 'sable-hello-child' ), 'primary', 'submit', true, null === $settings ? array( 'disabled' => 'disabled' ) : array() ); ?>
		</form>
		<p>
			<?php
			printf(
				/* translators: %s: download link for the kit zip. */
				esc_html__( 'Alternative: import %s with Elementor > Tools > Import/Export Kit.', 'sable-hello-child' ),
				'<a href="' . esc_url( sable_build_asset( 'sable-shear-kit.zip', true ) ) . '">sable-shear-kit.zip</a>'
			);
			?>
		</p>
	</div>
	<?php
}
