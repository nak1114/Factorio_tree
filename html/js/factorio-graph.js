var Factorio = Factorio || {};
Factorio.graph = function(node, prefix) {
    this.chart = d3.select(node);
    this.prefix = prefix;
    this.subtable = {};
    this.cur = 0;
    this.clear();
};
Factorio.graph.prototype = {
    clear : function() {
        var h = this;
        h.subtable = {nodes:[], node : {}, path : {}};
        h.cur = 0;
        h.chart.select("svg").remove();
    },
    node : function(req_spd,id,node_id,parent_id){
        var h = this;
        var tgt = Factorio.recipes[id];
        var node=h.subtable.node[node_id];

        if(node===undefined){
            var num=h.subtable.nodes.push({name : tgt.name})-1;
            node={};
            node.num=num;
            node.tgt=tgt;
            node.req_spd=0.0;
            h.subtable.node[id]=node;
        }
        node.req_spd+=req_spd;
        
        if(parent_id !== undefined){
            var parent_node=h.subtable.node[parent_id];
            var path=''+ node.num + 'to' + parent_node.num;
            var link=h.subtable.path[path];
            if(link===undefined){
                link={};
                link.source=node.num;
                link.target=parent_node.num;
                link.value=0.0;
                h.subtable.path[path]=link;
            }
            link.value+=req_spd;
        }
        
        req_spd/=tgt.quantity;
        $.each(tgt.ingredients, function() {
            h.node(req_spd*this[1],this[0],this[0],id);
        });
        return;
    },
    root : function(req_spd,id){
        var node_id='root-'+this.subtable.nodes.length;
        this.node(req_spd,id,node_id,undefined);
        this.redraw();
    },
    _css : ( function() {
            return (function () {/*
            .node rect {
                cursor: move;
                fill-opacity: .9;
                shape-rendering: crispEdges;
            }

            .node text {
                pointer-events: none;
                text-shadow: 0 1px 0 #fff;
            }
            .link {
                fill: none;
                stroke: #000;
                stroke-opacity: .2;
            }
            .link:hover {
                stroke-opacity: .5;
            }
            */}).toString().match(/\/\*\s*\n\s*([^]*)\r?\n\s*\*\//)[1].replace(/\r?\n\s*/g, '');
        }()),
    redraw : function() {
        //var h=this;
        this.chart.select("svg").remove();
        var links=$.map(this.subtable.path,function(val,key){return val;});
        var margin = {top : 1,right : 1,bottom : 6,left : 1};
        var width = 960 - margin.left - margin.right;
        var height = 700 - margin.top - margin.bottom;
    
        var formatNumber = d3.format(",.2f");
        var format = function(d) {return formatNumber(d) + " [u/s]";};
        var color = d3.scale.category20();

        var svg = this.chart
          .append("svg")
          .classed({'d3-sankey':true})
          .attr("width", width + margin.left + margin.right)
          .attr("height", height + margin.top + margin.bottom);
        svg.append('defs').append('style').attr("type","text/css").text(this._css);
        svg.append("g")
          .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

        var sankey = d3.sankey()
          .nodeWidth(15)
          .nodePadding(10)
          .size([width, height])
          .nodes(this.subtable.nodes)
          .links(links)
          .layout(32);
        var path = sankey.link();
        var link = svg
          .append("g")
          .selectAll(".link")
          .data(links)
          .enter()
          .append("path")
          .attr("class", "link")
          .attr("d", path)
          .style("stroke-width", function(d) {return Math.max(1, d.dy);})
          .sort(function(a, b) {return b.dy - a.dy;});
        link
          .append("title")
          .text(function(d) {
            return d.source.name + " → " + d.target.name + "\n" + format(d.value);
          });
        var node = svg
          .append("g")
          .selectAll(".node")
          .data(this.subtable.nodes)
          .enter()
          .append("g")
          .attr("class", "node")
          .attr("transform", function(d) {return "translate(" + d.x + "," + d.y + ")";})
          .call(d3.behavior.drag().origin(function(d) {return d;})
          .on("dragstart", function() {this.parentNode.appendChild(this);})
          .on("drag", dragmove));

        node.append("rect")
          .attr("height", function(d) {return d.dy;})
          .attr("width", sankey.nodeWidth())
          .style("fill", function(d) {return d.color = color(d.name.replace(/ .*/, ""));})
          .style("stroke", function(d) {return d3.rgb(d.color).darker(2);})
          .append("title").text(function(d) {return d.name + "\n" + format(d.value);});

        node.append("text")
          .attr("x", -6)
          .attr("y", function(d) {return d.dy / 2;})
          .attr("dy", ".35em")
          .attr("text-anchor", "end")
          .attr("transform", null)
          .text(function(d) {return d.name;})
          .filter(function(d) {return d.x < width / 2;})
          .attr("x", 6 + sankey.nodeWidth())
          .attr("text-anchor", "start");

        function dragmove(d) {
            d3.select(this)
              .attr("transform", "translate(" + d.x + "," + (d.y = Math.max(0, Math.min(height - d.dy, d3.event.y))) + ")");
            sankey.relayout();
            link.attr("d", path);
        }
        var svg_str = (new XMLSerializer()).serializeToString(svg[0][0]);
        //d3.select("#svg_output").text(svg_str);
    },
};
