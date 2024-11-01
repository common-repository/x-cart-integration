//PRODUCTBROWSER
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    xcartApp.createProductBrowsers = function() {
        xcartApp.productBrowserRouters = [];
        var elements = jQuery(document.body).find('div.xcart-product-browser');
        var counter = 0;
        _.each(elements, function(element) {
            xcartApp.productBrowserRouters.push(new xcartApp.BrowserRouter({
                browserNumber: counter,
                el: jQuery(element),
                productId: jQuery(element).attr('data-productId'),
                categoryId: jQuery(element).attr('data-categoryId')
            }));
            counter++;
        });
    };

    xcartApp.BrowserRouter = Backbone.Router.extend({
        initialize: function(options) {
            this.el = options.element;
            this.productBrowser = new xcartApp.BrowserView(options);
        },

        stateReset: function() {
            this.productBrowser.stateReset();
        },

        showProduct: function(productId) {
            this.productBrowser.showProduct(productId);
        },
    });

    xcartApp.BrowserView = Backbone.View.extend({
        tagName: 'div',

        currentProductView: null,

        initData: {},
        gridNumber: null,
        productId: 1,
        categoryId: 1,

        events: {
            'click [do-action=move-forward]': 'moveForward',
            'click [do-action=move-backward]': 'moveBackward',
            "click [do-action=add-product-to-cart]": 'addProductToCart',
        },

        initialize: function(params) {
            this.initData = params;
            if (undefined != params) {
                //TODO replace it with something more beautiful
                if (undefined != params['el']) {
                    this.el = params['el'];
                }
                if (undefined != params['categoryId']) {
                    this.categoryId = params['categoryId'];
                }
                if (undefined != params['productId']) {
                    this.productId = params['productId'];
                }
                if (undefined != params['browserNumber']) {
                    this.browserNumber = params['browserNumber'];
                }
                if (undefined != params['gridNumber']) {
                    this.gridNumber = params['gridNumber'];
                }
                if (undefined != params['browserProducts']) {
                    this.browserProducts = params['browserProducts'];
                }
                if (undefined != params['breadcrumbs']) {
                    this.breadcrumbs = params['breadcrumbs'];
                }
                this.backwardLink = (undefined != params['backwardLink'])?params['backwardLink']:'';
            }
            
            if (undefined != xcartApp.defaultRenderData.browser && xcartApp.defaultRenderData.browser == this.browserNumber) {
                this.productId = xcartApp.defaultRenderData.productId;
                this.categoryId = xcartApp.defaultRenderData.categoryId;
            }

            var loadView = new xcartApp.LoadingView();
            this.$el.html(loadView.render().el);

            var self = this;
            var isRerender = true;
            if (undefined != this.browserProducts) {
                isRerender = false;
                var product = this.browserProducts.get(this.productId);
                if (undefined == product) {
                    this.browserProducts.reset();
                    isRerender = true;
                }
            }

            if (!isRerender) {
                this.addProduct();
                this.modifyLastProductLink();
                this.modifyFirstProductLink();
            } else {
                this.browserProducts = new xcartApp.ProductList();
                this.browserProducts.on('sync', function() {
                    self.modifyLastProductLink();
                    self.modifyFirstProductLink();
                });

                if (undefined != xcartApp.CategoryProductsCache[this.categoryId]) {
                    this.browserProducts.add(xcartApp.CategoryProductsCache[this.categoryId].models);
                    this.render();
                    this.addProduct();
                } else {
                    this.browserProducts.fetch({
                        data: {
                            category: this.categoryId,
                        },
                        success: function() {
                            self.browserProducts.add(self.browserProducts.attributes);
                            xcartApp.CategoryProductsCache[self.categoryId] = _.clone(self.browserProducts);
                            console.log('ProductBrowser fetched; Product amount: ' + self.browserProducts.length);
                            self.addProduct();
                        },
                        error: function(collection, response, options) {
                            console.log('Browser products fetch failed:');
                            console.log({response: response.responseText, productId: this.productId, categoryId: this.categoryId});
                        },
                    });
                }
            }
        },

        stateReset: function() {
            this.productId = this.initData.productId;
            this.addProduct();
        },

        showProduct: function(productId) {
            this.productId = this.browserProducts.get(productId);
            if (this.gridNumber != null) {
                if (xcartApp.isSearchMode()) {
                    xcartApp.mainRouter.navigate("search/" + xcartApp.searchText + "/product/" + product.get('productId') + "/grid/" + this.gridNumber, {trigger: true});
                } else {
                    xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + this.productId.get('productId') + "/grid/" + this.gridNumber);
                }
            } else {
                xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + productId + "/browser/" + this.browserNumber);
            }
            this.addProduct();
        },

        modifyLastProductLink: function() {
            var elem = "[do-action=move-forward]";
            var productId = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) + 1);
            if (undefined != productId) {
                this.$el.find(elem).removeClass('disabled');
            } else {
                this.$el.find(elem).addClass('disabled');
            }
        },

        modifyFirstProductLink: function() {
            var elem = "[do-action=move-backward]";
            var productId = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) - 1);
            if (undefined != productId) {
                this.$el.find(elem).removeClass('disabled');
            } else {
                this.$el.find(elem).addClass('disabled');
            }       
        },

        isLastProduct: function() {
            return (undefined == this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) + 1));
        },

        isFirstProduct: function() {
            return (undefined == this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) - 1));
        },

        move: function (e) {
            if (this.gridNumber != null) {
                if (xcartApp.isSearchMode()) {
                    xcartApp.mainRouter.navigate("search/" + xcartApp.searchText + "/product/" + this.productId.get('productId') + "/grid/" + this.gridNumber, {trigger: true});
                } else {
                    xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + this.productId.get('productId') + "/grid/" + this.gridNumber);
                }
            } else {
                xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + this.productId.get('productId') + "/browser/" + this.browserNumber);
            }
            this.addProduct();
        },

        moveForward: function(e) {
            var productId = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) + 1);
            if (!this.isLastProduct()) {
                console.log('Next product');
                this.productId = productId;
                this.move();
                this.modifyLastProductLink();
            }
        },

        moveBackward: function(e) {
            var productId = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) - 1);
            if (!this.isFirstProduct()) {
                console.log('Previous product');
                this.productId = productId;
                this.move();
                this.modifyFirstProductLink();
            }
        },

        addProduct: function() {
            if (undefined != this.productId) {
                var product = this.browserProducts.get(this.productId);
                this.model = product;
                if (this.currentProductView != null) {
                    this.currentProductView.stopListening();
                    this.currentProductView.undelegateEvents();
                    this.currentProductView.remove();
                }
                this.currentProductView = new xcartApp.BrowserProductView({model: product});
                this.$el.html(this.currentProductView.render().el);
                this.$el.find('.breadcrumbs_placeholder').replaceWith(this.breadcrumbs);
                this.$el.find('.backward_link_placeholder').replaceWith(this.backwardLink);
            }
        },

        addProductToCart: function() {
            var result = xcartApp.cart.addProduct(this.model);
            if (result != true) {
                if (result.error == xcartApp.OUT_OF_STOCK) {
                    this.$el.find('.out-of-stock').addClass('active');
					this.$el.find('.buynow-block').addClass('hidden');
                }
            }
        },
    });

    xcartApp.BrowserProductView = Backbone.View.extend({
        tagName: 'div',

        template: _.template(jQuery('#xcart-product-template').html()),

        initialize: function() {
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-product-template').attr('class-to-element'));

            return this;
        }
    });

    xcartApp.createProductBrowsers();
});
