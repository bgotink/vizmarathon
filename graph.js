var graph = {};

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
            if(typeof child.id !== 'undefined') {
                this.children[idx].id = child.id;
                this.children[idx].x = child.x;
                this.children[idx].y = child.y;
                this.children[idx].x0 = child.x0;
                this.children[idx].y0 = child.y0;
            }
            
            return this.children[idx];
        }
    }
}

graph.init = function() {
    graph.duration = 5000;
    graph.idgen = 0;
    
    var radius = graph.radius = 960 / 2
 
    graph.layout = d3.layout.tree()
        .size([360, radius- 120])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth; }
	    );
    
    graph.diagonal = d3.svg.diagonal.radial()
         .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

    graph.svg = d3.select("body").append("svg:svg")
        .attr("width", radius * 2)
        .attr("height", radius * 2)
	    .append("g")
	    .attr("transform", "translate(" + radius + "," + radius + ")");
    
    graph.edges = graph.svg.append("svg:g");
    graph.nodes = graph.svg.append("svg:g");
    
    graph.data = new graph.TreeNode('Myanmar');
    
    graph.show(graph.data);
}
    
graph.fromPolarX = function(d) {
    return d.y * Math.cos((d.x - 90) * Math.PI / 180);
}

graph.fromPolarY = function(d) {
    return d.y * Math.sin((d.x - 90) * Math.PI / 180);
}

graph.show =  function(clicked) {    
    var tree = graph.layout,
        diagonal = graph.diagonal,
        root = graph.data;
    
	var nodes = tree.nodes(root).reverse(),
        links = tree.links(nodes);
        
    if (typeof clicked === 'undefined') {
        clicked = root;
    }
    
    var oldSourceLocation = {
        x: ~~clicked.x0,
        y: ~~clicked.y0
    };
    
    var getParent = function(d) {
        return (typeof d.parent === 'undefined') ? clicked : d.parent;
    }
    
    var node = graph.nodes.selectAll("g.node")
        .data(nodes, function(d) { return (typeof d.id === 'undefined') ? (d.id = ++graph.idgen) : d.id; });

	var link = graph.edges.selectAll("path.link")
		.data(links.filter(function(element) { return element.source !== root; }));
    
	var line = graph.edges.selectAll("line")
	    .data(links.filter(function(element) { return element.source === root; }));
        
    var dummyDiagonal = function(d) {
        return function(e) {
            return diagonal({
                source: d,
                target: d
            });
        };
    };
    
    var linkEnter = link.enter()
        .append("path")
		.attr("class", "link")
		.attr("d", dummyDiagonal(oldSourceLocation)
        );
        
    var lineEnter = line.enter()
	    .append("line")
        .attr("x1", function(d){
		    return graph.fromPolarX(oldSourceLocation);
        })
        .attr("y1", function(d){
	        return graph.fromPolarY(oldSourceLocation);
	    })
        .attr("x2", function(d) { 
            return graph.fromPolarX(oldSourceLocation); 
        })
        .attr("y2", function(d) { 
            return graph.fromPolarY(oldSourceLocation);
        })
	    .attr("stroke-width", 2)
        .attr("class", "line");
        
            
	var nodeEnter = node
    	.enter().append("g")
    	.attr("class", "node")
    	.attr("transform", function(d) { return "rotate(" + (oldSourceLocation.x - 90) +")translate(" + oldSourceLocation.y + ")"; })
        .on("click", function(d) { window.graph.toggle(d); });
 
    nodeEnter.append("circle")
        .attr("r", 4.5);
 
    nodeEnter.append("text")
        .attr("dy", ".31em")
    	.attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; })
    	.attr("transform", 
            function(d) { 
                if (d == root) return "rotate(-90)translate(-8)"
                return d.x < 180 ? "translate(8)" : "rotate(180)translate(-8)";
            }
        )
    	.text(function(d) { return d.name; })
        .attr('fill-opacity', 1e-6);
    
    var nodeUpdate = node.transition()
        .duration(graph.duration).ease(Math.sqrt)
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"});
        
    nodeUpdate.select("text")
        .style("fill-opacity", 1);
    
    link.transition()
        .duration(graph.duration).ease(Math.sqrt)
        .attr("d", diagonal);
    
    line.transition()
        .duration(graph.duration).ease(Math.sqrt)
        .attr("x1", function(d) {
            return graph.fromPolarX(d.source);
        })
        .attr("y1", function(d) {
            return graph.fromPolarY(d.source);
        })
        .attr("x2", function(d) {
            return graph.fromPolarX(d.target);
        })
        .attr("y2", function(d) {
            return graph.fromPolarY(d.target);
        });
        
    var nodeExit = node.exit().transition()
        .duration(graph.duration).ease(Math.sqrt)
        .attr("transform", function() { return "rotate(" + (clicked.x - 90) + ")translate(" + clicked.y + ")"})
        .remove();
    
    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
    
    link.exit().transition()
        .duration(graph.duration).ease(Math.sqrt)
        .attr("d", dummyDiagonal(clicked))
        .remove();
    
    line.exit().transition()
        .duration(graph.duration).ease(Math.sqrt)
        .attr("x1", function(d) {
            return graph.fromPolarX(clicked);
        })
        .attr("y1", function(d) {
            return graph.fromPolarY(clicked);
        })
        .attr("x2", function(d) {
            return graph.fromPolarX(clicked);
        })
        .attr("y2", function(d) {
            return graph.fromPolarY(clicked);
        })
        .remove();
    
    nodes.forEach(function(d) {
        d.x0 = d.x;
        d.y0 = d.y;
    });
}

graph.toggle = function(node) {
    if (node === graph.data) {
        console.log("root clicked");
        return;
    }
    
    console.log(node);
    
    if (typeof node.children === 'undefined') {
        node.parent.expandChild(node.name);
    } else {
        delete node.children;
    }
    
    graph.show(node);
}