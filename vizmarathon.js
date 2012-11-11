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

// FIXME fix above for non-Chrome browsers !!

var viz = {};

viz.w = 1280;
viz.h = 800;
viz.radius = Math.min(viz.w, viz.h) / 2;

viz.center = {
    x: viz.w / 2,
    y: viz.h / 2
}

viz.svg = d3.select("body").insert("svg:svg")
        .attr("width", viz.w)
        .attr("height", viz.h)
        .append("g");
viz._svg = d3.select("svg");

viz.g1 = viz.svg.append('g')
    .attr("id", "one");
viz.g2 = viz.svg.append('g')
    .attr("id", "two");

map.init();
graph.init();

d3.json("./data/world-countries.json", function(collection) {
  map.data = collection.features;
  
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
            graph.load(true);
        } else {
            map.load(true);
        }
    });
}
//TODO
//Absolute airline comparison
//Stories
//Restjes chinees eten
//FF fixen
//IE fixen