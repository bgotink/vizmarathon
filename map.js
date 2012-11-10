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

map.svg = d3.select("body").insert("svg:svg")
    .attr("width", map.w)
    .attr("height", map.h);

map.states = map.svg.append("svg:g")
    .attr("id", "states");
	
map.addTooltip = function(country){
		var x = event.pageX,
		y = event.pageY;
		map.svg.append("svg:g")
				.attr("id", "gtooltip")
				.attr("transform", "translate(" + x +", " + y + ")");
		d3.select("#gtooltip").append("svg:rect")
					.attr("id", "tooltiprect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", 200)
					.attr("height", 100)
					.style("stroke", "hsl(0,50%,0%)")
					.style("fill", "hsl(50,50%,80%)");
		d3.select("#gtooltip").append("svg:text")
					.attr("id", "tooltiptext")
					.attr("class", "tooltip")
					.attr("x", 10)
					.attr("y", 20)
					.text(country.properties.name)
		d3.select("#gtooltip").append("svg:text")
					.attr("class", "ttdesc")
					.attr("x", 10)
					.attr("y",35)
					.text("Total number of routes:" + (window.routes[country.properties.name]?window.routes[country.properties.name].totalNbOfRoutes:0));
		
}

map.updateTooltip = function(country){
	var x = event.pageX,
		y = event.pageY;
	d3.select("#gtooltip")
		.attr("transform", "translate(" + x +", " + y + ")");
}

map.hideTooltip = function(){
	d3.select("#gtooltip").remove();
}
	
map.countryOver = function(country){
	//console.log(country.id);
	d3.select("#" + country.id).classed("countryOver", true);
	map.addTooltip(country);
	//d3.select("#" + country.id).style("fill", "hsl(206,10%,75%)");
}

map.countryOut = function(country){
	d3.select("#" + country.id).classed("countryOver", false);
	map.hideTooltip();
}

map.countryClick = function(country){
	map.states.selectAll("path").style('fill', null);
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
}