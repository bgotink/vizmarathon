var map = {};

map.w = 1280;
map.h = 800;

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
	
map.countryOver = function(country){
	d3.select("#" + country.id).classed("countryOver", true);
}

map.countryOut = function(country){
	d3.select("#" + country.id).classed("countryOver", false);
}

map.countryClick = function(country){
	incCountry = country;
	map.states.selectAll("path").attr('fill', 'rgba(222,211,215,1)');
	cpath = d3.select("#" + country.id);
	rCountry = routes[ituToCountry[country.id]];
	if(!rCountry){
		console.log("could not find airport data for:" + country.properties.name);
		return;
	}
	l = 100-Math.sqrt(2*rCountry.totalNbOfRoutes);
	cpath.style("fill", "hsl(0, 85%," + l + "%)");
}