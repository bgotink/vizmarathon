var dialog = {};
 
dialog.width = 600;
dialog.height = 300;
dialog.topmargin = 40;
dialog.headerheight = 35;
dialog.lineheight = 20;
 
dialog.init = function(){
 
dialog.g = map.svg.append("svg:g")
				.attr("id", "dialog")
				.attr("transform","translate("+(map.w/2-dialog.width/2)+","+(map.h/2-dialog.height/2)+")");

dialog.rect = dialog.g.append("svg:rect")
				.attr("id", "dialogrect")
				.attr("x",0)
				.attr("y",0)
				.attr("width",dialog.width)
				.attr("height", dialog.height);

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
				.attr("class", "dialogtext")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight+4*dialog.lineheight);
				
dialog.textl6 = dialog.g.append("svg:text")
				.attr("id", "dialogtext1")
				.attr("class", "dialogtext")
				.attr("x",10)
				.attr("y",dialog.topmargin+dialog.headerheight+5*dialog.lineheight);

dialog.welcome = function(){
			dialog.header.text("Welcome");
			dialog.textl1.text("This is one of the 2012 Visualizing.org Global Marathon entries.");
			dialog.textl2.text("We'll show you a few interesting things we found using our visualization.");
			dialog.textl3.text("After that, you are free to explore on your own.");
			dialog.show();
}

dialog.hide = function(){
	dialog.g.style("display", "none");
}

dialog.show = function(){
	dialog.g.style("display", null);
}
dialog.hide();
}