import { Request } from 'express';

export interface AuthRequest extends Request {
  userId?: string;
  userEmail?: string;
}

export interface JwtPayload {
  userId: string;
  email: string;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface Activity {
  time: string;
  name: string;
  description: string;
  location: string;
  estimatedCost: number;
  duration: string;
  category: string;
}

export interface Song {
  title: string;
  artist: string;
  genre: string;
  spotifyUrl?: string;
}
