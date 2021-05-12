const dimensions = {
  width: 800,
  height: 800,
  margin: {
    top: 50,
    bottom: 50,
    left: 100,
    right: 100
  }
}
// make a draw dispersion function
// make that the draw one only specify what fields take to draw 
const drawScatterPlot = async (id, xData, yData) => {
  // Data

  const dataset = await d3.json('./data/general.json');
  const xAccessor = (d) => d[xData.attribute];
  const yAccessor = (d) => d[yData.attribute];

  dimensions.ctrWidth = dimensions.width - dimensions.margin.left - dimensions.margin.right;
  dimensions.ctrHeight = dimensions.height - dimensions.margin.top - dimensions.margin.bottom;

  const svg = d3.select(id)
    .append('svg')
    .attr('width', dimensions.width)
    .attr('height', dimensions.height);

  const ctr = svg.append('g')
    .attr(
      'transform',
      `translate(${dimensions.margin.left}, ${dimensions.margin.top})`
    );

  // Scales
  const xScale = d3.scaleLinear()
    .domain(d3.extent(dataset, xAccessor))
    .rangeRound([0, dimensions.ctrWidth])
    .clamp(true);

  const yScale = d3.scaleLinear()
    .domain(d3.extent(dataset, yAccessor))
    .rangeRound([dimensions.ctrHeight, 0])
    .nice()
    .clamp(true);

  const labelsGroup = ctr.append('g')
    .classed('bar-labels', true);

  // Draw Circles
  ctr.selectAll('circle')
    .data(dataset)
    .join('circle')
    .attr('cx', d => xScale(xAccessor(d)))
    .attr('cy', d => yScale(yAccessor(d)))
    .on("mouseover", function (i, d, p) {
      console.log(d);
      console.log(i);
      console.log(p);
      div.transition()
        .duration(200)
        .style("opacity", .9);
      div.html(d.casual + "<br/>" + d.casual)
        .style("left", (i.offsetX) + "px")
        .style("top", (i.offsetY - 28) + "px");
    })
    .on("mouseout", function (d) {
      div.transition()
        .duration(500)
        .style("opacity", 0);
    })
    .attr('r', 3)
    .attr('fill', 'lightblue')
    .attr('data-temp', yAccessor);

  // Axes
  const xAxis = d3.axisBottom(xScale)
    .ticks(5)
    .tickFormat((d) => d * 100 + '%');
  // .tickValues([0.4, 0.5, 0.8])

  const xAxisGroup = ctr.append('g')
    .call(xAxis)
    .style('transform', `translateY(${dimensions.ctrHeight}px)`)
    .classed('axis', true);

  xAxisGroup.append('text')
    .attr('x', dimensions.ctrWidth / 2)
    .attr('y', dimensions.margin.bottom - 0)
    .attr('fill', 'black')
    .text(xData.attributeName);

  const yAxis = d3.axisLeft(yScale);

  const yAxisGroup = ctr.append('g')
    .call(yAxis)
    .classed('axis', true);

  yAxisGroup.append('text')
    .attr('x', -dimensions.ctrHeight / 2)
    .attr('y', -dimensions.margin.left + 10)
    .attr('fill', 'black')
    .html(yData.attributeName)
    .style('transform', 'rotate(270deg)')
    .style('text-anchor', 'middle');
}

const drawSectors = async (id, datasetFilename) => {
  // Data
  const dataset = await d3.json(`./data/${datasetFilename}.json`);

  // Dimensions
  let dimensions = {
    width: 600,
    height: 600,
    margins: 10,
  }

  dimensions.ctrWidth = dimensions.width - dimensions.margins * 2
  dimensions.ctrHeight = dimensions.height - dimensions.margins * 2
  const radius = dimensions.ctrWidth / 2

  // Draw Image
  const svg = d3.select(id)
    .append("svg")
    .attr("width", dimensions.width)
    .attr("height", dimensions.height)

  const ctr = svg.append("g") // <g>
    .attr(
      "transform",
      `translate(${dimensions.margins}, ${dimensions.margins})`
    )

  // Scales
  const populationPie = d3.pie()
    .value((d) => d.value)
    .sort(null)
  const slices = populationPie(dataset)

  const arc = d3.arc()
    .outerRadius(radius)
    .innerRadius(0)
  const arcLabels = d3.arc()
    .outerRadius(radius)
    .innerRadius(60)

  const colors = d3.quantize(d3.interpolateBlues, dataset.length)
  const colorScale = d3.scaleOrdinal()
    .domain(slices.map(d => d.data.name))
    .range(d3.quantize(t => d3.interpolateSpectral(t * 0.8 + 0.1), slices.length).reverse())

  // Draw Shape
  const arcGroup = ctr.append('g')
    .attr(
      'transform',
      `translate(${dimensions.ctrHeight / 2}, ${dimensions.ctrWidth / 2})`
    )

  arcGroup.selectAll('path')
    .data(slices)
    .join('path')
    .attr('d', arc)
    .attr('fill', d => colorScale(d.data.name))

  const labelsGroup = ctr.append('g')
    .attr(
      'transform',
      `translate(${dimensions.ctrHeight / 2}, ${dimensions.ctrWidth / 2})`
    )
    .classed('labels', true)

  labelsGroup.selectAll('text')
    .data(slices)
    .join('text')
    .attr('transform', d => `translate(${arcLabels.centroid(d)})`)
    .call(
      text => text.append('tspan')
        .style('font-weight', 'bold')
        .attr('y', -4)
        .text(d => d.data.name)
    )
    .call(
      text => text.filter((d) => (d.endAngle - d.startAngle) > 0.25)
        .append('tspan')
        .attr('y', 9)
        .attr('x', 0)
        .text(d => d.data.value)
    )
}

drawScatterPlot('#chart-one',
  { attribute: 'temp', attributeName: 'Temperatura ºF' },
  { attribute: 'cnt', attributeName: 'Cantidad de Viajes' });

drawScatterPlot('#chart-two',
  { attribute: 'hum', attributeName: 'Humedad' },
  { attribute: 'cnt', attributeName: 'Cantidad de Viajes' });

drawScatterPlot('#chart-three',
  { attribute: 'windspeed', attributeName: 'Velocidad del viento' },
  { attribute: 'cnt', attributeName: 'Cantidad de Viajes' });

[
  ['four', 'weathers'],
  ['five', 'seasons'],
  ['six', 'laboral_days']
].forEach(e => drawSectors(`#chart-${e[0]}`, e[1]));
