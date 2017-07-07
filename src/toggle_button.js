function setupButtons() {
  d3.select('#toolbar')
    .selectAll('.button')
    .on('click', function () {

      d3.selectAll('.button').classed('active', false);

      var button = d3.select(this);

      button.classed('active', true);

      var buttonId = button.attr('id');

      myBubbleChart.toggleDisplay(buttonId);
    });
}
