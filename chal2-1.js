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
  countries = collection;
  states.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
	  .attr("id", function(d){return d.properties.name;})
      .attr("d", path)
	  .attr('fill', 'rgba(222,211,215,1)')
	  .attr('stroke', 'rgba(29,91,85,1)')
      .attr('stroke-width', 1)
	  .on("mouseover", countryOver)
	  .on("mouseout", countrOut);
});

 /*
 AIRPORT CITIES
 d3.csv("./data/flights/citiesTable.csv", function(airports) {
	ports = airports;
    //var positions = [];
	//airports.forEach(function(airport){positions.push(projection([airport['long. most active airport'],airport['lat. most active airport']]));});

    // Compute the Voronoi diagram of airports' projected positions.
    //var polygons = d3.geom.voronoi(positions);
	airports = airports.filter(function(airport){return airport['number of routes'] >= 16;});
    var g = cells.selectAll("g")
        .data(airports)
      .enter().append("svg:g");
		
    circles.selectAll("circle")
        .data(airports)
      .enter().append("svg:circle")
        .attr("cx", function(d, i) { return projection([d['long. most active airport'],d['lat. most active airport']])[0]; })
        .attr("cy", function(d, i) { return projection([d['long. most active airport'],d['lat. most active airport']])[1]; })
        .attr("r", function(d, i) { return 2; })
		.style("fill", 'red')
        .sort(function(a, b) { return a['number of routes'] - b['number of routes']; });
	});*/
	
d3.csv("./data/flights/countriesToCountries.csv", function(countries){
	graph = {};
	countries.forEach(function(country){
		if(!graph[''+country['country departure']]){
			graph[''+country['country departure']] = [];
		}
		graph[''+country['country departure']].push(country['country arrival']);
	});
	
});