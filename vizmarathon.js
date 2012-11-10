d3.json("./data/world-countries.json", function(collection) {
  countries = collection; //debug purposes
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
});

d3.csv("./data/flights/countriesToCountries.csv", function(countries){
	graph = {}; //global var, hurrah!
	countries.forEach(function(country){
		if(!graph[country['country departure']]){
			graph[country['country departure']] = [];
		}
		graph[''+country['country departure']].push(country['country arrival']);
	});
});