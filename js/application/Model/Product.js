/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Product module
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
], function(jQuery, _, Backbone, XCartApp) {
    var xcartApp = XCartApp.getApp();

    var Product = Backbone.Model.extend({
        idAttribute: "productId",

        defaults: {
            'attributeValues': {},
        },

        initialize: function() {
            this.set(this.attributes);
            var productAttributes = this.calculateAttributes();
            this.set({
                'priceModifier': productAttributes.priceModifier,
                'attributeValues': productAttributes.attributeValues,
                'actualPrice': productAttributes.priceModifier + this.get('price'),
            });

            try {
                var translations = this.get('translations')[xcartApp.options.lang];
                this.set({
                    'name': translations['name'],
                    'description': translations['description'],
                });
            } catch(e) {
            }

            if (undefined === typeof this.get('image') || this.get('image').length == 0) {
                this.set({
                    'image': [
                        {
                            url: xcartApp.options['siteUrl'] + "/wp-content/plugins/xcart-integration/images/no_image.png",
                            width: xcartApp.options['image_box_size'],
                            height: xcartApp.options['image_box_size']
                        }
                    ]
                });
            } else {
                var self = this;
                _.each(this.get('image'), function (image) {
                    var sizes = self.getResizedImage(image.height, image.width);
                    image.height = sizes.height;
                    image.width = sizes.width;
                });
            }
        },

        calculateAttributes: function() {
            var priceModifier = 0;
            var attributes = this.get('attributes');
            var attributeValues = {};
            
            if (typeof attributes !== 'undefined') {
                for (var i = 0; i < attributes.length; i++) {
                    if ("T" == attributes[i].type) {
                        attributeValues[attributes[i].id] = attributes[i].value;
                    }
                    if ("S" == attributes[i].type) {
                        var currentValue = _.findWhere(attributes[i].values, {selected: true});
                        if ('price' == currentValue.field) {
                            priceModifier = priceModifier + currentValue.modifier;
                        }
                        attributeValues[attributes[i].id] = currentValue.id;
                    }
                    if ("C" == attributes[i].type) {
                        var currentValue = _.findWhere(attributes[i].values, {selected: true});
                        if ('price' == currentValue.field) {
                            priceModifier = priceModifier + currentValue.modifier;
                        }
                        attributeValues[attributes[i].id] = currentValue.id;
                    }
                }
            }

            return {
                priceModifier: priceModifier,
                attributeValues: attributeValues
            }
        },

        getResizedImage: function(height, width) {
            if (xcartApp.options['image_box_size'] != 160) {
                var proportion = height/width;
                if (height > width) {
                    height = xcartApp.options['image_box_size'];
                    width = height / proportion;
                } else {
                    width = xcartApp.options['image_box_size'];
                    height = proportion * width;
                }
            }

            return {
                width: width,
                height: height
            };
        },

        getCleanURL: function() {
            if (undefined != this.get('cleanURLs') && this.get('cleanURLs').length > 0) {
                var cleanURL = this.get('cleanURLs')[0];
                if (cleanURL.length > 0) {
                    return cleanURL;
                }
            }

            return null;
        },

        sync: function(method, model, options) {
            options.dataType = "jsonp";

            return Backbone.sync(method, model, options);
        }
    });

    var ProductList = Backbone.Collection.extend({
        url: xcartApp.options['requestUrl'] + '?target=store_integration_api&action=get_products_in_category',
        model: Product,
        comparator: function(product) 
        {
            return product.get(this.sortFlag);
        },

        sync: function(method, model, options) {
            options.dataType = "jsonp";

            return Backbone.sync(method, model, options);
        },

        findByCleanURL: function (cleanURL) {
            return this.find(function(product) {
                return product.get('cleanURLs').indexOf(cleanURL) != -1;
            });
        },
    });

    return {
        ProductModel: Product,
        ProductList: ProductList
    };
});
