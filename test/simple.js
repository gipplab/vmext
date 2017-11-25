const request = require('supertest');
describe('loading express', () => {
  let server;
  beforeEach(() => {
    server = require('../server');
  });
  afterEach(() => {
    server.close();
  });
  it('responds to /', function testSlash(done) {
    request(server)
      .get('/')
      .expect(200, done);
  });
});
