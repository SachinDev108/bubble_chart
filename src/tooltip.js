
function floatingTooltip(tooltipId, width) {

  var tooltip = d3.select('body')
    .append('div')
    .attr('class', 'tooltip')
    .attr('id', tooltipId)
    .style('pointer-events', 'none');

  if (width) {
    tooltip.style('width', width);
  }

  hideTooltip();

  function showTooltip(content, event) {
    tooltip.style('opacity', 1.0)
      .html(content);

    updatePosition(event);
  }

  function hideTooltip() {
    tooltip.style('opacity', 0.0);
  }

  function updatePosition(event) {
    var xOffset = 20;
    var yOffset = 10;

    var tooltipWidth = tooltip.style('width');
    var tooltipHeight = tooltip.style('height');

    var wscrY = window.scrollY;
    var wscrX = window.scrollX;
    var curX = (document.all) ? event.clientX + wscrX : event.pageX;
    var curY = (document.all) ? event.clientY + wscrY : event.pageY;
    var ttleft = ((curX - wscrX + xOffset * 2 + tooltipWidth) > window.innerWidth) ?
                 curX - tooltipWidth - xOffset * 2 : curX + xOffset;

    if (ttleft < wscrX + xOffset) {
      ttleft = wscrX + xOffset;
    }

    var tttop = ((curY - wscrY + yOffset * 2 + tooltipHeight) > window.innerHeight) ?
                curY - tooltipHeight - yOffset * 2 : curY + yOffset;

    if (tttop < wscrY + yOffset) {
      tttop = curY + yOffset;
    }

    tooltip.style({ top: tttop + 'px', left: ttleft + 'px' });
  }

  return {
    showTooltip: showTooltip,
    hideTooltip: hideTooltip,
    updatePosition: updatePosition
  };
}
