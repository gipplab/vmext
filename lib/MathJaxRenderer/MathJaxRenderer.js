'use strict';

const preq = require('preq');
const config = require('config/config.js');
const log = require('lib/logger');

module.exports = {
  renderMML: (mml) => {
    /**
     * @return {string}
     */
    function toMML(mml) {
      return `<math xmlns="http://www.w3.org/1998/Math/MathML" id="A" class="ltx_Math" display="inline">${mml}</math>`;
    }

    const mathml = mml && mml.includes('<math', 0) || false ? mml : toMML(mml);
    return preq.post({
      uri: `${config.mathoidUrl}/json/`,
      body: {
        q: mathml,
        nospeech: true,
        type: 'mml'
      }
    }).then(res => res.body)
      .catch((err) => {
        log.error('Can not render MathML.', mml, err.body);
        throw err;
      }
      );
  }
};
