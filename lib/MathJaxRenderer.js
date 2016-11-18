'use strict';

const mjAPI = require("mathjax-node/lib/mj-single.js");

mjAPI.config({
  MathJax: {
    // traditional MathJax configuration
  }
});
mjAPI.start();

module.exports = class MathJaxRenderer {
  static renderMML(mml, callback){
    mjAPI.typeset({
      math: `<math xmlns="http://www.w3.org/1998/Math/MathML" id="A" class="ltx_Math" display="inline">${mml}</math>`,
      format: "MathML",
      svg: true,
    }, (data) => {
      if (data.errors) callback (data.errors, null);
      else callback(null, data.svg);
    });
  }

}
