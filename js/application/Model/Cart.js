/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Cart module
 *
 * @author    Qualiteam software Ltd <info@x-cart.com>
 * @copyright Copyright (c) 2011-2015 Qualiteam software Ltd <info@x-cart.com>. All rights reserved
 * @license   http://www.x-cart.com/license-agreement.html X-Cart 5 License Agreement
 * @link      http://www.x-cart.com/
 */

define([
    'jquery',
    'underscore',
    'XCartApp',
    'application/Model/Product',
    'backbone',
    'backbone.localStorage',
], function(jQuery, _, XCartApp, ProductModule, Backbone) {
    var xcartApp = XCartApp.getApp();
    xcartApp.OUT_OF_STOCK = 'out-of-stock';

    var CartProducts = Backbone.Collection.extend({
        localStorage: new Backbone.LocalStorage("xcart-cart-products"),

        model: ProductModule.ProductModel,

        addProduct: function(product, attributes) {
            if (undefined == attributes) {
                var attributes = {
                    attributeValues: product.get('attributeValues'),
                    priceModifier: product.get('priceModifier'),
                };
            }
            var productInCart = this.findWhere({productId: product.get('productId')});
            if (undefined === productInCart) { //if there is no such productin cart
                var newProduct = product.clone();
                var attributeVariants = [];
                var amount = 1;
                attributeVariants[attributeVariants.length] = {
                    amount: 1,
                    priceModifier: attributes.priceModifier,
                    attributeValues: attributes.attributeValues
                };
                newProduct.set({
                    'amount': amount,
                    'attributeVariants': attributeVariants
                });
                this.create(newProduct);
            } else {
                var productIdInCart = productInCart.get('productId');
                var currentAmount = productInCart.get('amount');
                var amountLeft = productInCart.get('quantity') - currentAmount;
                if (amountLeft > 0) {
                    var amount = currentAmount + 1;
                    var attributeVariants = productInCart.get('attributeVariants');
                    var attributeValues = attributes.attributeValues;
                    var isVariantInSet = false;
                    for (var i = 0; i < attributeVariants.length; i++) {
                        var attrVarEqual = (JSON.stringify(attributeVariants[i].attributeValues) == JSON.stringify(attributeValues));
                        isVariantInSet = isVariantInSet || attrVarEqual;
                        if (isVariantInSet) {
                            attributeVariants[i].amount++;
                        }
                    };
                    if (!isVariantInSet) {
                        attributeVariants[attributeVariants.length] = {
                            amount: 1,
                            priceModifier: attributes.priceModifier,
                            attributeValues: attributes.attributeValues
                        };
                    }
                    productInCart.set({
                        'amount': amount,
                        'attributeVariants': attributeVariants
                    });
                    console.log('Product amount: ' + productInCart.get('amount'));
                    this.invoke('save');
                } else {
                    return {
                        error: xcartApp.OUT_OF_STOCK,
                    };
                }
            }
            console.log('Product has been added to cart');

            return true;
        },

        deleteProduct: function(product) {
            var currentProduct = this.get(product.get('productId'));
            var currentAttrVarIndex = 0;
            var allVariantsQuantity = currentProduct.get('amount');
            if(currentProduct.get('attributeVariants').length == 1) {
                allVariantsQuantity -= currentProduct.get('attributeVariants')[0].amount;
                currentProduct.destroy();
            } else {
                _.each(currentProduct.get('attributeVariants'), function(attributeVariant, attributeVariantIndex) {
                    if (attributeVariant.attributeValues == product.get('attributeVariants').attributeValues) {
                        currentAttrVarIndex = attributeVariantIndex;
                    }
                });
                if (currentAttrVarIndex == currentProduct.get('attributeVariants').length || undefined == currentProduct.get('attributeVariants')) {
                    allVariantsQuantity -= currentProduct.get('amount');
                    currentProduct.destroy();
                } else {
                    allVariantsQuantity -= currentProduct.get('attributeVariants')[currentAttrVarIndex].amount;
                    var tmpAttributeVariants = currentProduct.get('attributeVariants');
                    tmpAttributeVariants.splice(currentAttrVarIndex, 1);
                    currentProduct.set({
                        'amount': allVariantsQuantity,
                        'attributeVariants': tmpAttributeVariants,
                    });
                    xcartApp.cartProducts.invoke('save');
                }
            }

            return true;
        },

        /*
         * product(Bockbone.Model) - product model
         * amount(int) - product amount
         * temporary(bool) - is temporary amount 
         */
        setAmount: function(product, amount, temporary) {
            var currentProduct = this.get(product.get('productId'));
            var allVariantsQuantity = 0;
            var currentAttrVarIndex = 0;
            _.each(currentProduct.get('attributeVariants'), function(attributeVariant, attributeVariantIndex) {
                if (JSON.stringify(attributeVariant.attributeValues) == JSON.stringify(product.get('attributeValues'))) {
                    currentAttrVarIndex = attributeVariantIndex;
                    allVariantsQuantity += amount;
                } else {
                    allVariantsQuantity += attributeVariant.amount;
                }
            });

            if (amount < 0) return {
                error: false,
            };
            if (undefined === temporary) {
                temporary = false;
            }
            var amountLeft = product.get('quantity') - allVariantsQuantity;
            if (amountLeft >= 0) {
                if (temporary != true) {
                    var tmpAttributeVariants = currentProduct.get('attributeVariants');
                    tmpAttributeVariants[currentAttrVarIndex].amount = amount;
                    currentProduct.set({
                        'attributeVariants': tmpAttributeVariants,
                        'amount': allVariantsQuantity
                    });
                    console.log('Product amount: ' + allVariantsQuantity);
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
            var product = null;
            while(product = this.first()) {
                product.destroy();
            }
            this.trigger('change');
        },
    });

    var CartModel = Backbone.Model.extend({
        localStorage: new Backbone.LocalStorage("xcart-cart"),

        defaults: {
            'length': 0,
        },

        initialize: function() {
        },
    });

    return {
        CartProducts: CartProducts,
        CartModel: CartModel
    };
});
