/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Product grid view
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
    'application/Model/Product',
    'application/View/Grid/AbstractProductGrid',
    'application/View/Grid/CategoryGrid',
], function(jQuery, _, Backbone, XCartApp, LoadingView, ProductModule, AbstractProductGrid, CategoryGrid) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var ProductGrid = Backbone.View.extend({
    });

    ProductGrid.prototype = Object.create(AbstractProductGrid.prototype);

    ProductGrid.prototype.init = function(options) {
        this.model = null;
        if (this.categoryId != options.categoryId) {
            this.gridProducts = new ProductModule.ProductList();
        } else {
            delete this.gridProducts.sortFlag;
        }

        this.setParams(options);

        var loadView = new LoadingView();
        this.$el.html(loadView.render().el);
        if (this.isRootCategory()) 
        {
            this.model = xcartApp.CategoriesCache.findWhere({depth: -1});
            this.categoryId = this.model.get('categoryId');
        } else {
            this.productViews = [];
            this.model = xcartApp.CategoriesCache.get(this.categoryId);
        }
        if (this.gridProducts.length == 0) {
            this.fetchProducts();
        } else {
            this.render();
        }
    };

    ProductGrid.prototype.stateReset = function() {
      this.init(this.initData);
    };

    ProductGrid.prototype.isRootCategory = function() {
        if (null != this.model) {
            return (-1 == this.model.get('depth'));
        }

        return undefined == this.categoryId || Number(this.categoryId) != this.categoryId || 0 == this.categoryId;
    };

    ProductGrid.prototype.productSelected = function(product) {
        var category = xcartApp.CategoriesCache.get(this.categoryId);

        if (null != product.getCleanURL() && null != category.getCleanURL()) {
            xcartApp.mainRouter.navigate("Catalog/" + category.getCleanURL() + "/" + product.getCleanURL() + "/grid/" + this.gridNumber, {trigger: true});
        } else {
            xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + product.get('productId') + "/grid/" + this.gridNumber, {trigger: true});
        }
    };

    ProductGrid.prototype.goToPage = function(options) {
        if (this.isCorrectPage(options.page)) {
            options.trigger = (undefined == options.trigger)?true:options.trigger;
            var categoryCleanURL = xcartApp.CategoriesCache.get(this.categoryId).getCleanURL();

            if (null != categoryCleanURL) {
                xcartApp.mainRouter.navigate("Catalog/" + categoryCleanURL + "/page/" + options.page + "/grid/" + this.gridNumber, {trigger: options.trigger});
            } else {
                xcartApp.mainRouter.navigate("category/" + this.categoryId + "/page/" + options.page + "/grid/" + this.gridNumber, {trigger: options.trigger});
            }
            console.log('Switched to page ' + options.page);
        }
    };

    ProductGrid.prototype.fetchProducts = function() {
        if (!this.isRootCategory()) {
            this.gridProducts = new ProductModule.ProductList();
            if (undefined != xcartApp.CategoryProductsCache[this.categoryId]) {
                this.gridProducts.add(xcartApp.CategoryProductsCache[this.categoryId].models);
                this.render();
            } else {
                var self = this;
                this.gridProducts.fetch({
                    data: {
                        category: this.categoryId,
                    },
                    success: function() {
                        self.gridProducts.add(self.gridProducts.attributes);
                        xcartApp.CategoryProductsCache[self.categoryId] = _.clone(self.gridProducts);
                        console.log('Grid: fetched ' + self.gridProducts.length + ' products');
                        self.render();
                    },
                    error: function() {
                        console.log('Fetch failed');
                    }
                });
            }
        } else {
            this.render();
        }
    };

    ProductGrid.prototype.render = function() {
        this.$el.empty();
        this.$el.html(this.template(this.model.toJSON()));
        this.renderCategoryGrid();
        if (!this.isRootCategory()) {
            this.renderProducts();
        }
        //Sorting by default
        if (this.gridProducts.sortFlag == undefined) {
            this.gridProducts.sortFlag = 'productId';
            this.$el.find('[do-action=sort-by-default]').addClass('active');
            this.$el.find('[do-action=sort-by-default]').addClass('arrow-down');
        }
    };

    ProductGrid.prototype.renderCategoryGrid = function() {
        var loadView = new LoadingView();
        jQuery('div.category-grid-replace').append(loadView.render().el);
        if (undefined != this.categoryGrid) {
            this.categoryGrid.remove();
        }
        this.categoryGrid = new CategoryGrid({model: this.model});
        this.categoryGrid.gridNumber = this.gridNumber;

        var self = this;
        this.categoryGrid.render(function() {
            var categoryGridDiv = self.$el.find('div.category-grid-replace');
            if (categoryGridDiv.length > 0) {
                categoryGridDiv.replaceWith(self.categoryGrid.$el);
            } else {
                self.$el.html(self.categoryGrid.$el);
            }
        });
    };

    return ProductGrid;
});
