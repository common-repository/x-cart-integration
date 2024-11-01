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
    'application/View/ProductBrowser/AbstractProductBrowser',
], function(jQuery, _, Backbone, XCartApp, AbstractProductBrowser) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var ProductBrowser = Backbone.View.extend({});

    ProductBrowser.prototype = Object.create(AbstractProductBrowser.prototype);

    ProductBrowser.prototype.showProduct = function(productId) {
        this.productId = this.browserProducts.get(productId).get('productId');
        this.move();
    };

    ProductBrowser.prototype.move = function (e) {
        var product = this.browserProducts.get(this.productId);
        var category = xcartApp.CategoriesCache.get(this.categoryId);

        if (this.gridNumber != null) {
            if (null != product.getCleanURL() && null != category.getCleanURL()) {
                this.productCleanURL = product.getCleanURL();
                this.categoryCleanURL = category.getCleanURL();
                xcartApp.mainRouter.navigate("Catalog/" + category.getCleanURL() + "/" + product.getCleanURL() + "/grid/" + this.gridNumber);
            } else {
                xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + this.productId + "/grid/" + this.gridNumber);
            }
        } else {
            if (null != product.getCleanURL() && null != category.getCleanURL()) {
                this.productCleanURL = product.getCleanURL();
                this.categoryCleanURL = category.getCleanURL();
                xcartApp.mainRouter.navigate("Catalog/" + category.getCleanURL() + "/" + product.getCleanURL() + "/grid/" + this.browserNumber);
            } else {
                xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + this.productId + "/browser/" + this.browserNumber);
            }
        }
        this.renderProduct();
    };

    return ProductBrowser;
});
