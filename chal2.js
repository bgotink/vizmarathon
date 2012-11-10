var width = 800,
	height = 600;
	
d3.csv("./data/flights/citiesToCities.csv", function(data){
	cities = data;
});