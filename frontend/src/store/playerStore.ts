import { create } from 'zustand';

export interface Track {
  title: string;
  artist: string;
  previewUrl: string;
  mood?: string;
}

interface PlayerState {
  track: Track | null;
  isPlaying: boolean;
  setTrack: (track: Track) => void;
  togglePlay: () => void;
  stop: () => void;
}

export const usePlayerStore = create<PlayerState>((set) => ({
  track: null,
  isPlaying: false,
  setTrack: (track) => set({ track, isPlaying: true }),
  togglePlay: () => set((s) => ({ isPlaying: !s.isPlaying })),
  stop: () => set({ track: null, isPlaying: false }),
}));
