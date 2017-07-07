var colorContainer = {
  low: '#d84b2a',
  medium: '#beccae',
  high: '#7aa25c'
};

var myBubbleChart = bubbleChart();

function display(error, data) {
  if (error) {
    console.log(error);
  }
  myBubbleChart('#vis', data.ubiome_bacteriacounts);
}

d3.json('data/bacteria.json', display);

setupColorInput();
setupButtons();
