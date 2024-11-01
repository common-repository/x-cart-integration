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
    'application/View/PopupProductAdded',
    'application/View/ImageGallery',
    'application/Model/Product',
], function(jQuery, _, Backbone, XCartApp, LoadingView, PopupProductAdded, ImageGallery, ProductModule) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.CategoryProductsCache = xcartApp.CategoryProductsCache || [];

    var BrowserView = Backbone.View.extend({
        tagName: 'div',

        currentProductView: null,

        initData: {},
        gridNumber: null,
        productId: 1,
        categoryId: 1,
        popupProductAdded: new PopupProductAdded(),

        events: {
            'click [do-action=move-forward]': 'moveForward',
            'click [do-action=move-backward]': 'moveBackward',
            "click [do-action=add-product-to-cart]": 'addProductToCart',
        },

        initialize: function(params) {
            this.initData = params;
            this.setParams(params);
        },

        setParams: function(params) {
            delete this.categoryId;
            delete this.productId;
            delete this.productCleanURL;
            delete this.categoryCleanURL;
            for (var param in params) {
                this[param] = params[param];
            }
        },

        init: function(params) {
            if (undefined != params) {
                this.setParams(params);
            }
            var loadView = new LoadingView();
            this.$el.html(loadView.render().el);

            var self = this;
            var isRerender = true;
            var product;
            if (undefined != this.browserProducts) {
                isRerender = false;
                if (undefined != this.productCleanURL) {
                    product = this.browserProducts.findByCleanURL(this.productCleanURL);
                } else {
                    if (undefined != this.productId) {
                        product = this.browserProducts.get(this.productId);
                    }
                }
                if (undefined == product) {
                    this.browserProducts.reset();
                    isRerender = true;
                }
            }

            if (!isRerender) {
                this.renderProduct();
                this.modifyLastProductLink();
                this.modifyFirstProductLink();
            } else {
                this.browserProducts = new ProductModule.ProductList();
                this.browserProducts.on('sync', function() {
                    self.modifyLastProductLink();
                    self.modifyFirstProductLink();
                });

                this.browserProducts.reset();
                if (undefined != xcartApp.CategoryProductsCache[this.categoryId]) {
                    this.browserProducts.add(xcartApp.CategoryProductsCache[this.categoryId].models);
                } else if (undefined != xcartApp.CategoryProductsCache[this.categoryCleanURL]) {
                    this.browserProducts.add(xcartApp.CategoryProductsCache[this.categoryCleanURL].models);
                } 
                var requestData = {category: this.categoryId};
                /*if (undefined != this.categoryCleanURL) {
                    requestData.clean_url = this.categoryCleanURL;
                } else {
                    requestData.category = this.categoryId;
                }*/
                this.browserProducts.fetch({
                    data: requestData,
                    success: function() {
                        self.browserProducts.add(self.browserProducts.attributes);
                        xcartApp.CategoryProductsCache[self.categoryId] = _.clone(self.browserProducts);
                        console.log('ProductBrowser fetched; Product amount: ' + self.browserProducts.length);
                        self.renderProduct();
                    },
                    error: function(collection, response, options) {
                        console.log('Browser products fetch failed:');
                        console.log({response: response.responseText, productId: this.productId, categoryId: this.categoryId});
                    },
                });
            }

        },

        stateReset: function() {
            this.productId = this.initData.productId;
            this.init(this.initData);
        },

        showProduct: function(productId) {
        },

        modifyLastProductLink: function() {
            if (null == this.currentProductView) {
                return;
            }
            var elem = "[do-action=move-forward]";
            var product = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) + 1);
            this.modifyProductLink(product, elem);
        },

        modifyFirstProductLink: function() {
            if (null == this.currentProductView) {
                return;
            }
            var elem = "[do-action=move-backward]";
            var product = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) - 1);
            this.modifyProductLink(product, elem);
        },

        modifyProductLink: function(product, elem) {
            if (undefined != product) {
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
        },

        moveForward: function(e) {
            var product = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) + 1);
            if (!this.isLastProduct()) {
                console.log('Next product');
                this.productId = product.get('productId');
                this.move();
                this.modifyLastProductLink();
            }
        },

        moveBackward: function(e) {
            var product = this.browserProducts.at(this.browserProducts.indexOf(this.currentProductView.model) - 1);
            if (!this.isFirstProduct()) {
                console.log('Previous product');
                this.productId = product.get('productId');
                this.move();
                this.modifyFirstProductLink();
            }
        },

        renderProduct: function() {
            if (undefined != this.productCleanURL) {
                var product = this.browserProducts.findByCleanURL(this.productCleanURL);
            } else {
                var product = this.browserProducts.get(this.productId);
            }

            if (undefined != product) {
                this.model = product;
                if (this.currentProductView != null) {
                    this.currentProductView.stopListening();
                    this.currentProductView.undelegateEvents();
                    this.currentProductView.remove();
                }
                this.currentProductView = new BrowserProductView({model: product});
                this.$el.html(this.currentProductView.render().el);
                this.$el.find('.breadcrumbs_placeholder').replaceWith(this.breadcrumbs);
                this.$el.find('.backward_link_placeholder').replaceWith(this.backwardLink);
            }
        },

        addProductToCart: function() {
            var attributes = this.currentProductView.calculateAttributes();
            var result = xcartApp.cartProducts.addProduct(this.currentProductView.model, attributes);
            if (result != true) {
                if (result.error == xcartApp.OUT_OF_STOCK) {
                    this.$el.find('.out-of-stock').addClass('active');
                    this.$el.find('.buynow-block').addClass('hidden');
                }
            } else {
                this.popupProductAdded.render();
            }
        },
    });

    var BrowserProductView = Backbone.View.extend({
        tagName: 'div',

        template: _.template(xcartApp.templates[xcartApp.options.template].product_browser.product_browser),
        className: 'xcart-product-browser',

        events: {
            'click img.xcart_product_image': 'showGallery',
        },

        initialize: function() {
        },

        showGallery: function() {
            var images = this.$el.find('[do-action=change-image]');
            var imageGallery = new ImageGallery(images, this.$el.find('img.xcart_product_image').attr('src'));
        },

        calculateAttributes: function() {
            var priceModifier = 0;
            var attributes = this.model.get('attributes');
            var inputs = this.$el.find(':input');
            var attributeValues = {};
            for (var i = 0; i < inputs.length; i++) {
                var dataAttrId = parseInt(jQuery(inputs[i]).attr('data-attribute-id'));
                var dataAttrVal = jQuery(inputs[i]).val();
                var attribute = _.findWhere(attributes, {id: dataAttrId});
                if (undefined != attribute) {
                    //Calculating price
                    if (undefined != attribute.values) {
                        if ('C' != attribute.type) {
                            dataAttrVal = parseInt(dataAttrVal);
                        } else {
                            if (jQuery(inputs[i]).is(':checked')) {
                                dataAttrVal = parseInt(dataAttrVal);
                            } else {
                                dataAttrVal = parseInt(jQuery(inputs[i]).attr('data-unchecked'));
                            }
                        }
                        var attrVal = _.findWhere(attribute.values, {id: dataAttrVal});
                        if (undefined != attrVal.field && attrVal.field == 'price') {
                            priceModifier = priceModifier + attrVal.modifier;
                        }
                    }
                    attributeValues[dataAttrId] = dataAttrVal;
                }
            }

            return {
                priceModifier: priceModifier,
                attributeValues: attributeValues,
            };
        },

        setImageClickHandlers: function() {
            var images = this.$el.find('[do-action=change-image]');
            var $mainImage = this.$el.find('img.xcart_product_image');
            var getResizedImage = this.model.getResizedImage;
            for (var i = 0; i < images.length; i++) {
                jQuery(images[i]).on('click', function(e) {
                    for (var j = 0; j < images.length; j++) {
                        jQuery(images[j]).parent('li').removeClass('active');
                    }
                    jQuery(e.target).parent('li').addClass('active');
                    var oldWidth = jQuery(e.target).attr('orig-width');
                    var oldHeight = jQuery(e.target).attr('orig-height');
                    var sizes = getResizedImage(oldHeight, oldWidth);
                    $mainImage.attr('width', sizes.width);
                    $mainImage.attr('height', sizes.height);
                    $mainImage.attr('src', jQuery(e.target).attr('src'))
                });
            }
        },

        renderPrice: function() {
            var priceTemplater = _.template(xcartApp.templates[xcartApp.options.template].product_browser.product_price);
            var modifier = this.calculateAttributes().priceModifier;
            this.$el.find('[data-place-template=price]').html(priceTemplater({
                currencySymbol: this.model.get('currencySymbol'),
                modifier: modifier,
                price: this.model.get('price'),
                initialPrice: this.model.get('initialPrice'),
                salePercent: this.model.get('salePercent')
            }));
            this.$el.html();
        },

        render: function() {
            var options = xcartApp.options;
            this.$el.html(this.template({
                model: this.model.toJSON(), 
                options: options
            }));

            this.renderPrice();
            this.setImageClickHandlers();
            var inputs = this.$el.find(':input');
            var self = this;
            for (var i = 0; i < inputs.length; i++) {
                jQuery(inputs[i]).change(function() {
                    self.renderPrice();
                });
            }

            return this;
        }
    });

    return BrowserView;
});
