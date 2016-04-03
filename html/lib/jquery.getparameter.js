(function($) {
	$.extend({
		getParameter: function getParameter() {
			var arg  = {};
			var pair = location.search.substring(1).split('&');
			for(i=0; pair[i]; i++) {
				var kv = pair[i].split('=');
				arg[kv[0]] = kv[1];
			}
			return arg;
		}
	});
})(jQuery);
