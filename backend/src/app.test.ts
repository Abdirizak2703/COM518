import fs from 'node:fs';
import path from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';

const testDbPath = path.resolve(process.cwd(), 'data', 'placestostay.test.db');

beforeAll(async () => {
  process.env.DB_PATH = './data/placestostay.test.db';

  if (fs.existsSync(testDbPath)) {
    fs.unlinkSync(testDbPath);
  }

  const { initDb } = await import('./db/initDb');
  const { createUser } = await import('./dao/userDao');
  await initDb();

  const passwordHash = await bcrypt.hash('TestUser#1234', 10);
  await createUser({
    username: 'testuser',
    passwordHash,
    admin: false
  });
}, 30000);

describe('Session and booking flow', () => {
  it('registers a new user and allows login', async () => {
    const { createApp } = await import('./app');
    const app = createApp();
    const agent = request.agent(app);

    const registerResponse = await agent.post('/register').send({
      username: 'newclient',
      password: 'NewClient#1234',
      fullName: 'New Client',
      phone: '+34123456789',
      homeCity: 'Barcelona',
      bio: 'I travel every month for work and leisure.'
    });

    expect(registerResponse.status).toBe(201);

    const loginResponse = await agent.post('/login').send({
      username: 'newclient',
      password: 'NewClient#1234'
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.username).toBe('newclient');
  });

  it('resets password via forgot password flow', async () => {
    const { createApp } = await import('./app');
    const app = createApp();
    const agent = request.agent(app);

    const forgotResponse = await agent.post('/forgot-password').send({
      username: 'newclient',
      newPassword: 'ResetPass#1234'
    });

    expect(forgotResponse.status).toBe(200);

    const loginResponse = await agent.post('/login').send({
      username: 'newclient',
      password: 'ResetPass#1234'
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.username).toBe('newclient');
  });

  it('returns 401 on session before login', async () => {
    const { createApp } = await import('./app');
    const app = createApp();

    const response = await request(app).get('/session');
    expect(response.status).toBe(401);
  });

  it('logs in, checks session, and books successfully', async () => {
    const { createApp } = await import('./app');
    const app = createApp();
    const agent = request.agent(app);

    const loginResponse = await agent.post('/login').send({
      username: 'testuser',
      password: 'TestUser#1234'
    });

    expect(loginResponse.status).toBe(200);
    expect(loginResponse.body.user.username).toBe('testuser');

    const sessionResponse = await agent.get('/session');
    expect(sessionResponse.status).toBe(200);
    expect(sessionResponse.body.user.username).toBe('testuser');

    const tomorrow = new Date();
    tomorrow.setUTCDate(tomorrow.getUTCDate() + 1);
    const yy = String(tomorrow.getUTCFullYear() % 100).padStart(2, '0');
    const mm = String(tomorrow.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getUTCDate()).padStart(2, '0');

    const bookingResponse = await agent.post('/book').send({
      accID: 1,
      date: `${yy}${mm}${dd}`,
      npeople: 2,
      apiID: '0x574144'
    });

    expect(bookingResponse.status).toBe(201);
  });

  it('returns 409 when requested seats exceed availability', async () => {
    const { createApp } = await import('./app');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/login').send({
      username: 'testuser',
      password: 'TestUser#1234'
    });

    const soon = new Date();
    soon.setUTCDate(soon.getUTCDate() + 2);
    const yy = String(soon.getUTCFullYear() % 100).padStart(2, '0');
    const mm = String(soon.getUTCMonth() + 1).padStart(2, '0');
    const dd = String(soon.getUTCDate()).padStart(2, '0');

    const response = await agent.post('/book').send({
      accID: 1,
      date: `${yy}${mm}${dd}`,
      npeople: 20,
      apiID: '0x574144'
    });

    expect(response.status).toBe(409);
  });

  it('logs out and invalidates session', async () => {
    const { createApp } = await import('./app');
    const app = createApp();
    const agent = request.agent(app);

    await agent.post('/login').send({
      username: 'testuser',
      password: 'TestUser#1234'
    });

    const logoutResponse = await agent.post('/logout');
    expect(logoutResponse.status).toBe(204);

    const sessionResponse = await agent.get('/session');
    expect(sessionResponse.status).toBe(401);
  });
});
