//CATEGORIES
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};
    xcartApp.SearchProductsCache = xcartApp.SearchProductsCache || [];

    var Search = Backbone.View.extend({
        el: jQuery('#xcart-search-widget'),

        template: _.template(jQuery('#xcart-search-widget-template').html()),
        
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
                this.searchProducts = new xcartApp.ProductList();
                this.searchProducts.url = xcartApp.options['requestUrl'] + '?target=integration_api&action=search';
                var self = this;
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

    xcartApp.searchWidget = new Search();
});
