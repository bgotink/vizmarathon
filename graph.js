var graph = {};

//graph.svg = d3.select("body").insert("svg:svg")
//   .attr("width", map.w)
//   .attr("height", map.h);


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
 
var graph = d3.select("body").append("svg:svg")
    .attr("width", radius * 2)
    .attr("height", radius * 2)
	.append("g")
	.attr("transform", "translate(" + radius + "," + radius + ")");

d3.json("./data/flare2.json", function(json) {
	var nodes = tree.nodes(json);

	var link = graph.selectAll("path.link")
		.data(tree.links(nodes))
		.enter().append("path")
		.attr("class", "link");
		//.attr("d", diagonal);
		//.attr("d", line(d));
		//.attr("d", function(d) { return line.tension(d)});

		
	//g.append("svg:path")
    //.attr("d", function(d) { return line(d); });
	graph.selectAll("line")
	.data(nodes)
	.enter()
	.append("line")
    .attr("x1", function(d){
		return d.y*Math.cos((d.x-90)*Math.PI/180);
	})
    .attr("y1", function(d){
		return d.y*Math.sin((d.x-90)*Math.PI/180);
	})
    .attr("x2", 0)
    .attr("y2", 0)
	.attr("stroke-width", 2)
	.attr("stroke", "black");
 
 
	var node = graph.selectAll("g.node")
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