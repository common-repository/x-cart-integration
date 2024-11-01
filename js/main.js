/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Main controller
 *
 * @author    Qualiteam software Ltd <info@x-cart.com>
 * @copyright Copyright (c) 2011-2015 Qualiteam software Ltd <info@x-cart.com>. All rights reserved
 * @license   http://www.x-cart.com/license-agreement.html X-Cart 5 License Agreement
 * @link      http://www.x-cart.com/
 */

require.config({
    paths: {
        LoadingView: 'application/View/Loading',
    }
});

require([
    'jquery',
    'application/View/cart',
    'application/View/category-menu',
    'application/View/ProductBrowser/BrowserController',
    'application/View/Grid/GridController',
    'application/View/search',
    'application/MainRouter',
    'XCartApp',
], function(jQuery, CartWidget, CategoryMenuWidget, BrowserController, ProductGridWidget, SearchWidget, MainRouter, XCartApp) {
    var xcartApp = XCartApp.getApp();
    xcartApp.isModalProductGrid = false;
    xcartApp.handleNoGridController = function() {
        if (undefined != xcartApp.gridControllers) {
            if (null != xcartApp.options.demoShopUrl) {
                window.location.replace(xcartApp.options.demoShopUrl + '/#' + Backbone.history.getFragment());
            } else {
                product_grid_el = jQuery.parseHTML(xcartApp.templates[xcartApp.options.template].elements.modal_product_grid);
                xcartApp.isModalProductGrid = true;
                jQuery('body').append(product_grid_el);
                jQuery(product_grid_el).find('.xcart-btn-close-popup').on('click', function() {
                    xcartApp.gridControllers[0].hideOtherElements();
                });
                xcartApp.gridControllers = null;
                xcartApp.gridControllers = ProductGridWidget.createGridControllers();
                Backbone.history.stop();
                Backbone.history.start();
            }
        }
    };

    xcartApp.cartWidget = CartWidget.initialize();
    xcartApp.searchWidget = SearchWidget.initialize();
    xcartApp.categoryMenuWidget = CategoryMenuWidget.initialize();
    xcartApp.gridControllers = ProductGridWidget.createGridControllers();
    xcartApp.browserControllers = BrowserController.createBrowserControllers();


    //Depended on categories
    xcartApp.utils.runFuncSynch({
        funcs: [CategoryMenuWidget.fetchCategories],
        callback: function() {
            xcartApp.categoryMenuWidget.render();
            xcartApp.mainRouter = MainRouter.initialize();
        },
    });
});
