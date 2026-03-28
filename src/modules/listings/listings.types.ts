import { ListingsQuery } from './listings.schema';

export interface GetListingsParams extends ListingsQuery {
  role?: 'USER' | 'ADMIN';
}
