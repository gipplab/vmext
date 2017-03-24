'use strict';

var preq = require('preq');
var config = require('config/config.js');

module.exports = class MathJaxRenderer {
    static renderMML(mml) {
        const mathml = mml.includes('<math', 0)
            ? mml
            : `<math xmlns="http://www.w3.org/1998/Math/MathML" id="A" class="ltx_Math" display="inline">${mml}</math>`;
        return preq.post({
            uri: config.mathoidUrl + "/svg/",
            body: {q: mathml, nospeech: true, type: "mml"}
        }).then((res) => {
            return res.body;
        }).catch(function (err) {
            console.log('problem rendering' + JSON.stringify(mathml));
            console.log('mathoid error' + JSON.stringify(err));
        });
    }
};