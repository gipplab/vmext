'use strict';

const path = require('path');
const fs = require('fs');
const jsdom = require('jsdom');
const cheerio = require('cheerio');
const d3 = require('d3');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const SVGstyles = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const SVGscripts = fs.readFileSync(path.join(__dirname, 'scripts.js'), 'utf8');

module.exports = class SVGRenderer {
  static renderSVG({ data, renderFormula: renderFormula = false }, callback) {
    jsdom.env({
      html: '',
      features: { QuerySelector: true },
      scripts: ['http://code.jquery.com/jquery.js'],
      done(jsdomErr, window) {
        if (jsdomErr) callback(jsdomErr, null);
        window.d3 = d3.select(window.document);
        const defaults = {
          maxWidth: 30,
          strokeWidth: 2
        };

        // set the dimensions and margins of the diagram
        const margin = {
          top: defaults.maxWidth / 2 + defaults.strokeWidth,
          right: defaults.maxWidth / 2 + defaults.strokeWidth,
          bottom: defaults.maxWidth / 2 + defaults.strokeWidth,
          left: defaults.maxWidth / 2 + defaults.strokeWidth
        };
        const width = 660 - margin.left - margin.right;
        const height = 550 - margin.top - margin.bottom;
        const mathJaxRenderings = [];

        // declares a tree layout and assigns the size
        const treemap = d3.tree()
                          .size([width, height - 100]);

        //  assigns the data to a hierarchy using parent-child relationships
        let nodes = d3.hierarchy(data);

        // maps the node data to the tree layout
        nodes = treemap(nodes);

        const svg = window.d3.select('body')
                             .append('container').attr('class', 'container')
                             .append('svg')
                             .attr('width', '100%')
                             .attr('height', '100%')
                             .attr('viewbox', `0 0 ${width + margin.left + margin.right} ${height + margin.top + margin.bottom}`)
                             .attr('class', 'mainSVG')
                             .attr('xmlns', 'http://www.w3.org/2000/svg');
        const styles = svg.append('style').text(SVGstyles);
        const script = svg.append('script').html(SVGscripts).attr('type', 'text/javascript');

        const mainWrapper = svg.append('g')
                       .attr('class', 'mainWrapper')
                       .attr('transform', `translate(${margin.left},${margin.top})`);

        if (renderFormula) {
          const header = mainWrapper.append('g')
                            .attr('transform', 'translate(0,0)')
                            .attr('class', 'header');

          // header.append('rect')
          //       .classed('header__background', true)
          //       .attr('width', '100%')
          //       .attr('height', '100');

          header.append('text')
                .attr('dx', 0)
                .attr('dy', 15)
                .attr('class', 'header__caption')
                .text('Formula:');

          mathJaxRenderings.push(
            new Promise((resolve, reject) => {
              MathJaxRenderer.renderMML(data.presentation, (err, entireFormula) => {
                if (err) reject(err);
                const svgSize = SVGRenderer.getSVGsize(entireFormula);
                window.d3.select('.header')
                .append('g')
                .attr('transform', `translate(${width / 2 - svgSize.width * 5},0)`)
                .attr('class', 'header__formula')
                .html(entireFormula);
                resolve();
              });
            })
          );
        }
        const ast = mainWrapper.append('g')
                     .attr('transform', d => {
                       return renderFormula ? `translate(0,${100})` :
                                             'translate(0,0)';
                     })
                     .attr('class', 'ast');

        ast.append('text')
           .attr('dx', 0)
           .attr('dy', 0)
           .attr('class', 'ast__caption')
           .text('Abstract Syntax Tree:');

        // adds the links between the nodes
        ast.selectAll('.link')
          .data(nodes.descendants().slice(1))
          .enter().append('path')
          .attr('class', 'link')
          .attr('d', (d) => {
            return 'M' + d.x + ',' + d.y
            + 'C' + d.x + ',' + (d.y + d.parent.y) / 2
            + ' ' + d.parent.x + ',' + (d.y + d.parent.y) / 2
            + ' ' + d.parent.x + ',' + d.parent.y;
          });

        // adds each node as a group
        const node = ast.selectAll('.node')
        .data(nodes.descendants())
        .enter().append('g')
        .attr('class', d => 'node' + (d.children ? ' node--internal' : ' node--leaf'))
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .attr('data-xref', d => d.data.id)

        // add rect and MathJaxSVG to all nodes
        node.each(function(d) {
          mathJaxRenderings.push(new Promise((resolve, reject) => {
            MathJaxRenderer.renderMML(d.data.nodePresentation, (mathjaxErr, mmlSVG) => {
              if (mathjaxErr) reject(mathjaxErr);
              const svgSize = SVGRenderer.getSVGsize(mmlSVG);
              const rectWidth = (svgSize.width * 9) > 30 ? svgSize.width * 9 : 30;
              const rectHeight = (svgSize.height * 9) > 30 ? svgSize.height * 9 : 30;

              d3.select(this).append('rect')
              .attr('width', rectWidth)
              .attr('height', rectHeight)
              .attr('rx', 7)
              .attr('ry', 7)
              .attr('transform', `translate(${-rectWidth / 2}, ${-rectHeight / 2})`);

              d3.select(this).append('g')
              // TODO Fix conversion from ex to pixels
              .attr('transform', `translate(${-svgSize.width * 4},${-svgSize.height * 4})`)
              .html(mmlSVG);
              resolve();
            });
          }));
        });
        Promise.all(mathJaxRenderings).then(() => {
          callback(null, window.d3.select('.container').html());
        }).catch((err) => {
          callback(err, null);
        });
      }
    });
  }

  static getSVGsize(svgString) {
    const $ = cheerio.load(svgString);
    return {
      width: $('svg').attr('width').substring(0, $('svg').attr('width').length - 2),
      height: $('svg').attr('height').substring(0, $('svg').attr('height').length - 2)
    };
  }
};
