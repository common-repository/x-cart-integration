<?php
/**
 * @package X-Cart_Integration
 * @version 0.3
 */
/*
Plugin Name: X-Cart Integration
Plugin URI: http://wordpress.org/plugins/xcart-integration/
Description: This is plugin for integration with x-cart store
Author: CDev
Version: 0.3
Author URI: http://x-cart.com/
*/

add_action( 'wp_ajax_templates', 'xcart_ajax_templates' );
add_action( 'wp_ajax_nopriv_templates', 'xcart_ajax_templates' );
register_activation_hook( __FILE__, 'xcart_store_activate' );
register_deactivation_hook( __FILE__, 'xcart_store_deactivate' );
// add JS-scripts to admin back-end
if (is_admin() ){ 
  add_action('admin_enqueue_scripts', 'xcart_common_admin_scripts');
  add_action('admin_enqueue_scripts', 'xcart_register_admin_styles');
}

add_action('wp_footer', 'xcart_options_js', 1000);
add_shortcode('xcart', 'xcart_shortcode');
add_filter( 'widget_text', 'do_shortcode');

add_filter('plugins_loaded', 'xcart_load_textdomain');
add_action('wp_enqueue_scripts', 'xcart_add_frontend_scripts');
add_action('wp_enqueue_scripts', 'xcart_add_frontend_styles');
if (is_admin()) {
    add_action('admin_menu', 'xcart_admin_menu');
    add_action('admin_init', 'xcart_register_settings');
    add_filter('plugin_action_links_' . plugin_basename(__FILE__), 'xcart_plugin_actions');
}

function xcart_ajax_templates() {
    header('Content-Type: application/javascript');
    $translate = "__";
    include plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '.php';
    die();
}

function xcart_options_js() {
    $requestUrl = get_option('xcart_store_url');
    $shopUrl = get_option('xcart_store_url');
    $image_box_size = get_option('xcart_image_box_size');
    $template = get_option('xcart_template');
    if (intval($image_box_size) < 0 || !is_numeric($image_box_size)) {
        $image_box_size = 160;
    }
    $storePageId = get_option("xcart_store_page_id");	
    $demoPageShopUrl = get_permalink($storePageId);
    $lang = explode("_", get_locale());
    $lang = $lang[0];
    $translate = "__";
    $requireSrc = plugins_url('x-cart-integration/js/common/require.js');
    $jsSrc = plugin_dir_url( __FILE__ ) . 'js';
    $imagesUrl = plugin_dir_url( __FILE__ ) . 'templates/' . get_option('xcart_template') . '/images/';
    $templatesSrc = get_site_url() ."\/wp-admin\/admin-ajax.php?action=templates";
    echo '<script type="text/javascript">';
    include plugin_dir_path(__FILE__) . '/js/init.php';
    echo '</script>';
}

function xcart_plugin_actions($links) {
	$settings_link = "<a href='admin.php?page=xcart'>"
		. __('Settings')
		. "</a>";
	array_unshift( $links, $settings_link );

	return $links;
}

function xcart_add_frontend_scripts() {
    wp_enqueue_script('jquery');
    wp_enqueue_script('underscore');
    wp_enqueue_script('backbone');
}

function xcart_add_frontend_styles() {
	wp_enqueue_style('client-css', plugins_url('x-cart-integration/templates/' . get_option('xcart_template') . '/css/client.css'));
    
    // Add unique styles for current theme
    $current_theme = wp_get_theme();
    $current_theme_domainname = $current_theme->get('TextDomain');
    wp_enqueue_style('client-theme-css', plugins_url('x-cart-integration/css/' . $current_theme_domainname . '.css'));
}

function xcart_shortcode($attributes)
{
    $widget = '';
    $attributes = shortcode_atts(array(
        'widget' => 'widget',
        'category_id' => 'category_id',
        'product_id' => 'product_id',
        'grid_size' => 'grid_size',
    ), $attributes );

    switch ($attributes['widget']) {
        case 'productbrowser':
            $widget = xcart_productbrowser_widget($attributes);
            break;
        case 'categorymenu':
            $widget = xcart_categorymenu_widget($attributes);
            break;
        case 'productgrid':
            $widget = xcart_productgrid_widget($attributes);
            break;
        case 'search':
            $widget = xcart_search_widget($attributes);
            break;
    }

    return $widget;
}

function xcart_productbrowser_widget($attributes) {
    return require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/product-browser.php';
}

function xcart_categorymenu_widget($attributes) {
    return require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/hor-category-menu.php';
}

function xcart_productgrid_widget($attributes) {
    $widget = require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/product-grid.php';

    return $widget;
}

function xcart_search_widget($attributes) {
    return require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/search.php';
}

function xcart_admin_menu () {
	add_menu_page(
		__('X-Cart Integration settings', 'xcart-integration'),
		__('X-Cart Integration', 'xcart-integration'),
		'manage_options',
		'xcart',
		'xcart_settings_page'
	);
}

function xcart_load_textdomain() {
    load_plugin_textdomain('x-cart-integration', false, dirname(plugin_basename(__FILE__)).'/languages' ); 
}

function xcart_settings_page () {
    add_option('xcart_store_url', '', null, "yes");
    add_option('xcart_image_box_size', '', 160, "yes");
    add_option('xcart_template', '', 'default', "yes");
    add_option('xcart_sso_key', '', 'default', "yes");
    //add_option('xcart_enable_search', '', null, "yes");
    require_once plugin_dir_path(__FILE__) . '/templates/settings.php';
}

function xcart_register_settings () {
    register_setting('xcart-settings-group', 'xcart_store_url');
    register_setting('xcart-settings-group', 'xcart_image_box_size');
    register_setting('xcart-settings-group', 'xcart_template');
    register_setting('xcart-settings-group', 'xcart_sso_key');
}

function xcart_store_activate() {
	$my_post = array();
    $attributes = array(
        'category_id' => 0,
        'grid_size' => 6,
    );
    $content = require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/product-grid.php';

    $id = get_option("xcart_store_page_id");	
	$_tmp_page = null;
	if (!empty($id) and ($id > 0)) { 
		$_tmp_page = get_post($id);
	}
	if ($_tmp_page !== null) {
		$my_post = array();
		$my_post['ID'] = $id;
		$my_post['post_status'] = 'publish';
		wp_update_post( $my_post );
	} else {
        xcart_load_textdomain();
		$my_post['post_title'] = __('Store', 'xcart-shopping-cart');
		$my_post['post_content'] = $content;
		$my_post['post_status'] = 'publish';
		$my_post['post_author'] = 1;
		$my_post['post_type'] = 'page';
		$my_post['comment_status'] = 'closed';
		$id = wp_insert_post( $my_post );
		update_option('xcart_store_page_id', $id);
	}
}

function xcart_store_deactivate() {
	$xcart_page_id = get_option("xcart_store_page_id");
	$_tmp_page = null;
	if (!empty($xcart_page_id) and ($xcart_page_id > 0)) {
		$_tmp_page = get_page($xcart_page_id);
		if ($_tmp_page !== null) {
			$my_post = array();
			$my_post['ID'] = $xcart_page_id;
			$my_post['post_status'] = 'draft';
			wp_update_post( $my_post );
		} else {
			update_option('xcart_store_page_id', '');	
		}
	}
}

/* X-Cart Minicart widget */
class XcartMinicartWidget extends WP_Widget {

    function XcartMinicartWidget() {
        $widget_ops = array('classname' => 'widget_xcart_mini widget_links', 'description' => __('X-Cart Minicart widget', 'xcart-shopping-cart'));
        $this->WP_Widget('xcartminicart', __('X-Cart Minicart cart', 'xcart-shopping-cart'), $widget_ops);
    }

    function widget($args, $instance) {
		extract($args);
		$title = apply_filters('widget_title', empty($instance['title']) ? '' : $instance['title']);

		echo $before_widget;

		if ( $title && (strlen($title) > 0))
		echo $before_title . $title . $after_title;

        $widget = require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/mini-cart-static.php';
		echo $widget;

		echo $after_widget;
    }

    function update($new_instance, $old_instance){
        $instance = $old_instance;
        $instance['title'] = strip_tags(stripslashes($new_instance['title']));

        return $instance;
    }

    function form($instance){
        $defaultTitle = __('Your cart', 'xcart-shopping-cart');
        $instance = wp_parse_args( (array) $instance, array('title'=>$defaultTitle) );

        $title = htmlspecialchars($instance['title']);

        echo '<p><label for="' . $this->get_field_name('title') . '">' . __('Title:') . ' <input style="width:100%;" id="' . $this->get_field_id('title') . '" name="' . $this->get_field_name('title') . '" type="text" value="' . $title . '" /></label></p>';
    }
}

/* X-Cart Search widget */
class XcartSearchWidget extends WP_Widget {

    function XcartSearchWidget() {
        $widget_ops = array('classname' => 'widget_xcart_search widget_links', 'description' => __('X-Cart Search widget', 'xcart-shopping-cart'));
        $this->WP_Widget('xcartsearch', __('X-Cart Search', 'xcart-shopping-cart'), $widget_ops);
    }

    function widget($args, $instance) {
		extract($args);
		$title = apply_filters('widget_title', empty($instance['title']) ? '' : $instance['title']);

		echo $before_widget;

		if ( $title && (strlen($title) > 0))
		echo $before_title . $title . $after_title;

        $widget = require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/search.php';
		echo $widget;

		echo $after_widget;
    }

    function update($new_instance, $old_instance){
        $instance = $old_instance;
        $instance['title'] = strip_tags(stripslashes($new_instance['title']));

        return $instance;
    }

    function form($instance){
        $defaultTitle = __('Product search', 'xcart-shopping-cart');
        $instance = wp_parse_args( (array) $instance, array('title'=>$defaultTitle) );

        $title = htmlspecialchars($instance['title']);

        echo '<p><label for="' . $this->get_field_name('title') . '">' . __('Title:') . ' <input style="width:100%;" id="' . $this->get_field_id('title') . '" name="' . $this->get_field_name('title') . '" type="text" value="' . $title . '" /></label></p>';
    }
}

/* X-Cart Categories widget */
class XcartCategoriesWidget extends WP_Widget {

    function XcartCategoriesWidget() {
        $widget_ops = array('classname' => 'widget_xcart_categories widget_links', 'description' => __('X-Cart Categories menu', 'xcart-shopping-cart'));
        $this->WP_Widget('xcartcategories', __('X-Cart Categories', 'xcart-shopping-cart'), $widget_ops);
    }

    function widget($args, $instance) {
		extract($args);
		$title = apply_filters('widget_title', empty($instance['title']) ? '' : $instance['title']);

		echo $before_widget;

		if ( $title && (strlen($title) > 0))
		echo $before_title . $title . $after_title;

        $widget = require plugin_dir_path(__FILE__) . '/templates/' . get_option('xcart_template') . '/elements/category-menu.php';
		echo $widget;

		echo $after_widget;
    }

    function update($new_instance, $old_instance){
        $instance = $old_instance;
        $instance['title'] = strip_tags(stripslashes($new_instance['title']));

        return $instance;
    }

    function form($instance){
        $defaultTitle = __('Shop categories', 'xcart-shopping-cart');
        $instance = wp_parse_args( (array) $instance, array('title'=>$defaultTitle) );

        $title = htmlspecialchars($instance['title']);

        echo '<p><label for="' . $this->get_field_name('title') . '">' . __('Title:') . ' <input style="width:100%;" id="' . $this->get_field_id('title') . '" name="' . $this->get_field_name('title') . '" type="text" value="' . $title . '" /></label></p>';
    }

}

/* X-Cart widget registration */
function xcart_sidebar_widgets_init() {
	register_widget('XcartCategoriesWidget');
	register_widget('XcartSearchWidget');
	register_widget('XcartMinicartWidget');
}

add_action('widgets_init', 'xcart_sidebar_widgets_init');

/* add ADMIN X-Cart scripts and CSS */
function xcart_common_admin_scripts() {
	wp_enqueue_script('xcart-admin-js', plugins_url('x-cart-integration/js/admin.js'));
}
function xcart_register_admin_styles() {
	wp_enqueue_style('xcart-admin-css', plugins_url('x-cart-integration/css/admin.css'));
}

// SSO login feature
add_action('wp_login', 'xcart_sso_login', 11, 2);

/* sso login to x-cart */
function xcart_sso_login($user_login, $user) {
    $ssoKey = get_option('xcart_sso_key');

    if ($ssoKey && get_option('xcart_store_url') && filter_var(get_option('xcart_store_url'), FILTER_VALIDATE_URL)) {
        $getTokenUrl = get_option('xcart_store_url') . '?target=store_integration_api&action=get_sso_access_token';
        $ssoLoginUrl = get_option('xcart_store_url') . '?target=StoreIntegrationSSOLogin&action=login';
        $urlsIsValid = true;

        $tokenUrlHeaders = get_headers($getTokenUrl);
        $ssoLoginHeaders = get_headers($ssoLoginUrl);
        if (
            (!$tokenUrlHeaders || (isset($tokenUrlHeaders['Status']) && $tokenUrlHeaders['Status'] == '404 Not Found'))
            || (!$ssoLoginHeaders || (isset($ssoLoginHeaders['Status']) && $ssoLoginHeaders['Status'] == '404 Not Found'))
        ) {
            $urlsIsValid = false;
        }

        if ($urlsIsValid) {
            $ch = curl_init();
            curl_setopt($ch, CURLOPT_URL, $getTokenUrl);
            curl_setopt($ch, CURLOPT_POST, 1);
            curl_setopt($ch, CURLOPT_POSTFIELDS,
                'sso_key=' . urlencode($ssoKey) . '&profile_login=' . urlencode($user->data->user_email));
            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);

            $result = curl_exec($ch);
            curl_close($ch);

            $result = json_decode($result, true);

            if ($result['result']) {
                $redirectUrl = $ssoLoginUrl . '&sso_token=' . $result['token'] . '&return_url=' . get_home_url();
                wp_redirect($redirectUrl);
                exit(0);
            }
        }
    }
}
?>
