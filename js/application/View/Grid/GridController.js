/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Product grid controller
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
    'application/View/Grid/ProductGrid',
    'application/View/Grid/SearchProductGrid',
    'application/View/ProductBrowser/ProductBrowser',
    'application/View/ProductBrowser/SearchProductBrowser',
], function(jQuery, _, Backbone, XCartApp, LoadingView, CategoryModule, ProductModule, ProductGrid, SearchProductGrid, ProductBrowser, SearchProductBrowser) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var GridController = function (options) {
        this.options = options;
        if (undefined == this.options.gridSize) {
            this.options.gridSize = xcartApp.options.grid_size;
        }
        this.initialize = function() {
            if (undefined == this.options.productId) {
                this.productGrid = this.createProductGrid();
            }
        };

        this.hideElement = function($el) {
            $el.hide();
        };

        this.showModal = function() {
            if (xcartApp.isModalProductGrid) {
                var xcart_modal = jQuery('body').find('.xcart-modal');
                if (!jQuery(xcart_modal).is(':visible')) {
                    xcart_modal.fadeIn(200);
                }
            }
        };

        this.hideModal = function() {
            if (xcartApp.isModalProductGrid) {
                var xcart_modal = jQuery('body').find('.xcart-modal');
                if (jQuery(xcart_modal).is(':visible')) {
                    xcart_modal.hide(200);
                }
            }
        };

        this.hideOtherElements = function(BackboneView, options) {
            if (undefined == options) {
                var options = {};
            }
            options.scroll = (undefined == options.scroll)?true:options.scroll;

            if (undefined != this.searchProductGrid && this.searchProductGrid != BackboneView) {
                this.hideElement(this.searchProductGrid.$el);
            }
            if (undefined != this.productGrid && this.productGrid != BackboneView) {
                this.hideElement(this.productGrid.$el);
            }
            if (undefined != this.browser && this.browser != BackboneView) {
                this.hideElement(this.browser.$el);
            }
            if (xcartApp.isModalProductGrid) {
                var xcart_modal = jQuery('body').find('.xcart-modal');
                if (xcart_modal.length > 0) {
                    this.hideElement(xcart_modal);
                }
            }
            if (options.showModal) {
                this.showModal();
            }
            if (null != BackboneView && undefined != typeof BackboneView) {
                this.showModal();
                if (!BackboneView.$el.is(':visible')) {
                    BackboneView.$el.fadeIn(200);
                }
                if (true == options.scroll) {
                    xcartApp.scrollToElement(BackboneView.$el);
                }
            }
        };

        this.createProductGrid = function() {
            return new ProductGrid(this.options);
        };

        this.createSearchProductGrid = function() {
            console.log('creating SearchProductGrid');
            var $div = jQuery(document.createElement('div'));
            this.productGrid.$el.before($div);
            var options = {};
            options.el = $div;

            return new SearchProductGrid(options);
        };

        this.showSearchResults = function(searchProducts, searchText, page) {
            var options = {};
            options.gridSize = this.options.gridSize;
            //options.gridNumber = xcartApp.gridControllers.length;
            options.gridNumber = this.options.gridNumber;
            options.page = (undefined == page)?1:page;
            options.searchProducts = searchProducts;
            options.searchText = searchText;

            if (undefined == this.searchProductGrid) {
                this.searchProductGrid = this.createSearchProductGrid();
            }
            this.searchProductGrid.init(options);
            this.hideOtherElements(this.searchProductGrid, {showModal: true});
        };

        this.stateReset = function() {
            this.hideOtherElements(this.productGrid, {scroll: false});
            this.productGrid.stateReset();
            if (undefined != this.browser) { this.browser.remove(); }
            if (undefined != this.productGrid.model) {
                this.productGrid.init(this.options);
            } else {
                var options = this.options;
                options.categoryId = 0;
                options.page = 1;
                this.productGrid.init(this.options);
            }
        };

        this.renderLoader = function() {
            if (undefined != this.browser) { this.browser.$el.fadeOut(); }
            if (undefined != this.productGrid) {
                this.loadView = new LoadingView();
                this.productGrid.$el.html(this.loadView.render().el);
            }
            if (!this.productGrid.$el.is(':visible')) {
                this.productGrid.$el.fadeIn(); 
            }
        };

        this.deleteRenderLoader = function () {
            if (undefined != this.loadView) {
            this.loadView.remove();
            }
        };

        this.showGrid = function(options) {
            if (undefined != this.browser) { this.browser.remove(); }
            this.hideOtherElements(this.productGrid);
            var productGridOptions = _.clone(this.options);
            if (undefined == options.categoryId) {
                productGridOptions.categoryCleanURL = options.categoryCleanURL;
            } else {
                productGridOptions.categoryId = options.categoryId;
            }
            productGridOptions.page = options.page;
            this.productGrid.init(options);
        };

        this.getBreadCrumbs = function(options) {
            return xcartApp.renderBreadCrumbs(options);
        };

        this.getBackwardLink = function() {
            //Rendering backward link to search results
            var backwardLink = '';
            var backwardLinkTemplate = _.template(xcartApp.templates[xcartApp.options.template].product_grid.backward_search_link);
            var url = "search/" + this.searchProductGrid.searchText;
            if (1 < this.searchProductGrid.page) {
                url += "/page/" + this.searchProductGrid.page + "/grid/0";
            }
            backwardLink = backwardLinkTemplate({url: url});

            return backwardLink;
        };

        this.showProductBrowser = function(options) {
            if (undefined != this.browser) {
                this.browser.remove();
            }
            var browserViewParams = {};
            browserViewParams.breadcrumbs = '';
            browserViewParams.backwardLink = '';
            browserViewParams.browserProducts = null;
            for (option in options) {
                browserViewParams[option] = options[option];
            }

            browserViewParams.gridNumber = this.options.gridNumber;

            if (undefined != options.searchText && null != options.searchText) {
                browserViewParams.backwardLink = this.getBackwardLink();
                browserViewParams.browserProducts = new ProductModule.ProductList(this.searchProductGrid.gridProducts.models);
                browserViewParams.searchText = options.searchText;
                this.browser = new SearchProductBrowser(browserViewParams);
            } else {
                var breadCrumbsOptions = {};
                breadCrumbsOptions.gridNumber = this.options.gridNumber;
                breadCrumbsOptions.isIncludeCategory = true;
                if (undefined != options.categoryCleanURL) {
                    breadCrumbsOptions.categoryCleanURL = options.categoryCleanURL;
                } else {
                    breadCrumbsOptions.categoryId = options.categoryId;
                }
                browserViewParams.breadcrumbs = this.getBreadCrumbs(breadCrumbsOptions);
                browserViewParams.browserProducts = new ProductModule.ProductList(this.productGrid.gridProducts.models);
                if (undefined != options.categoryCleanURL) {
                    browserViewParams.categoryId = xcartApp.CategoriesCache.findByCleanURL(options.categoryCleanURL).get('categoryId');
                    if (this.productGrid.gridProducts.length > 0) {
                        browserViewParams.productId = this.productGrid.gridProducts.findByCleanURL(options.productCleanURL).get('categoryId');
                    }
                }

                this.browser = new ProductBrowser(browserViewParams);
            }

            this.renderBrowser();
            this.hideOtherElements(this.browser);
        };

        this.renderBrowser = function() {
            this.browser.init();
            this.productGrid.$el.after(this.browser.$el);
        };

        this.render = function() {
            this.productGrid.init(this.options);
        };
    };

    var createGridControllers = function() {
        var gridControllers = [];
        var elements = jQuery(document.body).find('div.xcart-product-grid');
        var counter = 0;
        var defaultOptions = {};
        _.each(elements, function(element) {
            defaultOptions = {};
            if (counter == xcartApp.defaultRenderData.gridNumber) {
                defaultOptions = xcartApp.defaultRenderData;
            } else {
                defaultOptions.categoryId = jQuery(element).attr('data-categoryId');
            }
            defaultOptions.gridNumber = counter;
            defaultOptions.el = jQuery(element);
            defaultOptions.gridSize = jQuery(element).attr('data-gridSize');
            defaultOptions.page = 1;

            var gridController = new GridController(defaultOptions);
            gridController.initialize();
            gridControllers.push(gridController);
            counter++;
        });

        return gridControllers;
    };

    return {
        createGridControllers: createGridControllers
    };

});
