/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Main router
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
    'application/Model/Cart',
], function(jQuery, _, Backbone, XCartApp, CartModule) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);

    var MainRouter = Backbone.Router.extend({
        routes: {
            "": "resetAll",
            //Common
            "category/:category": "goToCategory",
            "search/:searchText": "search",
            //Product grids
            "category/:category/page/:page/grid/:grid": "goToCategoryInGrid", 
            "search/:searchText/page/:page/grid/:grid": "goToPageInSearchResult",
            "category/:category/product/:product/grid/:grid": "showProductInGrid",
            "search/:searchText/product/:product/grid/:grid": "showProductOfSearchResult",
            //Product browsers
            "category/:category/product/:product/browser/:browser": "showProductInBrowser",

            //Clean url
            "Catalog/:category": "goToCategoryCleanURL",
            //Product grids
            "Catalog/:category/page/:page/grid/:grid": "goToCategoryInGridCleanURL", 
            "Catalog/:category/:product/grid/:grid": "showProductInGridCleanURL",
            //Product browsers
            "Catalog/:category/:product/browser/:browser": "showProductInBrowserCleanURL",
        },

        initialize: function () {},

        //CLEANURLS
        goToCategoryCleanURL: function (categoryCleanURL) {
            var curCategory = xcartApp.CategoriesCache.findByCleanURL(categoryCleanURL);
            this.goToCategory(curCategory.get('categoryId'));
        },
        goToCategoryInGridCleanURL: function (categoryCleanURL, page, grid) {
            grid = parseInt(grid);
            this.initAll({exceptElements: {
                grids: [grid],
                browsers: []
            }});
            var curCategory = xcartApp.CategoriesCache.findByCleanURL(categoryCleanURL);
            this.goToCategoryInGrid(curCategory.get('categoryId'), page, grid);
        },
        showProductInGridCleanURL: function (categoryCleanURL, productCleanURL, grid) {
            grid = parseInt(grid);
            this.initAll({exceptElements: {
                grids: [grid],
                browsers: []
            }});
            var curCategory = xcartApp.CategoriesCache.findByCleanURL(categoryCleanURL);
            grid = parseInt(grid);
            if (xcartApp.gridControllers.length > 0) {
                _.each(xcartApp.gridControllers, function(gridController) {
                    if (gridController.productGrid.gridNumber == grid) {
                        gridController.showProductBrowser({
                            categoryCleanURL: categoryCleanURL,
                            productCleanURL: productCleanURL,
                        });
                    }
                });
            } else {
                xcartApp.handleNoGridController();
            }
        },
        showProductInBrowserCleanURL: function (categoryCleanURL, productCleanURL, browser) {
            browser = parseInt(browser);
            this.initAll({exceptElements: {
                grids: [],
                browsers: [browser]
            }});
            browser = parseInt(browser);
            _.each(xcartApp.browserControllers, function(browserController) {
                if (browserController.productBrowser.browserNumber == parseInt(browser)) {
                    productId = parseInt(productId);
                    browserController.showProduct(productId);
                    xcartApp.scrollToElement(browserController.productBrowser.$el);
                }
            });
        },

        resetAll: function() {
            this.initAll();
        },

        initAll: function(options) {
            //TODO delete
            if (undefined == xcartApp.appStarted) {
                if (undefined == options) {
                    options = {
                        exceptElements: {},
                    };
                }

                options.exceptElements.grids = (undefined == options.exceptElements.grids)?[]:options.exceptElements.grids;
                options.exceptElements.browsers = (undefined == options.exceptElements.browsers)?[]:options.exceptElements.browsers;

                _.each(xcartApp.gridControllers, function(gridController) {
                    if (options.exceptElements.grids.indexOf(gridController.productGrid.gridNumber) == -1) {
                        gridController.stateReset();
                    }
                });
                _.each(xcartApp.browserControllers, function(browserController) {
                    if (options.exceptElements.browsers.indexOf(browserController.productBrowser.browserNumber) == -1) {
                        browserController.stateReset();
                    }
                });
            }
            xcartApp.appStarted = true;
        },

        goToCategory: function(categoryId) {
            this.initAll({exceptElements: {
                grids: [1],
                browsers: []
            }});
            categoryId = parseInt(categoryId);
            if (undefined != xcartApp.categoryMenuWidget) {
                xcartApp.categoryMenuWidget.resetActiveCategories(categoryId);
            }
            var gridController = _.first(xcartApp.gridControllers);
            if (undefined != gridController) {
                gridController.showGrid({categoryId: categoryId, page: 1});
            } else {
                xcartApp.handleNoGridController();
            }
        },

        search: function(searchText) {
            this.initAll({exceptElements: {
                grids: [1],
                browsers: []
            }});
            var gridController = _.first(xcartApp.gridControllers);
            if (undefined != gridController) {
                xcartApp.categoryMenuWidget.resetActiveCategories(0);
                if (undefined != xcartApp.searchWidget && searchText.length > 0) {
                    xcartApp.searchWidget.search(searchText, function(searchProducts) {
                        gridController.showSearchResults(searchProducts, searchText);
                    });
                }
            } else {
                xcartApp.handleNoGridController();
            }
        },

        goToPageInSearchResult: function(searchText, page, grid) {
            page = parseInt(page);
            grid = parseInt(grid);
            this.initAll({exceptElements: {
                grids: [grid],
                browsers: []
            }});
            if (xcartApp.gridControllers.length > 0) {
            _.each(xcartApp.gridControllers, function(gridController) {
                if (gridController.productGrid.gridNumber == parseInt(grid)) {
                    if (undefined != xcartApp.categoryMenuWidget) {
                        xcartApp.categoryMenuWidget.resetActiveCategories(0);
                    }
                    xcartApp.searchWidget.search(searchText, function(searchProducts) {
                        gridController.showSearchResults(searchProducts, searchText, page);
                    });
                }
            });
            } else {
                xcartApp.handleNoGridController();
            }
        },

        showProductOfSearchResult: function(searchText, productId, grid) {
            grid = parseInt(grid);
            this.initAll({exceptElements: {
                grids: [grid],
                browsers: []
            }});
            productId = parseInt(productId);
            if (xcartApp.gridControllers.length > 0) {
                _.each(xcartApp.gridControllers, function(gridController) {
                    if (gridController.productGrid.gridNumber == parseInt(grid)) {
                        if (undefined != xcartApp.categoryMenuWidget) {
                            xcartApp.categoryMenuWidget.resetActiveCategories(0);
                        }
                        xcartApp.searchWidget.search(searchText, function(searchProducts) {
                            gridController.showSearchResults(searchProducts, searchText, 0);
                            gridController.showProductBrowser({
                                categoryId: 0, 
                                productId: productId, 
                                searchText: searchText,
                            });
                        });
                    }
                });
            } else {
                xcartApp.handleNoGridController();
            }
        },

        goToCategoryInGrid: function(categoryId, page, grid) {
            categoryId = parseInt(categoryId);
            grid = parseInt(grid);
            page = parseInt(page);
            this.initAll({exceptElements: {
                grids: [grid],
                browsers: []
            }});
            if (xcartApp.gridControllers.length > 0) {
                _.each(xcartApp.gridControllers, function(gridController) {
                    if (gridController.productGrid.gridNumber == parseInt(grid)) {
                        if (undefined != xcartApp.categoryMenuWidget) {
                            xcartApp.categoryMenuWidget.resetActiveCategories(categoryId);
                        }
                        gridController.showGrid({categoryId: categoryId, page: page});
                    }
                });
            } else {
                xcartApp.handleNoGridController();
            }
        },

        showProductInGrid: function(categoryId, productId, grid) {
            categoryId = parseInt(categoryId);
            productId = parseInt(productId);
            grid = parseInt(grid);
            this.initAll({exceptElements: {
                grids: [grid],
                browsers: []
            }});
            if (xcartApp.gridControllers.length > 0) {
                _.each(xcartApp.gridControllers, function(gridController) {
                    if (gridController.productGrid.gridNumber == parseInt(grid)) {
                        gridController.showProductBrowser({
                            categoryId: categoryId,
                            productId: productId,
                        });
                    }
                });
            } else {
                xcartApp.handleNoGridController();
            }
        },

        showProductInBrowser: function(categoryId, productId, browser) {
            categoryId = parseInt(categoryId);
            productId = parseInt(productId);
            browser = parseInt(browser);
            this.initAll({exceptElements: {
                grids: [],
                browsers: [browser]
            }});
            _.each(xcartApp.browserControllers, function(browserController) {
                if (browserController.productBrowser.browserNumber == parseInt(browser)) {
                    productId = parseInt(productId);
                    browserController.showProduct(productId);
                    xcartApp.scrollToElement(browserController.productBrowser.$el);
                }
            });
        },
    });

    var initialize = function () {
        var mainRouter = new MainRouter();
        try {
            Backbone.history.start();
        } catch (x) {
            console.log(x);
            console.log('History started');
        }

        return mainRouter;
    };

    return {
        initialize: initialize
    };
});
