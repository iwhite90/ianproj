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
    links,
    linkSource;

d3.json("getNodes", function(error, graph) {

  nodes = graph.nodes;
  links = graph.links;

  doLayout();

});

function doLayout() {

  var old = document.getElementsByTagName('svg')[0];
  old.parentNode.removeChild(old);
  svg = d3.select("body").append("svg")
      .attr("class", "jumbotron");

  var maxWidth = 0,
      maxHeight = 0;

  for (var i = 0; i < nodes.length; i++) {
    if (nodes[i].px > maxWidth) maxWidth = nodes[i].px;
    if (nodes[i].py > maxHeight) maxHeight = nodes[i].py;
  }

  width = maxWidth + 400;
  height = maxHeight + 500;

  svg.attr("width", width)
     .attr("height", height);
  force.nodes(nodes)
       .links(links)
	     .start();

  var scale = d3.scale.linear()
                      .domain([0, nodes.length])
                      .range([100, 255]);
  var invScale = d3.scale.linear()
                        .domain([0, nodes.length])
                        .range([255, 0]);

  var link =
	svg.selectAll(".link")
       .data(links)
       .enter().append("polyline")
       .attr("class", "link")
       .style("stroke-width", 2);

  var node =
	svg.selectAll(".node")
       .data(nodes)
       .enter().append("rect");

  var nodeAttrs =
    node.attr("class", "btn btn-info btn-lg")
        .attr("width", nodeWidth)
		.attr("height", nodeHeight)
		.attr("rx", 20)
		.attr("ry", 20)
        .style("fill", function(d, i) { return "rgb(0, 0, " + Math.ceil(scale(i)) + ")"; })
        .call(force.drag);

  var nodeText =
    svg.selectAll(".nodeText")
	   .data(nodes)
	   .enter().append("text");

  var textLabels =
    nodeText.attr("x", function(d) { return d.x; })
		    .attr("y", function(d) { return d.y; })
		    .text( function (d) { return d.name; })
		    .attr("class", "text")
		    .attr("id", function(d, i) { return "text_" + i;})
		    .attr("text-anchor", "middle")
		    .attr("fill", "#FFFFFF")
		    .on("click", updateText);

  var handles =
    svg.selectAll(".handle")
	   .data(nodes)
	   .enter().append("rect");

  var handleAttrs =
    handles.attr("width", 10)
           .attr("height", 10)
           .attr("rx", 3)
           .attr("ry", 3)
           .attr("class", "handle")
           .style("fill", function(d, i) { return "rgb(" + Math.ceil(invScale(i)) + ", " + Math.ceil(scale(i)) +", 0)"; })

  var handleElems = document.getElementsByClassName('handle');
  for (var i = 0; i < handleElems.length; i++) {
    handleElems[i].setAttribute("onclick", "doLinking(this, " + i + ")");
  }


  var linkElems = document.getElementsByClassName('link');
  for (var i = 0; i < linkElems.length; i++) {
    linkElems[i].setAttribute("onclick", "doDelete(this, " + i + ")");
  }

  force.on("tick", function() {
    link.attr("points", function(d) { return [d.source.x, ',', d.source.y, ' ', d.source.x + 10, ',', d.source.y, ' ', d.target.x, ',', d.target.y].join('');})

    node.attr("x", function(d) { return d.x - nodeWidth / 2; })
        .attr("y", function(d) { return d.y - nodeHeight / 2; });

    nodeText.attr("x", function(d) { return d.x; })
            .attr("y", function(d) { return d.y - 5; });

    handles.attr("x", function(d) { return d.x + 35;})
           .attr("y", function(d) { return d.y + 10;})
  });
}

function linksToString(links) {
  var result = '';
  for (var i = 0; i < links.length; i++) {
    var linkString = '{"source":' + links[i].source.index + ',"target":' + links[i].target.index + '},';
    result += linkString;
  }
  return result.substring(0, result.length - 1);
}

function saveProject() {
  d3.xhr("project")
     .header("Content-Type", "application/json")
     .post(
         '{"nodes":' + JSON.stringify(nodes) + ',"links":[' + linksToString(links) + ']}',
         function(err, rawData){
             var data = JSON.parse(rawData.responseText);
             alert(data.status);
         }
     );
}

function newTask() {
  nodes.push({"name":"New","y":50,"x":100,"fixed":1,"py":50,"px":60,"weight":1,"index":nodes.length});
  doLayout();
}

function updateText() {
  var e = d3.select(this)[0][0],
      index = e.id.replace('text_', ''),
      newText = prompt("Update the task name", e.innerHTML);

  if (newText) {
    nodes[index].name = newText;
    e.innerHTML = newText;
  }
}

function doLinking(elem, index) {
  if (!linkSource) {
    linkSource = index;
    elem.setAttribute("style", "fill: yellow;")
  }
  else if (linkSource === index) {
    linkSource = null;
    elem.setAttribute("style", "fill: red;")
  }
  else {
    var linkTarget = index,
        exists = false;

    for (var i = 0; i < links.length; i++) {
      if (links[i].source.index === linkSource && links[i].target.index === linkTarget ||
          links[i].source.index === linkTarget && links[i].target.index === linkSource) {
        exists = true;
        break;
      }
    }

    if (!exists) links.push({"source":linkSource,"target":linkTarget});
    linkSource = null;
    elem.setAttribute("style", "fill: red;")
    doLayout();
  }
}

function doDelete(elem, index) {
  if (confirm("Delete this link?")) {
    links.splice(index, 1);
    doLayout();
  }
}