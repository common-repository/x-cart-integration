/* vim: set ts=2 sw=2 sts=2 et: */

/**
 * Initialization controller
 *
 * @author    Qualiteam software Ltd <info@x-cart.com>
 * @copyright Copyright (c) 2011-2015 Qualiteam software Ltd <info@x-cart.com>. All rights reserved
 * @license   http://www.x-cart.com/license-agreement.html X-Cart 5 License Agreement
 * @link      http://www.x-cart.com/
 */

if (typeof xcartApp == 'undefined') {
    var xcartApp = {};
    xcartApp.scriptEl = document.createElement('script');
    xcartApp.scriptEl.type = 'text/javascript';
    xcartApp.scriptEl.src = '<?php echo $requireSrc ?>'; 
    (document.getElementsByTagName('head')[0] || document.documentElement ).appendChild(xcartApp.scriptEl);

    xcartApp.scriptEl.onload = function() {
        define('jquery', [], function() {
            return jQuery;
        });
        define('underscore', [], function() {
            return _;
        });
        define('backbone', [], function() {
            return Backbone;
        });

        requirejs.config({
            baseUrl: '<?php echo $jsSrc ?>',
            paths: {
                templates: '<?php echo $templatesSrc ?>',
                'backbone.localStorage': '<?php echo $jsSrc ?>/common/backbone.localStorage-min',
            },
        });
        require(['templates', 'XCartApp'], function(templates, XCartApp) {
            var xcartAppInstance = XCartApp.getApp();
            xcartAppInstance.templates = templates;
            xcartAppInstance.options= {
                requestUrl: '<?php echo $shopUrl ?>',
                sourceUrl: {
                    images: '<?php echo $imagesUrl ?>'
                },
                shopUrl: '<?php echo $shopUrl ?>',
                demoShopUrl: '<?php echo $demoPageShopUrl ?>',
                lang: '<?php echo $lang ?>',
                template: '<?php echo $template ?>',
                image_box_size: '<?php echo $image_box_size ?>',
                titles: {
                    SEARCH_RESULT: '<?php echo $translate("Search results", "xcart-integration") ?>',
                    NO_PRODUCTS: '<?php echo $translate("zero products found", "xcart-integration") ?>'
                },
            };
            require(['main']);
        });
    }
}
