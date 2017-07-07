function setupColorInput() {
  d3.select('.colorPickerContainer')
    .selectAll('.inputColor')
    .attr('value', function(d) { return colorContainer[this.id] })
    .on('input', function () {

      var element = d3.select('.colorPickerContainer')
        .selectAll('.inputColor');

      element[0].map(function(d) {
        colorContainer[d.id] = d.value;
      });

      myBubbleChart.reColor();
    });
}
