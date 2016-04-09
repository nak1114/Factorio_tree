var Factorio = Factorio || {};
Factorio.helper = {

    _table_str : ( function() {
            return (function () {/*
            <table>
            <thead>
            <tr>
            <th width="1%" class='Label_product_name'>Product Name</th>
            <th width="1%" class='Label_require_product_speed'>Require product speed[units/sec]</th>
            <th width="1%" class='Label_production_facility'>Production facility</th>
            <th width="1%" class='Label_product_ejector'>Ejector</th>
            <th            class='Label_else'></th>
            <!--
            <th>要求挿入速度</th>
            <th>挿入能力</th>
            <th>挿入器</th>
            -->
            </tr>
            </thead>
            <tbody>
            <tr class='Label_merge_bar merged'>
            <td colspan='5'>Merged Item(s)</td>
            </tr>
            </tbody>
            </table>
            */}).toString().split('*')[1];
            //.replace(/(\n)/g, '')
        }()),
    varidateConfig : function(c) {
        var h = Factorio.helper;
        Factorio.config = Factorio.config || {};

        Factorio.config.recipes = c.recipes;
        if ($.type(Factorio.config.recipes) !== 'string') {
            Factorio.config.recipes = '';
        }

        Factorio.config.item = c.item;
        if ($.type(Factorio.config.item) !== 'string') {
            Factorio.config.item = '';
        }

        Factorio.config.val = Number(c.val);
        if (isNaN(Factorio.config.val)) {
            Factorio.config.val = 1;
        }

        Factorio.config.filter = c.filter;
        if ($.type(Factorio.config.filter) !== 'array') {
            Factorio.config.filter = [Factorio.config.filter];
        }

        Factorio.config.facilities = c.facilities;
        if ($.type(Factorio.config.facilities) !== 'array') {
            Factorio.config.facilities = [Number(Factorio.config.facilities)];
        }

        return Factorio.config;
    },
    updateConfig : function() {
        var h = Factorio.helper;
        var root = Factorio.root;

        var item = root.find(".query-item :selected").attr('value');
        if ($.type(item) !== 'string') {
            item = '';
        }
        Factorio.config.item = item;

        var val = Number(root.find(".query-count").spinner('value'));
        if ($.type(val) !== 'number') {
            val = 1;
        }
        Factorio.config.val = val;

        var unit = Number(root.find(".query-unit :selected").attr('value'));
        if ($.type(unit) !== 'number') {
            unit = 1;
        }
        Factorio.config.unit = unit;

        var filter = [];
        root.find(".option-filter :selected").each(function() {
            filter.push(this.value);
        });
        Factorio.config.filter = filter;

        var facilities = [];
        $.each(Factorio.facilities, function(key, val) {
            if (val.sel) {
                facilities.push(val.getID());
            }
        });
        $.each(Factorio.ejectors, function(key, val) {
            if (val.sel) {
                facilities.push(val.getID());
            }
        });
        Factorio.config.facilities = facilities;

        return Factorio.config;
    },

    makeDivTitle : function(root, title) {
        var h = Factorio.helper;
        var div = $("<div>").appendTo(root).addClass("title");
        var str = title || 'JSON file is illigal.';
        $("<label>").appendTo(div).text(str);
    },
    makeDivQuery : function(root) {
        var h = Factorio.helper;
        var c = Factorio.config;
        var div = $("<div>").appendTo(root).addClass("query ui-widget ui-widget-header ui-corner-all");
        $("<label>").appendTo(div).addClass("Label_target_item").text("target item:");
        $("<select>").appendTo(div).addClass("query-item").select2({
            templateResult : h.formatState,
            templateSelection : h.formatState,
            placeholder : 'Select a item',
            data : h.options2([c.item]),
        });
        $("<input>").appendTo(div).addClass("query-count").val(c.val).attr('size', '1').spinner({
            min : 0,
            icons : {
                up : "ui-icon-plus",
                down : "ui-icon-minus"
            },
        });
        $("<select>").appendTo(div).addClass("query-unit").html('<select><option value="1">[unit/sec]</option><option value="2">[facility]</option></select>').selectspinner();
        $("<button>").appendTo(div).addClass("query-add Tip_add").text('add').button().click(function() {
            var cfg = h.updateConfig();
            var req_spd = h.getReqSpeed();
            Factorio.main.root(req_spd, cfg.item);
        });
        $("<button>").appendTo(div).addClass("query-clear Tip_clear").text('clear').button().click(function() {
            Factorio.main.clear();
        });
    },
    makeDivOption : function(root) {
        var h = Factorio.helper;
        var c = Factorio.config;
        var div = $("<div>").appendTo(root).addClass("option ui-widget　ui-widget-header ui-corner-all");

        $("<label>").appendTo(div).addClass("Label_facirities").text("facirities: ");
        $.each(Factorio.facilities, function(key, val) {
            var v = this;
            if (v.sel) {
                v.sel.appendTo(div).select2(v.opt);
            }
        });

        $("<label>").appendTo(div).addClass("Label_ejectors").text("ejectors: ");
        $.each(Factorio.ejectors, function(key, val) {
            var v = this;
            if (v.sel) {
                v.sel.appendTo(div).select2(v.opt);
            }
        });

        $("<label>").appendTo(div).addClass("Label_merge_items").text("merge item(s): ");
        $("<select multiple='multiple'>").appendTo(div).addClass("option-filter").select2({
            width : '320px',
            templateResult : h.formatState,
            templateSelection : h.formatState_icononly,
            placeholder : 'Select some item(s)',
            data : h.options2(c.filter),
        });
        $("<button>").appendTo(div).addClass('option-save  Tip_save').text("save").button().click(function() {
            h.updateConfig();
            Cookies.set('factorio', Factorio.config, {
                expires : 100
            });
            return;
        });
        $("<button>").appendTo(div).addClass('option-erase Tip_erase').text("erase").button().click(function() {
            Cookies.remove('factorio');
            return;
        });
    },
    makeDivTable : function(root) {
        var h = Factorio.helper;
        var div = $("<div>").appendTo(root).addClass("table");
        $(h._table_str).addClass("table-main").appendTo(div);
        Factorio.main = new Factorio.tree(root.find('.table-main'), 'table-main-');
    },

    patchLabel : function(root, label) {
        if (!label) {
            return;
        }
        $.each(label, function(k, v) {
            root.find('.Label_' + k).text(v);
        });
    },
    patchTip : function(root, label) {
        if (!label) {
            return;
        }
        $.each(label, function(k, v) {
            root.find('.Tip_' + k).attr('title', v).tooltip();
        });
    },
    init : function(root, para, func) {
        Factorio.root = root;
        root.text("Loading...");

        Factorio.helper.varidateConfig(para);
        $.getJSON(Factorio.config.recipes, {}).done(function(data) {
            //Factorio.title = data.title;
            //Factorio.label = data.label;
            Factorio.facilities = data.facilities;
            Factorio.ejectors = data.ejectors;
            Factorio.recipes = data.recipes;
            Factorio.helper.varidate();

            var cfg = Factorio.config.facilities;
            Factorio.helper.addFunc('facilities', cfg);
            Factorio.helper.addFunc('ejectors', cfg);

            root.text("").addClass("Factorio_tree");
            Factorio.helper.makeDivTitle(root, data.title);
            Factorio.helper.makeDivQuery(root);
            Factorio.helper.makeDivOption(root);
            Factorio.helper.makeDivTable(root);
            Factorio.helper.patchLabel(root, data.label);
            Factorio.helper.patchTip(root, data.tooltip);
            func();
        }).fail(function(jqXHR, textStatus, errorThrown) {
            root.text("Can't read JSON file.Click on the ’English’　anchor at the bottom of this page .");
            console.error("error：" + textStatus);
            console.error(jqXHR);
            console.error(errorThrown);
        }).always(function() {
            //console.log("OK!");
        });
    },
    varidate : function() {
        function listlist(id, paraname) {
            $.each(Object.keys(Factorio[id]), function() {
                var key = this;
                var val = Factorio[id][key];
                var flg = true;

                if (val.list === undefined) {
                    console.log(id, ':', 'undefined list.in ' + key);
                    val.list = [[key]];
                } else if (!$.isArray(val.list)) {
                    console.log(id, ':', 'list is not Array<Array>.in ' + key);
                    val.list = [[val.list]];
                } else if (val.list.length == 0) {
                    console.log(id, ':', 'list is empty.in ' + key);
                    val.list = [[key]];
                } else {
                    $.each(val.list, function(i) {
                        if (!$.isArray(this)) {
                            console.log(id, ':', "list's Array is empty.in " + key);
                            val.list[i] = [this];
                        }
                    });
                }
                var len = val.list[0].length;
                $.each(val.list, function() {
                    var items = $.map(this, function(v, i) {
                        var item = Factorio.recipes[v];
                        if (item) {
                            if (!$.isNumeric(item[paraname])) {
                                console.log(id, ':', "item '", v, "' isn't provide '" + paraname + "'.in " + key);
                                item[paraname] = 1.0;
                            }
                            return item;
                        }
                        console.log(id, ':', "item '", v, "' is not found.in " + key);
                        return null;
                    });
                    if (items.length != len) {
                        console.log(id, ':', "illigal list.in " + key);
                        flg = false;
                    }
                });
                if (!flg) {
                    console.error(id, ':', "deleted." + key);
                    delete Factorio[this];
                }
            });
        }

        listlist('facilities', 'production_efficiency');
        listlist('ejectors', 'insert_capacity');

        $.each(Factorio.recipes, function(key, val) {
            if (val.name === undefined) {
                console.log('undefined name', key);
                val.name = key;
            }
            if (val.icon === undefined) {
                console.log('undefined icon', key);
                val.icon = 'icons/question.png';
            }
            if (val.factory !== undefined) {//for craft
                if ($.type(val.factory) !== 'array') {
                    console.log('illigal factory', val.name);
                    val.factory = [Object.keys(Factorio.facilities)[0], 0];
                }
                if (Factorio.facilities[val.factory[0]] === undefined) {
                    console.log('undeined facility item', val.factory, 'in', val.name);
                    val.factory = [Object.keys(Factorio.facilities)[0], 0];
                }
                if (isNaN(val.factory[1])) {
                    console.log('undeined facility num', val.factory, 'in', val.name);
                    val.factory[1] = 0;
                }
                val.factory[1] = Number(val.factory[1]);
                if (Factorio.facilities[val.factory[0]].list.length <= val.factory[1]) {
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
                        if (Factorio.recipes[elem[0]].factory === undefined) {
                            console.log('illigal ingredient item', this[0], 'in', val.name);
                            ret = false;
                        }
                        return ret;
                    });
                    val.ingredients = filtered;
                }
            }
        });
    },
    getReqSpeed : function() {
        var c = Factorio.config;
        if(c.unit==1){
            return c.val;
        }
        var tgt = Factorio.recipes[c.item];
        var faci_id = Factorio.facilities[tgt.factory[0]].getID();
        var fac = tgt.factory;
        var faci = Factorio.facilities[fac[0]].getItem(fac[1], faci_id);
        var speed = tgt.quantity / tgt.time * faci.production_efficiency;
        return c.val * speed;
    },
    addFunc : function(id, cfg) {
        var h = Factorio.helper;
        $.each(Factorio[id], function(key, val) {
            var ary = [];
            var v = this;

            v.getItem = function(num, id) {
                return Factorio.recipes[this.list[num][id]];
            };
            if (val.list[0].length < 2) {
                v.getID = function() {
                    return 0;
                };
            } else {
                var def = Number(cfg.shift());
                def = (def && (0 <= def) && (def < val.list[0].length)) ? def : 0;
                $.each(val.list[0], function(i) {
                    var opt = {};
                    opt.id = i;
                    opt.text = '';
                    opt.item = Factorio.recipes[this];
                    if (i == def) {
                        opt.selected = true;
                    }
                    ary.push(opt);
                });
                v.sel = $('<select>').addClass("option-" + id + "-" + key).on("change", function(e) {
                    Factorio.main.recalc(2);
                });
                v.opt = {
                    templateResult : h.formatState_icononly,
                    templateSelection : h.formatState,
                    width : '60px',
                    placeholder : 'Select a item',
                    minimumResultsForSearch : Infinity,
                    data : ary,
                };
                v.getID = function() {
                    return Number(v.sel.find(":selected").attr('value'));
                };
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
    options2 : function(sel_list) {
        var h = Factorio.recipes;
        var data = [];
        jQuery.each(h, function(key, val) {
            var item = {};
            if (val.factory != undefined) {
                item.id = key;
                item.text = (val.query) ? val.query : val.name;
                item.item = val;
                if ($.inArray(key, sel_list) >= 0) {
                    item.selected = true;
                }
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
