import { env } from '../config/env';

const BASE = 'https://ws.audioscrobbler.com/2.0';

interface LastFmTrack {
  imageUrl: string | null;
  lastFmUrl: string | null;
  listeners: number | null;
  duration: number | null;
  album: string | null;
}

async function fetchTrackInfo(artist: string, title: string): Promise<LastFmTrack> {
  const key = env.LASTFM_API_KEY;
  if (!key) return { imageUrl: null, lastFmUrl: null, listeners: null, duration: null, album: null };

  const url = `${BASE}/?method=track.getInfo&api_key=${key}&artist=${encodeURIComponent(artist)}&track=${encodeURIComponent(title)}&format=json&autocorrect=1`;

  const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
  if (!res.ok) return { imageUrl: null, lastFmUrl: null, listeners: null, duration: null, album: null };

  const data = await res.json() as { track?: { url?: string; listeners?: string; duration?: string; album?: { title?: string; image?: Array<{ '#text': string; size: string }> } } };
  const track = data.track;
  if (!track) return { imageUrl: null, lastFmUrl: null, listeners: null, duration: null, album: null };

  const images = track.album?.image ?? [];
  const large = images.find((i) => i.size === 'large') ?? images.find((i) => i.size === 'medium');
  const imageUrl = large?.['#text'] && !large['#text'].includes('2a96cbd8b46e442fc41c2b86b821562f')
    ? large['#text']
    : null;

  return {
    imageUrl,
    lastFmUrl: track.url ?? null,
    listeners: track.listeners ? parseInt(track.listeners, 10) : null,
    duration: track.duration ? parseInt(track.duration, 10) : null,
    album: track.album?.title ?? null,
  };
}

export async function enrichSongs(songs: Array<{ title: string; artist: string; [key: string]: unknown }>) {
  if (!env.LASTFM_API_KEY) return songs;

  const enriched = await Promise.allSettled(
    songs.map(async (song) => {
      const info = await fetchTrackInfo(song.artist, song.title);
      return { ...song, ...info };
    })
  );

  return enriched.map((r, i) => r.status === 'fulfilled' ? r.value : songs[i]);
}
