var Factorio = Factorio || {};

Factorio.tree = function(id, prefix) {
    this.table = id;
    this.subtable = {};
    this.prefix = prefix;
    this.cur = 1;
    this.clear();
};
Factorio.tree.prototype = {
    clear : function() {
        var h = this;
        h.subtable = {};
        h.cur = 1;
        h.table.find("tbody tr:not(.merged)").remove();
        h.table.treetable({
            expandable : true
        });
    },
    prenode : function(req_spd, id, parent_node, depth, ary, root_id) {
        var h = this;
        var tgt = Factorio.recipes[id];

        var node = h.cur;
        h.cur++;

        var cont = {};

        ary.push(cont);
        cont.req_spd = req_spd;
        cont.node = node;
        cont.parent_node = parent_node;
        cont.id = id;
        cont.depth = depth;
        cont.sub = undefined;
        if (parent_node >= 0 && $.inArray(id, Factorio.config.filter) >= 0) {
            cont.sub = "filter-" + id;
            h.preroot(0.0, id, cont.sub, root_id, ary.length - 1);
            return node;
        }
        //h.table.treetable("loadBranch", node, rows);
        $.each(tgt.ingredients, function() {
            h.prenode(req_spd * this[1], this[0], node, depth + 1, ary, root_id);
        });
        return node;
    },
    preroot : function(req_spd, id, type, source_id, source_num) {
        var h = this;
        var tgt = Factorio.recipes[id];
        if (h.subtable[type] === undefined) {
            var hash = {};
            var ary = [];
            h.subtable[type] = hash;
            hash.id = id;
            hash.type = type;
            hash.source = [];
            hash.req_spd = req_spd;
            hash.list = ary;
            hash.status = 'preroot';
            var node = h.prenode(1.0, id, -1, 0, ary, type);
        }
        if (source_num >= 0) {
            h.subtable[type].source.push([source_id, source_num]);
        }
    },
    id : function(type, num) {
        return this.prefix + type + '-' + num;
    },
    name_with_icon : function(tgt) {
        var str = $("<img />").attr('src', tgt.icon).attr('alt', tgt.name).addClass("name-icon").prop('outerHTML');
        return str + tgt.name;
    },
    icon : function(tgt) {
        var str = $("<img />").attr('src', tgt.icon).attr('alt', tgt.name).addClass("name-icon").prop('outerHTML');
        return str;
    },
    a : function(id) {
        return "<a id='" + id + "' name='" + id + "' >";
    },
    getSpeed : function(type, num) {
        var h = this;
        var tgt = h.subtable[type];
        var req_spd = tgt.req_spd;
        $.each(tgt.source, function(val) {
            req_spd += h.getSpeed(this[0], this[1]);
        });
        return req_spd * tgt.list[num].req_spd;
    },
    makeNode : function(type) {
        var h = this;
        var merge = h.table.find('.merged').first();
        $.each(h.subtable, function(key, val) {
            var req_spd = h.getSpeed(key, 0);
            if (val.status == 'preroot') {
                val.status = 'makenode';
                $.each(val.list, function(num) {
                    var i = this;
                    var tnode = null;
                    var tgt = Factorio.recipes[i.id];
                    var ireq_spd = req_spd * i.req_spd;
                    var rows = $("<tr>").attr("data-tt-id", i.node).attr('type', key).attr('num', num);
                    if (i.parent_node >= 0) {
                        rows.attr("data-tt-parent-id", i.parent_node);
                        tnode = h.table.treetable("node", i.parent_node);
                    }
                    $("<td>").appendTo(rows).html(h.a(h.id(key, num)) + h.name_with_icon(tgt) + "</a>");
                    $("<td>").appendTo(rows).text("calc Speed");
                    $("<td>").appendTo(rows).text("calc Facility");
                    $("<td>").appendTo(rows).text("calc Ejector");
                    if (i.sub) {
                        $("<td>").appendTo(rows).html("<a href='#" + h.id(i.sub, 0) + "'>to merge</a>");
                    } else {
                        $("<td>").appendTo(rows).text("");
                    }
                    h.table.treetable("loadBranch", tnode, rows);
                    if (type == key) {
                        rows.insertBefore(merge);
                    }
                });
            }
        });
    },
    root : function(req_spd, id) {
        var h = this;
        var tgt = Factorio.recipes[id];
        if (!tgt) {
            console.error('ID not found', id);
            return;
        }
        if (!h.table) {
            console.error('not init table');
            return;
        }

        var type = 'main-' + h.cur;
        var par2 = h.preroot(req_spd, id, type, 0, -1);
        h.makeNode(type);
        h.recalc(15);
    },
    recalc : function(flg) {
        var h = this;
        var tmp = h.table.find("tbody tr");
        tmp.each(function() {
            var tr = $(this);
            var type = tr.attr('type');
            if (type !== undefined) {
                var num = tr.attr('num');
                var list = h.subtable[type].list[num];

                var id = list.id;
                var faci_id = tr.attr('facility-id');
                var cargo_id = tr.attr('cargo-id');

                var tgt = Factorio.recipes[id];
                faci_id = $.isNumeric(faci_id) ? faci_id : Factorio.facilities[tgt.factory[0]].getID();
                cargo_id = $.isNumeric(cargo_id) ? cargo_id : Factorio.ejectors[tgt.cargo].getID();

                var req_spd = h.getSpeed(type, num);
                tr.find('td:eq(1)').text(req_spd.toFixed(2));

                var fac = tgt.factory;
                var faci = Factorio.facilities[fac[0]].getItem(fac[1], faci_id);
                var speed = tgt.quantity / tgt.time * faci.production_efficiency;
                //[u/s]
                var count = req_spd / speed;
                var str = h.icon(faci) + "*" + count.toFixed(2);
                tr.find('td:eq(2)').html(str);

                var cargo = tgt.cargo;
                var faci = Factorio.ejectors[cargo].getItem(0, cargo_id);
                var speed = faci.insert_capacity;
                //[u/s]
                var count = req_spd / speed;
                var str = h.icon(faci) + "*" + count.toFixed(2);
                tr.find('td:eq(3)').html(str);
            }
        });
    },
};
/*    destroy : function() {
 var h = this;
 h.clear();
 h.table = undefined;
 h.cur = undefined;
 },
 node : function(req_spd, id, parent_node) {
 var h = this;
 var tgt = Factorio.recipes[id];

 var cur = h.cur;
 h.cur++;

 var node = null;
 var rows = $("<tr>").attr("data-tt-id", cur).attr("req_spd", req_spd).attr("item", id);
 if (parent_node >= 0) {
 rows.attr("data-tt-parent-id", parent_node);
 node = h.table.treetable("node", parent_node);
 }
 $("<td>").appendTo(rows).html(h.a(cur) + h.name_with_icon(tgt) + "</a>");
 $("<td>").appendTo(rows).html(req_spd.toFixed(2));
 $("<td>").appendTo(rows).text("calc Facility");
 $("<td>").appendTo(rows).text("calc Ejector");
 $("<td>").appendTo(rows).text("hoge");

 h.table.treetable("loadBranch", node, rows);
 $.each(tgt.ingredients, function() {
 h.node(req_spd * this[1], this[0], cur);
 });
 return cur;
 },
 $("<button>").appendTo(div).addClass('option-save').text("save").button().click(function() {
 console.log(this);
 return count;
 });
 */
