_.templateSettings = {
    evaluate    : /<jstpl([\s\S]+?)jstpl>/g,
    interpolate : /<jstpl=([\s\S]+?)jstpl>/g,
    escape      : /<jstpl-([\s\S]+?)jstpl>/g
};
//CATEGORIES
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};

    xcartApp.Loading = Backbone.Model.extend({
    });

    xcartApp.LoadingView = Backbone.View.extend({
        tagName: 'div',

        initialize: function() {
        },

        template: _.template(jQuery('#xcart-loading-template').html()),

        render: function() {
            this.$el.html(this.template());
            this.$el.addClass(jQuery('#xcart-loading-template').attr('class-to-element'));

            return this;
        },
    });
});
