/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Product browser view
 *
 * @author    Qualiteam software Ltd <info@x-cart.com>
 * @copyright Copyright (c) 2011-2015 Qualiteam software Ltd <info@x-cart.com>. All rights reserved
 * @license   http://www.x-cart.com/license-agreement.html X-Cart 5 License Agreement
 * @link      http://www.x-cart.com/
 */

define([
    'jquery',
    'underscore',
    'backbone',
    'XCartApp',
    'LoadingView',
    'application/View/ProductBrowser/SearchProductBrowser',
    'application/View/ProductBrowser/ProductBrowser',
], function(jQuery, _, Backbone, XCartApp, LoadingView, SearchProductBrowser, ProductBrowser) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var createBrowserControllers = function() {
        var browserControllers = [];
        var elements = jQuery(document.body).find('div.xcart-product-browser');
        var counter = 0;
        _.each(elements, function(element) {
            browserControllers.push(new BrowserController({
                browserNumber: counter,
                el: jQuery(element),
                productId: jQuery(element).attr('data-productId'),
                categoryId: jQuery(element).attr('data-categoryId')
            }));
            counter++;
        });

        return browserControllers;
    };

    var BrowserController = function(options) {
        this.el = options.element;
        this.productBrowser = new ProductBrowser(options);

        this.stateReset = function() {
            this.productBrowser.stateReset();
        };

        this.showProduct = function(productId) {
            this.productBrowser.showProduct(productId);
        };
    };

    return {
        createBrowserControllers: createBrowserControllers,
        BrowserController: BrowserController,
    };
});
