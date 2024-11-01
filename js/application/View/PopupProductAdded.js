/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Popup with product added notification
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
    _ = xcartApp.setUnderscoreTag(_);

    var PopupProductAdded = Backbone.View.extend({
        tagName: 'div',

        className: 'xcart-popup-product-added',

        template: _.template(xcartApp.templates[xcartApp.options.template].popup_product_added),

        isRendered: false,

        events: {
            'click': 'hide',
        },

        initialize: function() {
        },

        hide: function() {
            if (undefined != this.timer) {
              clearTimeout(this.timer);
            }
            this.$el.hide();
        },

        render: function() {
            if (!this.isRendered) {
              this.$el.html(this.template());
              jQuery('body').append(this.$el);
              this.isRendered = true;
            }
            if (undefined != this.timer) {
              clearTimeout(this.timer);
              this.$el.show();
            }
            var self = this;
            this.timer = setTimeout(function() {
                self.$el.fadeOut(400, function() {
                    self.remove();
                });
            }, 2500);
        }
    });

    return PopupProductAdded;
});
