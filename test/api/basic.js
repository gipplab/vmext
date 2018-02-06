const request = require('supertest');
describe('api test', () => {
  let server;
  let app;
  before(() => {
    server = require('../../server').start();
    app = require('../../server').app;
  });
  afterEach(() => {
    server.close();
  });
  const singleEndpoints = ['parseAST', 'renderPMML', 'parseCytoscapedAST', 'renderAST'];
  const mergedEndpoints = ['renderMergedAST', 'parseCytoscapedMergedAst'];
  const endpoints = singleEndpoints.concat(mergedEndpoints);
  endpoints.forEach((t) => {
    it('handle empty requests ' + t, function testSlash (done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .expect(400, done);
    });
  });
  singleEndpoints.forEach((t) => {
    it('handle invalid mathml requests ' + t, function testSlash (done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .field('mathml', '<math>this is not valid</math>')
        .expect(422, done);
    });
  });
  singleEndpoints.forEach((t) => {
    it('handle mathml requests ' + t, function testSlash (done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .field('mathml', app.locals.mml[0])
        .expect(200, done);
    });
  });
  singleEndpoints.forEach((t) => {
    it('handle single mathml requests ' + t, function testSlash (done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .field('mathml', app.locals.mml[6])
        .expect(200, done);
    });
  });
  singleEndpoints.forEach((t) => {
    it('handle presentation annotation requests ' + t, function testSlash (done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .field('mathml', app.locals.mml[7])
        .expect(200, done);
    });
  });
  mergedEndpoints.forEach((t) => {
    it('handle mathml requests ' + t, function testSlash (done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .field('reference_mathml', app.locals.mml[3])
        .field('comparison_mathml', app.locals.mml[4])
        .field('similarities', app.locals.sim[0])
        .expect(200, done);
    });
  });
  mergedEndpoints.forEach((t) => {
    it('handle invaldid mathml requests ' + t, function testSlash (done) {
      request(server)
        .post(`/api/v1/math/${t}`)
        .field('reference_mathml', '<math>this is not valid</math>')
        .field('comparison_mathml', app.locals.mml[4])
        .field('similarities', app.locals.sim[0])
        .expect(422, done);
    });
  });
});
