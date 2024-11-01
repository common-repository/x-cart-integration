/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Search product grid view
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
    'application/Model/Category',
    'application/Model/Product',
    'application/View/Grid/CategoryGrid',
    'application/View/Grid/AbstractProductGrid',
], function(jQuery, _, Backbone, XCartApp, LoadingView, CategoryModule, ProductModule, CategoryGrid, AbstractProductGrid) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var SearchProductGrid = Backbone.View.extend({
    });

    SearchProductGrid.prototype = Object.create(AbstractProductGrid.prototype);

    SearchProductGrid.prototype.init = function(options) {
        this.initData = _.clone(options); //saving state
        this.setParams(options);
        this.gridProducts = new ProductModule.ProductList();
        this.gridProducts.add(options.searchProducts.models);
        var loadView = new LoadingView();
        this.$el.html(loadView.render().el);

        this.searchText = options.searchText;
        this.model = new CategoryModule.Category({
//            categoryId: 0,
            depth: -2,
            viewDescription: '',
            name: xcartApp.options.titles.SEARCH_RESULT,
        }, {silent: true});
//        this.productViews = [];
        this.render();
    };

    SearchProductGrid.prototype.stateReset = function() {
      this.init(this.initData);
    };

    SearchProductGrid.prototype.productSelected = function(product) {
        xcartApp.mainRouter.navigate("search/" + this.searchText + "/product/" + product.get('productId') + "/grid/" + this.gridNumber, {trigger: true});
    };

    SearchProductGrid.prototype.goToPage = function(options) {
        if (this.isCorrectPage(options.page)) {
            options.trigger = (undefined == options.trigger)?true:options.trigger;
            xcartApp.mainRouter.navigate("search/" + this.searchText + "/page/" + options.page + "/grid/" + this.gridNumber, {trigger: options.trigger});
            console.log('Switched to page ' + options.page);
        }
    };

    SearchProductGrid.prototype.render = function() {
        this.$el.empty();
        this.$el.html(this.template(this.model.toJSON()));
        this.renderProducts();
        //Sorting by default
        this.gridProducts.sortFlag = 'productId';
        this.$el.find('[do-action=sort-by-default]').addClass('active');
        this.$el.find('[do-action=sort-by-default]').addClass('arrow-down');
    };

    return SearchProductGrid;
});
