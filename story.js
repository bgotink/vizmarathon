var dialog = {};
 
dialog.width = 600;
dialog.height = 200;
dialog.topmargin = 40;
dialog.headerheight = 35;
dialog.lineheight = 20;
 
dialog.init = function(){

dialog.exitClick = function(){
	//console.log("clickcatcher click");
	dialog.g.transition().duration(1500).ease("quad", "out").style("opacity",0).remove();
	dialog.clickCatcher.transition().duration(1500).ease("quad", "out").style("opacity",0).remove();
}

dialog.transition = function(callback){
	dialog.g.transition().duration(2000).style("opacity", 0).each("end", function(){
		dialog.g.transition().duration(2000).style("opacity",1);
		callback();
	});
}

dialog.story1 = function(){
	//console.log("story 1");
	dialog.transition(function(callback){
			dialog.clickCatcher.transition().duration(500).style("fill","rgba(0,0,0,0)");
			dialog.g.transition().duration(1500).attr("transform", "translate(400,100)");
			map.showCountry(d3.select("#CUB").data()[0]);
			dialog.header.text("United States embargo against Cuba.");
			dialog.textl1.text("What stands out when looking at Cuba's flights, is that there are none to the USA.");
			dialog.textl2.text("The reason is the commercial, economic and financial embargo ");
			dialog.textl3.text("that has been active since 1960.");
			dialog.textl4.text("");
			dialog.textl5.text("Click anywhere on this dialog to continue,");
			dialog.textl6.text("or click outside of it at any time to close it and skip these stories.");
			dialog.rect.on("click", null);
			dialog.rect.on("click", dialog.story2);
			dialog.show();
	});
}

dialog.story2 = function(){
	//console.log("story 2");
	dialog.transition(function(callback){
			dialog.clickCatcher.transition().duration(500).style("fill","rgba(0,0,0,0)");
			dialog.g.transition().duration(1500).attr("transform", "translate(700,150)");
			map.showCountry(d3.select("#COD").data()[0]);
			dialog.header.text("Colonial relations");
			dialog.textl1.text("Congo used to be a colony of Belgium. To this day it still has quite");
			dialog.textl2.text("a few flight connections to Belgium, despite the long distance.");
			dialog.textl3.text("Other colonial relationships like this can be found, for example look at");
			dialog.textl4.text("French Guiana and Suriname.");
			dialog.textl5.text("Click anywhere on this dialog to continue,");
			dialog.textl6.text("or click outside of it at any time to close it and skip these stories.");
			dialog.rect.on("click", null);
			dialog.rect.on("click", dialog.exitClick);
			dialog.show();
	});
}

dialog.clickCatcher = map.svg.append('svg:rect')
						.attr("x",0)
						.attr("y",0)
						.attr("width",map.w)
						.attr("height",map.h)
						.style("fill", "rgba(0,0,0,0.5)")
						.on("click", dialog.exitClick);
 
dialog.g = map.svg.append("svg:g")
				.attr("id", "dialog")
				.attr("transform","translate("+(map.w/2-dialog.width/2)+","+(map.h/2-dialog.height/2)+")");

dialog.rect = dialog.g.append("svg:rect")
				.attr("id", "dialogrect")
				.attr("x",0)
				.attr("y",0)
				.attr("width",dialog.width)
				.attr("height", dialog.height)
				.on("click", dialog.story1);

dialog.header = dialog.g.append("svg:text")
				.attr("id", "dialogheader")
				.attr("class", "dialogtext")
				.attr("x", 10)
				.attr("y",dialog.topmargin);

dialog.textl1 = dialog.g.append("svg:text")
				.attr("id", "dialogtext1")
				.attr("class", "dialogtext")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight);
				
dialog.textl2 = dialog.g.append("svg:text")
				.attr("id", "dialogtext1")
				.attr("class", "dialogtext")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight+1*dialog.lineheight);
				
dialog.textl3 = dialog.g.append("svg:text")
				.attr("id", "dialogtext1")
				.attr("class", "dialogtext")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight+2*dialog.lineheight);
				
dialog.textl4 = dialog.g.append("svg:text")
				.attr("id", "dialogtext1")
				.attr("class", "dialogtext")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight+3*dialog.lineheight);
				
dialog.textl5 = dialog.g.append("svg:text")
				.attr("id", "dialogtext1")
				.attr("class", "dialogtext dialoghint")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight+4*dialog.lineheight);
				
dialog.textl6 = dialog.g.append("svg:text")
				.attr("id", "dialogtext1")
				.attr("class", "dialogtext dialoghint")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight+5*dialog.lineheight);
dialog.show = function(){
	dialog.g.style("display", null);
}
dialog.hide = function(callback){
	dialog.clickCatcher().remove();
	dialog.g.transition().duration(2000).style("display", "none");//.call(callback);
}
dialog.welcome = function(){
			dialog.header.text("Welcome");
			dialog.textl1.text("This is one of the 2012 Visualizing.org Global Marathon entries.");
			dialog.textl2.text("If you want, we'll show you a few interesting facts about the flight data.");
			dialog.textl3.text("");
			dialog.textl4.text("");
			dialog.textl5.text("Click anywhere on this dialog to continue,");
			dialog.textl6.text("or click outside of it at any time to close it and skip these stories.");
			dialog.show();
}
dialog.welcome();
}
dialog.init();