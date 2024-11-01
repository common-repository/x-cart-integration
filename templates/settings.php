<?php
/**
 * X-Cart
 *
 * NOTICE OF LICENSE
 *
 * This source file is subject to the software license agreement
 * that is bundled with this package in the file LICENSE.txt.
 * It is also available through the world-wide-web at this URL:
 * http://www.x-cart.com/license-agreement.html
 * If you did not receive a copy of the license and are unable to
 * obtain it through the world-wide-web, please send an email
 * to licensing@x-cart.com so we can send you a copy immediately.
 *
 * DISCLAIMER
 *
 * Do not modify this file if you wish to upgrade X-Cart to newer versions
 * in the future. If you wish to customize X-Cart for your needs please
 * refer to http://www.x-cart.com/ for more information.
 *
 * @category  X-Cart 5
 * @author    Qualiteam software Ltd <info@x-cart.com>
 * @copyright Copyright (c) 2011-2015 Qualiteam software Ltd <info@x-cart.com>. All rights reserved
 * @license   http://www.x-cart.com/license-agreement.html X-Cart 5 License Agreement
 * @link      http://www.x-cart.com/
 */
?>

<h1><?php _e('Options', 'xcart-integration'); ?></h1>
<p><?php _e('You should add a shortcode to put widgets with a list of products or a single product. Shortcodes are in product and category settings in the X-Cart shop under the WP code tab', 'xcart-integration'); ?></p>
<div><label for="xcart_url">
<div class="pure-control-group store-id">
	<form method="POST" action="options.php" class="pure-form xcart-settings general-settings">
        <?php settings_fields('xcart-settings-group');?>
        <table>
            <tr>
                <td><?php _e('Enter your store url here', 'xcart-integration'); ?> (http://example.com/cart.php):</label></div></td>
                <td><input
                        id="xcart_store_url"
                        name="xcart_store_url"
                        type="text" size="40"
                        placeholder="<?php _e('Store url', 'xcart-integration'); ?>"
                        value="<?php echo get_option('xcart_store_url'); ?>" />
                </td>
            </tr>
            <tr>
                <td><?php _e('Size of product images box', 'xcart-integration'); ?>:</label></div></td>
                <td><input
                        id="xcart_image_box_size"
                        name="xcart_image_box_size"
                        type="number" size="40"
                        placeholder="<?php _e('Box size', 'xcart-integration'); ?>"
                        value="<?php echo get_option('xcart_image_box_size'); ?>" />
                </td>
            </tr>
                <td><?php _e('Template', 'xcart-integration'); ?>:</label></div></td>
                <td>
                <select
                        id="xcart_template"
                        name="xcart_template"
                        placeholder="<?php _e('Template', 'xcart-integration'); ?>" />
                <?php 
                $xcartTemplatesPath = plugin_dir_path(__FILE__); 
                $xcartTemplates = array_filter(glob($xcartTemplatesPath . '*'), 'is_dir');
                $xcartResultTemplates = array();
                foreach($xcartTemplates as $xcartTemplate) {
                    $xcartTemplate = explode('/', $xcartTemplate);
                    $xcartTemplate = array_pop($xcartTemplate);
                    $xcartTemplateName = ucfirst($xcartTemplate);
                    $xcartTemplateName = __($xcartTemplateName, 'xcart-integration');
                ?>
                    <option value="<?php echo $xcartTemplate ?>" <?php if($xcartTemplate == get_option('xcart_template')) { echo 'selected';} ?>><?php echo $xcartTemplateName ?></option>
                <?php
                }
                ?>
            </select>
</td>
            </tr>
            <tr>
                <td><?php _e('Enter your X-Cart SSO secret key from module settings', 'xcart-integration'); ?></label></div></td>
                <td><input
                        id="xcart_sso_key"
                        name="xcart_sso_key"
                        type="text" size="40"
                        value="<?php echo get_option('xcart_sso_key'); ?>" />
                </td>
            </tr>
        </table>
        
        
        <input type='hidden' name='action' value='update' />
        <input type='hidden' name='page_options' value='xcart_store_url' />
        <input type='hidden' name='page_options' value='xcart_image_box_size' />
        <input type='hidden' name='page_options' value='xcart_template' />
        <button type="submit"><?php _e('Save', 'xcart-integration'); ?></button>
    </form>
</div>

