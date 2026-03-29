import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';

vi.mock('../../../lib/prisma');

import app from '../../../app';
import { prisma } from '../../../lib/prisma';

const mockTransaction = prisma.$transaction as ReturnType<typeof vi.fn>;
const mockPropertyFindUnique = prisma.property.findUnique as ReturnType<
  typeof vi.fn
>;

const createToken = (userId = 1, role = 'USER') =>
  jwt.sign({ sub: userId, role }, process.env.JWT_SECRET!);

const sampleListing = {
  id: 1,
  title: 'Test Property',
  description: 'A nice test property',
  price: 500000,
  bedrooms: 3,
  bathrooms: 2,
  propertyType: 'house',
  suburb: 'Testville',
  state: 'NSW',
  address: '123 Test St',
  imageUrl: null,
  status: 'available',
  isFeatured: false,
  createdAt: new Date('2025-01-01'),
  updatedAt: new Date('2025-01-01'),
  agentId: 1,
  agent: { id: 1, name: 'Agent Smith', email: 'agent@test.com', phone: '123' },
};

describe('Listings API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/listings', () => {
    it('should return 401 without auth', async () => {
      const res = await request(app).get('/api/listings');

      expect(res.status).toBe(401);
      expect(res.body.error).toBe('Authentication required');
    });

    it('should return paginated data with auth', async () => {
      const token = createToken();
      mockTransaction.mockResolvedValue([1, [sampleListing]]);

      const res = await request(app)
        .get('/api/listings')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toHaveLength(1);
      expect(res.body.data[0].title).toBe('Test Property');
      expect(res.body.meta).toMatchObject({
        total: 1,
        page: 1,
        limit: 10,
        total_pages: 1,
      });
    });
  });

  describe('GET /api/listings/:id', () => {
    it('should return a single listing', async () => {
      const token = createToken();
      mockPropertyFindUnique.mockResolvedValue(sampleListing);

      const res = await request(app)
        .get('/api/listings/1')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(200);
      expect(res.body.data).toMatchObject({
        id: 1,
        title: 'Test Property',
        suburb: 'Testville',
      });
    });

    it('should return 404 for non-existent listing', async () => {
      const token = createToken();
      mockPropertyFindUnique.mockResolvedValue(null);

      const res = await request(app)
        .get('/api/listings/999')
        .set('Cookie', [`token=${token}`]);

      expect(res.status).toBe(404);
      expect(res.body.error).toBe('Listing not found');
    });
  });
});
