//CATEGORIES
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};

    var CategoryMenu = Backbone.View.extend({
        categoryMenuViews: [],
        loadViews: [],

        initialize: function () {
            this.renderMenuLoaders();
            var self = this;
            if (undefined != xcartApp.CategoriesCache.models) {
                this.processCollection(xcartApp.CategoriesCache.models);
            } else {
                    xcartApp.Categories.fetch({
                        success: function() {
                            self.processCollection(xcartApp.Categories.attributes);
                        },
                        error: function(collection, response, options) {
                            console.log('Category fetch failed:');
                            console.log({response: response.responseText});
                        }
                });
            }
        },

        processCollection: function (collection) {
            xcartApp.Categories.add(xcartApp.Categories.attributes);
            xcartApp.Categories.sort();
            console.log("Sorting");
            this.categories = this.sortByPos();
            this.renderMenus(this.categories);
            if (undefined != xcartApp.defaultRenderData.categoryId) {
                xcartApp.categoryMenu.resetActiveCategories(xcartApp.defaultRenderData.categoryId);
            }
            console.log('Category: ' + xcartApp.Categories.length + ' categories fetched');
        },

        sortByPos: function(nearCategory) {
            var binaryTree = [];
            if (undefined == this.idInTree) {
                this.idInTree = [];
            }
            var prevDepth = -1;
            var isLevelComplited = false;
            var self = this;
            _.each(xcartApp.Categories.models, function (category) {
                if (self.idInTree.indexOf(category.get('categoryId')) == -1 && !isLevelComplited) {
                    if (undefined == nearCategory) {
                        if (prevDepth == category.get('depth')) {
                            binaryTree.push(category);
                        }
                        if (prevDepth < category.get('depth')) {
                            binaryTree[binaryTree.length-1].children = self.sortByPos(category);
                        }
                    } else {
                        if (category == nearCategory) prevDepth = category.get('depth');
                        if (prevDepth != -1) {
                            if (prevDepth == category.get('depth')) {
                                binaryTree.push(category);
                                self.idInTree.push(category.get('categoryId'));
                            }
                            if (prevDepth < category.get('depth')) {
                                binaryTree[binaryTree.length-1].children = self.sortByPos(category);
                            }
                            if (prevDepth > category.get('depth')) {
                                isLevelComplited = true;
                            }
                        }
                    }
                }
            });

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
                this.loadViews[this.loadViews.length] = new xcartApp.LoadingView();
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
            }
            if (undefined != categories) {
                this.renderCategories(categories);
            }
        },

        resetActiveCategories: function(categoryId) {
            var currentCategory = xcartApp.Categories.get(categoryId);
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
            var self = this;
            if (undefined == self.parentElem) self.parentElem = [];
            self.parentElem.push(elem);
            _.each(categories, function (category) {
                if (category.get('enabled')) {
                    if (category.get('depth') != -1) {
                        var parentView = self.renderCategory(category, self.parentElem[self.parentElem.length - 1]);
                    }
                    if (category.children != undefined) {
                        if (category.get('depth') != -1) {
                            parentView.append(document.createElement('ul'));
                        }
                        self.renderCategories(category.children, parentView);
                    }
                }
            });
            self.parentElem.pop();
        },

        renderCategory: function(category, element) {
            this.views[this.views.length] = new xcartApp.CategoryView({model: category});
            if (undefined != element) {
                element.find('ul').first().append(this.views[this.views.length - 1].render().el);
            } else {
                this.$el.find('ul:first-child').append(this.views[this.views.length - 1].render().el);
            }

            return this.views[this.views.length - 1].$el;
        }
    });

    xcartApp.CategoryView = Backbone.View.extend({
        tagName: 'li',

        template: _.template(jQuery('#xcart-category-template').html()),

        events: {
            'click [do-action=select-category]': 'selectCategory',
        },

        initialize: function() {
        },

        selectCategory: function() {
            xcartApp.categoryMenu.resetActiveCategories();
            this.$el.addClass('active');
            xcartApp.Categories.trigger('selected', this.model);
            xcartApp.isFromUrl = false;
            xcartApp.mainRouter.navigate("category/" + this.model.get('categoryId'), {trigger: true});

            return false;
        },

        render: function() {
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-category-template').attr('class-to-element'));

            return this;
        }
    });


    xcartApp.Categories = new xcartApp.CategoryList();
    xcartApp.categoryMenu = new CategoryMenu();

});
