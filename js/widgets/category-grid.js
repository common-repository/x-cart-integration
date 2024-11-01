//CATEGORYGRID
jQuery(document).ready(function() {
    xcartApp = window.xcartApp || {};

    xcartApp.CategoryCellView = Backbone.View.extend({
        template: _.template(jQuery('#xcart-category-grid-template').html()),

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
            this.$el.html(this.template(this.model.toJSON()));
            this.$el.addClass(jQuery('#xcart-category-grid-template').attr('class-to-element'));

            return this.$el;
        }
    });

    xcartApp.CategoryGrid = Backbone.View.extend({
        tagName: "div",

        gridCategories: null,
        gridNumber: 0,
        className: "xcart-categories-grid",

        initialize: function () {
            this.gridCategories = new xcartApp.CategoryList();
        },

        renderCategories: function() {
            this.gridCategories.models = _.sortBy(this.gridCategories.models, function (model) {
                return model.get('lpos');
            });

            this.$el.append(xcartApp.renderBreadCrumbs(this.model.get('categoryId'), this.gridNumber, true));

            var self = this;
            this.gridCategories.models = _.sortBy(this.gridCategories.models, function (model) {
                return model.get('categoryId');
            });

            this.gridCategories.models = _.sortBy(this.gridCategories.models, function (model) {
                return model.get('pos');
            });
            _.each(this.gridCategories.models, function(category) {
                if (self.model.get('depth') < 0) {
                    if (category.get('depth') == 0) {
                        if (true === category.get('enabled')) {
                            self.renderCategory(category);
                        }
                    }
                } else {
                    if (category.get('lpos') > self.model.get('lpos') && category.get('rpos') < self.model.get('rpos') && category.get('depth') == (self.model.get('depth') + 1 )) {
                        if (true === category.get('enabled')) {
                            self.renderCategory(category);
                        }
                    }
                }
            });
        },

        renderCategory: function(category) {
            var categoryCellView = new xcartApp.CategoryCellView({model: category});
            categoryCellView.gridNumber = this.gridNumber;
            this.$el.append(categoryCellView.render());
        },

        render: function(callback) {
            var self = this;
            if (this.gridCategories.length < 1) {
                if (undefined != xcartApp.CategoriesCache.models && xcartApp.CategoriesCache.models.length > 0) {
                    this.gridCategories.add(xcartApp.CategoriesCache.models);
                    self.renderCategories();
                    callback();
                } else {
                    this.gridCategories.fetch({
                        success: function() {
                            self.gridCategories.add(self.gridCategories.attributes);
                            xcartApp.CategoriesCache = new xcartApp.CategoryList();
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

        productSelected: function(product) {
            xcartApp.isFromUrl = false;
            xcartApp.mainRouter.navigate("category/" + this.categoryId + "/product/" + product.get('productId') + "/grid/" + this.gridNumber, {trigger: true});
        }
    });
});
