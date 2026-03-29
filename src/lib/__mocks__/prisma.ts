import { vi } from 'vitest';

export const prisma = {
  user: {
    findUnique: vi.fn(),
    create: vi.fn(),
  },
  property: {
    findMany: vi.fn(),
    findUnique: vi.fn(),
    count: vi.fn(),
  },
  $transaction: vi.fn(),
};
