const request = require('supertest');
describe('loading express', () => {
  let server;
  beforeEach(() => {
    server = require('../server').start();
  });
  afterEach(() => {
    server.close();
  });
  const endpoints = ['/','/ast-renderer.html', '/merged-asts.html' ,'/api-docs/#/Math']; // , '/swagger.json'
  endpoints.forEach((t) => {
    it('responds to ' + t, function testSlash(done) {
      request(server)
        .get(t)
        .expect(200, done);
    });
  });

});
