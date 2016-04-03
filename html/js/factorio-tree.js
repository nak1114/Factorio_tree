var Factorio = Factorio || {};
Factorio.tree = {
    init : function(id) {
        var h = Factorio.tree;
        h.table = id;
        h.cur = 1;
        $(h.table).children("tbody").html("");
        $(h.table).treetable({
            expandable : true
        });
    },
    clear : function() {
        var h = Factorio.tree;
        h.init(h.table);
    },
    destroy : function() {
        var h = Factorio.tree;
        h.clear();
        h.table = undefined;
        h.cur = undefined;
    },
    name_with_icon : function(id) {
        var tgt = Factorio.recipes[id];
        var str = $("<img />").attr('src', tgt.icon).attr('alt', id).addClass("name-icon").prop('outerHTML');
        return str + tgt.name;
    },
    icon : function(id) {
        var tgt = Factorio.recipes[id];
        var str = $("<img />").attr('src', tgt.icon).attr('alt', id).addClass("name-icon").prop('outerHTML');
        return str;
    },
    node : function(req_spd, id, parent_node) {
        var h = Factorio.tree;
        var tgt = Factorio.recipes[id];

        var effi = Factorio.recipes[tgt.factory[0]].production_efficiency;
        effi = effi ? effi : 1.0;
        var speed = tgt.quantity / tgt.time * effi;
        //[u/s]
        var count = req_spd / speed;
        var cur = h.cur;
        h.cur++;

        var rows = '';
        var node = null;
        rows = rows + "<tr data-tt-id='" + cur;
        if (parent_node) {
            rows = rows + "' data-tt-parent-id='" + parent_node;
            node = $(h.table).treetable("node", parent_node);
        }
        rows = rows + "'>";

        rows = rows + "<td>" + h.name_with_icon(id) + "</td>";
        rows = rows + "<td>" + req_spd.toFixed(2) + "</td>";
        rows = rows + "<td>" + h.icon(tgt.factory[0]) + "*" + count.toFixed(2) + "</td>";

        rows = rows + "</tr>";

        $(h.table).treetable("loadBranch", node, rows);
        $.each(tgt.ingredients, function() {
            h.node(req_spd * this[1], this[0], cur);
        });
        return cur;
    },
    root : function(req_spd, id) {
        var h = Factorio.tree;
        var tgt = Factorio.recipes[id];
        if (!tgt) {
            console.error('ID not found', id);
            return;
        }
        if (!h.table) {
            console.error('not init table');
            return;
        }
        var par = h.node(req_spd, id, null);
    },
};

