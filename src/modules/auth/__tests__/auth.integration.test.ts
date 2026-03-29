import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

vi.mock('../../../lib/prisma');

import app from '../../../app';
import { prisma } from '../../../lib/prisma';

const mockUserFindUnique = prisma.user.findUnique as ReturnType<typeof vi.fn>;
const mockUserCreate = prisma.user.create as ReturnType<typeof vi.fn>;

describe('Auth API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/auth/register', () => {
    const validBody = {
      email: 'test@example.com',
      name: 'Test User',
      password: 'TestPass1!',
    };

    it('should register a new user (201)', async () => {
      mockUserFindUnique.mockResolvedValue(null);
      mockUserCreate.mockResolvedValue({
        id: 1,
        email: validBody.email,
        name: validBody.name,
        password: 'hashed',
        role: 'USER',
      });

      const res = await request(app).post('/api/auth/register').send(validBody);

      expect(res.status).toBe(201);
      expect(res.body.message).toBe('Account created');
      expect(mockUserCreate).toHaveBeenCalledOnce();
    });

    it('should return 409 for duplicate email', async () => {
      mockUserFindUnique.mockResolvedValue({
        id: 1,
        email: validBody.email,
        name: 'Existing User',
        password: 'hashed',
        role: 'USER',
      });

      const res = await request(app).post('/api/auth/register').send(validBody);

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already exists');
      expect(mockUserCreate).not.toHaveBeenCalled();
    });

    it('should return 400 for invalid body', async () => {
      const res = await request(app)
        .post('/api/auth/register')
        .send({ email: 'not-an-email' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation Error');
    });
  });

  describe('POST /api/auth/login', () => {
    it('should login successfully and set cookie (200)', async () => {
      const hashedPassword = await bcrypt.hash('TestPass1!', 10);
      mockUserFindUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'TestPass1!' });

      expect(res.status).toBe(200);
      expect(res.body.message).toBe('Logged in');
      expect(res.body.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });

      const cookies = res.headers['set-cookie'];
      expect(cookies).toBeDefined();
      expect(String(cookies)).toContain('token=');
    });

    it('should return 401 for wrong password', async () => {
      const hashedPassword = await bcrypt.hash('TestPass1!', 10);
      mockUserFindUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: hashedPassword,
        role: 'USER',
      });

      const res = await request(app)
        .post('/api/auth/login')
        .send({ email: 'test@example.com', password: 'WrongPass1!' });

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Invalid credentials');
    });
  });

  describe('GET /api/auth/me', () => {
    it('should return current user with valid cookie', async () => {
      const token = jwt.sign(
        { sub: 1, role: 'USER' },
        process.env.JWT_SECRET!,
      );

      mockUserFindUnique.mockResolvedValue({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        password: 'hashed',
        role: 'USER',
      });

      const res = await request(app)
        .get('/api/auth/me')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.user).toMatchObject({
        id: 1,
        email: 'test@example.com',
        name: 'Test User',
        role: 'USER',
      });
    });
  });
});
