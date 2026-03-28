import { Request, Response, NextFunction } from 'express';
import { registerSchema, loginSchema } from './auth.schema';
import * as authService from './auth.service';
import { env } from '../../config/env';

export const register = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedResult = registerSchema.safeParse(req.body);
    if (!validatedResult.success) {
      return res.status(400).json({ error: 'Validation Error', details: validatedResult.error.format() });
    }

    await authService.registerUser(
      validatedResult.data.email, 
      validatedResult.data.name, 
      validatedResult.data.password
    );
    
    return res.status(201).json({ message: 'Account created' });
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedResult = loginSchema.safeParse(req.body);
    if (!validatedResult.success) {
      return res.status(400).json({ error: 'Validation Error', details: validatedResult.error.format() });
    }

    const { user, token } = await authService.loginUser(
      validatedResult.data.email,
      validatedResult.data.password
    );

    res.cookie('token', token, {
      httpOnly: true,
      secure: env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000, 
    });

    return res.status(200).json({ message: 'Logged in', user });
  } catch (err) {
    next(err);
  }
};

export const logout = (req: Request, res: Response, next: NextFunction) => {
  res.clearCookie('token');
  return res.status(200).json({ message: 'Logged out' });
};

export const me = async (req: Request, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const user = await authService.getUserById(req.user.id);
    return res.status(200).json({ user });
  } catch (error) {
    next(error);
  }
};
