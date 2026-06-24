export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  createdAt: string;
  profile?: TravelerProfile;
}

export interface TravelerProfile {
  id: string;
  budget?: number;
  accommodationType?: string;
  favoriteCountries: string[];
  musicGenres: string[];
  foodStyle: string[];
  activities: string[];
  climateType?: string;
  travelFrequency?: string;
  travelStyle?: string;
  photography: boolean;
  socialMedia: boolean;
  adventureLevel?: string;
  travelerType?: string;
}

export interface Destination {
  id: string;
  name: string;
  country: string;
  description: string;
  imageUrl?: string;
  climate?: string;
  tags: string[];
  latitude?: number;
  longitude?: number;
  featured: boolean;
}

export interface Trip {
  id: string;
  title: string;
  status: 'PLANNING' | 'BOOKED' | 'ONGOING' | 'COMPLETED' | 'CANCELLED';
  startDate?: string;
  endDate?: string;
  budget?: number;
  notes?: string;
  destination: Pick<Destination, 'id' | 'name' | 'country' | 'imageUrl'>;
  createdAt: string;
}

export interface Playlist {
  id: string;
  name: string;
  type: 'TRAVEL' | 'STORIES' | 'REELS' | 'SUNSET' | 'ROMANTIC' | 'ADVENTURE';
  songs: Song[];
  tripId?: string;
  destination?: string;
  genres?: string[];
  createdAt: string;
}

export interface Song {
  title: string;
  artist: string;
  genre: string;
  mood?: string;
  reason?: string;
  imageUrl?: string | null;
  lastFmUrl?: string | null;
  listeners?: number | null;
  album?: string | null;
}

export interface Recommendation {
  name: string;
  country: string;
  reason: string;
  highlights: string[];
  bestFor: string[];
  estimatedBudget: string;
  bestSeason: string;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: string;
}
