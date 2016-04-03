var Factorio = Factorio || {};
Factorio.helper = {
    init : function(id, json, func) {
        $.getJSON(json, {}, function(data) {
            if (data.title) {
                $("#label_jsondata").text(data.title);
            }
            if (data.label.product_name) {
                $(id).find('.label_product_name').text(data.label.product_name);
            }
            if (data.label.require_product_speed) {
                $(id).find('.label_product_speed').text(data.label.require_product_speed);
            }
            if (data.label.production_facility) {
                $(id).find('.label_product_facility').text(data.label.production_facility);
            }
            Factorio.recipes = data.recipes;
            Factorio.helper.varidate();
            func();
        });
        Factorio.tree.init(id);
    },
    varidate : function() {
        $.each(Factorio.recipes, function(key, val) {
            if (val.name === undefined) {
                console.log('undefined name', key);
            }
            if (val.icon === undefined) {
                console.log('undefined icon', key);
            }
            if (val.production_efficiency !== undefined) {//for factory
                if ($.type(val.production_efficiency) !== 'number') {
                    console.log('illigal production_efficiency', val.name);
                }
            }
            if (val.factory !== undefined) {//for craft
                if ($.type(val.time) !== 'number') {
                    console.log('illigal time', val.name);
                }
                if (!$.isNumeric(val.quantity)) {
                    console.log('illigal quantity', val.name);
                }
                if ($.type(val.factory) !== 'array') {
                    console.log('illigal factory', val.name);
                }
                if (!$.isArray(val.ingredients)) {
                    console.log('illigal ingredients', val.name);
                }
                $.each(val.factory, function() {
                    if (Factorio.recipes[this] === undefined) {
                        console.log('undefined factory', this, 'in', val.name);
                    }
                });
                $.each(val.ingredients, function() {
                    if (Factorio.recipes[this[0]] === undefined) {
                        console.log('undefined ingredient', this[0], 'in', val.name);
                    }
                    if (!$.isNumeric(this[1])) {
                        console.log('illigal ingredient count', this[1], 'in', val.name);
                    }
                });
            }
        });
    },
    options : function() {
        var hash = Factorio.recipes;
        var str = '<option value="" icon="icons/question.png">Select target item...</option>';
        jQuery.each(Factorio.recipes, function(key, val) {
            if (val.factory != undefined) {
                str = str + '<option value="' + key + '" icon="' + val.icon + '">' + val.query + '</option>';
            }
        });
        return str;
    },
};
