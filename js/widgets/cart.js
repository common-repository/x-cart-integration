//PRODUCTGRID
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};

    xcartApp.CartView = Backbone.View.extend({
        productViews: [],

        el: jQuery('#xcart-cart'),

        template: _.template(jQuery('#xcart-cart-template').html()),
        
        events: {
            'click [do-action=clear-cart]': 'emptyCart',
            'click [do-action=update-cart]': 'updateCart',
            'click [do-action=hide-cart]': 'hideCart',
        },

        initialize: function() {
            this.listenTo(xcartApp.cartProducts, 'change', this.render);
            console.log('Initializing cart view');
            this.render();
            this.registerHideManager();
        },

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

        hideCart: function() {
            this.$el.fadeOut();
        },

        emptyCart: function() {
            xcartApp.cart.removeProducts();
            this.render();
            this.$el.fadeOut();
        },

        updateCart: function() {
            _.each(this.productViews, function(productView) {
                productView.setAmount();
            });
            //this.render();
        },

        render: function() {
            this.$el.html();

            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-cart-template').attr('class-to-element'));
            this.model.set({
                'products': xcartApp.cartProducts.models,
            });
            var checkoutForm = new xcartApp.CartCheckoutForm({model: xcartApp.cart});
            this.$el.find('.xcart-cart-product-list-box').after(checkoutForm.render().el);


            var self = this;
            _.each(xcartApp.cartProducts.models, function(product) {
                console.log('Rendering product in cart');
                var index = self.productViews.length;
                self.productViews[index] = new xcartApp.ProductInCartListView({'model': product});
                self.$el.find('table').append(self.productViews[index].render().el);
            });
        }
    });

    xcartApp.CartCheckoutForm = Backbone.View.extend({
        tagName: 'form',

        template: _.template(jQuery('#xcart-cart-checkout-form').html()),

        render: function() {
            this.$el.attr('method', 'POST');
            this.$el.attr('action', xcartApp.options['shopUrl']);
            //this.$el.attr('target', '_blank');
            var referer = window.location.href;
            this.model.set({
                'referer': referer
            });
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-cart-checkout-form').attr('class-to-element'));

            return this;
        },
    });


    xcartApp.ProductInCartListView = Backbone.View.extend({
        temporaryAmount: null,

        tagName: 'tr',

        template: _.template(jQuery('#xcart-cart-product-template').html()),

        events: {
            'click [do-action=delete]': 'deleteProduct',
            'keyup [do-action=set-amount]': 'setAmount',
        },

        deleteProduct: function() {
            this.model.destroy();
            xcartApp.cartProducts.trigger('change');
        },

        setAmount: function(e) {
            var amount = 0;
            var result = false;

            if (undefined === e) {
                if (null == this.temporaryAmount) return;
                amount = parseInt(this.temporaryAmount);
                this.temporaryAmount = null;
                result = xcartApp.cart.setAmount(this.model, amount, false);
            } else {
                amount = parseInt(this.$el.find('[do-action=set-amount]').val());
                if (e.keyCode != 13) {
                    this.temporaryAmount = amount;
                    console.log("new amount in cart: " + amount);
                    result = xcartApp.cart.setAmount(this.model, amount, true);
                } else {
                    result = xcartApp.cart.setAmount(this.model, amount, false);
                }
            }

            if (result != true) {
                if (result.error == xcartApp.OUT_OF_STOCK) {
                    this.$el.find('.out-of-stock').addClass('active');
                }
            } else {
                console.log('Amount setted');
                this.$el.find('.out-of-stock').removeClass('active');
            }
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-cart-product-template').attr('class-to-element'));

            return this;
        },
    });

    var MiniCartView = Backbone.View.extend({
        el: jQuery('#xcart-mini-cart'),

        template: _.template(jQuery('#xcart-mini-cart-template').html()),

        events: {
            'click [do-action=show-cart]': 'showCart',
        },

        initialize: function () {
            this.model = xcartApp.cart;
            this.listenTo(xcartApp.cartProducts, 'add', this.render);
            this.listenTo(xcartApp.cartProducts, 'change', this.render);
            this.render();
        },

        showCart: function() {
            xcartApp.cartView = new xcartApp.CartView({model: xcartApp.cart});
            xcartApp.cartView.$el.fadeIn();
        },

        render: function() {
            console.log('MiniCart rendering');
            var length = 0;

            _.each(xcartApp.cartProducts.models, function(model){
                length += model.get('amount');
            });

            this.model.set({
                'length': length,
            });

            if (length > 0) {
                this.$el.fadeIn();
            } else {
                this.$el.fadeOut();
            }

            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-mini-cart-template').attr('class-to-element'));
        },
    });

    xcartApp.miniCartView = new MiniCartView({model: xcartApp.cart});
});
