import { prisma } from '../config/database';

export async function updateProfile(userId: string, data: { name?: string; avatar?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data,
    select: { id: true, name: true, email: true, avatar: true, updatedAt: true },
  });
}

export async function saveTravelerProfile(userId: string, data: {
  budget?: number;
  accommodationType?: string;
  favoriteCountries?: string[];
  musicGenres?: string[];
  foodStyle?: string[];
  activities?: string[];
  climateType?: string;
  travelFrequency?: string;
  travelStyle?: string;
  photography?: boolean;
  socialMedia?: boolean;
  adventureLevel?: string;
  travelerType?: string;
}) {
  return prisma.travelerProfile.upsert({
    where: { userId },
    create: { userId, ...data },
    update: data,
  });
}

export async function getTravelerProfile(userId: string) {
  return prisma.travelerProfile.findUnique({ where: { userId } });
}

export async function getNotifications(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });
}

export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.update({
    where: { id: notificationId, userId },
    data: { read: true },
  });
}
