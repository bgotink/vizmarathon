var clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (var i in this) {
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
}; 

Object.defineProperty( Object.prototype, "clone", {value: clone, enumerable: false});

d3.json("./data/world-countries.json", function(collection) {
//  countries = collection; //debug purposes (nope, keep this!)
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
	  .on("click", map.countryClick);

  window.countryToItu = {};
  window.ituToCountry = {};
  
  for (var idx in collection.features) {
      var country = collection.features[idx];
      
      //console.log(country.id, country);
      window.ituToCountry[country.id] = country.properties.name;
      window.countryToItu[country.properties.name] = country.id;
  }
  
  loadRouteData();
});

if (typeof window.graph == 'undefined') {
    window.graph = {};
}

loadRouteData = function() {
    d3.csv("./data/flights/countriesToCountries.csv", function(countries){
	    window.routes = {}; //global var, hurrah!
    
        countries.forEach(function(country){
            var departure = country['country departure'].replace(/\s\(.*\)/,'');
			
    		if(!routes[departure]){
    			routes[departure] = {totalNbOfRoutes:0, neighbours:[]};
    		}
    		routes[departure].neighbours.push({
    			name: country['country arrival'].replace(/\s\(.*\)/,''),
    			nbOfRoutes: +(country['number of routes'])
    			});
    		routes[departure].totalNbOfRoutes += +(country['number of routes']);
        });
    
        window.graph.countryNodes = {};
    
        for(var departure in routes) {
            var countryNode = { name: departure },
                arrivals = routes[departure];
            
            countryNode.children = arrivals.neighbours.map(
                function (o) {
                    return (typeof o == 'object') ? o.clone() : o;
                }
            );
        
            var departureKey = window.countryToItu[departure];
        
            window.graph.countryNodes[departureKey] = countryNode;
        }
    });
}

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
