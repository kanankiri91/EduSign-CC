//dbconnect.test.js
var request = require("supertest");
var app = require('../index');

describe('Test the root path', () => {
  test('It should respond to the GET method', async () => {
    const res = await request(app)
      .get("/");

    expect(res.statusCode).toBe(200);
  });
})