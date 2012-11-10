var w = 1280,
    h = 800;

var projection = d3
            .geo
            .equirectangular()
            .scale(w)
            .translate([w/2, h/2]);

var path = d3.geo.path()
    .projection(projection);

var svg = d3.select("body").insert("svg:svg", "h2")
    .attr("width", w)
    .attr("height", h);

var states = svg.append("svg:g")
    .attr("id", "states");

var circles = svg.append("svg:g")
    .attr("id", "circles");

var cells = svg.append("svg:g")
    .attr("id", "cells");

d3.json("./data/world-countries.json", function(collection) {
  states.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
      .attr("d", path)
	  .attr('fill', 'rgba(29,91,85,1)')
   .attr('stroke', 'rgba(29,91,85,1)')
   .attr('stroke-width', 1);;
});

 d3.text("./data/glds00ag15.txt", function(text) {
	text = text.split("\n");
	ncols = +(text[0].split(" ").slice(-1)[0]); nrows = +(text[1].split(" ").slice(-1)[0]);
	xllcorner = +(text[2].split(" ").slice(-1)[0]); yllcorner = +(text[3].split(" ").slice(-1)[0]);
	cellsize = +(text[4].split(" ").slice(-1)[0]); nodata = text[5].split(" ").slice(-1)[0];
	
	grid = text.slice(6);
	
 });	