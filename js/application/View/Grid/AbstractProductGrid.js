/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Abstract product grid
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
    'application/View/PopupProductAdded',
    'application/Model/Category',
    'application/Model/Product',
], function(jQuery, _, Backbone, XCartApp, LoadingView, PopupProductAdded, CategoryModule, ProductModule) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var GridPagination = Backbone.View.extend({
        tagName: 'div',
        className: 'xcart-product-grid',
        options: {},

        events: {
            "click [do-action=go-to-page]": 'goToPage',
            "click [do-action=go-to-next-page]": 'goToNextPage',
            "click [do-action=go-to-previous-page]": 'goToPreviousPage',
        },

        template: _.template(xcartApp.templates[xcartApp.options.template].product_grid.pagination),

        goToPage: function(e) {
            var el = e.target || e.srcElement;
            var page = jQuery(el).attr('data-page');
            this.trigger('go-to-page', {
                page: page,
            });
        },

        goToNextPage: function() {
            this.trigger('go-to-next-page');
        },

        goToPreviousPage: function() {
            this.trigger('go-to-previous-page');
        },

        render: function(options) {
            this.$el.html(this.template({
                model: this.model.toJSON(), 
                options: this.options
            }));

            return this;
        }
    });

    var ProductCellView = Backbone.View.extend({
        tagName: 'div',

        events: {
            "click [do-action=show-product-browser]": 'showProductBrowser',
            "click [do-action=add-product-to-cart]": 'addProductToCart',
        },

        template: _.template(xcartApp.templates[xcartApp.options.template].product_grid.product_cell),

        className: 'xcart-product',

        popupProductAdded: new PopupProductAdded(),

        showProductBrowser: function (e) {
            e.preventDefault();
            this.trigger('product-selected', this.model);
        },

        addProductToCart: function() {
            var result = xcartApp.cartProducts.addProduct(this.model);
            if (result != true) {
                if (result.error == xcartApp.OUT_OF_STOCK) {
                    this.$el.find('.out-of-stock').addClass('active');
                }
            } else {
                this.popupProductAdded.render();
            }
        },

        render: function() {
            this.$el.html(this.template({
                model: this.model.toJSON(),
                options: xcartApp.options
            }));
            this.$el.addClass(jQuery('#xcart-product-cell-template').attr('class-to-element'));

            return this;
        }
    });

    var ProductGrid = Backbone.View.extend({
        template: _.template(xcartApp.templates[xcartApp.options.template].product_grid.product_grid),

        initData: {},
        gridNumber: null,
        isCategoryChanged: true,
        categoryId: 0,
        gridSize: 3,
        page: 1,
        categoryGrid: null,

        events: {
            "click [do-action=sort-by-name]": 'sortByName',
            "click [do-action=sort-by-price]": 'sortByPrice',
            "click [do-action=sort-by-default]": 'sortByDefault',
        },

        initialize: function (options) {
            this.initData = _.clone(options); //saving state
            for (var param in options) {
                this[param] = options[param];
            }

            this.gridProducts = new ProductModule.ProductList();
            this.loadView = new LoadingView();
            this.$el.html(this.loadView.render().el);
        },

        setParams: function(params) {
            for (var param in params) {
                this[param] = params[param];
            }
        },

        init: function(options) {},

        stateReset: function() {
            this.page = 1;
            this.model = this.initData.category;
            this.categoryId = this.initData.categoryId;
            if (undefined != this.initData.gridProducts) {
                this.gridProducts = this.initData.gridProducts;
            }
        },

        productSelected: function(product) {},

        //PAGINATION
        isCorrectPage: function(page) {
            var result = false;
            if (undefined != page && null != page && page >0) {
                var pageCount = this.gridProducts.length / this.gridSize;
                var productsLeft = this.gridProducts.length - pageCount;
                if (productsLeft > 0) {
                    pageCount++;
                }
                if (page < pageCount) {
                    result = true;
                }
            }

            return result;
        },

        setCurrentPage: function(page) {
            if (this.isCorrectPage(page)) {
                this.page = page;
            } else {
                this.page = 1;
            }
        },

        goToPage: function(options) {},

        goToNextPage: function() {
            var page = parseInt(this.page) + 1;
            this.goToPage({page: page});
        },

        goToPreviousPage: function() {
            var page = parseInt(this.page) - 1;
            this.goToPage({page: page});
        },

        //SORTING
        comparator: function(product) {
            return product.get('name');
        },

        sort: function(sortFlag, element) {
            if (undefined == this.gridProducts.sortFlag) {
                console.log('Sorting by default');
            } else {
                console.log('Sorting by ' + this.gridProducts.sortFlag );
            }

            var sortElements = [
                jQuery('[do-action=sort-by-name]'),
                jQuery('[do-action=sort-by-price]'),
                jQuery('[do-action=sort-by-default]')
            ];

            _.each(sortElements, function (el) {
                el.removeClass('active');
                el.removeClass('arrow-down');
                el.removeClass('arrow-up');
            });

            jQuery(element).addClass('active');

            this.page = 1;
            if (this.gridProducts.sortFlag == sortFlag) { //if products has been sorted by the same way
                jQuery(element).addClass('arrow-up');
                jQuery(element).removeClass('arrow-down');
                this.gridProducts.models.reverse();
                this.gridProducts.trigger('sort');
                this.gridProducts.sortFlag = null;
            } else {
                jQuery(element).addClass('arrow-down');
                jQuery(element).removeClass('arrow-up');
                this.gridProducts.sortFlag = sortFlag;
                this.gridProducts.sort();
            }
            this.goToPage({page: 1, trigger: false});
            this.renderProducts();
        },
        sortByName: function(e) {
            e.preventDefault();
            this.sort('name', e.target);
        },

        sortByPrice: function(e) {
            e.preventDefault();
            this.sort('actualPrice', e.target);
        },

        sortByDefault: function(e) {
            e.preventDefault();
            this.sort('productId', e.target);
        },
        //END SORTING

        renderProduct: function(product) {
            var view = new ProductCellView({model: product});
            this.listenTo(view, 'product-selected', this.productSelected)
            this.productViews[this.productViews.length] = view;
            this.$el.find('.products').append(view.render().el);
        }, 

        renderCategoryGrid: function() {},

        renderProducts: function() {
            if (undefined == this.productViews) {
                this.productViews = [];
            }
            _.each(this.productViews, function(view) {
                view.remove();
            });
            this.productViews = [];

            if (undefined != this.paginationView) {
                this.paginationView.remove();
            }

            //Rendering pagination
            var paginationData = {
                currentPage: this.page,
                productsCount: this.gridProducts.length,
                gridSize: this.gridSize
            };

            var pageCount = paginationData.productsCount / paginationData.gridSize;
            if (pageCount > 1) {
                if (undefined != this.paginationView) {
                    this.paginationView.remove();
                }
                this.paginationView = new GridPagination({
                    model: this.model
                });
                this.paginationView.options = paginationData;
                this.listenTo(this.paginationView, 'go-to-page', this.goToPage);
                this.listenTo(this.paginationView, 'go-to-next-page', this.goToNextPage);
                this.listenTo(this.paginationView, 'go-to-previous-page', this.goToPreviousPage);
            }

            this.$el.find('.products').empty();

            if (pageCount > 1) {
                this.$el.find('.products').after(this.paginationView.render().el);
            }

            var productCounter = 0;
            var lastProductOnPage = this.gridSize * this.page;
            var firstProductOnPage = lastProductOnPage - this.gridSize + 1;

            _.each(this.gridProducts.models, function(product) {
                productCounter++;
                if(productCounter >= firstProductOnPage && productCounter <=lastProductOnPage ) {
                    this.renderProduct(product);
                }
            }, this);

            if (this.gridProducts.models.length == 0) {
                this.$el.find('.products').append("<div class='xcart-no-products'>" + xcartApp.options.titles.NO_PRODUCTS + "</div>");
            }
        },

        render: function() {
            this.$el.empty();
            this.$el.html(this.template(this.model.toJSON()));
            this.renderCategoryGrid();
            this.renderProducts();
            //Sorting by default
            this.gridProducts.sortFlag = 'productId';
            this.$el.find('[do-action=sort-by-default]').addClass('active');
            this.$el.find('[do-action=sort-by-default]').addClass('arrow-down');
        },
    });

    return ProductGrid;
});
