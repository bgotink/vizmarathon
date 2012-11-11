var map = {};

map.duration = 1500;

map.init = function() {

map.w = viz.w;
map.h = viz.h;
    
map.projection = d3
            .geo
            .mercator()
            .scale(map.w)
            .translate([map.w/2, map.h/2]);

map.path = d3.geo.path()
    .projection(map.projection);

map.svg = viz.svg;

map.states = viz.g1;
map.lltextg = viz.g2;

map.cachedCentroids = {};

map.load = function(initial) {
    map.lltexthead = map.lltextg.append("svg:text")
		.attr("id", "lltexthead")
		.text("Click on a country")
        .classed("invisible", true);
    map.lltextl1 = map.lltextg.append("svg:text")
		.attr("id", "lltext")
		.attr("y", 20)
		.text("to view connected countries.")
        .classed("invisible", true);
    map.lltextl2 = map.lltextg.append("svg:text")
		.attr("id", "lltext")
		.attr("y", 35)
		.text("")
        .classed("invisible", true);
    map.lltextl3 = map.lltextg.append("svg:text")
		.attr("id", "lltext")
        .attr("y", 50)
		.text("")
        .classed("invisible", true);
            
    if (initial) {
        map.lltextg.attr("transform", "translate(10," + (map.h - 400) + ")");
        viz._svg.classed("map", true);
    
        map.states.selectAll("path")
            .data(map.data)
          .enter().append("svg:path")
            .attr("id", function(d){return d.id;})
            .attr("d", map.path)
          	.classed("country", true)
          	.on("mouseover", map.countryOver)
          	.on("mouseout", map.countryOut)
          	.on("click", map.countryClick)
          	.on("mousemove", map.updateTooltip);
        
        map.lltextg.selectAll("text").classed("invisible", false);
        
        map.initCentroidCache();
    } else {
        viz._svg.style("background-color", "#fff");
        viz._svg.transition().duration(map.duration).ease('quad', 'out')
            .style("background-color", "hsl(206,58%,95%)")
            .each("end", function() {
                viz._svg.classed("map", true);
                viz._svg.style("background-color", null);
            });
            

        map.lltextg
            .transition().duration(map.duration).ease('quad','out')
            .attr("transform", "translate(10," + (map.h - 400) + ")");
            
        map.lltextg.selectAll("text")
            .attr("fill", "#fff")
            .attr("stroke", "#fff")
            .classed("invisible", false);
        
        map.lltextg.selectAll("text")
            .transition().duration(map.duration).ease('quad', 'out')
            .attr("fill", "#000")
            .attr("stroke", "#000")
            .each("end", function() {
                d3.select(this)
                    .attr("stroke", null)
                    .attr("fill", null);
            });

        map.enterCountries();
    }
}

map.unload = function(callback) {
    var t0 = viz._svg.transition()
        .duration(map.duration).ease('quad', 'out');
    
    t0.style("background-color", "#FFF")
        .each("end", function(e) {
            viz._svg.classed("map", false);
            viz._svg.style("background-color", null);
        });
        
    var svg = t0.select("g");
    
    t0.select("#two")
        .transition().duration(map.duration).ease('quad', 'out')
        .attr("transform", "translate(0,0)")
        .each("end", function() {
            d3.select(this).attr("transform", null);
        });
    
    svg.selectAll("#two > text")
        .transition().duration(map.duration).ease('quad', 'out')
        .attr("fill", "#fff")
        .attr("stroke", "#fff")
        .remove();
    
    svg.selectAll("#one > path").transition()
        .duration(map.duration).ease('quad', 'out')
        .attr("transform", function(c) {
            var t = map.getCentroid(c.id);
            return "translate("+t.x+","+t.y+")scale(2e-6)";
        })
        .remove();
        
    if (callback) {
        t0.transition().each('end', callback);
    }
}

map.selectedcountry;
	
map.addTooltip = function(x,y,country){
		map.svg.append("svg:g")
				.attr("id", "gtooltip")
				.attr("class", "tooltip")
				.attr("transform", "translate(" + x +", " + y + ")");
		d3.select("#gtooltip").append("svg:rect")
					.attr("id", "tooltiprect")
					.attr("x", 0)
					.attr("y", 0)
					.attr("width", 260)
					.attr("height", 75)
					.style("stroke", "hsl(0,50%,0%)")
					.style("fill", "hsl(50,50%,80%)");
		d3.select("#gtooltip").append("svg:text")
					.attr("id", "tooltiphead")
					.attr("x", 10)
					.attr("y", 20)
					.text(country.properties.name);
		
		if(map.selectedcountry){
			d3.select("#gtooltip").append("svg:text")
					.attr("id", "tooltipdesctocountry")
					.attr("class", "tooltipdesc")
					.attr("x", 10)
					.attr("y",35)
					.text("Routes from " + window.countryToItu[map.selectedcountry.properties.name] +
						" to " + window.countryToItu[country.properties.name] +
						": " + map.routesBetween(map.selectedcountry.properties.name,country.properties.name));
			
			if(map.selectedcountry.properties.name !== country.properties.name){
			d3.select("#gtooltip").append("svg:text")
					.attr("id", "tooltipdescreturn")
					.attr("class", "tooltipdesc")
					.attr("x", 10)
					.attr("y",50)
					.text("Routes from " + window.countryToItu[country.properties.name] +
						" to " + window.countryToItu[map.selectedcountry.properties.name] +
						": " + map.routesBetween(country.properties.name, map.selectedcountry.properties.name));
						}
		}
		var r = window.routes[country.properties.name];
		var total = r?r.totalNbOfRoutes:0;
		d3.select("#gtooltip").append("svg:text")
					.attr("id", "tooltipdesctotal")
					.attr("class", "tooltipdesc")
					.attr("x", 10)
					.attr("y",65)
					.text("Total routes in " + window.countryToItu[country.properties.name] +
						": " + total);
}

map.routesBetween = function(from, dest){//from, dest = name strings
	var r = window.routes[from];
	var c = r?r.neighbours.filter(function(e){return e.name === dest;})[0]:undefined;
	var n = c?c.nbOfRoutes:0;
	return n?n:0;
}

map.updateTooltip = function(country){
	var m = d3.mouse(this);
	var p = map.calcTooltipPos(m[0], m[1]);
	d3.select("#gtooltip")
		.attr("transform", "translate(" + p[0] +"," + p[1] + ")");
}

map.hideTooltip = function(){
	d3.select("#gtooltip").remove();
}
	
map.countryOver = function(country){
	//console.log(country.id);
	var m = d3.mouse(this);
	var p = map.calcTooltipPos(m[0], m[1]);
	d3.select("#" + country.id).classed("countryOver", true);
	map.addTooltip(p[0],p[1], country);
	//d3.select("#" + country.id).style("fill", "hsl(206,10%,75%)");
}

map.countryOut = function(country){
	d3.select("#" + country.id).classed("countryOver", false);
	map.hideTooltip();
}

map.resetMap = function(){
	map.selectedcountry = undefined;
	map.states.selectAll("path").transition().duration(map.duration).ease('quad', 'out').style('fill', "#ffffff");
}

map.countryClick = function(country){
	if(map.selectedcountry && (map.selectedcountry.properties.name===country.properties.name)){
		map.resetMap();
		return;
	}
	map.selectedcountry = country;
	map.hideTooltip();
	var m = d3.mouse(this);
	var c = map.calcTooltipPos(m[0], m[1]);
	map.addTooltip(c[0], c[1], country);
	map.states.selectAll("path").transition().duration(map.duration).ease('quad', 'out').style('fill', "#ffffff");
	map.lltexthead.text(country.properties.name);
	map.lltextl1.text("Country code:" + countryToItu[country.properties.name]);
	map.lltextl2.text("Total # of routes: " + (routes[country.properties.name]?routes[country.properties.name].totalNbOfRoutes:0));
	var rCountry = routes[ituToCountry[country.id]];
	if(!rCountry){
		console.log("could not find route data for:" + country.properties.name);
		return;
	}
	var maxRoutes = 0;
	rCountry.neighbours.map(function(elem){if(elem.nbOfRoutes > maxRoutes && elem.name !== country.properties.name) maxRoutes = elem.nbOfRoutes;});
	var n = maxRoutes;
	var selfcontr=80;
	//d3.select("#"+country.id).style("fill", "hsl(247, 85%, 100%)");
	rCountry.neighbours.forEach(function(neighbour){
		gneighbour = neighbour;
		var itu = countryToItu[neighbour.name];
		contribution = 97 - (50 * (neighbour.nbOfRoutes / n));
		//console.log(country.properties.name + "===" + neighbour.name + "\tnbofroutes:" + neighbour.nbOfRoutes + "\tc:" + contribution);
		if(country.properties.name	=== neighbour.name){
			selfcontr = 97 - 50*(neighbour.nbOfRoutes / routes[country.properties.name].totalNbOfRoutes);
		}else{
			d3.select("#"+itu).transition().duration(map.duration).ease('quad', 'out').style("fill", "hsl(0, 85%, " + contribution + "%)");
		}		
	});
	d3.select("#"+country.id).transition().duration(map.duration).ease('quad', 'out').style("fill", "hsl(247, 85%, " + selfcontr + "%)");	
}

map.enterCountries = function(){
    var states = map.states.selectAll("path")
            .data(map.data);
    
    states.enter().append("svg:path")
        .attr("id", function(d){return d.id;})
        .attr("d", map.path)
        .classed("country", true)
        .on("mouseover", map.countryOver)
        .on("mouseout", map.countryOut)
        .on("click", map.countryClick)
        .on("mousemove", map.updateTooltip)
        .attr("transform", function (c) {
            var t = map.getCentroid(c.id);
            return "translate(" + t.x + "," + t.y + ')scale(2e-6)';
        });
    
	states.transition()
        .duration(map.duration).ease('quad', 'out')
        .attr("transform", "translate(0,0)scale(1)");
}

map.getCentroidOfItu = function(itu){
    if (!itu) {
        return { x: 0, y: 0 };
    }
    
	var sel = d3.select("#"+itu);
	return map.getCentroid(sel);
}

map.calcTooltipPos = function(x,y){
	var dx = 15, dy = 0;
	if(x > map.w-260){
		x-=260;
		dx*=-1;
	}
	if(y > map.h-100){
		y-=100;
		dy*=-1;
	}
	return [x+dx,y+dy];
}

map.showAllInternal = function(){
	map.selectedcountry = undefined;
	for(var country in routes){
		var total = routes[country].totalNbOfRoutes;
		var share = map.routesBetween(country, country)/total;
		var l = 95 - 45*share;
		d3.select("#" + countryToItu[country]).transition().duration(map.duration).ease('quad', 'out').style("fill", "hsl(247, 85%,"+l+"%)");
	}
	map.lltexthead.text("Fraction of domestic flights");
	map.lltextl1.text("#domestic flights/total #flights");
	map.lltextl2.text("Darker: larger percentage of domestic flights");
	map.lltextl3.text("Click on a country to cancel");
}

map.showTotals = function(){
	map.selectedcountry = undefined;
	var maxTotal = 0;
	for(var country in routes){
		if(routes[country].totalNbOfRoutes > maxTotal){
			maxTotal = routes[country].totalNbOfRoutes;
		}
	}
	for(var country in routes){
		var cTotal = routes[country].totalNbOfRoutes;
		var share = cTotal/maxTotal;
		var l = 95 - 45*share;
		d3.select("#" + countryToItu[country]).transition().duration(map.duration).ease('quad','out').style("fill", "hsl(0, 85%, " + l + ")"); 
	}
	map.lltexthead.text("Absolute number of flights.");
	map.lltextl1.text("Move mouse over country for absolute numbers.");
	map.lltextl2.text("Darker: More flights.");
	map.lltextl3.text("Click on a country to cancel");
}

map.getCentroid = function(selection) {
    if (ituToCountry[selection]) {
        selection = d3.select("#" + selection);
    }
    
    // get the DOM element from a D3 selection
    // you could also use "this" inside .each()
    var element = selection.node(),
        // use the native SVG interface to get the bounding box
        bbox = element.getBBox();
    // return the center of the bounding box
    
    return {
            x: bbox.x + bbox.width/2,
            y: bbox.y + bbox.height/2
        };
}

map.getCachedCentroid = function(id) {
    if (countryToItu[id]) {
        id = countryToItu[id];
    }
    return map.cachedCentroids[id]
        ? map.cachedCentroids[id]
        : {
            x: 0,
            y: 0
        };
}

map.initCentroidCache = function() {
    for (var idx in ituToCountry) {
        map.cachedCentroids[idx] = map.getCentroid(idx);
    }
}
}