//CATEGORIES
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};
    xcartApp.CategoriesCache = xcartApp.CategoriesCache || [];

    xcartApp.Category = Backbone.Model.extend({
        url: xcartApp.options['requestUrl'] + '?target=integration_api&action=get_category_by_id',
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
    });

    xcartApp.CategoryList = Backbone.Collection.extend({
        url: xcartApp.options['requestUrl'] + '?target=integration_api&action=get_categories',
        model: xcartApp.Category,

        comparator: function(category) 
        {
            return category.get('lpos');
        },
    });
});
