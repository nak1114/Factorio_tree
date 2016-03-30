var Factorio = Factorio || {};
Factorio.helper = {
	target_options : (function(hash) {
		var str = '<option value="" icon="icons/question.png">Select target item...</option>';
		jQuery.each(hash, function(key, val) {
			str = str + '<option value="' + key + '" icon="icons/' + val.icon + '">' + val.query + '</option>';
		});
		return str;
	})(Factorio.recipes),
	calc_target : function(num,id){
		var str='';
		var tgt=Factorio.recipes[id];
	},
};
