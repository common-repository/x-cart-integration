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
    'application/View/ProductBrowser/AbstractProductBrowser',
], function(jQuery, _, Backbone, XCartApp, LoadingView, AbstractProductBrowser) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var SearchProductBrowser = Backbone.View.extend({});

    SearchProductBrowser.prototype = Object.create(AbstractProductBrowser.prototype);

    SearchProductBrowser.prototype.showProduct = function(productId) {
        this.productId = this.browserProducts.get(productId).get('productId');
        xcartApp.mainRouter.navigate("search/" + this.searchText + "/product/" + this.productId + "/grid/" + this.gridNumber, {trigger: true});
        this.renderProduct();
    };

    SearchProductBrowser.prototype.move = function (e) {
        if (this.gridNumber != null) {
            xcartApp.mainRouter.navigate("search/" + this.searchText + "/product/" + this.productId + "/grid/" + this.gridNumber, {trigger: true});
        }
        this.renderProduct();
    };

    return SearchProductBrowser;
});
