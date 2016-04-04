(function($) {
	$.extend({
		getParameter: function getParameter() {
			var arg  = {};
			var pair = location.search.substring(1).split('&');
			for(i=0; pair[i]; i++) {
				var kv = pair[i].split('=');
				var val=kv[1].split(',');
				if(val.length==1){val=kv[1];}
				arg[kv[0]] = val;
			}
			return arg;
		}
	});
})(jQuery);
