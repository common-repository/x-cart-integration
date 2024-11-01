/* vim: set ts=4 sw=4 sts=4 et: */

/**
 * Image gallery view
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

    var ImageGallery = Backbone.View.extend({
        tagName: 'div',

        className: 'xcart-popup-image-gallery',

        template: _.template(xcartApp.templates[xcartApp.options.template].product_browser.image_gallery),

        events: {
            'click [do-action=change-image]': 'changeImage',
            'click [do-action=next-image]': 'nextImage',
            'click [do-action=close-gallery]': 'closeGallery',
        },

        initialize: function(images, currentImageSrc) {
            if (xcartApp.gridControllers.length > 0) {
                xcartApp.gridControllers[0].hideModal();
            }
            this.images = images;
            this.currentImageSrc = currentImageSrc;
            this.render();
        },

        setActiveImage: function() {
            var galleryImages = this.$el.find('[do-action=change-image]');
            for(var i = 0; i < galleryImages.length; i++) {
                jQuery(galleryImages[i]).parent('li').removeClass('active');
                if (jQuery(galleryImages[i]).attr('src') == this.currentImageSrc) {
                    jQuery(galleryImages[i]).parent('li').addClass('active');
                }
            }
        },

        nextImage: function() {
            var imageIndex = 0;
            if (0 == this.images.length) {
                return;
            }
            while (this.images[imageIndex].src != this.currentImageSrc && imageIndex < this.images.length) {
                imageIndex++;
            }
            imageIndex++;
            if (undefined != this.images[imageIndex]) {
                this.currentImageSrc = this.images[imageIndex].src;
            } else {
                this.currentImageSrc = this.images[0].src;
            }
            this.$el.find('img.main-image').attr('src', this.currentImageSrc);
            this.setActiveImage();
        },

        changeImage: function(e) {
            this.currentImageSrc = jQuery(e.target).attr('src');
            this.$el.find('img.main-image').attr('src', this.currentImageSrc);
            this.setActiveImage();
        },

        closeGallery: function() {
            var self = this;
            this.$el.fadeOut(400, function() {
                self.remove();
                xcartApp.gridControllers[0].showModal();
            });
        },

        render: function() {
            var imgObj = {
                images: this.images,
                currentImageSrc: this.currentImageSrc
            };
            this.$el.html(this.template(imgObj));
            jQuery('body').append(this.$el);
        }
    });

    return ImageGallery;
});
