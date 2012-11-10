var map = {};


map.w = 1280;
map.h = 800;

map.init = function() {
map.projection = d3
            .geo
            .mercator()
            .scale(map.w)
            .translate([map.w/2, map.h/2]);

map.path = d3.geo.path()
    .projection(map.projection);

map.svg = d3.select("body").insert("svg:svg", "h2")
    .attr("width", map.w)
    .attr("height", map.h);

map.states = map.svg.append("svg:g")
    .attr("id", "states");

map.circles = map.svg.append("svg:g")
    .attr("id", "circles");

map.cells = map.svg.append("svg:g")
    .attr("id", "cells");
}
	
map.countryOver = function(country){
	d3.select("#" + country.id).classed("countryOver", true);
}

map.countryOut = function(country){
	d3.select("#" + country.id).classed("countryOver", false);
}

map.countryClick = function(country){
	map.states.selectAll("path").style('fill', 'rgba(255,255,255,1)');
	var cpath = d3.select("#" + country.id);
	rCountry = routes[ituToCountry[country.id]];
	if(!rCountry){
		console.log("could not find airport data for:" + country.properties.name);
		return;
	}
	cpath.style("fill", "hsl(0, 85%,50%)");
	maxRoutes = 0;
	rCountry.neighbours.map(function(elem){if(elem.nbOfRoutes > maxRoutes) maxRoutes = elem.nbOfRoutes;});
	n = maxRoutes;
	d3.select("#"+country.id).style("fill", "hsl(247, 85%, " + 90 + "%)");
	rCountry.neighbours.forEach(function(neighbour){
		gneighbour = neighbour;
		itu = countryToItu[neighbour.name];
		contribution = 90 - (40 * (neighbour.nbOfRoutes / n));
		console.log(country.properties.name + "===" + neighbour.name + "\tnbofroutes:" + neighbour.nbOfRoutes + "\tc:" + contribution);
		if(country.properties.name	=== neighbour.name){
			d3.select("#"+itu).style("fill", "hsl(247, 85%, " + contribution + "%)");
		}else{
			d3.select("#"+itu).style("fill", "hsl(0, 85%, " + contribution + "%)");
		}
	});
}