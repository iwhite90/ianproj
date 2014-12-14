var width = 0,
    height = 0,
	nodeWidth = 120,
	nodeHeight = 50;

var color = d3.scale.category20();

var force = d3.layout.force()
    .charge(-400)
    .linkDistance(30)
	  .linkStrength(0.01)
    .size([width, height]);

var svg = d3.select("body").append("svg")
    .attr("class", "jumbotron");

var nodes,
    links;

//d3.json("nodes.json", function(error, graph) {
d3.json("http://localhost:9000/getNodes", function(error, graph) {

  nodes = graph.nodes;
  links = graph.links;

  var nodesLength = nodes.length,
      linksLength = links.length,
      levels = [],
      totalLevels = 1;
      
  levels[0] = [0];

  for (var level = 0; level < totalLevels; level++) {
    var levelsArray = levels[totalLevels - 1] || [];
    var levelsLength = levelsArray.length;
    for (var i = 0; i < levelsLength; i++) {
      var startNodeIndex = levels[totalLevels - 1][i];
      
      for (var j = 0; j < linksLength; j++) {
        var link = links[j],
            target;
        
        if (link.source === startNodeIndex) {
          target = link.target;
          if (!levels[totalLevels]) levels[totalLevels] = [];
          levels[totalLevels].push(target);
        }
      }
      if (i == levelsLength - 1) totalLevels++;
    }
  }
  var maxColumns = 0;
  
  for (var i = 0; i < levels.length; i++) {
    if (levels[i].length > maxColumns) maxColumns = levels[i].length;
  }
  
//  height = levels.length * 100 + 100;
//  width = maxColumns * 200;

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].px > width) width = nodes[i].px;
    if (nodes[i].py > height) height = nodes[i].py;
  }

  width += 200;
  height += 150;
  
  svg.attr("width", width)
     .attr("height", height);
  /*
  for (var i = 0; i < levels.length; i++) {
    for (var j = 0; j < levels[i].length; j++) {
      nodes[levels[i][j]].y = 50 + 100 * i;
      nodes[levels[i][j]].x = (width / (levels[i].length + 1)) * (j + 1);
      nodes[levels[i][j]].fixed = true;
    }
  }
*/
  force.nodes(graph.nodes)
       .links(graph.links)
	     .start();	  

  var link =
	svg.selectAll(".link")
       .data(graph.links)
       .enter().append("line")
       .attr("class", "link")
       .style("stroke-width", function(d) { return Math.sqrt(d.value); });

  var node =
	svg.selectAll(".node")
       .data(graph.nodes)
       .enter().append("rect");
	   
  var nodeAttrs =
    node.attr("class", "btn btn-info btn-lg")
        .attr("width", nodeWidth)
		.attr("height", nodeHeight)
		.attr("rx", 20)
		.attr("ry", 20)
        .style("fill", function(d) { return color(2); })
        .call(force.drag);
	  
  var nodeText =
    svg.selectAll(".nodeText")
	   .data(graph.nodes)
	   .enter().append("text");
	   
  var textLabels =
    nodeText.attr("x", function(d) { return d.x; })
		    .attr("y", function(d) { return d.y; })
		    .text( function (d) { return d.name; })
		    .attr("class", "text")
		    .attr("fill", "#FFFFFF")
	  

  force.on("tick", function() {
    link.attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });

    node.attr("x", function(d) { return d.x - nodeWidth / 2; })
        .attr("y", function(d) { return d.y - nodeHeight / 2; });
		
    nodeText.attr("x", function(d) { return d.x - nodeWidth / 2 + 10; })
            .attr("y", function(d) { return d.y; });
  });
  //console.log('{"nodes":' + JSON.stringify(nodes) + ',"links":[' + linksToString(links) + ']}');
});

function linksToString(links) {
  var result = '';
  for (var i = 0; i < links.length; i++) {
    var linkString = '{"source":' + links[i].source.index + ',"target":' + links[i].target.index + '},';
    result += linkString;
  }
  return result.substring(0, result.length - 1);
}

function saveProject() {
 d3.xhr("http://localhost:9000/project")
     .header("Content-Type", "application/json")
     .post(
         '{"nodes":' + JSON.stringify(nodes) + ',"links":[' + linksToString(links) + ']}',
         function(err, rawData){
             var data = JSON.parse(rawData.responseText);
             console.log("got response", data);
         }
     );
}