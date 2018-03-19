const server = require('../../server');
const mathoid = require('lib/MathML/MathJaxRenderer');

describe('math rendering', () => {
  it('should render empty',(done) => {
    mathoid.renderMML('');
    done();
  });
});
