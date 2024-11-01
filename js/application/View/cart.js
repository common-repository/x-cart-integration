/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Cart view
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

    var CartView = Backbone.View.extend({
        productViews: [],

        template: _.template(xcartApp.templates[xcartApp.options.template].cart.cart),

        events: {
            'click [do-action=clear-cart]': 'emptyCart',
            'click [do-action=update-cart]': 'updateCart',
            'click [do-action=hide-cart]': 'hideCart',
        },

        initialize: function() {
            this.setElement(jQuery('#xcart-cart'));
            console.log('Initializing cart view');
            if (jQuery('#xcart-mini-cart').length>0) {
                this.miniCartView = new MiniCartView();
                this.listenTo(this.miniCartView, 'show-cart-action', this.showCart);
            }
            //this.registerHideManager();
        },

        addProduct: function(product) {},

        registerHideManager: function() {
            var self = this;
             jQuery('body').on('click', function(e) {
                var isValid = true;
                var children = self.$el.find('*');
                _.each(children, function(child) {
                    if (e.target.isEqualNode(child)) {
                        isValid = false;
                    }
                });
                var parents = jQuery(e.target).parents();
                _.each(parents, function(parent) {
                    if (
                        jQuery(parent).attr('id') == xcartApp.miniCartView.$el.attr('id')
                        || jQuery(parent).attr('id') == self.$el.attr('id')
                        || jQuery(e.target).attr('id') == self.$el.attr('id')) {
                        isValid = false;
                    }
                });
                if (isValid) {
                    self.hideCart();
                }
            });
        },

        showCart: function() {
            this.listenTo(xcartApp.cartProducts, 'change', this.render);
            this.render();
            this.$el.fadeIn();
        },

        hideCart: function() {
            this.$el.fadeOut();
        },

        emptyCart: function() {
            xcartApp.cartProducts.removeProducts();
            this.render();
            this.$el.fadeOut();
        },

        updateCart: function() {
            _.each(this.productViews, function(productView) {
                productView.setAmount();
            });
            this.render();
        },

        render: function() {
            if (xcartApp.cartProducts.length == 0) {
                this.$el.fadeOut();

                return;
            }
            this.$el.html();
            var length = 0;

            _.each(xcartApp.cartProducts.models, function(model){
                length += model.get('amount');
            });

            this.$el.html(this.template({
                length: length
            }));

            var checkoutForm = new CartCheckoutForm();
            this.$el.find('.xcart-cart-product-list-box').after(checkoutForm.render().el);

            for(var modelIndex = 0; modelIndex < xcartApp.cartProducts.models.length; modelIndex++) {
                console.log('Rendering product in cart');
                var index = this.productViews.length;
                for (var attrVarIndex = 0; attrVarIndex < xcartApp.cartProducts.models[modelIndex].get('attributeVariants').length; attrVarIndex++) {
                    var newProduct = xcartApp.cartProducts.models[modelIndex].clone();
                    var newAttributeValues = newProduct.get('attributeVariants')[attrVarIndex].attributeValues;
                    var newPriceModifier = newProduct.get('attributeVariants')[attrVarIndex].priceModifier;
                    var newAmount = newProduct.get('attributeVariants')[attrVarIndex].amount;
                    newProduct.set({
                        'attributeValues': newAttributeValues,
                        'priceModifier': newPriceModifier,
                        'amount': newAmount
                    }, {silent: true});
                    this.productViews[index] = new ProductInCartListView({'model': newProduct});
                    this.$el.find('table').append(this.productViews[index].render().el);
                }
            };
        }
    });

    var CartCheckoutForm = Backbone.View.extend({
        tagName: 'form',

        template: _.template(xcartApp.templates[xcartApp.options.template].cart.cart_checkout_form),

        render: function() {
            _.each(xcartApp.cartProducts.models, function(model) {
                console.log(model);
            });
            this.$el.attr('method', 'POST');
            this.$el.attr('action', xcartApp.options['shopUrl']);
            //this.$el.attr('target', '_blank');
            var referer = window.location.href;
            this.$el.html(this.template({
                referer: referer,
                products: xcartApp.cartProducts.models
            }));
            this.$el.addClass(jQuery('#xcart-cart-checkout-form').attr('class-to-element'));

            return this;
        },
    });


    var ProductInCartListView = Backbone.View.extend({
        temporaryAmount: null,

        tagName: 'tr',

        template: _.template(xcartApp.templates[xcartApp.options.template].cart.cart_product),

        events: {
            'click [do-action=delete]': 'deleteProduct',
            'keyup [do-action=set-amount]': 'setAmount',
        },

        deleteProduct: function() {
            xcartApp.cartProducts.deleteProduct(this.model);
            xcartApp.cartProducts.trigger('change');
        },

        setAmount: function(e) {
            var amount = 0;
            var result = false;

            if (undefined === e) {
                if (null == this.temporaryAmount) return;
                amount = parseInt(this.temporaryAmount);
                this.temporaryAmount = null;
                result = xcartApp.cartProducts.setAmount(this.model, amount, false);
            } else {
                amount = parseInt(this.$el.find('[do-action=set-amount]').val());
                if (e.keyCode != 13) {
                    this.temporaryAmount = amount;
                    console.log("new amount in cart: " + amount);
                    result = xcartApp.cartProducts.setAmount(this.model, amount, true);
                } else {
                    result = xcartApp.cartProducts.setAmount(this.model, amount, false);
                }
            }

            if (result != true) {
                if (result.error == xcartApp.OUT_OF_STOCK) {
                    this.$el.find('.out-of-stock').addClass('active');
                }
            } else {
                console.log('Amount setted');
                this.$el.find('.out-of-stock').removeClass('active');
                if (null == this.temporaryAmount) {
                    this.render();
                }
            }
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-cart-product-template').attr('class-to-element'));

            return this;
        },
    });

    var MiniCartView = Backbone.View.extend({
        template: _.template(xcartApp.templates[xcartApp.options.template].cart.mini_cart),

        events: {
            'click [do-action=show-cart]': 'showCart',
        },

        length: 0,

        initialize: function () {
            this.setElement(jQuery('#xcart-mini-cart'));
            this.listenTo(xcartApp.cartProducts, 'add', this.render);
            this.listenTo(xcartApp.cartProducts, 'change', this.render);
            this.render();
        },

        showCart: function() {
            console.log(13);
            if (this.length > 0) {
              this.trigger('show-cart-action');
            }
        },

        render: function() {
            console.log('MiniCart rendering');
            var length = 0;

            _.each(xcartApp.cartProducts.models, function(model){
                length += model.get('amount');
            });
            this.length = length;

            if (length > 0 || this.$el.hasClass('static')) {
                this.$el.fadeIn();
            } else {
                this.$el.fadeOut();
            }

            this.$el.html(this.template({
                length: length
            }));
            this.$el.addClass(jQuery('#xcart-mini-cart-template').attr('class-to-element'));
        },
    });

    var initialize = function() {
        var big_cart_element = jQuery.parseHTML(xcartApp.templates[xcartApp.options.template].elements.big_cart);
        jQuery('body').append(big_cart_element);
        if (jQuery('#xcart-mini-cart').length == 0) {
            var mini_cart_element = jQuery.parseHTML(xcartApp.templates[xcartApp.options.template].elements.mini_cart);
            jQuery('body').append(mini_cart_element);
        }
        xcartApp.cartProducts = new CartModule.CartProducts();
        xcartApp.cartProducts.fetch();

        return new CartView();
    };

    return {
        initialize: initialize
    };
});
