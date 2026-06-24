import { TripStatus, Prisma } from '@prisma/client';
import { prisma } from '../config/database';

export async function createTrip(userId: string, data: {
  destinationId: string;
  title: string;
  startDate?: string;
  endDate?: string;
  budget?: number;
  notes?: string;
}) {
  return prisma.trip.create({
    data: {
      userId,
      destinationId: data.destinationId,
      title: data.title,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
      budget: data.budget,
      notes: data.notes,
    },
    include: { destination: true },
  });
}

export async function getUserTrips(userId: string) {
  return prisma.trip.findMany({
    where: { userId },
    include: { destination: { select: { name: true, country: true, imageUrl: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getTripById(tripId: string, userId: string) {
  const trip = await prisma.trip.findFirst({
    where: { id: tripId, userId },
    include: {
      destination: true,
      itinerary: { orderBy: { dayNumber: 'asc' } },
      playlists: true,
    },
  });

  if (!trip) throw new Error('Viagem não encontrada');
  return trip;
}

export async function updateTrip(tripId: string, userId: string, data: {
  title?: string;
  startDate?: string;
  endDate?: string;
  status?: TripStatus;
  budget?: number;
  notes?: string;
}) {
  return prisma.trip.update({
    where: { id: tripId, userId },
    data: {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : undefined,
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    },
    include: { destination: true },
  });
}

export async function deleteTrip(tripId: string, userId: string) {
  await prisma.trip.delete({ where: { id: tripId, userId } });
}

export async function saveItinerary(tripId: string, userId: string, days: Array<{
  dayNumber: number;
  activities: unknown[];
}>) {
  await prisma.trip.findFirstOrThrow({ where: { id: tripId, userId } });

  const upserts = days.map((day) =>
    prisma.itineraryDay.upsert({
      where: { tripId_dayNumber: { tripId, dayNumber: day.dayNumber } },
      create: { tripId, dayNumber: day.dayNumber, activities: day.activities as Prisma.InputJsonValue[] },
      update: { activities: day.activities as Prisma.InputJsonValue[] },
    })
  );

  return Promise.all(upserts);
}
