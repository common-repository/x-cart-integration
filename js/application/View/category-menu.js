/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Category menu view
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

    var CategoryMenu = Backbone.View.extend({
        categoryMenuViews: [],
        loadViews: [],

        initialize: function () {
            console.log('CategoryMenu initialization');
            this.renderMenuLoaders();
        },

        render: function() {
            if (undefined != xcartApp.CategoriesCache.models) {
                this.categories = new CategoryModule.CategoryList();
                this.categories.add(xcartApp.CategoriesCache.models);
                this.processCollection();
            } else {
                var self = this;
                xcartApp.Categories.fetch({
                        success: function() {
                            console.log('Categories have been fetched');
                            self.processCollection(xcartApp.Categories.attributes);
                            xcartApp.CategoriesCache.add(xcartApp.Categories.models);
                        },
                        error: function(collection, response, options) {
                            console.log('Category fetch failed:');
                            console.log({response: response.responseText});
                        }
                });
            }
        },

        processCollection: function () {
            this.categories.sort();
            console.log("Sorting");
            this.categories = this.sortByPos();
            this.renderMenus(this.categories);
            if (undefined != xcartApp.defaultRenderData.categoryId) {
                xcartApp.categoryMenuWidget.resetActiveCategories(xcartApp.defaultRenderData.categoryId);
            }
        },

        sortByPos: function(nearCategory) {
            var binaryTree = [];
            if (undefined == this.idInTree) {
                this.idInTree = [];
            }
            var prevDepth = -1;
            var isLevelComplited = false;
            _.each(this.categories.models, function (category) {
                if (this.idInTree.indexOf(category.get('categoryId')) == -1 && !isLevelComplited) {
                    if (undefined == nearCategory) {
                        if (prevDepth == category.get('depth')) {
                            binaryTree.push(category);
                        }
                        if (prevDepth < category.get('depth')) {
                            binaryTree[binaryTree.length-1].children = this.sortByPos(category);
                        }
                    } else {
                        if (category == nearCategory) prevDepth = category.get('depth');
                        if (prevDepth != -1) {
                            if (prevDepth == category.get('depth')) {
                                binaryTree.push(category);
                                this.idInTree.push(category.get('categoryId'));
                            }
                            if (prevDepth < category.get('depth')) {
                                binaryTree[binaryTree.length-1].children = this.sortByPos(category);
                            }
                            if (prevDepth > category.get('depth')) {
                                isLevelComplited = true;
                            }
                        }
                    }
                }
            }, this);

            binaryTree = _.sortBy(binaryTree, function (category) {
                return category.get('categoryId');
            });

            binaryTree = _.sortBy(binaryTree, function (category) {
                return category.get('pos');
            });

            return binaryTree;
        },

        resetActiveCategories: function(categoryId) {
            for (var i = 0; i < this.categoryMenuViews.length; i++) {
                this.categoryMenuViews[i].resetActiveCategories(categoryId);
            }
        },

        renderMenus: function(categories) {
            var elems = jQuery('body').find('.xcart-category-menu');
            for (var i = 0; i < this.loadViews.length; i++) {
                this.loadViews[i].remove();
            }
            for (var i = 0; i < elems.length; i++) {
                this.categoryMenuViews[this.categoryMenuViews.length] = new CategoryMenuView(elems[i], categories);
            }
        },

        renderMenuLoaders: function() {
            var elems = jQuery('body').find('.xcart-category-menu');
            for (var i = 0; i < elems.length; i++) {
                this.loadViews[this.loadViews.length] = new LoadingView();
                jQuery(elems[i]).find('ul').before(this.loadViews[this.loadViews.length-1].render().el);
            }
        },
    });

    var CategoryMenuView = Backbone.View.extend({
        el: jQuery('#xcart-category-menu'),

        views: [],

        events: {
        },

        initialize: function(elem, categories) {
            if (undefined != elem) {
                this.$el = jQuery(elem);
                if (this.$el.find('ul').length == 0) {
                    this.$el.append("<ul></ul>");
                }
            }
            if (undefined != categories) {
                this.renderCategories(categories);
            }
        },

        resetActiveCategories: function(categoryId) {
            var currentCategory = xcartApp.CategoriesCache.get(categoryId);
            if (undefined != currentCategory) {
                var rpos = currentCategory.get('rpos');
                var lpos = currentCategory.get('lpos');
            }
            _.each(this.views, function (view) {
                view.$el.removeClass('active');
                if (view.model.get('categoryId') == categoryId) {
                    view.$el.addClass('active');
                }
                if (view.model.get('rpos') > rpos && view.model.get('lpos') < lpos) {
                    //Parent cateogries
                    view.$el.addClass('active');
                }
            });
        },

        renderCategories: function (categories, elem) {
            if (undefined == this.parentElem) this.parentElem = [];
            this.parentElem.push(elem);
            _.each(categories, function (category) {
                if (category.get('enabled')) {
                    if (category.get('depth') != -1) {
                        var parentView = this.renderCategory(category, this.parentElem[this.parentElem.length - 1]);
                    }
                    if (category.children != undefined) {
                        if (category.get('depth') != -1) {
                            parentView.append(document.createElement('ul'));
                        }
                        this.renderCategories(category.children, parentView);
                    }
                }
            }, this);
            this.parentElem.pop();
        },

        renderCategory: function(category, element) {
            this.views[this.views.length] = new CategoryView({model: category});
            if (undefined != element) {
                element.find('ul').first().append(this.views[this.views.length - 1].render().el);
            } else {
                this.$el.find('ul:first-child').append(this.views[this.views.length - 1].render().el);
            }

            return this.views[this.views.length - 1].$el;
        }
    });

    var CategoryView = Backbone.View.extend({
        tagName: 'li',

        template: _.template(xcartApp.templates[xcartApp.options.template].category_menu.category),
        className: 'xcart_category',

        events: {
            'click [do-action=select-category]': 'selectCategory',
        },

        initialize: function() {
        },

        selectCategory: function() {
            xcartApp.selectCategory(this.model.get('categoryId'));

            return false;
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-category-template').attr('class-to-element'));

            return this;
        }
    });

    var initialize = function () {
        xcartApp.Categories = new CategoryModule.CategoryList();

        return new CategoryMenu();
    };

    var fetchCategories = function (callback) {
        xcartApp.CategoriesCache = new CategoryModule.CategoryList();
        xcartApp.CategoriesCache.fetch({
            success: function() {
                xcartApp.CategoriesCache.add(xcartApp.CategoriesCache.attributes);
                console.log('Category: ' + xcartApp.CategoriesCache.length + ' categories fetched');
                callback();
            },
            error: function(collection, response, options) {
                console.log('Categories cache fetch failed:');
                console.log({response: response.responseText});
            },
        });
    };

    return {
        initialize: initialize,
        fetchCategories: fetchCategories
    };

});
