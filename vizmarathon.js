var clone = function() {
  var newObj = (this instanceof Array) ? [] : {};
  for (var i in this) {
    if (this[i] && typeof this[i] == "object") {
      newObj[i] = this[i].clone();
    } else newObj[i] = this[i]
  } return newObj;
}; 

Object.defineProperty( Object.prototype, "clone", {value: clone, enumerable: false});

// Array Remove - By John Resig (MIT Licensed)
Object.defineProperty(Array.prototype, "remove", {value: function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
}, enumerable: false});

if (!Array.prototype.indexOf)
{
    alert("This browser doesn't support indexOf, please die a horrible death.");
}

Object.defineProperty( Array.prototype, "contains", {value: function(elem) {
    return this.indexOf(elem) !== -1;
}, enumerable: false });

if (isMap) {
    map.init();
}

d3.json("./data/world-countries.json", function(collection) {
//  countries = collection; //debug purposes

  if (isMap) {
  map.states.selectAll("path")
      .data(collection.features)
    .enter().append("svg:path")
	  .attr("id", function(d){return d.id;})
      .attr("d", map.path)
	  .classed("country", true)
	  .on("mouseover", map.countryOver)
	  .on("mouseout", map.countryOut)
	  .on("click", map.countryClick)
	  .on("mousemove", map.updateTooltip);
  }
  
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
        
        if (isTree) {
            graph.init();
        }
    });
}
//TODO
//Absolute airline comparison
//Stories
//Restjes chinees eten
//FF fixen
//IE fixen