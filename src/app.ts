import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';
import { rateLimiter } from './middleware/rateLimiter';
import authRouter from './modules/auth/auth.router';
import listingsRouter from './modules/listings/listings.router';

const app = express();

app.use(cors({
  origin: env.NODE_ENV === 'production'
    ? env.ALLOWED_ORIGINS?.split(',').map(o => o.trim()).filter(Boolean)
    : 'http://localhost:5173',
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(rateLimiter);

// Routes
app.use('/api/auth', authRouter);
app.use('/api/listings', listingsRouter);

// Global Error Handler
app.use(errorHandler);

export default app;
