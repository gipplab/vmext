const request = require('supertest');
describe('loading express', () => {
  let server;
  beforeEach(() => {
    server = require('../server');
  });
  afterEach(() => {
    server.close();
  });
  const endpoints = ['/','/ASTRenderer', '/mergedASTs' ,'/api-docs/#/Math'];
  endpoints.forEach((t) => {
    it('responds to ' + t, function testSlash(done) {
      request(server)
        .get(t)
        .expect(200, done);
    });
  });

});
