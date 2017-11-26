const request = require('supertest');
describe('api test', () => {
  let server;
  beforeEach(() => {
    server = require('../../server').start();
  });
  afterEach(() => {
    server.close();
  });
  const endpoints = ['parseAST','renderPMML', 'renderMergedAST' ,'parseCytoscapedMergedAst', 'parseCytoscapedAST','renderAST'];
  endpoints.forEach((t) => {
    it('handle empty requests ' + t, function testSlash(done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .expect(400, done);
    });
  });

});
