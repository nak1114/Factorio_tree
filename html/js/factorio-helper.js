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
    _getFacID_multi : function() {
        var v = this;
        var val = this.sel.find(":selected").attr('value');
        return Number(val);
    },
    _getEffi : function(num) {
        var v = this;
        var sel = v.getID();
        var item = v.list[sel][num];
        var val = Factorio.recipes[item].production_efficiency;
        var val = val ? val : 1.0;
        return val;
    },
    _getItem : function(num) {
        var v = this;
        var sel = v.getID();
        var item = v.list[sel][num];
        return Factorio.recipes[item];
    },
    _getFacID_single : function() {
        return 0;
    },
    makeDivOption : function(root) {
        var h = Factorio.helper;
        var div = $("<div>").appendTo(root).addClass("option ui-widget");
        $("<label>").appendTo(div).text("default facirities: ");

        var cfg = Factorio.config.facilities;
        if (!$.isArray(cfg)) {
            cfg = [];
        }

        $.each(Factorio.facilities, function(key, val) {
            var ary = [];
            var v = this;
            var def = Number(cfg.shift());

            v.getItem = h._getItem;
            v.getEffi = h._getEffi;
            if (val.list.length < 2) {
                v.getID = h._getFacID_single;
            } else {
                def = (def && (0 <= def) && (def < val.list.length)) ? def : 0;
                $.each(val.list, function(i) {
                    var opt = {};
                    opt.id = i;
                    opt.text = '';
                    opt.item = Factorio.recipes[this[0]];
                    if (i == def) {
                        opt.selected = 'selected';
                    }
                    ary.push(opt);
                });
                var sel = $('<select>').appendTo(div).addClass("option-faciriteis-" + key).select2({
                    templateResult : h.formatState_icononly,
                    templateSelection : h.formatState,
                    width : '60px',
                    placeholder : 'Select a item',
                    minimumResultsForSearch : Infinity,
                    data : ary,
                });
                v.sel = sel;
                v.getID = h._getFacID_multi;
            }
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
            var val = root.find(".query-item :selected").attr('value');
            var count = h.getCount(root.find(".query-count").spinner('value'), val);
            return count;
        });
        $("<button>").appendTo(div).addClass('option-save-to-cookie').text("save to cookie").click(function() {
            var ary=[];
            var ary2=[];
            var val = root.find(".option-filter :selected").each(function() {
                ary.push(this.value);
            });
            $.each(Factorio.facilities, function(key, val) {
                ary2.push(val.getID());
            });
            Factorio.config.filter = ary;
            Factorio.config.facilities = ary2;
            Cookies.set('factorio',Factorio.config);

            return;
        });
        $("<button>").appendTo(div).addClass('option-delete-cookie').text("delete cookie").click(function() {
            Cookies.remove('factorio');
            return;
        });
    },
    getCount : function(req_spd, id) {
        var h = Factorio.tree;
        var tgt = Factorio.recipes[id];
        var fac = tgt.factory;
        var effi = Factorio.facilities[fac[0]].getEffi(fac[1]);
        var speed = tgt.quantity / tgt.time * effi;
        //[u/s]
        var count = req_spd / speed;
        console.log("getCount", effi, speed, count);

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
    init : function(root, para, func) {
        Factorio.config = para;
        $.getJSON(para.recipes, {}, function(data) {
            Factorio.facilities = data.facilities;
            Factorio.recipes = data.recipes;
            Factorio.helper.varidate();

            root.text("").addClass("Factorio_tree");
            Factorio.helper.makeDivTitle(root, data.title);
            Factorio.helper.makeDivQuery(root);
            Factorio.helper.makeDivOption(root);
            Factorio.helper.makeDivTable(root);
            Factorio.helper.patchLabel(root, data.label);

            func();
        });
    },
    varidate : function() {
        var keys = Object.keys(Factorio.facilities);

        $.each(keys, function() {
            var key = this;
            var val = Factorio.facilities[key];
            var flg = true;

            if (val.list === undefined) {
                console.log('facilities:', 'undefined list.in ' + key);
                val.list = [[key]];
            } else if (!$.isArray(val.list)) {
                console.log('facilities:', 'list is not Array<Array>.in ' + key);
                val.list = [[val.list]];
            } else if (val.list.length == 0) {
                console.log('facilities:', 'list is empty.in ' + key);
                val.list = [[key]];
            } else {
                $.each(val.list, function(i) {
                    if (!$.isArray(this)) {
                        console.log('facilities:', "list's Array is empty.in " + key);
                        val.list[i] = [this];
                    }
                });
            }
            var len = val.list[0].length;
            val.items = [];
            $.each(val.list, function() {
                var items = $.map(this, function(v, i) {
                    var item = Factorio.recipes[v];
                    if (item) {
                        return item;
                    }
                    console.log('facilities:', "item '", v, "' is not found.in " + key);
                    return null;
                });
                if (items.length != len) {
                    console.log('facilities:', "illigal list.in " + key);
                    flg = false;
                }
                val.items.push(items);
            });
            if (!flg) {
                console.error('facilities:', "delete facility." + key);
                delete Factorio.facilities[this];
            }
        });
        $.each(Factorio.recipes, function(key, val) {
            if (val.name === undefined) {
                console.log('undefined name', key);
                val.name = key;
            }
            if (val.icon === undefined) {
                console.log('undefined icon', key);
                val.icon = 'icons/question.png';
            }
            if (val.production_efficiency !== undefined) {//for factory
                if ($.type(val.production_efficiency) !== 'number') {
                    console.log('illigal production_efficiency', val.name);
                }
            }
            if (val.factory !== undefined) {//for craft
                if ($.type(val.factory) !== 'array') {
                    console.log('illigal factory', val.name);
                    val.factory = [Object.keys(Factorio.facilities)[0], 0];
                }
                if (Factorio.facilities[val.factory[0]] === undefined) {
                    console.log('undeined facility ', val.factory, 'in', val.name);
                    val.factory = [Object.keys(Factorio.facilities)[0], 0];
                }
                if (Factorio.facilities[val.factory[0]].list[0][val.factory[1]] === undefined) {
                    console.log('undeined facility num', val.factory, 'in', val.name);
                    val.factory[1] = 0;
                }
                if (val.query === undefined) {
                    console.log('undefined query', val.name);
                    val.query = val.name;
                }
                if ($.type(val.time) !== 'number') {
                    console.log('illigal time', val.name);
                    val.time = 1.0;
                }
                if (!$.isNumeric(val.quantity)) {
                    console.log('illigal quantity', val.name);
                    val.quantity = 1.0;
                }
                if (!$.isArray(val.ingredients)) {
                    console.log('illigal ingredients ', val.ingredients, ' in ', val.name);
                    val.ingredients = [];
                } else {
                    var filtered = $.grep(val.ingredients, function(elem, index) {
                        var ret = true;
                        if (Factorio.recipes[elem[0]] === undefined) {
                            console.log('undefined ingredient', this[0], 'in', val.name);
                            ret = false;
                        }
                        if (!$.isNumeric(elem[1])) {
                            console.log('illigal ingredient count', this[1], 'in', val.name);
                            ret = false;
                        }
                        return ret;
                    });
                    val.ingredients = filtered;
                }
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
