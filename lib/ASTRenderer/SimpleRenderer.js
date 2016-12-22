'use strict';

const path = require('path');
const fs = require('fs');
const jsdom = require('jsdom');
const cheerio = require('cheerio');
const d3 = require('d3');
const MathJaxRenderer = require('app/lib/MathJaxRenderer');
const SVGstyles = fs.readFileSync(path.join(__dirname, 'styles.css'), 'utf8');
const SVGscripts = fs.readFileSync(path.join(__dirname, 'scripts.js'), 'utf8');

module.exports = class SimpleRenderer {
  constructor() {
    this.defaults = {
      width: 660,
      height: 550,
      minNodeWidth: 30,
      strokeWidth: 2
    };
    this.dimensions = {
      margin: {
        top: this.defaults.minNodeWidth / 2 + this.defaults.strokeWidth,
        right: this.defaults.minNodeWidth / 2 + this.defaults.strokeWidth,
        bottom: this.defaults.minNodeWidth / 2 + this.defaults.strokeWidth,
        left: this.defaults.minNodeWidth / 2 + this.defaults.strokeWidth
      }
    };
    this.dimensions.width = this.defaults.width - this.dimensions.margin.left - this.dimensions.margin.right;
    this.dimensions.height = this.defaults.height - this.dimensions.margin.top - this.dimensions.margin.bottom;

    this.window = new Promise((resolve, reject) => {
      jsdom.env({
        html: '',
        features: { QuerySelector: true },
        done: (jsdomErr, window) => {
          if (jsdomErr) reject(jsdomErr);
          window.d3 = d3.select(window.document);
          resolve(window);
        }
      });
    });

    this.marginedSVG = this.window.then((window) => {
      return {
        svg: this.renderSVGwithMarginStylesAndScript(window),
        window
      };
    });
  }

  renderSVGwithMarginStylesAndScript(window) {
    const svg = window.d3.select('body')
        .append('container').attr('class', 'container')
        .append('svg')
        .attr('width', '100%')
        .attr('height', '100%')
        .attr('viewbox', this.viewBox())
        .attr('class', 'mainSVG')
        .attr('xmlns', 'http://www.w3.org/2000/svg');

    svg.append('style').text(SVGstyles);
    svg.append('script').html(SVGscripts).attr('type', 'text/javascript');

    return svg.append('g')
        .attr('class', 'marginedSVG')
        .attr('transform', `translate(${this.dimensions.margin.left},${this.dimensions.margin.top})`);
  }

  render({ data, renderFormula: renderFormula = false }) {
    return this.marginedSVG.then(({ svg, window }) => {
      const mathJaxRenderings = [];

      // declares a tree layout and assigns the size
      const astHeight = renderFormula ? this.defaults.height - 100 : this.defaults.height;
      const treemap = d3.tree()
        .size([this.defaults.width, astHeight]);

      //  assigns the data to a hierarchy using parent-child relationships
      let nodes = d3.hierarchy(data);

      // maps the node data to the tree layout
      nodes = treemap(nodes);

      if (renderFormula) {
        const header = svg.append('g')
          .attr('transform', 'translate(0,0)')
          .attr('class', 'header');

        header.append('text')
          .attr('dx', 0)
          .attr('dy', 15)
          .attr('class', 'header__caption')
          .text('Formula:');

        mathJaxRenderings.push(
          MathJaxRenderer.renderMML(data.presentation).then((entireFormula) => {
            const svgSize = SimpleRenderer.getSVGsize(entireFormula);
              window.d3.select('.header')
              .append('g')
              .attr('transform', `translate(${this.defaults.width / 2 - svgSize.width * 5}, 0)`)
              .attr('class', 'header__formula')
              .html(entireFormula);
          })
        );
      }
      const ast = svg.append('g')
        .attr('transform', (d) => {
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
        .classed('ambiguous', d => d.data.name === 'ambiguous')
        .attr('transform', d => `translate(${d.x},${d.y})`)
        .attr('data-xref', d => d.data.id);

      // add rect and MathJaxSVG to all nodes
      node.each(function (d) {
        mathJaxRenderings.push(
          MathJaxRenderer.renderMML(d.data.nodePresentation).then((mmlSVG) => {
            const svgSize = SimpleRenderer.getSVGsize(mmlSVG);
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
          })
        );
      });
      return Promise.all(mathJaxRenderings).then(() => {
        return window.d3.select('.container').html();
      });
    });
  }

  static getSVGsize(svgString) {
    const $ = cheerio.load(svgString);
    return {
      width: $('svg').attr('width').substring(0, $('svg').attr('width').length - 2),
      height: $('svg').attr('height').substring(0, $('svg').attr('height').length - 2)
    };
  }

  viewBox() {
    return `0 0 ${this.defaults.width + this.dimensions.margin.left + this.dimensions.margin.right} ${this.defaults.height + this.dimensions.margin.top + this.dimensions.margin.bottom}`;
  }
};
