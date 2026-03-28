import { prisma } from '../../lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { env } from '../../config/env';
import { z } from 'zod';

export const registerSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2, 'Name must be at least 2 characters'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
});

export const registerUser = async (email: string, name: string, passwordRaw: string) => {
  const existingUser = await prisma.user.findUnique({ where: { email } });
  if (existingUser) {
    throw { status: 409, message: 'Email already exists' };
  }

  const hashedPassword = await bcrypt.hash(passwordRaw, 10);

  const user = await prisma.user.create({
    data: {
      email,
      name,
      password: hashedPassword,
      role: 'USER',
    },
  });

  return { id: user.id, email: user.email, name: user.name, role: user.role };
};

export const loginUser = async (email: string, passwordRaw: string) => {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const isMatch = await bcrypt.compare(passwordRaw, user.password);
  if (!isMatch) {
    throw { status: 401, message: 'Invalid credentials' };
  }

  const token = jwt.sign({ sub: user.id, role: user.role }, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN as jwt.SignOptions['expiresIn'],
  });

  return {
    user: { id: user.id, email: user.email, name: user.name, role: user.role },
    token,
  };
};

export const getUserById = async (id: number) => {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) {
    throw { status: 404, message: 'User not found' };
  }
  return { id: user.id, email: user.email, name: user.name, role: user.role };
};
