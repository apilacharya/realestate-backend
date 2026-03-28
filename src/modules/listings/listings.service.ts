import { prisma } from '../../lib/prisma';
import { GetListingsParams } from './listings.types';
import { Prisma } from '@prisma/client';

export const getListings = async (params: GetListingsParams) => {
  const {
    suburb,
    price_min,
    price_max,
    beds,
    baths,
    property_type,
    keyword,
    status,
    page,
    limit,
    sort_by,
    role,
  } = params;

  const where: Prisma.PropertyWhereInput = {};

  if (suburb) {
    where.suburb = { contains: suburb, mode: 'insensitive' };
  }
  
  if (price_min !== undefined || price_max !== undefined) {
    where.price = {};
    if (price_min !== undefined) where.price.gte = price_min;
    if (price_max !== undefined) where.price.lte = price_max;
  }

  if (beds !== undefined) {
    where.bedrooms = { gte: beds };
  }

  if (baths !== undefined) {
    where.bathrooms = { gte: baths };
  }

  if (property_type) {
    where.propertyType = property_type;
  }

  if (status) {
    where.status = status;
  }

  if (keyword) {
    where.OR = [
      { title: { contains: keyword, mode: 'insensitive' } },
      { description: { contains: keyword, mode: 'insensitive' } },
      { suburb: { contains: keyword, mode: 'insensitive' } },
      { state: { contains: keyword, mode: 'insensitive' } },
      { address: { contains: keyword, mode: 'insensitive' } },
    ];
  }

  const orderBy: Prisma.PropertyOrderByWithRelationInput = {};
  if (sort_by === 'price_asc') {
    orderBy.price = 'asc';
  } else if (sort_by === 'price_desc') {
    orderBy.price = 'desc';
  } else {
    orderBy.createdAt = 'desc';
  }

  const skip = (page - 1) * limit;

  const select: Prisma.PropertySelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    bedrooms: true,
    bathrooms: true,
    propertyType: true,
    suburb: true,
    state: true,
    address: true,
    imageUrl: true,
    status: true,
    isFeatured: true,
    createdAt: true,
    updatedAt: true,
    agentId: true,
    agent: {
      select: { id: true, name: true, email: true, phone: true }
    },
    internalNotes: role === 'ADMIN',
  };

  const [total, data] = await prisma.$transaction([
    prisma.property.count({ where }),
    prisma.property.findMany({
      where,
      orderBy,
      skip,
      take: limit,
      select,
    }),
  ]);

  return {
    data,
    meta: {
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    },
  };
};

export const getListingById = async (id: number, role?: 'USER' | 'ADMIN') => {
  const select: Prisma.PropertySelect = {
    id: true,
    title: true,
    description: true,
    price: true,
    bedrooms: true,
    bathrooms: true,
    propertyType: true,
    suburb: true,
    state: true,
    address: true,
    imageUrl: true,
    status: true,
    isFeatured: true,
    createdAt: true,
    updatedAt: true,
    agentId: true,
    agent: {
      select: { id: true, name: true, email: true, phone: true }
    },
    internalNotes: role === 'ADMIN',
  };

  const property = await prisma.property.findUnique({
    where: { id },
    select,
  });

  if (!property) {
    throw { status: 404, message: 'Listing not found' };
  }

  return property;
};
