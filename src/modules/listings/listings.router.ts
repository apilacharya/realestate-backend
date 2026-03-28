import { Router } from 'express';
import * as listingsController from './listings.controller';
import { auth } from '../../middleware/auth';

const router = Router();

router.get('/', auth, listingsController.getAll);
router.get('/:id', auth, listingsController.getOne);

export default router;
