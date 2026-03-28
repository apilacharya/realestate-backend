import { Request, Response, NextFunction } from 'express';
import { listingsQuerySchema } from './listings.schema';
import * as listingsService from './listings.service';

export const getAll = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validatedQuery = listingsQuerySchema.safeParse(req.query);
    if (!validatedQuery.success) {
      return res.status(400).json({ error: 'Validation Error', details: validatedQuery.error.format() });
    }

    const role = req.user?.role;

    const result = await listingsService.getListings({
      ...validatedQuery.data,
      role: role as 'USER' | 'ADMIN' | undefined,
    });

    return res.status(200).json(result);
  } catch (err) {
    next(err);
  }
};

export const getOne = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = parseInt(req.params.id, 10);
    if (isNaN(id)) {
      return res.status(400).json({ error: 'Invalid listing ID' });
    }

    const role = req.user?.role;
    
    const property = await listingsService.getListingById(id, role as 'USER' | 'ADMIN' | undefined);

    return res.status(200).json({ data: property });
  } catch (err) {
    next(err);
  }
};
