
function bubbleChart() {

  var width = 940;
  var height = 400;
  var expandedHeight = 400;
  var damper = 0.102;

  var tooltip = floatingTooltip('gates_tooltip', 240);

  var center = { x: width / 2, y: height / 2 };

  var svg = null;
  var bubbles = null;
  var nodes = [];
  var species = {};

  function charge(d) {
    return -1.2 * Math.pow(d.radius, 2.0) / 8;
  }

  var force = d3.layout.force()
    .size([width, height])
    .charge(charge)
    .gravity(0.01)
    .friction(0.9);

  var fillColor = d3.scale.ordinal()
    .domain(['low', 'medium', 'high'])
    .range([colorContainer.low, colorContainer.medium, colorContainer.high]);

  function colorRange(count) {
    if (count < 500) {
      return 'low';
    } else if (count >= 500 && count < 10000) {
      return 'medium';
    } else {
      return 'high';
    }
  }

  var radiusScale = d3.scale.pow()
    .exponent(0.5)
    .range([2, 45]);

  function setPositionForSpecies() {

    var x = 160;
    var y = 40;

    Object.keys(species).map(function(d) {
      species[d].titleCenter = {
        x: x,
        y: y
      };
      species[d].center = {
        x: x,
        y: y + 80
      };
      x += width/3;

      if (x > 800) {
        x = 160;
        y += 160;
      }
    });

    expandedHeight = y + 160;
  }

  function createNodes(rawData) {
    var myNodes = rawData.map(function (d) {

      if (!species[d.tax_rank]) {
        species[d.tax_rank] = {};
      }

      return {
        id: d.taxon,
        radius: radiusScale(+d.count),
        value: d.count,
        name: d.tax_name,
        species: d.tax_rank,
        x: Math.random() * 900,
        y: Math.random() * 800
      };
    });

    myNodes.sort(function (a, b) { return b.value - a.value; });
    setPositionForSpecies();
    return myNodes;
  }

  // Create chart

  var chart = function chart(selector, rawData) {

    var maxAmount = d3.max(rawData, function (d) { return +d.count; });
    radiusScale.domain([0, maxAmount]);

    nodes = createNodes(rawData);
    force.nodes(nodes);
    
    svg = d3.select(selector)
      .append('svg')
      .attr('width', width)
      .attr('height', height);

    bubbles = svg.selectAll('.bubble')
      .data(nodes, function (d) { return d.id; });

    bubbles.enter().append('circle')
      .classed('bubble', true)
      .attr('r', 0)
      .attr('fill', function (d) { return fillColor(colorRange(d.value)); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(colorRange(d.value))).darker(); })
      .attr('stroke-width', 2)
      .on('mouseover', showDetail)
      .on('mouseout', hideDetail);

    bubbles.transition()
      .duration(2000)
      .attr('r', function (d) {return d.radius;});

    groupBubbles();
  };

  // Group/Split Bubbles

  function groupBubbles() {
    hideSpecies();

    force.on('tick', function (e) {
      bubbles.each(moveToCenter(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();

    setTimeout(function() {
      adjustSvgFrame(width, height)
    }, 400);
  }

  function splitBubbles() {
    showSpecies();
    adjustSvgFrame(width, expandedHeight);

    force.size([center.x * 2, 500 ]);

    force.on('tick', function (e) {
      bubbles.each(moveToSpecies(e.alpha))
        .attr('cx', function (d) { return d.x; })
        .attr('cy', function (d) { return d.y; });
    });

    force.start();
  }

  function adjustSvgFrame(newWidth, newHeight) {
    width = newWidth;
    height = newHeight;

    svg.attr('width', width)
      .attr('height', height);
  }

  function moveToCenter(alpha) {
    return function (d) {
      d.x = d.x + (center.x - d.x) * damper * alpha;
      d.y = d.y + (center.y - d.y) * damper * alpha;
    };
  }

  function moveToSpecies(alpha) {
    return function (d) {
      var target = species[d.species].center;
      d.x = d.x + (target.x - d.x) * damper * alpha * 1.1;
      d.y = d.y + (target.y - d.y) * damper * alpha * 1.1;
    };
  }

  function hideSpecies() {
    svg.selectAll('.species').remove();
  }

  function showSpecies() {
    var speciesData = d3.keys(species);
    var speciesName = svg.selectAll('.species')
      .data(speciesData);

    speciesName.enter().append('text')
      .attr('class', 'species')
      .attr('x', function (d) { return species[d].titleCenter.x; })
      .attr('y', function (d) { return species[d].titleCenter.y; })
      .attr('text-anchor', 'middle')
      .text(function (d) { return capitalizeFirstLetter(d); });
  }

  function capitalizeFirstLetter(string) {
    return string.charAt(0).toUpperCase() + string.slice(1);
  }

  // Show/Hide ToolTip

  function showDetail(d) {
    console.log(this);
    d3.select(this).attr('stroke', 'black');

    var content = '<span class="name">Name: </span><span class="value">' +
                  d.name +
                  '</span><br/>' +
                  '<span class="name">Count: </span><span class="value">' +
                  addCommas(d.value) +
                  '</span><br/>' +
                  '<span class="name">Species: </span><span class="value">' +
                  d.species +
                  '</span>';
    tooltip.showTooltip(content, d3.event);
  }

  function hideDetail(d) {
    d3.select(this)
      .attr('stroke', d3.rgb(fillColor(colorRange(d.value))).darker());

    tooltip.hideTooltip();
  }

  // Change Display from Toggle and Color Input

  chart.toggleDisplay = function (displayName) {
    if (displayName === 'species') {
      splitBubbles();
    } else {
      groupBubbles();
    }
  };

  chart.reColor = function() {
    fillColor = d3.scale.ordinal()
      .domain(['low', 'medium', 'high'])
      .range([colorContainer.low, colorContainer.medium, colorContainer.high]);

    bubbles
      .attr('fill', function (d) { return fillColor(colorRange(d.value)); })
      .attr('stroke', function (d) { return d3.rgb(fillColor(colorRange(d.value))).darker(); })
  };

  return chart;
}
