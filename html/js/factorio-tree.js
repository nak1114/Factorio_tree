var Factorio = Factorio || {};
Factorio.tree = {
    init : function(id) {
        var h = Factorio.tree;
        h.table = id;
        h.cur = 1;
        h.table.children("tbody").html("");
        h.table.treetable({
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
    name_with_icon : function(tgt) {
        var str = $("<img />").attr('src', tgt.icon).attr('alt', tgt.name).addClass("name-icon").prop('outerHTML');
        return str + tgt.name;
    },
    icon : function(tgt) {
        var str = $("<img />").attr('src', tgt.icon).attr('alt', tgt.name).addClass("name-icon").prop('outerHTML');
        return str;
    },
    node : function(req_spd, id, parent_node) {
        var h = Factorio.tree;
        var tgt = Factorio.recipes[id];

        var cur = h.cur;
        h.cur++;

        var rows = '';
        var node = null;
        rows = rows + "<tr data-tt-id='" + cur;
        if (parent_node) {
            rows = rows + "' data-tt-parent-id='" + parent_node;
            node = h.table.treetable("node", parent_node);
        }
        rows = rows + "' req_spd='" + req_spd + "' item='" + id + "' >";

        rows = rows + "<td>" + h.name_with_icon(tgt) + "</td>";
        rows = rows + "<td>" + req_spd.toFixed(2) + "</td>";
        rows = rows + "<td>calc Facility</td>";
        rows = rows + "<td>calc Ejecter</td>";

        rows = rows + "</tr>";

        h.table.treetable("loadBranch", node, rows);
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
        h.recalc(15);
    },
    recalc : function(flg) {
        var h = Factorio.tree;
        var tmp=h.table.find("tbody tr");
        tmp.each(function() {
            var tr = $(this);
            var req_spd = tr.attr('req_spd');
            var id = tr.attr('item');
            var faci_id = tr.attr('facility-id');
            var cargo_id = tr.attr('cargo-id');

            var tgt = Factorio.recipes[id];
            faci_id  = $.isNumeric(faci_id )?faci_id  : Factorio.facilities[tgt.factory[0]].getID();
            cargo_id = $.isNumeric(cargo_id)?cargo_id : Factorio.ejectors[tgt.cargo].getID();

            var fac = tgt.factory;
            var faci = Factorio.facilities[fac[0]].getItem(fac[1],faci_id);
            var speed = tgt.quantity / tgt.time * faci.production_efficiency;
            //[u/s]
            var count = req_spd / speed;
            var str = h.icon(faci) + "*" + count.toFixed(2) ;
            tr.find('td:eq(2)').html(str);

            var cargo = tgt.cargo;
            var faci = Factorio.ejectors[cargo].getItem(0,cargo_id);
            var speed = faci.insert_capacity;
            //[u/s]
            var count = req_spd / speed;
            var str = h.icon(faci) + "*" + count.toFixed(2) ;
            tr.find('td:eq(3)').html(str);
            

        });
    },
};

