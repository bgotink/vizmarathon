var graph = {};

graph.TreeNode = function (country) {
    if (typeof window.countryToItu[country] != 'undefined') {
        country = window.countryToItu[country];
    }
    
    var tmp = graph.countryNodes[country].clone();
    this.name = tmp.name;
    this.children = tmp.children;
}

graph.TreeNode.constructor = graph.TreeNode;

graph.TreeNode.prototype.expandChild = function (name) {
    if (typeof window.ituToCountry[name] != 'undefined') {
        name = window.ituToCountry[name];
    }
    
    for(var idx in this.children) {
        var child = this.children[idx];
        
        if (child.name == name) {

            if (typeof child.chilren != 'undefined') continue;

            this.children[idx] = new graph.TreeNode(name);
            this.children[idx].nbOfRoutes = child.nbOfRoutes;
        }
    }
}

//graph.svg = d3.select("body").insert("svg:svg")
//   .attr("width", map.w)
//   .attr("height", map.h);

graph.init = function() {

var radius = 960 / 2;
 
var tree = d3.layout.tree()
    .size([360, radius- 120])
    .separation(function(a, b) { 
		return (a.parent == b.parent ? 1 : 1) / a.depth; }
	);
 
/*var diagonal = d3.svg.diagonal.radial()
    .projection(function(d) {
		return [d.y, d.x / 180*Math.PI]; }
	);*/
/*var diagonal = d3.svg.line()
	.x(function(d){
		return d.x;
	})
	.y(function(d){
		return d.y;
	});*/
	
//var line = d3.svg.line()
  //  .x(function(d) { return x(d.x); })
    //.y(function(d) { return y(d.y); });
 
graph.graph = d3.select("body").append("svg:svg")
    .attr("width", radius * 2)
    .attr("height", radius * 2)
	.append("g")
	.attr("transform", "translate(" + radius + "," + radius + ")");
    
graph.fromPolarX = function(d) {
    return d.y * Math.cos((d.x - 90) * Math.PI / 180);
}

graph.fromPolarY = function(d) {
    return d.y * Math.sin((d.x - 90) * Math.PI / 180);
}

d3.json("./data/flare2.json", function(json) {
    json = new graph.TreeNode('Myanmar');
    json.expandChild('China');
    
	var nodes = tree.nodes(json);

	var link = graph.graph.selectAll("path.link")
		.data(tree.links(nodes))
		.enter().append("path")
		.attr("class", "link");
		//.attr("d", diagonal);
		//.attr("d", line(d));
		//.attr("d", function(d) { return line.tension(d)});

		
	//g.append("svg:path")
    //.attr("d", function(d) { return line(d); });
	graph.graph.selectAll("line")
	.data(nodes)
	.enter()
	.append("line")
    .attr("x1", function(d){
		return graph.fromPolarX(d);
	})
    .attr("y1", function(d){
		return graph.fromPolarY(d);
	})
    .attr("x2", function(d) { 
        return (typeof d.parent == 'undefined') ? 0 : graph.fromPolarX(d.parent); 
    })
    .attr("y2", function(d) { 
        return (typeof d.parent == 'undefined') ? 0 : graph.fromPolarY(d.parent);
    })
	.attr("stroke-width", 2)
	.attr("stroke", "black");
 
 
	var node = graph.graph.selectAll("g.node")
		.data(nodes)
		.enter().append("g")
		.attr("class", "node")
		.attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"; })
 
	node.append("circle")
		.attr("r", 4.5);
 
	node.append("text")
		.attr("dy", ".31em")
		.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
		.attr("transform", function(d) { return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)"; })
		.text(function(d) { return d.name; });
});

}