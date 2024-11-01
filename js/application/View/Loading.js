/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Loading view
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

    var LoadingView = Backbone.View.extend({
        tagName: 'div',

        initialize: function() {
        },

        template: _.template(xcartApp.templates[xcartApp.options.template].loading),

        render: function() {
            this.$el.html(this.template({
                options: xcartApp.options
            }));
            this.$el.addClass(jQuery('#xcart-loading-template').attr('class-to-element'));

            return this;
        },
    });

    return LoadingView;
});
