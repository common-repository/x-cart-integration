/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Search view
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
    'application/Model/Product',
], function(jQuery, _, Backbone, XCartApp, CartModule, ProductModule) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);
    xcartApp.SearchProductsCache = xcartApp.SearchProductsCache || [];

    var Search = Backbone.View.extend({
        el: jQuery('#xcart-search-widget'),

        template: _.template(xcartApp.templates[xcartApp.options.template].search_widget),
        
        views: [],

        events: {
            "keypress [do-action=search]": 'searchByEnter',
            "click [do-action=search-by-button]": 'searchByClick',
        },

        initialize: function () {
            this.render();
        },

        render: function() {
            this.$el.html(this.template());
            this.$el.addClass(jQuery('#xcart-search-widget-template').attr('class-to-element'));
        },

        search: function(searchText, callback) {
            if (0 < searchText.length) {
                this.searchProducts = new ProductModule.ProductList();
                this.searchProducts.url = xcartApp.options['requestUrl'] + '?target=store_integration_api&action=search';
                var self = this;
                if (undefined != xcartApp.SearchProductsCache[searchText]) {
                    if (undefined != callback) {
                        callback(xcartApp.SearchProductsCache[searchText]);
                    }
                } else {
                    this.searchProducts.fetch({
                        data: {
                            text_for_search: searchText,
                        },
                        success: function() {
                            self.searchProducts.add(self.searchProducts.attributes);
                            this.searchProductsResult = _.clone(self.searchProducts);
                            xcartApp.SearchProductsCache[searchText] = _.clone(this.searchProductsResult);
                            if (undefined != callback) {
                                callback(this.searchProductsResult);
                            }
                            console.log('Search products fetched; Product amount: ' + self.searchProducts.length);
                        },
                        error: function(collection, response, options) {
                            console.log('Search products fetch failed:');
                            console.log({response: response.responseText});
                        },
                    });
                }
            }
        },

        searchByClick: function() {
            var searchText = jQuery("[do-action=search]").val();
            jQuery("[do-action=search]").val('');
            if (0 < searchText.length) {
                xcartApp.isFromUrl = false;
                xcartApp.mainRouter.navigate("search/" + searchText, {trigger: true});
            }
        },

        searchByEnter: function(e) {
            if (e.keyCode == 13) {
                this.searchByClick();
            }
        },
    });

    var initialize = function() {
        return new Search;
    };

    return {
        initialize: initialize
    };
});
