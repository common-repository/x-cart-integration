/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Category module
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

    xcartApp.CategoriesCache = xcartApp.CategoriesCache || [];

    var Category = Backbone.Model.extend({
        url: xcartApp.options['requestUrl'] + '?target=store_integration_api&action=get_category',
        idAttribute: "categoryId",

        initialize: function() {
            this.set(this.attributes);

            try {
                var translations = this.get('translations')[xcartApp.options.lang];
                this.set({
                    'name': translations['name'],
                });
            } catch(e) {
            }

            if ('undefined' == (typeof this.get('image'))) {
                this.set({
                    'image': {
                            url: xcartApp.options['siteUrl'] + "/wp-content/plugins/xcart-integration/images/no_image.png",
                            width: xcartApp.options['image_box_size'],
                            height: xcartApp.options['image_box_size']
                    }
                });
            } else {
                if (xcartApp.options['image_box_size'] != 160) {
                    var image = this.get('image');
                    var proportion = image.height/image.width;
                    if (image.height > image.width) {
                        image.height = xcartApp.options['image_box_size'];
                        image.width = image.height / proportion;
                    } else {
                        image.width = xcartApp.options['image_box_size'];
                        image.height = proportion * image.width;
                    }
                    this.set({'image': image});
                }
            }
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

    var CategoryList = Backbone.Collection.extend({
        url: xcartApp.options['requestUrl'] + '?target=store_integration_api&action=get_categories',
        model: Category,

        comparator: function(category) 
        {
            return category.get('lpos');
        },

        sync: function(method, model, options) {
            options.dataType = "jsonp";

            return Backbone.sync(method, model, options);
        },

        findByCleanURL: function (cleanURL) {
            return this.find(function(category) {
                return category.get('cleanURLs').indexOf(cleanURL) != -1;
            });
        },
    });

    return {
        Category: Category,
        CategoryList: CategoryList
    };
});
