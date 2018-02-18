const request = require('supertest');
describe('loading express', () => {
  let server;
  beforeEach(() => {
    server = require('../server').start();
  });
  afterEach(() => {
    server.close();
  });
  const endpoints = ['/','/ASTRenderer', '/mergedASTs' ,'/api-docs/#/Math']; // , '/swagger.json'
  endpoints.forEach((t) => {
    it('responds to ' + t, function testSlash(done) {
      request(server)
        .get(t)
        .expect(200, done);
    });
  });

});
