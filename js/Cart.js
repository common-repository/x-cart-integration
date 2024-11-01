//CART
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};
    xcartApp.OUT_OF_STOCK = 'out-of-stock';

    var CartProducts = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("xcart-cart-products"),

        model: xcartApp.Product,
    });

    xcartApp.cartProducts = new CartProducts();

    var Cart = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage("xcart-cart"),

        defaults: {
            'length': 0,
        },

        initialize: function() {
        },

        addProduct: function(product) {
            var popupProductAdded = new xcartApp.PopupProductAdded();

            var productInCart = xcartApp.cartProducts.findWhere({productId: product.get('productId')});
            if (undefined === productInCart) { //if there is no such productin cart
                var newProduct = product.clone();
                newProduct.set({amount: 1});
                xcartApp.cartProducts.create(newProduct);
            } else {
                var productIdInCart = productInCart.get('productId');
                var currentAmount = productInCart.get('amount');
                var amountLeft = productInCart.get('quantity') - currentAmount;
                if (amountLeft > 0) {
                    var amount = currentAmount + 1;
                    productInCart.set({'amount': amount});
                    console.log('Product amount: ' + productInCart.get('amount'));
                    xcartApp.cartProducts.invoke('save');
                } else {
                    return {
                        error: xcartApp.OUT_OF_STOCK,
                    };
                }
            }
            console.log('Product has been added to cart');

            return true;
        },

        /*
         * product(Bockbone.Model) - product model
         * amount(int) - product amount
         * temporary(bool) - is temporary amount 
         */
        setAmount: function(product, amount, temporary) {
            if (amount < 0) return {
                error: false,
            };
            if (undefined === temporary) {
                temporary = false;
            }
            var amountLeft = product.get('quantity') - amount;
            if (amountLeft >= 0) {
                if (temporary != true) {
                    product.set({'amount': amount});
                    console.log('Product amount: ' + product.get('amount'));
                    xcartApp.cartProducts.invoke('save');
                }
            } else {
                return {
                    error: xcartApp.OUT_OF_STOCK,
                };
            }

            return true;
        },

        removeProducts: function() {
            _.each(xcartApp.cartProducts.models, function(product) {
                xcartApp.cartProducts.models[0].destroy();
            });
            xcartApp.cartProducts.trigger('change');
        },
    });

    xcartApp.PopupProductAdded = Backbone.View.extend({
        tagName: 'div',

        className: 'xcart-popup-product-added',

        template: _.template(jQuery('#xcart-popup-product-added-template').html()),

        initialize: function() {
            this.render();
            var self = this;
            setTimeout(function() {
                self.$el.fadeOut(400, function() {
                    self.remove();
                });
            }, 2500);
        },

        render: function() {
            this.$el.html(this.template());
            jQuery('body').append(this.$el);
        }
    });

    xcartApp.cart = new Cart();
    xcartApp.cartProducts.fetch();
});
