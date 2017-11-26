'use strict';

const preq = require('preq');
const log = require('lib/logger');
const config = require('config/config.js');

module.exports = {
  renderMML: (mml) => {
    /**
     * @return {string}
     */
    function toMML(mml) {
      return `<math xmlns="http://www.w3.org/1998/Math/MathML" id="A" class="ltx_Math" display="inline">${mml}</math>`;
    }

    const mathml = mml.includes('<math', 0) ? mml : toMML(mml);
    return preq.post({
      uri: `${config.mathoidUrl}/svg/`,
      body: {
        q: mathml,
        nospeech: true,
        type: 'mml'
      }
    }).then(res => res.body);
  }
};
