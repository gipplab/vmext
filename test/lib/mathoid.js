const server = require('../../server');
const mathoid = require('lib/MathJaxRenderer/MathJaxRenderer');

describe('math rendering', () => {
  it('should render empty',(done) => {
    mathoid.renderMML('');
    done();
  });
});
