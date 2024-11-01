//PRODUCTGRID
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    xcartApp.createProductGrids = function() {
        xcartApp.gridRouters = [];
        var elements = jQuery(document.body).find('div.xcart-product-grid');
        var counter = 0;
        _.each(elements, function(element) {
            xcartApp.gridRouters.push(new xcartApp.GridRouter({
                gridNumber: counter,
                element: jQuery(element),
                categoryId: jQuery(element).attr('data-categoryId'),
                gridSize: jQuery(element).attr('data-gridSize')
            }));
            counter++;
        });
        if (undefined != xcartApp.defaultRenderData.searchText) {
            xcartApp.defaultRenderData.func(_.first(xcartApp.gridRouters));
        }
    };

    xcartApp.GridRouter = Backbone.Router.extend({
        initialize: function(options) {
            this.el = options.element;
            
            if (undefined != xcartApp.defaultRenderData.grid && xcartApp.defaultRenderData.grid == options.gridNumber) {
                options.categoryId = xcartApp.defaultRenderData.categoryId;
                if (undefined == xcartApp.defaultRenderData.productId) {
                    options.currentPage = xcartApp.defaultRenderData.pageId;
                } else {
                    options.productId = xcartApp.defaultRenderData.productId;
                    options.isDefaultShowProduct = true;
                    var self = this;
                    options.callback = function() {
                        if (undefined == xcartApp.CategoriesCache.models) {
                            var categories = new xcartApp.CategoryList();
                            selfSelf = self;
                            categories.fetch({
                                success: function() {
                                    categories.add(xcartApp.Categories.attributes);
                                    xcartApp.CategoriesCache = new xcartApp.CategoryList();
                                    xcartApp.CategoriesCache.add(categories.models);
                                    selfSelf.showProductBrowser(xcartApp.defaultRenderData.categoryId, xcartApp.defaultRenderData.productId);
                                },
                                error: function(collection, response, options) {
                                    console.log('Category fetch failed:');
                                    console.log({response: response.responseText});
                                }
                            });
                        }
                    }
                }
            }

            this.productGrid = new xcartApp.ProductGrid(options);
        },

        stateReset: function() {
            this.productGrid.stateReset();
            if (undefined != this.productGrid.model) {
                this.showGrid(this.productGrid.model.get('categoryId'), 1);
            } else {
                this.showGrid(0, 1);
            }
        },

        renderLoader: function() {
            if (undefined != this.browser) { this.browser.$el.fadeOut(); }
            if (undefined != this.productGrid) {
                this.loadView = new xcartApp.LoadingView();
                this.productGrid.$el.html(this.loadView.render().el);
            }
            if (!this.productGrid.$el.is(':visible')) {
                this.productGrid.$el.fadeIn(); 
            }
        },

        deleteRenderLoader: function () {
            if (undefined != this.loadView) {
                this.loadView.remove();
            }
        },

        showSearchResults: function(searchProducts, pageId) {
            if (undefined != this.browser) { this.browser.$el.fadeOut(); }
            if (undefined != this.productGrid) {
                this.productGrid.showSearchResults(searchProducts, pageId);
            }
            if (!this.productGrid.$el.is(':visible')) {
                this.productGrid.$el.fadeIn(); 
            }
        },

        showGrid: function(categoryId, pageId, callback) {
            if (undefined != this.browser) { this.browser.$el.fadeOut(); }
            if (undefined != this.productGrid) {
                categoryId = parseInt(categoryId);
                if (0 == this.productGrid.gridNumber && xcartApp.wasSearchMode) {
                    this.productGrid.model.set({
                        'name': this.productGrid.nameBeforeSearch,
                    });
                }
                this.productGrid.isCategoryChanged = (this.productGrid.categoryId != categoryId);
                if (xcartApp.wasSearchMode && 0 == this.productGrid.gridNumber) {
                    this.productGrid.isCategoryChanged = true;
                }
                if (xcartApp.isSearchMode() && 0 == this.productGrid.gridNumber) {
                    this.productGrid.isCategoryChanged = false;
                }
                this.productGrid.categoryId = categoryId;
                if (this.productGrid.isRootCategory()) {
                    var loadView = new xcartApp.LoadingView();
                    this.productGrid.$el.html(loadView.render().el);
                    this.productGrid.model = new xcartApp.Category({
                        categoryId: 0,
                        depth: -1,
                    }, {silent: true});
                    this.productGrid.renderCategoryGrid();
                } else {
                    if (!this.productGrid.isCategoryChanged) {
                        this.productGrid.setCurrentPage(pageId);
                        this.productGrid.reRender();
                    } else {
                        this.productGrid.currentPage = pageId;
                        this.productGrid.updateGrid(xcartApp.Categories.get(categoryId));
                    }
                }
                if (undefined != callback) {
                    callback();
                }
            }
            if (!this.productGrid.$el.is(':visible')) {
                this.productGrid.$el.fadeIn(); 
            }
        },

        createProductBrowser: function(categoryId, productId, breadcrumbs, backwardLink) {
            var browserProducts = new xcartApp.ProductList(this.productGrid.gridProducts.models);
            var browser = new xcartApp.BrowserView({
                categoryId: parseInt(categoryId),
                productId: parseInt(productId),
                gridNumber: this.productGrid.gridNumber,
                browserProducts: browserProducts,
                breadcrumbs: breadcrumbs,
                backwardLink: backwardLink
            });

            return browser;
        },

        showProductBrowser: function(categoryId, productId, callback) {
            if (undefined != this.browser) {
                this.browser.remove();
            }
            var breadcrumbs = '';
            var backwardLink = '';
            if (!xcartApp.isSearchMode() || 0 != this.productGrid.gridNumber) {
                breadcrumbs = xcartApp.renderBreadCrumbs(this.productGrid.model.get('categoryId'), this.productGrid.gridNumber, true);
            } else {
                //Rendering backward link to search results
                if (0 == this.productGrid.gridNumber) {
                    var backwardLinkTemplate = _.template(jQuery('#xcart-backward-search-link-template').html());
                    var url = "search/" + xcartApp.searchText;
                    if (1 < this.productGrid.currentPage) {
                        url += "/page/" + this.productGrid.currentPage + "/grid/0";
                    }
                    backwardLink = backwardLinkTemplate({url: url});
                }
            }
            this.browser = this.createProductBrowser(categoryId, productId, breadcrumbs, backwardLink);

            if (undefined != this.productGrid && this.productGrid.$el.is(':visible')) {
                this.productGrid.$el.fadeOut(function() {
                    if (undefined != callback) {
                        callback();
                    }
                });
            }
            this.renderBrowser();
        },

        renderBrowser: function() {
            this.productGrid.$el.after(this.browser.$el);
        },
    });

    xcartApp.GridPagination = Backbone.View.extend({
        tagName: 'div',

        events: {
            "click [do-action=go-to-page]": 'goToPage',
            "click [do-action=go-to-next-page]": 'goToNextPage',
            "click [do-action=go-to-previous-page]": 'goToPreviousPage',
        },

        template: _.template(jQuery('#xcart-pagination-template').html()),

        goToPage: function(e) {
            var el = e.target || e.srcElement;
            var page = jQuery(el).attr('data-page');
            this.trigger('go-to-page', {
                currentPage: page,
            });
        },

        goToNextPage: function() {
            this.trigger('go-to-next-page');
        },

        goToPreviousPage: function() {
            this.trigger('go-to-previous-page');
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-pagination-template').attr('class-to-element'));

            return this;
        }
    });

    xcartApp.ProductCellView = Backbone.View.extend({
        tagName: 'div',

        events: {
            "click [do-action=show-product-browser]": 'showProductBrowser',
            "click [do-action=add-product-to-cart]": 'addProductToCart',
        },

        template: _.template(jQuery('#xcart-product-cell-template').html()),

        showProductBrowser: function (e) {
            e.preventDefault();
            this.trigger('product-selected', this.model);
        },

        addProductToCart: function() {
            var result = xcartApp.cart.addProduct(this.model);
            if (result != true) {
                if (result.error == xcartApp.OUT_OF_STOCK) {
                    this.$el.find('.out-of-stock').addClass('active');
                }
            }
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-product-cell-template').attr('class-to-element'));

            return this;
        }
    });

    xcartApp.ProductGrid = Backbone.View.extend({
        template: _.template(jQuery('#xcart-product-grid-template').html()),

        initData: {},
        gridNumber: null,
        isCategoryChanged: true,
        categoryId: 3,
        gridSize: 3,
        currentPage: 1,
        categoryGrid: null,

        events: {
            "click [do-action=sort-by-name]": 'sortByName',
            "click [do-action=sort-by-price]": 'sortByPrice',
            "click [do-action=sort-by-default]": 'sortByDefault',
            "keyup [do-action=search]": 'search',
        },

        initialize: function (options) {
            this.initData = _.clone(options); //saving state
            this.$el = options.element;

            this.gridSize = options.gridSize;
            this.categoryId = options.categoryId;
            this.gridNumber = options.gridNumber;
            if (undefined != options.productId) {
                this.productId = options.productId;
            }
            if (undefined != options.currentPage) {
                this.currentPage = options.currentPage;
            }
            this.gridProducts = new xcartApp.ProductList();
            this.model = new xcartApp.Category({
                categoryId: 0,
                depth: -1,
            }, {silent: true});

            if (undefined == xcartApp.defaultRenderData.searchText || this.gridNumber != 0) {
                var loadView = new xcartApp.LoadingView();
                this.$el.html(loadView.render().el);

                if (this.isRootCategory()) 
                {
                    this.initData.category = this.model;
                    if (!options.isDefaultShowProduct && !xcartApp.defaultRenderData.searchMode) {
                        this.renderCategoryGrid();
                    }
                } else {
                    this.productViews = [];
                    this.model = new xcartApp.Category({categoryId: this.categoryId}, {silent: true});
                    var self = this;
                    this.model.fetch({
                        data: {
                            category: this.categoryId,
                        },
                        success: function(results) {
                            self.model.set(results);
                            self.initData.category = self.model;
                            var validate = (self.model.get('categoryId') == parseInt(self.categoryId)) && (typeof self.model.get('lpos') == 'number');
                            if (validate) validate = 'correctly'; else validate = 'incorrect';
                            console.log('Category of grid (categoryId = ' + self.categoryId + ') was fetched ' + validate);
                            if (!options.isDefaultShowProduct && !xcartApp.defaultRenderData.searchMode) {
                                self.updateGrid(self.model);
                            } else {
                                if (undefined != options.callback && !xcartApp.defaultRenderData.searchMode) {
                                    options.callback();
                                }
                            }
                        },
                        error: function(collection, response, options) {
                            console.log('ProductGrid: Category of grid fetch failed!');
                            console.log({response: response.responseText, categoryId: self.categoryId});
                        },
                    });
                }
            }
        },

        isRootCategory: function() {
            if (0 == this.gridNumber && xcartApp.isSearchMode()) {
                return false;
            }
            return undefined == this.categoryId || Number(this.categoryId) != this.categoryId || 0 == this.categoryId;
        },

        stateReset: function() {
            this.currentPage = 1;
            this.model = this.initData.category;
            this.categoryId = this.initData.categoryId;
            if (undefined != this.initData.gridProducts) {
                this.gridProducts = this.initData.gridProducts;
            }
        },

        productSelected: function(product) {
            var search_mode = "";
            xcartApp.isFromUrl = false;
            if (xcartApp.isSearchMode() && 0 == this.gridNumber) {
                xcartApp.mainRouter.navigate("search/" + xcartApp.searchText + "/product/" + product.get('productId') + "/grid/" + this.gridNumber, {trigger: true});
            } else {
                xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + product.get('productId') + "/grid/" + this.gridNumber, {trigger: true});
            }
        },

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
                this.currentPage = page;
            } else {
                this.currentPage = 1;
            }
        },

        goToPage: function(options) {
            if (this.isCorrectPage(options.currentPage)) {
                var search_mode = "";
                if (xcartApp.isSearchMode() && 0 == this.gridNumber) {
                    xcartApp.mainRouter.navigate("search/" + xcartApp.searchText + "/page/" + options.currentPage + "/grid/" + this.gridNumber, {trigger: true});
                } else {
                    xcartApp.mainRouter.navigate("category/" + this.categoryId + "/page/" + options.currentPage + "/grid/" + this.gridNumber, {trigger: true});
                }
                console.log('Switched to page ' + options.currentPage);
            }
        },

        goToNextPage: function() {
            var page = parseInt(this.currentPage) + 1;
            if (this.isCorrectPage(page)) {
                var search_mode = "";
                if (xcartApp.isSearchMode() && 0 == this.gridNumber) {
                    xcartApp.mainRouter.navigate("search/" + xcartApp.searchText + "/page/" + page + "/grid/" + this.gridNumber, {trigger: true});
                } else {
                    xcartApp.mainRouter.navigate("category/" + this.categoryId + "/page/" + page + "/grid/" + this.gridNumber, {trigger: true});
                }
                console.log('Switched to page ' + page);
            }
        },

        goToPreviousPage: function() {
            var page = parseInt(this.currentPage) - 1;
            if (this.isCorrectPage(page)) {
                var search_mode = "";
                if (xcartApp.isSearchMode() && 0 == this.gridNumber) {
                    xcartApp.mainRouter.navigate("search/" + xcartApp.searchText + "/page/" + page + "/grid/" + this.gridNumber, {trigger: true});
                } else {
                    xcartApp.mainRouter.navigate("category/" + this.categoryId + "/page/" + page + "/grid/" + this.gridNumber, {trigger: true});
                }
                console.log('Switched to page ' + page);
            }
        },

        //SORTING
        comparator: function(product) {
            return product.get('name');
        },

        sort: function(sortFlag, element) {
            this.isCategoryChanged = false;
            if (xcartApp.isSearchMode()) {
                xcartApp.previousSearchText = xcartApp.searchText;
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

            this.currentPage = 1;
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
            this.reRender();
        },
        sortByName: function(e) {
            e.preventDefault();
            this.sort('name', e.target);
        },

        sortByPrice: function(e) {
            e.preventDefault();
            this.sort('price', e.target);
        },

        sortByDefault: function(e) {
            e.preventDefault();
            this.sort('productId', e.target);
        },
        //END SORTING
        
        showSearchResults: function(searchProducts, pageId) {
            this.isCategoryChanged = false;
            this.nameBeforeSearch = this.model.get('name');
            this.model.set({
                'name': xcartApp.options.titles.SEARCH_RESULT,
            });
            this.currentPage = (undefined == pageId)?1:pageId;
            if (undefined === this.initData.gridProducts) {
                this.initData.gridProducts = _.clone(this.gridProducts);
            }
            this.gridProducts = new xcartApp.ProductList(searchProducts.models);
            this.render();
        },

        search: function() {
            this.currentPage = 1;
            var text = jQuery('[do-action=search]').val();
            if (undefined === this.fullGridProducts) {
                this.fullGridProducts = this.gridProducts;
            }
            if(0 != text.length) {
                filteredProducts = this.fullGridProducts.filter(function(product) {
                    return product.get('name').toLowerCase().indexOf(text.toLowerCase()) + 1;
                });
                console.log(filteredProducts.length + ' items of ' + this.fullGridProducts.length + ' was found with ' + text);
                this.gridProducts = new xcartApp.ProductList(filteredProducts);
                this.reRender();
            } else {
                this.gridProducts = this.fullGridProducts;
                this.reRender();            
            }
        },

        updateGrid: function(category) {
            var loadView = new xcartApp.LoadingView();
            this.$el.html(loadView.render().el);

            if(undefined != typeof category) {
                this.model = category;
                this.categoryId = category.get('categoryId');
            }

            this.fetchProducts();
        },

        fetchProducts: function() {
            if (!this.isRootCategory()) {
                var self = this;
                this.gridProducts = new xcartApp.ProductList();
                if (undefined != xcartApp.CategoryProductsCache[this.categoryId]) {
                    this.gridProducts.add(xcartApp.CategoryProductsCache[this.categoryId].models);
                    this.render();
                } else {
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
            }
        },

        renderProduct: function(product) {
            var view = new xcartApp.ProductCellView({model: product});
            this.listenTo(view, 'product-selected', this.productSelected)
            this.productViews[this.productViews.length] = view;
            this.$el.find('.products').append(view.render().el);
        }, 

        isAnotherCategory: function() {
            return this.isCategoryChanged;
        },

        renderCategoryGrid: function(callback) {
            if (this.isAnotherCategory())
            {
                this.categoryGrid = new xcartApp.CategoryGrid({model: this.model});
                this.categoryGrid.gridNumber = this.gridNumber;

                var self = this;
                this.categoryGrid.render(function() {
                    if (undefined != callback) {
                        callback();
                    }

                    var toolsElem = self.$el.find('.tools');
                    if (toolsElem.length > 0) {
                        toolsElem.before(self.categoryGrid.$el);
                    } else {
                        self.$el.html(self.categoryGrid.$el);
                    }
                });
            } else {
                if (undefined != callback) {
                    callback();
                }
            }
        },

        reRender: function(callback) {
            var self = this;
            this.renderCategoryGrid(function() {
                _.each(self.productViews, function(view) {
                    view.remove();
                });

                self.productViews = [];

                if (undefined != self.paginationView) {
                    self.paginationView.remove();
                }

                //Rendering pagination
                self.model.set({
                    currentPage: self.currentPage,
                    productsCount: self.gridProducts.length,
                    gridSize: self.gridSize,
                });

                var pageCount = self.model.get('productsCount') / self.model.get('gridSize');
                if (pageCount > 1) {
                    self.paginationView = new xcartApp.GridPagination({model: self.model});
                    self.listenTo(self.paginationView, 'go-to-page', self.goToPage);
                    self.listenTo(self.paginationView, 'go-to-next-page', self.goToNextPage);
                    self.listenTo(self.paginationView, 'go-to-previous-page', self.goToPreviousPage);
                }

                if (undefined != callback) {
                    callback();
                }

                self.$el.find('.products').empty();

                if (pageCount > 1) {
                    self.$el.find('.products').after(self.paginationView.render().el);
                }

                var innerSelf = self;
                var productCounter = 0;
                var lastProductOnPage = self.gridSize * self.currentPage;
                var firstProductOnPage = lastProductOnPage - self.gridSize + 1;

                _.each(self.gridProducts.models, function(product) {
                    productCounter++;
                    if(productCounter >= firstProductOnPage && productCounter <=lastProductOnPage ) {
                        innerSelf.renderProduct(product);
                    }
                });

                if (
                    self.gridProducts.models.length == 0 
                    && (self.isAnotherCategory() 
                    || (xcartApp.isSearchMode() && xcartApp.isAnotherSearchRequest() && 0 == self.gridNumber))
                ) {
                    self.$el.find('.products').after("<div class='xcart-no-products'>" + xcartApp.options.titles.NO_PRODUCTS + "</div>");
                }

                self.$el.find('.products').after("<div class='clear'></div>");

                jQuery(xcartApp).trigger('product-grid-updated');
            });
        },

        render: function() {
            var self = this;
            this.$el.empty();
            this.reRender(function() {
                self.$el.html(self.template(self.model.toJSON()));
                self.$el.addClass(jQuery('#xcart-product-grid-template').attr('class-to-element'));
                //Sorting by default
                self.gridProducts.sortFlag = 'productId';
                self.$el.find('[do-action=sort-by-default]').addClass('active');
                self.$el.find('[do-action=sort-by-default]').addClass('arrow-down');
            });
        },
    });

    xcartApp.createProductGrids();
});
