/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Category grid view
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
    'LoadingView',
    'application/Model/Category',
], function(jQuery, _, Backbone, XCartApp, LoadingView, CategoryModule) {
    var xcartApp = XCartApp.getApp();
    _ = xcartApp.setUnderscoreTag(_);

    var CategoryCellView = Backbone.View.extend({
        template: _.template(xcartApp.templates[xcartApp.options.template].product_grid.category_grid),

        gridNumber: 0,

        className: "item",

        events: {
            'click [do-action=select-category]': 'selectCategory',
        },

        selectCategory: function() {
            xcartApp.selectCategory(this.model.get('categoryId'), this.gridNumber);

            return false;
        },

        render: function() {
            this.$el.html(this.template({
                model: this.model.toJSON(), 
                options: xcartApp.options
            }));
            this.$el.addClass(jQuery('#xcart-category-grid-template').attr('class-to-element'));

            return this.$el;
        }
    });

    var CategoryGrid = Backbone.View.extend({
        tagName: "div",

        gridCategories: null,
        gridNumber: 0,
        className: "xcart-categories-grid",

        initialize: function () {
            this.gridCategories = new CategoryModule.CategoryList();
        },

        renderCategories: function() {
            this.gridCategories.models = _.sortBy(this.gridCategories.models, function (model) {
                return model.get('lpos');
            });

            this.$el.append(xcartApp.renderBreadCrumbs({
                categoryId: this.model.get('categoryId'),
                gridNumber: this.gridNumber,
                isIncludeCategory: true,
            }));

            this.gridCategories.models = _.sortBy(this.gridCategories.models, function (model) {
                return model.get('categoryId');
            });

            this.gridCategories.models = _.sortBy(this.gridCategories.models, function (model) {
                return model.get('pos');
            });
            _.each(this.gridCategories.models, function(category) {
                if (this.model.get('depth') < 0) {
                    if (category.get('depth') == 0) {
                        if (true === category.get('enabled')) {
                            this.renderCategory(category);
                        }
                    }
                } else {
                    if (category.get('lpos') > this.model.get('lpos') && category.get('rpos') < this.model.get('rpos') && category.get('depth') == (this.model.get('depth') + 1 )) {
                        if (true === category.get('enabled')) {
                            this.renderCategory(category);
                        }
                    }
                }
            }, this);
        },

        renderCategory: function(category) {
            var categoryCellView = new CategoryCellView({model: category});
            categoryCellView.gridNumber = this.gridNumber;
            this.$el.append(categoryCellView.render());
        },

        render: function(callback) {
            if (this.gridCategories.length < 1) {
                if (undefined != xcartApp.CategoriesCache.models && xcartApp.CategoriesCache.models.length > 0) {
                    this.gridCategories.add(xcartApp.CategoriesCache.models);
                    this.renderCategories();
                    callback();
                } else {
                    var self = this;
                    this.gridCategories.fetch({
                        success: function() {
                            self.gridCategories.add(self.gridCategories.attributes);
                            xcartApp.CategoriesCache = new CategoryModule.CategoryList();
                            xcartApp.CategoriesCache.add(self.gridCategories.models);
                            self.renderCategories();
                            callback();
                        }
                    });
                }
            } else {
                this.renderCategories();
                callback();
            }

            return this;
        },
    });

    return CategoryGrid;
});
