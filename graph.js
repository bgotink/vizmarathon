var graph = {};

graph.TreeNode = function (country) {
    if (typeof window.countryToItu[country] != 'undefined') {
        country = window.countryToItu[country];
    }
    
    var tmp = graph.countryNodes[country].clone();
    this.name = tmp.name;
    this.children = tmp.children.filter(
        function(c) {
            return c.name !== tmp.name;
        }
    );
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
                this.children[idx].highlight = child.highlight;
            }
            
            return this.children[idx];
        }
    }
}

graph.init = function() {
    graph.duration = 1000;
    graph.idgen = 0;
    
    var radius = viz.radius;
 
    graph.layout = d3.layout.tree()
        .size([360, radius- 120])
        .separation(function(a, b) {
            return (a.parent == b.parent ? 1 : 2) / a.depth; }
	    );
    
    graph.diagonal = d3.svg.diagonal.radial()
         .projection(function(d) { return [d.y, d.x / 180 * Math.PI]; });

    graph.svg = viz.svg;
    
    graph.edges = viz.g1;
    graph.nodes = viz.g2;
    
    graph.linkCount = 0;
    
    graph.storedEdges = {};
}

graph.load = function(initial) {
    graph.svg
	        .attr("transform", "translate(" + viz.center.x + "," + viz.center.y + ")");
    if (initial) {
        graph.data = new graph.TreeNode('Belgium');
        graph.show(graph.data);
        return;
    }
    
    graph.data = new graph.TreeNode(
        map.selectedcountry
        ? map.selectedcountry.properties.name
        : "BEL"
    );
    
    var setLocation = function(node) {
        var loc = map.getCachedCentroid(node.name).clone();
        
        loc.x -= viz.center.x;
        loc.y -= viz.center.y;
        
        node.x = node.x0 = node.mapX = graph.toPolarX(loc);
        node.y = node.y0 = node.mapY = graph.toPolarY(loc);
        
        if (node.children) {
            node.children.forEach(setLocation);
        }
    }
    setLocation(graph.data);
    
    console.log(graph.data);
    
    graph.show(graph.data, true);
}

graph.unload = function(callback) {
    graph.data.children.forEach(
        function(child) {
            if (child.children) {
                delete child.children;
            }
        }
    );
    
    graph.show();
    
    var t0 = graph.svg.transition().duration(graph.duration);
    
    var node = t0.selectAll("g.node");
    var line = t0.selectAll("line");
    
    node.attr("transform", function(node) {
            return "rotate(" + (node.mapX - 90) + ")translate(" + node.mapY + ")";
        })
        .remove();
        
    node.select("circle")
        .attr("r", 1e-6);
    
    node.select("text")
        .attr('fill-opacity', 1e-6)
        .attr('stroke-opacity', 1e-6);
    
    line.attr("stroke-opacity", 1e-6).remove();
    
    t0.each("end", function() {
        graph.svg
	        .attr("transform", "translate(0,0)");
        callback();
    });
}
    
graph.fromPolarX = function(d) {
    return d.y * Math.cos((d.x - 90) * Math.PI / 180);
}

graph.fromPolarY = function(d) {
    return d.y * Math.sin((d.x - 90) * Math.PI / 180);
}

graph.toPolarX = function(d) {
    return Math.atan2(d.y, d.x) * 180 / Math.PI + 90;
}

graph.toPolarY = function(d) {
    return Math.sqrt(d.x * d.x + d.y * d.y);
}

graph.updateEdges = function(edges) {
    var newEdges = {};
    
    var edgesObj = {};
    
    edges.forEach(function(edge) {
        edgesObj["idx" + edge.target.id] = edge;
    });
    
    for (var idx in edgesObj) {
        if (! graph.storedEdges[idx]) {
            newEdges[idx] = edgesObj[idx];
        } else {
            graph.storedEdges[idx] = edgesObj[idx];
        }
    }
    
    for (var idx in graph.storedEdges) {
        if (! edgesObj[idx]) {
            delete graph.storedEdges[idx];
        }
    };
    
    for (var idx in newEdges) {
        graph.storedEdges[idx] = newEdges[idx];
    }
    
    return graph.storedEdges;
}

graph.shortenName = function(name) {
    if (!name.match(/\s/) || name.length < 15) {
        return name;
    }
    
    var matches = name.match(/\b(\w)/g);
    return matches.join('');    
}

graph.show =  function(clicked, nodeLocationsSet) {    
    var tree = graph.layout,
        diagonal = graph.diagonal,
        root = graph.data;
    

	var nodes = tree.nodes(root).sort(function(a,b) {
            return a.id - b.id;
        }),//.reverse(),
        edges = tree.links(nodes),
        links = edges.filter(function(e) {
            return e.source !== root;
        }),
        lines = edges.filter(function(e) {
            return e.source === root;
        });
    
    if (!clicked) {
        clicked = root;
    }
    
    var oldSourceLocation = {
        x: ~~clicked.x0,
        y: ~~clicked.y0
    };
    
    var oldTargetLocation = function(d) {
        if (nodeLocationsSet) return {
            x: d.mapX,
            y: d.mapY
        };
        return oldSourceLocation;
    }
    
    var node = graph.nodes.selectAll("g.node")
        .data(nodes, function(d) { return (typeof d.id === 'undefined') ? (d.id = ++graph.idgen) : d.id; });
    
    var updatedLinks = graph.updateEdges(links);
    links = [];
    for (var idx in updatedLinks) {
        links.push(updatedLinks[idx]);
    }

	var link = graph.edges.selectAll("path.link")
		.data(links);
    
	var line = graph.edges.selectAll("line")
	    .data(lines);
        
    var dummyDiagonal = function(d) {
        return function(e) {
            return diagonal({
                source: d,
                target: d
            });
        };
    };
        
    var lineEnter = line.enter()
	    .append("line")
        .attr("x1", function(d){
		    return graph.fromPolarX(oldSourceLocation);
        })
        .attr("y1", function(d){
	        return graph.fromPolarY(oldSourceLocation);
	    })
        .attr("x2", function(d) { 
            return graph.fromPolarX(oldTargetLocation(d.target)); 
        })
        .attr("y2", function(d) { 
            return graph.fromPolarY(oldTargetLocation(d.target));
        })
	    .attr("stroke-width", 2)
        .attr("class", "line")
        .on("mouseover", graph.mouseOver)
        .on("mouseout", graph.mouseOut);
        
    if (nodeLocationsSet) {
        lineEnter.attr("stroke-opacity", 1e-6);
    }
    
    link.enter()
        .append("path")
		.attr("class", "link")
		.attr("d", dummyDiagonal(oldSourceLocation))
        .attr("id", function(e) {
            return "" + e.target.id;
        })
        .on("mouseover", graph.mouseOver)
        .on("mouseout", graph.mouseOut);
            
	var nodeEnter = node
    	.enter().append("g")
    	.attr("class", "node")
    	.attr("transform", function(d) {
            var t = oldTargetLocation(d);
            return "rotate(" + (t.x - 90) +")translate(" + t.y + ")"; 
        })
        .on("click", graph.toggle)
        .on("mouseover", graph.mouseOver)
        .on("mouseout", graph.mouseOut);
 
    nodeEnter.append("circle")
        .attr("r", (nodeLocationsSet ? 1e-6 : 2.5));
 
    nodeEnter.append("text")
        .attr("dy", ".31em")
    	.text(function(d) { return "    " + graph.shortenName(d.name) + "    "; })
        .attr('fill-opacity', 1e-6)
        .attr('stroke-opacity', 1e-6)
        .attr("class", "graph");
    
    var nodeUpdate = node.transition()
        .duration(graph.duration).ease('quad', 'out')
        .attr("transform", function(d) { return "rotate(" + (d.x - 90) + ")translate(" + d.y + ")"});
        
    if (nodeLocationsSet) {
        node.transition().duration(graph.duration / 10).ease('quad', 'out')
            .select("circle").attr("r", 2.5);
    }
        
    nodeUpdate.select("text")
        .style("fill-opacity", 1)
        .style("stroke-opacity", 1)
    	.attr("transform", 
            function(d) {
                return (d.x < 180)
                        ? "translate(0)"
                        : "rotate(180)translate(-0)";
            }
        )
        .attr("text-anchor", function(d) { return d.x < 180 ? "start" : "end"; });
    
    link.transition()
        .duration(graph.duration).ease('quad', 'out')
        .attr("d", diagonal);
    
    line.transition()
        .duration(graph.duration).ease('quad', 'out')
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
        })
        .attr("stroke-opacity", 1);
        
    var nodeExit = node.exit().transition()
        .duration(graph.duration).ease('quad')
        .attr("transform", function() { return "rotate(" + (clicked.x - 90) + ")translate(" + clicked.y + ")"})
        .remove();
    
    nodeExit.select("text")
        .style("fill-opacity", 1e-6);
    
    link.exit().transition()
        .duration(graph.duration).ease('quad')
        .attr("d", dummyDiagonal(clicked))
        .remove();
    
    line.exit().transition()
        .duration(graph.duration).ease('quad')
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

graph.updateHighlights = function() {
    var tree = graph.layout,
        diagonal = graph.diagonal,
        root = graph.data;
    
	var nodes = tree.nodes(root).sort(function(a,b) {
            return a.id - b.id;
        }),
        edges = tree.links(nodes),
        links = edges.filter(function(e) {
            return e.source !== root;
        }),
        lines = edges.filter(function(e) {
            return e.source === root;
        });
    
    var node = graph.nodes.selectAll("g.node")
        .data(nodes);
    
    var updatedLinks = graph.updateEdges(links);
        links = [];
    for (var idx in updatedLinks) {
        links.push(updatedLinks[idx]);
    }

    var link = graph.edges.selectAll("path.link")
    	.data(links);
    
    var line = graph.edges.selectAll("line")
        .data(lines);
    
    node.attr("class", function(d) {
            return d.highlight ? "node graphhighlight" : "node";
        });
        
    link.attr("class", function(e) {
            return e.target.highlight ? "link graphhighlight" : "link";
        });
        
    line.attr("class", function(e) {
            return e.target.highlight ? "line graphhighlight" : "line";
        });
}

graph.mouseOver = function(node, id, repeat) {
    if (typeof node.target !== 'undefined') {
        node = node.target;
    }
    
    graph.mouseOverTimer = false;
    
    graph.hoveredElem = node.name;
    
    var setHighlight = function(n) {
        var highlight = (n.name === node.name);
        if (n.children) {
            n.children.forEach(
                function(child) {
                    highlight |= setHighlight(child);
                }
            );
        }
        return (n.highlight = highlight);
    }
    
    // set the highlights
    setHighlight(graph.data);
    
    // show the update
    graph.updateHighlights();
}

graph.mouseOut = function(node, id, repeat) {
    if (typeof node.target !== 'undefined') {
        node = node.target;
    }
    
    var clearHighlight = function(n) {
        n.highlight = false;
        if (n.children) {
            n.children.forEach(
                clearHighlight
            );
        }
    }
    
    // clear the highlights
    clearHighlight(graph.data);
    
    // show the update
    graph.updateHighlights();
}

graph.toggle = function(node) {
    if (node === graph.data) {
        return;
    }
    
    if (typeof node.children === 'undefined') {
        node.parent.expandChild(node.name);
    } else {
        delete node.children;
    }
    
    graph.show(node);
}