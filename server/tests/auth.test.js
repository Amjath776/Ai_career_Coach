/**
 * Auth Integration Tests
 * Tests signup, login, and protected route access.
 */

const request = require('supertest');
const mongoose = require('mongoose');
const app = require('../app');

const TEST_USER = {
  name: 'Test User',
  email: `test_${Date.now()}@example.com`,
  password: 'password123',
};

let authToken = '';

beforeAll(async () => {
  // Use test database
  if (process.env.MONGODB_URI && !process.env.MONGODB_URI.includes('test')) {
    const testUri = process.env.MONGODB_URI.replace(/\/[^/]+$/, '/ai_career_coach_test');
    await mongoose.disconnect();
    await mongoose.connect(testUri);
  }
});

afterAll(async () => {
  // Clean up test user
  const User = require('../models/User');
  await User.deleteOne({ email: TEST_USER.email });
  await mongoose.disconnect();
});

describe('Health Check', () => {
  test('GET /api/health returns ok', async () => {
    const res = await request(app).get('/api/health');
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('ok');
  });
});

describe('Auth — Signup', () => {
  test('Creates a new user successfully', async () => {
    const res = await request(app).post('/api/auth/signup').send(TEST_USER);
    expect(res.statusCode).toBe(201);
    expect(res.body.success).toBe(true);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toBe(TEST_USER.email);
    expect(res.body.user.password).toBeUndefined(); // password should not be returned
    authToken = res.body.token;
  });

  test('Rejects duplicate email', async () => {
    const res = await request(app).post('/api/auth/signup').send(TEST_USER);
    expect(res.statusCode).toBe(400);
  });

  test('Rejects invalid email', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Bad', email: 'not-an-email', password: '123456' });
    expect(res.statusCode).toBe(400);
  });

  test('Rejects short password', async () => {
    const res = await request(app).post('/api/auth/signup').send({ name: 'Bad', email: 'bad@test.com', password: '123' });
    expect(res.statusCode).toBe(400);
  });
});

describe('Auth — Login', () => {
  test('Logs in with correct credentials', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_USER.email, password: TEST_USER.password });
    expect(res.statusCode).toBe(200);
    expect(res.body.token).toBeDefined();
    authToken = res.body.token;
  });

  test('Rejects wrong password', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: TEST_USER.email, password: 'wrongpassword' });
    expect(res.statusCode).toBe(401);
  });

  test('Rejects non-existent email', async () => {
    const res = await request(app).post('/api/auth/login').send({ email: 'ghost@example.com', password: 'password123' });
    expect(res.statusCode).toBe(401);
  });
});

describe('Auth — Protected Routes', () => {
  test('GET /api/auth/me returns current user with valid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.user.email).toBe(TEST_USER.email);
  });

  test('GET /api/auth/me rejects without token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toBe(401);
  });

  test('GET /api/auth/me rejects invalid token', async () => {
    const res = await request(app).get('/api/auth/me').set('Authorization', 'Bearer invalidtoken123');
    expect(res.statusCode).toBe(401);
  });
});

describe('Auth — Profile Update', () => {
  test('Updates profile fields', async () => {
    const res = await request(app)
      .put('/api/auth/profile')
      .set('Authorization', `Bearer ${authToken}`)
      .send({ currentTitle: 'Software Engineer', industry: 'Technology', skills: ['JavaScript', 'React', 'Node.js'] });
    expect(res.statusCode).toBe(200);
    expect(res.body.user.currentTitle).toBe('Software Engineer');
  });
});

describe('Dashboard', () => {
  test('GET /api/dashboard returns aggregated data', async () => {
    const res = await request(app).get('/api/dashboard').set('Authorization', `Bearer ${authToken}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.data).toBeDefined();
    expect(res.body.data.stats).toBeDefined();
  });
});
