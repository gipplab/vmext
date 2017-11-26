const request = require('supertest');
describe('api test', () => {
  let server;
  let app;
  beforeEach(() => {
    server = require('../../server').start();
    app = require('../../server').app;
  });
  afterEach(() => {
    server.close();
  });
  const singleEndpoints = ['parseAST','renderPMML', 'parseCytoscapedAST','renderAST'];
  const endpoints = singleEndpoints.concat([ 'renderMergedAST' ,'parseCytoscapedMergedAst']);
  endpoints.forEach((t) => {
    it('handle empty requests ' + t, function testSlash(done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .expect(400, done);
    });
  });
  singleEndpoints.forEach((t) => {
    it('handle mathml requests ' + t, function testSlash(done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .field('mathml',app.locals.mml[0])
        .expect(200, done);
    });
  });

});
