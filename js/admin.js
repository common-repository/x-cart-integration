jQuery(document).ready(function() {

	if (location.href.match(/wp-admin\/widgets.php/)) {
		jQuery('div[id^="widget-"]').filter('div[id*="_xcart"]').each(function(idx, el) {
			if (location.href.match(/wp-admin\/widgets.php\?from-xcart=/) && el.id.match(/__i__/)) {
				if (jQuery('.xcart-widget').length > 0) {
					jQuery(el).insertAfter(jQuery('.xcart-widget:last'));
				} else {
					jQuery(el).prependTo(jQuery('#widget-list'));
				}
				jQuery('.widget-top', el).addClass('xcart-widget-highlighted');
			}

			var classname = el.id.match(/widget.*xcart(.*)-/);
			if (classname) {
				classname = 'xcart-widget-' + classname[1];
				jQuery(el).addClass('xcart-widget')
					.find('.widget-top')
					.addClass(classname);
			}
		});
	}

});
