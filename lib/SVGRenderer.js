'use strict';

const path = require('path'),
      jsdom = require('jsdom'),
      cheerio = require('cheerio'),
      d3  = require("d3"),
      MathJaxRenderer = require(path.join(process.cwd(), 'lib', 'MathJaxRenderer'));

const SVGstyles = `<![CDATA[
  .node circle {
    fill: #fff;
    stroke: steelblue;
    stroke-width: 2;
  }

  .node--leaf circle {
    stroke-dasharray: 2, 2;
  }

  .link {
    fill: none;
    stroke: #ccc;
    stroke-width: 2px;
  }

  text {
    text-anchor: middle;
    font-family: 'Georgia', serif;
    font-style: italic;
    font-size: 1rem;
    fill: #5d5d5d;
    cursor: default;
  }
]]>`

module.exports = class SVGRenderer {
  static renderSVG(data, callback) {
    jsdom.env({
      html: '',
      features: {QuerySelector: true},
      scripts: ['http://code.jquery.com/jquery.js'],
      done: function(err, window){
        window.d3 = d3.select(window.document);

        // set the dimensions and margins of the diagram
        let margin = {top: 40, right: 90, bottom: 50, left: 90},
            width = 660 - margin.left - margin.right,
            height = 500 - margin.top - margin.bottom;

        // declares a tree layout and assigns the size
        let treemap = d3.tree()
            .size([width, height]);

        //  assigns the data to a hierarchy using parent-child relationships
        let nodes = d3.hierarchy(data);

        // maps the node data to the tree layout
        nodes = treemap(nodes);

        var svg = window.d3.select('body')
              .append('container').attr('class', 'container')
              .append('svg')
              .attr('width', width + margin.left + margin.right)
              .attr('height', height + margin.top + margin.bottom)
              .attr('class', 'mainSVG')
              .attr('xmlns', 'http://www.w3.org/2000/svg'),
            s = svg.append('style').text(SVGstyles),
            g = svg.append('g')
              .attr('transform', `translate(${margin.left},${margin.top})`);

            var mathjaxContainer = svg.append('g')
                             .attr('transform', `translate(${margin.left},${margin.top})`)
                             .attr('class', 'mathJaxContainer');

        // adds the links between the nodes
        let link = g.selectAll('.link')
            .data( nodes.descendants().slice(1))
          .enter().append('path')
            .attr('class', 'link')
            .attr('d', function(d) {
               return "M" + d.x + "," + d.y
                 + "C" + d.x + "," + (d.y + d.parent.y) / 2
                 + " " + d.parent.x + "," +  (d.y + d.parent.y) / 2
                 + " " + d.parent.x + "," + d.parent.y;
               });

        // adds each node as a group
        let node = g.selectAll('.node')
            .data(nodes.descendants())
          .enter().append('g')
            .attr('class', (d) => "node" + (d.children ? ' node--internal' : ' node--leaf'))
            .attr('transform', (d) => `translate(${d.x},${d.y})`);

        // adds the circle to the node
        node.append('circle')
            .attr('r', 15)
            .each(function(d) {
              if(d.data.name === 'ambiguous') {
                MathJaxRenderer.renderMML(`<math xmlns="http://www.w3.org/1998/Math/MathML" id="A" class="ltx_Math" display="inline">${d.data.presentation}</math>`, (err, mmlSVG) => {
                  let $ = cheerio.load(mmlSVG);
                  let dimensions = {
                      width: $('svg').attr('width').substring(0,$('svg').attr('width').length-2),
                      height: $('svg').attr('height').substring(0,$('svg').attr('height').length-2),
                  }
                  d3.select(this).attr('r', dimensions.width * 6);
                  mathjaxContainer.append('g')
                                  // TODO Fix conversion from ex to pixels
                                  .attr('transform', `translate(${d.x - dimensions.width * 4},${d.y - dimensions.height * 4})`)
                                  .html(mmlSVG);
                });
              }
            });


        node.append('text')
            .attr('dy', '.35em')
            .text((d) => d.data.name === 'ambiguous' ? '': d.data.name)
            .style('fill-opacity', 1);

        // fs.writeFileSync(outputLocation, window.d3.select('.container').html())
        callback(window.d3.select('.container').html());

      }
    });
  }
}
