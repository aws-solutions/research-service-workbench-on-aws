import request from 'supertest';
import app from '../app';

describe('/GET request', () => {
  test('should respond with a 200 status code', async () => {
    const response = await request(app).get('/').send({});
    expect(response.status).toBe(200);
  });
});
