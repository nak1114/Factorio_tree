var Factorio = Factorio || {};
Factorio.helper = {
    _table_str : ( function() {
            return (function () {/*
            <table class='table-main'>
            <thead>
            <tr>
            <th width="1%" class='Label_product_name'>Product Name</th>
            <th width="1%" class='Label_require_product_speed'>Require product speed[units/sec]</th>
            <th            class='Label_production_facility'>Production facility</th>
            <!--
            <th>生産能力</th>
            <th>排出能力</th>
            <th>排出器</th>
            <th>要求挿入速度</th>
            <th>挿入能力</th>
            <th>挿入器</th>
            -->
            </tr>
            </thead>
            <tbody></tbody>
            </table>
            */}).toString().replace(/(\n)/g, '').split('*')[1];
        }()),

    makeDivTitle : function(root, title) {
        var h = Factorio.helper;
        var div = $("<div>").appendTo(root).addClass("title");
        var str = 'JSON file is illigal.';
        if (title) {
            str = title;
        }
        $("<label>").appendTo(div).text(str);
    },
    makeDivQuery : function(root) {
        var h = Factorio.helper;
        var div = $("<div>").appendTo(root).addClass("query ui-widget");
        $("<label>").appendTo(div).addClass("Label_query_target").text("target item:");
        $("<select>").appendTo(div).addClass("query-item").select2({
            templateResult : h.formatState,
            templateSelection : h.formatState,
            placeholder : 'Select a item',
            data : h.options2(),
        });
        $("<input>").appendTo(div).addClass("query-count").val('1').attr('size', '1').spinner({
            min : 0,
            icons : {
                up : "ui-icon-plus",
                down : "ui-icon-minus"
            },
        });
        $("<label>").appendTo(div).text("[units/sec]  ");
        $("<button>").appendTo(div).addClass("query-add").text('add').button().click(function() {
            var val = root.find(".query-item :selected").attr('value');
            if (val === undefined || val == '') {
                return;
            }
            Factorio.tree.root(root.find(".query-count").spinner('value'), val);
        });
        $("<button>").appendTo(div).addClass("query-clear").text('clear').button().click(function() {
            Factorio.tree.clear();
        });
    },
    makeDivOption : function(root) {
        var h = Factorio.helper;
        var div = $("<div>").appendTo(root).addClass("option ui-widget");
        $("<label>").appendTo(div).text("default facirities: ");
        $.each(Factorio.facilities, function(key, val) {
            var ary = [];
            var h = Factorio.helper;
            $.each(val, function(i) {
                var opt = {};
                opt.id = this;
                opt.text = '';
                opt.item = Factorio.recipes[this];
                if (i == 0) {
                    opt.selected = 'selected';
                }
                ary.push(opt);
            });
            $('<select>').appendTo(div).addClass("option-faciriteis-" + key).select2({
                templateResult : h.formatState_icononly,
                templateSelection : h.formatState,
                width : '60px',
                placeholder : 'Select a item',
                minimumResultsForSearch : Infinity,
                data : ary,
            });
        });
        $("<label>").appendTo(div).text("default marge item(s): ");
        $("<select multiple='multiple'>").appendTo(div).addClass("option-filter").select2({
            templateResult : h.formatState,
            templateSelection : h.formatState_icononly,
            placeholder : 'Select some item(s)',
            data : h.options2(),
        });
        $("<button>").appendTo(div).addClass('option-save').text("save").click(function() {
            console.log(this);
            var val = root.find(".option-filter :selected").map(function() {
                return this.value;
            });
            console.log(val);
        });
    },
    makeDivTable : function(root) {
        var h = Factorio.helper;
        var div = $("<div>").appendTo(root).addClass("table");
        $(h._table_str).appendTo(div);
        Factorio.tree.init(root.find('.table-main'));

    },

    patchLabel : function(root, label) {
        if (!label) {
            return;
        }
        $.each(label, function(k, v) {
            root.find('.Label_' + k).text(v);
        });
    },
    init : function(id, json, func) {
        $.getJSON(json, {}, function(data) {
            Factorio.facilities = data.facilities;
            Factorio.recipes = data.recipes;
            Factorio.helper.varidate();

            var root = $("#test").text("").addClass("Factorio_tree");
            Factorio.helper.makeDivTitle(root, data.title);
            Factorio.helper.makeDivQuery(root);
            Factorio.helper.makeDivOption(root);
            Factorio.helper.makeDivTable(root);
            Factorio.helper.patchLabel(root, data.label);

            func();
        });
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
    options2 : function() {
        var h = Factorio.recipes;
        var data = [];
        jQuery.each(h, function(key, val) {
            var item = {};
            if (val.factory != undefined) {
                item.id = key;
                item.text = (val.query) ? val.query : val.name;
                item.item = val;
                data.push(item);
            }
        });
        return data;
    },
    formatState : function(state) {
        if (!state.item) {
            return state.text;
        }
        var node = $('<span><img src="' + state.item.icon + '" class="select2-img-icon" /> ' + state.text + '</span>');
        return node;
    },
    formatState_icononly : function(state) {
        if (!state.item) {
            return state.text;
        }
        var node = $('<span><img src="' + state.item.icon + '" class="select2-img-icon" /></span>');
        return node;
    },
};
