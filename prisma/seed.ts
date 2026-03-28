import { prisma } from '../src/lib/prisma';
import bcrypt from 'bcryptjs';

async function main() {
  // Users
  const adminPassword = await bcrypt.hash('admin123', 10);
  const userPassword = await bcrypt.hash('user123', 10);

  await prisma.user.upsert({
    where: { email: 'admin@realestate.com' },
    update: {},
    create: {
      email: 'admin@realestate.com',
      name: 'Admin User',
      password: adminPassword,
      role: 'ADMIN',
    },
  });

  await prisma.user.upsert({
    where: { email: 'user@realestate.com' },
    update: {},
    create: {
      email: 'user@realestate.com',
      name: 'John Doe',
      password: userPassword,
      role: 'USER',
    },
  });

  // Agents
  const agents = [
    { name: 'Jane Smith', email: 'jane@realestate.com', phone: '0400 123 456' },
    { name: 'Michael Chen', email: 'michael@realestate.com', phone: '0400 654 321' },
    { name: 'Alice Wong', email: 'alice@realestate.com', phone: '0400 999 888' },
  ];
  
  await prisma.agent.createMany({
    data: agents,
    skipDuplicates: true,
  });

  // Properties 
  const allAgents = await prisma.agent.findMany();
  
  const images = [
    '/images/properties/house-1.png',
    '/images/properties/apt-1.png',
    '/images/properties/town-1.png',
    '/images/properties/house-2.png',
    '/images/properties/apt-2.png'
  ];

  const titles = [
    'Modern Family Home', 'Luxury Penthouse', 'Cozy Urban Townhouse', 'Spacious Villa', 'Historic Estate', 'Minimalist Apartment', 'Beachside Retreat', 'Contemporary Loft'
  ];
  const descriptions = [
    'A stunning property with modern finishes, open-plan living, and exceptional natural light. Perfect for comfortable everyday living and entertaining.',
    'Experience luxury living at its finest with panoramic views and top-tier amenities throughout. This is a rare opportunity to secure a premium residence.',
    'Perfectly located close to transport and schools, offering a low maintenance and comfortable lifestyle in a highly sought-after neighborhood.',
    'An architectural masterpiece featuring expansive entertaining areas, high ceilings, and a private back garden oasis.',
    'Recently renovated to the highest standard, blending classic charm with modern convenience effortlessly. Move-in ready.'
  ];
  const suburbs = ['Northside', 'Southside', 'Heights', 'Riverside', 'Downtown'];
  const types = ['house', 'apartment', 'townhouse', 'land'];
  const statuses = ['available', 'available', 'available', 'under_offer', 'sold'];

  const propertyData = Array.from({ length: 35 }).map((_, i) => ({
    title: `${titles[i % titles.length]}`,
    description: descriptions[i % descriptions.length],
    price: 450000 + Math.floor(Math.abs(Math.sin(i)) * 80) * 25000,
    bedrooms: 1 + (i % 5),
    bathrooms: 1 + Math.floor(i % 3),
    propertyType: types[i % types.length] as any,
    suburb: suburbs[i % suburbs.length],
    state: i % 4 === 0 ? 'NSW' : i % 4 === 1 ? 'VIC' : 'QLD',
    address: `${10 + (i * 12)} ${['Skyline Dr', 'Maple Ave', 'Ocean Blvd', 'King St'][i % 4]}`,
    imageUrl: images[i % images.length],
    status: statuses[i % statuses.length] as 'available' | 'under_offer' | 'sold',
    internalNotes: i % 6 === 0 ? 'VIP Priority - motivated seller' : null,
    isFeatured: i % 8 === 0,
    agentId: allAgents[i % allAgents.length].id,
  }));

  await prisma.property.createMany({
    data: propertyData,
    skipDuplicates: true,
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
