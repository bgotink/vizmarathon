d3.json("./data/world-countries.json", function(collection) {
  countries = collection; //debug purposes (nope, keep this!)
  map.states.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
	  .attr("id", function(d){return d.id;})
      .attr("d", map.path)
	  .attr('fill', 'rgba(222,211,215,1)')
	  .attr('stroke', 'rgba(29,91,85,1)')
      .attr('stroke-width', 1)
	  .on("mouseover", map.countryOver)
	  .on("mouseout", map.countryOut)
	  .on("mouseclick", map.countryClick);

  window.countryToItu = {};
  window.ituToCountry = {};
  
  for (var idx in collection.features) {
      var country = collection.features[idx];
      
      console.log(country.id, country);
      window.ituToCountry[country.id] = country.properties.name;
      window.countryToItu[country.properties.name] = country.id;
  }
  
  loadRouteData();
});

loadRouteData = function() {
    d3.csv("./data/flights/countriesToCountries.csv", function(countries){
	    window.routes = {}; //global var, hurrah!
    
        if (typeof window.graph == 'undefined') {
            window.graph = {};
        }
    
        window.graph.countryNodes = {};
    
        countries.forEach(function(country){
            var departure = country['country departure'].replace(/\s(.*)/,'');
            console.log(departure);
    		if(!routes[departure]){
    			routes[departure] = {totalNbOfRoutes:0, neighbours:[]};
    		}
    		routes[departure].neighbours.push({
    			name: country['country arrival'].replace(/\s(.*)/,''),
    			nbOfRoutes: +(country['number of routes'])
    			});
    		routes[departure].totalNbOfRoutes += +(country['number of routes']);
        });
    
        for(var departure in routes) {
            var arrivals = routes[departure];
        
            var departureKey = window.countryToItu[departure];
        
            window.graph.countryNodes[departureKey] = {
                name: departure,
                children: arrivals
            }
        }
    });
}
