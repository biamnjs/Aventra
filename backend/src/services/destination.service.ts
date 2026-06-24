import { prisma } from '../config/database';

export async function listDestinations(filters?: { country?: string; climate?: string; tags?: string[] }) {
  return prisma.destination.findMany({
    where: {
      ...(filters?.country && { country: { contains: filters.country, mode: 'insensitive' } }),
      ...(filters?.climate && { climate: filters.climate }),
      ...(filters?.tags?.length && { tags: { hasSome: filters.tags } }),
    },
    orderBy: [{ featured: 'desc' }, { name: 'asc' }],
  });
}

export async function getFeaturedDestinations() {
  return prisma.destination.findMany({
    where: { featured: true },
    take: 8,
    orderBy: { createdAt: 'desc' },
  });
}

export async function getDestinationById(id: string) {
  const destination = await prisma.destination.findUnique({
    where: { id },
    include: {
      hotels: { take: 5, orderBy: { rating: 'desc' } },
      reviews: {
        include: { user: { select: { name: true, avatar: true } } },
        take: 10,
        orderBy: { createdAt: 'desc' },
      },
    },
  });

  if (!destination) throw new Error('Destino não encontrado');
  return destination;
}

export async function searchDestinations(query: string) {
  return prisma.destination.findMany({
    where: {
      OR: [
        { name: { contains: query, mode: 'insensitive' } },
        { country: { contains: query, mode: 'insensitive' } },
        { description: { contains: query, mode: 'insensitive' } },
        { tags: { hasSome: [query.toLowerCase()] } },
      ],
    },
    take: 10,
  });
}

export async function createDestination(data: {
  name: string;
  country: string;
  description: string;
  imageUrl?: string;
  climate?: string;
  tags?: string[];
  latitude?: number;
  longitude?: number;
  featured?: boolean;
}) {
  return prisma.destination.create({ data });
}
