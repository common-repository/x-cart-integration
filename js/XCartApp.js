/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Application object
 *
 * @author    Qualiteam software Ltd <info@x-cart.com>
 * @copyright Copyright (c) 2011-2015 Qualiteam software Ltd <info@x-cart.com>. All rights reserved
 * @license   http://www.x-cart.com/license-agreement.html X-Cart 5 License Agreement
 * @link      http://www.x-cart.com/
 */

define([
    'jquery',
], function(jQuery) {
    var App = {};
    App.options = {
        requestUrl: 'http://localhost/next/src/cart.php',
        sourceUrl: 'http://localhost/next/src/cart.php',
        shopUrl: 'http://localhost/next/src/cart.php',
        demoShopUrl: 'http://localhost/wordpress/index.php/store/',
        lang: 'en',
        image_box_size: '170',
        titles: {
            SEARCH_RESULT: 'Search results',
            NO_PRODUCTS: 'zero products found'
        },
    };
    App.defaultRenderData = {};

    App.scrollToElement = function(elem) {
        if (!App.isModalProductGrid) {
            jQuery('html,body').stop().animate({ scrollTop: elem.offset().top-=50 }, 500);
        }
    };

    App.setUnderscoreTag = function(_) {
        _.templateSettings = {
            evaluate    : /<jstpl([\s\S]+?)jstpl>/g,
            interpolate : /<jstpl=([\s\S]+?)jstpl>/g,
            escape      : /<jstpl-([\s\S]+?)jstpl>/g
        };

        return _;
    };

    App.selectCategory = function(categoryId, gridNumber) {
        var curCategory = App.CategoriesCache.get(categoryId);
        if (undefined != App.categoryMenu) {
            App.Categories.trigger('selected', curCategory);
        }

        if (undefined == gridNumber) {
            if (null != curCategory.getCleanURL()) {
                App.mainRouter.navigate("Catalog/" + curCategory.getCleanURL(), {trigger: true});
            } else {
                App.mainRouter.navigate("category/" + categoryId, {trigger: true});
            }
        } else {
            if (null != curCategory.getCleanURL()) {
                App.mainRouter.navigate("Catalog/" + curCategory.getCleanURL() + "/page/" + 1 + "/grid/" + gridNumber, {trigger: true});
            } else {
                App.mainRouter.navigate("category/" + categoryId + "/page/" + 1 + "/grid/" + gridNumber, {trigger: true});
            }
        }
    };
    
    App.renderBreadCrumbs = function (options) {
        var isIncludeCategory = (undefined == options.isIncludeCategory)?false:options.isIncludeCategory;
        console.log('rendering breadcrumbs');

        if (undefined != options.categoryCleanURL) {
            var curCategory = App.CategoriesCache.findByCleanURL(options.categoryCleanURL);
        } else {
            var curCategory = App.CategoriesCache.get(options.categoryId);
        }
        breadcrumbs = '';
        if (undefined != curCategory) {
            var lpos = curCategory.get('lpos');
            var rpos = curCategory.get('rpos');
            var breadCrumbsTemplate = _.template(this.templates[this.options.template].product_grid.category_breadcrumbs);
            categories = [];
            _.each(App.CategoriesCache.models, function (category) {
                if (
                    (category.get('rpos') > rpos && category.get('lpos') < lpos)
                    || (category.get('categoryId') == curCategory.get('categoryId') && isIncludeCategory)
                ) {
                    var tmpCategory = {
                        gridNumber: options.gridNumber,
                        name: category.get('name'),
                    };
                    if (undefined != category.get('cleanURLs') && category.get('cleanURLs').length > 0) {
                        tmpCategory.cleanURL = category.get('cleanURLs')[0];
                    } else {
                        tmpCategory.categoryId = (category.get('depth') < 0)?0:category.get('categoryId');
                    }
                    categories[categories.length] = tmpCategory;
                }
            });
            var breadCrumbsModel = {categories: categories};
            breadCrumbsModel.currentURL = document.location.href.match(/(^[^#]*)/)[0];

            breadcrumbs = breadCrumbsTemplate(breadCrumbsModel);
        }

        return breadcrumbs;
    };

    App.utils = {};
    /*
     * Utils
     * params: {
     *  funcs: [],
     *  callback: function,
     *  funcCounter: optional
     * }
     */
    App.utils.runFuncSynch = function runFuncSynch(params){
        params.funcCounter = (undefined == params.funcCounter)?params.funcs.length:params.funcCounter;
        var func = params.funcs.shift();
        func(function() {
            params.funcCounter--;
            if (params.funcCounter == 0) {
                params.callback();
            } else {
                runFuncSynch(params);
            }
        });
    };

    return {
        getApp: function() {return App; }
    };
});
