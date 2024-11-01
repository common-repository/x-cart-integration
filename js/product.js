//PRODUCT
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};

    xcartApp.Product = Backbone.Model.extend({
        idAttribute: "productId",

        initialize: function() {
            this.set(this.attributes);

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
                if (xcartApp.options['image_box_size'] != 160) {
                    _.each(this.get('image'), function (image) {
                        var proportion = image.height/image.width;
                        if (image.height > image.width) {
                            image.height = xcartApp.options['image_box_size'];
                            image.width = image.height / proportion;
                        } else {
                            image.width = xcartApp.options['image_box_size'];
                            image.height = proportion * image.width;
                        }
                    });
                }
            }
        },
    });

    xcartApp.ProductList = Backbone.Collection.extend({
        url: xcartApp.options['requestUrl'] + '?target=integration_api&action=get_products_in_category',
        model: xcartApp.Product,
        comparator: function(product) 
        {
            if (undefined == this.sortFlag) {
                console.log('Sorting by default');
            } else {
                console.log('Sorting by ' + this.sortFlag );
            }
            return product.get(this.sortFlag);
        },
    });
});
