//MAINROUTER
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};
    xcartApp.previousSearchText = null;
    xcartApp.searchText = null;
    xcartApp.wasSearchMode = false;
    xcartApp.isFromUrl = true;
    xcartApp.defaultRenderData = {};

    xcartApp.MainRouter = Backbone.Router.extend({
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
        },

        initialize: function() {
            this.listenTo(xcartApp.Categories, 'selected', this.showGridFromCategory);
        },

        resetAll: function() {
            _.each(xcartApp.gridRouters, function(gridRouter) {
                gridRouter.stateReset();
            });
            _.each(xcartApp.productBrowserRouters, function(browserRouter) {
                browserRouter.stateReset();
            });
        },

        goToCategory: function(categoryId) {
            xcartApp.defaultRenderData = {
                categoryId: categoryId,
                pageId: 1,
                grid: 0
            };
            xcartApp.unsetSearchMode();
            if (undefined != xcartApp.categoryMenu) {
                xcartApp.categoryMenu.resetActiveCategories(categoryId);
            }
            var gridRouter = _.first(xcartApp.gridRouters);
            if (undefined != gridRouter) {
                gridRouter.showGrid(categoryId, 1, function() {
                    xcartApp.scrollToElement(gridRouter.productGrid.$el);
                });
            } else {
                if (!xcartApp.isFromUrl) {
                    window.location.replace(xcartApp.options.demoShopUrl + '/#' + Backbone.history.getFragment());
                }
            }
        },

        search: function(searchText) {
            this.setDefaultSearchRenderData(searchText);
            var gridRouter = _.first(xcartApp.gridRouters);
            if (undefined != gridRouter) {
                xcartApp.categoryMenu.resetActiveCategories(0);
                if (undefined != xcartApp.searchWidget && searchText.length > 0) {
                    xcartApp.previousSearchText = xcartApp.searchText;
                    xcartApp.searchText = searchText;
                    gridRouter.renderLoader();
                    xcartApp.scrollToElement(gridRouter.productGrid.$el);
                    xcartApp.searchWidget.search(searchText, function(searchProducts) {
                        gridRouter.showSearchResults(searchProducts);
                    });
                } else {
                    if (searchText == 0) {
                        gridRouter.stateReset();
                    }
                }
            } else {
                if (!xcartApp.isFromUrl) {
                    window.location.replace(xcartApp.options.demoShopUrl + '/#' + Backbone.history.getFragment());
                }
            }

        },

        setDefaultSearchRenderData: function(searchText, pageId, productId) {
            pageId = (undefined == pageId)?1:parseInt(pageId)
            xcartApp.defaultRenderData = {
                searchText: searchText,
                func: function(gridRouter) {
                    if (undefined != gridRouter) {
                        xcartApp.previousSearchText = xcartApp.searchText;
                        xcartApp.searchText = searchText;
                        if (xcartApp.defaultRenderData.searchText.length > 0) {
                            gridRouter.renderLoader();
                            xcartApp.scrollToElement(gridRouter.productGrid.$el);
                            xcartApp.searchWidget.search(xcartApp.defaultRenderData.searchText, function(searchProducts) {
                                if (undefined != productId) {
                                    gridRouter.productGrid.gridProducts.add(searchProducts.models);
                                    gridRouter.showProductBrowser(0, productId);
                                    gridRouter.deleteRenderLoader();
                                } else {
                                    gridRouter.showSearchResults(searchProducts, pageId);
                                }
                            });
                        }
                    }
                },
            };
            if (undefined != productId) {
                xcartApp.defaultRenderData.productId = productId;
            }
        },

        goToPageInSearchResult: function(searchText, pageId, grid) {
            if (searchText.length > 0) {
                this.setDefaultSearchRenderData(searchText, pageId);
                xcartApp.defaultRenderData.currentPage = pageId;
            }
            _.each(xcartApp.gridRouters, function(gridRouter) {
                if (gridRouter.productGrid.gridNumber == parseInt(grid)) {
                    if (undefined != xcartApp.categoryMenu) {
                        xcartApp.categoryMenu.resetActiveCategories(0);
                    }
                    gridRouter.showGrid(0, pageId);
                    xcartApp.scrollToElement(gridRouter.productGrid.$el);
                }
            });
        },

        goToCategoryInGrid: function(categoryId, pageId, grid) {
            xcartApp.defaultRenderData = {
                categoryId: categoryId,
                pageId: pageId,
                grid: grid
            };
            _.each(xcartApp.gridRouters, function(gridRouter) {
                if (gridRouter.productGrid.gridNumber == parseInt(grid)) {
                    if (0 == parseInt(grid)) {
                        xcartApp.unsetSearchMode();
                    }
                    if (undefined != xcartApp.categoryMenu) {
                        xcartApp.categoryMenu.resetActiveCategories(categoryId);
                    }
                    gridRouter.showGrid(categoryId, pageId, function() {
                        xcartApp.scrollToElement(gridRouter.productGrid.$el);
                    });
                }
            });
        },

        showProductOfSearchResult: function(searchText, productId, grid) {
            xcartApp.previousSearchText = xcartApp.searchText;
            xcartApp.searchText = searchText;
            if (searchText.length > 0) {
                this.setDefaultSearchRenderData(searchText, 1, productId);
            }
            _.each(xcartApp.gridRouters, function(gridRouter) {
                if (gridRouter.productGrid.gridNumber == parseInt(grid)) {
                    gridRouter.showProductBrowser(0, productId, function() {
                        xcartApp.scrollToElement(gridRouter.browser.$el);
                    });
                }
            });
        },

        showProductInGrid: function(categoryId, productId, grid) {
            xcartApp.defaultRenderData = {
                categoryId: categoryId,
                productId: productId,
                grid: grid
            };
            _.each(xcartApp.gridRouters, function(gridRouter) {
                if (gridRouter.productGrid.gridNumber == parseInt(grid)) {
                    if (0 == parseInt(grid)) {
                        xcartApp.unsetSearchMode();
                    }
                    gridRouter.showProductBrowser(categoryId, productId, function() {
                        xcartApp.scrollToElement(gridRouter.browser.$el);
                    });
                }
            });
        },

        showProductInBrowser: function(categoryId, productId, browser) {
            xcartApp.defaultRenderData = {
                browser: browser,
                categoryId: categoryId,
                productId: productId
            };
            _.each(xcartApp.productBrowserRouters, function(productBrowserRouter) {
                if (productBrowserRouter.productBrowser.browserNumber == parseInt(browser)) {
                    productId = parseInt(productId);
                    productBrowserRouter.showProduct(productId);
                    xcartApp.scrollToElement(productBrowserRouter.productBrowser.$el);
                }
            });
        },
    });

    xcartApp.unsetSearchMode = function () {
        if (xcartApp.isSearchMode()) {
            xcartApp.wasSearchMode = true;
        } else {
            xcartApp.wasSearchMode = false;
        }
        xcartApp.previousSearchText = xcartApp.searchText;
        xcartApp.searchText = null;
    }

    xcartApp.isSearchMode = function () {
        if (null != xcartApp.searchText) {
            return true;
        } else {
            return false;
        }
    }

    xcartApp.isAnotherSearchRequest = function () {
        return xcartApp.searchText != xcartApp.previousSearchText;
    }

    xcartApp.scrollToElement = function(elem) {
        jQuery('html,body').stop().animate({ scrollTop: elem.offset().top-=50 }, 500);
    }

    xcartApp.selectCategory = function(categoryId, gridNumber) {
        if (0 == gridNumber) {
            xcartApp.unsetSearchMode();
        }

        if (undefined != xcartApp.categoryMenu) {
            xcartApp.Categories.trigger('selected', this.model);
        }
        xcartApp.isFromUrl = false;
        if (undefined == gridNumber) {
            xcartApp.mainRouter.navigate("category/" + categoryId, {trigger: true});
        } else {
            xcartApp.mainRouter.navigate("category/" + categoryId + "/page/" + 1 + "/grid/" + gridNumber, {trigger: true});
        }
    },
    
    xcartApp.renderBreadCrumbs = function (categoryId, gridNumber, isIncludeCategory) {
        if (undefined == isIncludeCategory) isIncludeCategory = false;

        var category = xcartApp.CategoriesCache.get(categoryId);
        breadcrumbs = '';
        if (undefined != category) {
            var lpos = category.get('lpos');
            var rpos = category.get('rpos');
            var breadCrumbsTemplate = _.template(jQuery('#xcart-category-breadcrumbs-template').html());
            categories = [];
            _.each(xcartApp.CategoriesCache.models, function (category) {
                if (category.get('rpos') > rpos && category.get('lpos') < lpos) {
                    var categoryId = (category.get('depth') < 0)?0:category.get('categoryId');
                    categories[categories.length] = {
                        categoryId: categoryId,
                        gridNumber: gridNumber,
                        name: category.get('name'),
                        isLast: false 
                    };
                }
            });
            if (isIncludeCategory) {
                categories[categories.length] = {
                        categoryId: category.get('categoryId'),
                        gridNumber: gridNumber,
                        name: category.get('name'),
                        isLast: false 
                    };
            }
            if (categories.length > 0) {
                categories[categories.length - 1].isLast = true;
            }
            var breadCrumbsModel = {categories: categories};

            breadcrumbs = breadCrumbsTemplate(breadCrumbsModel);
        }

        return breadcrumbs;
    },

    xcartApp.mainRouter = new xcartApp.MainRouter();

    try {
        Backbone.history.start();
    } catch (x) {
        console.log('History started');
    }
});
