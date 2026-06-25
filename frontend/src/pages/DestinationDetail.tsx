import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  MapPin, ArrowLeft, Heart, Star, Calendar, Music, Globe, Plus,
  ShieldCheck, ExternalLink, CheckCircle2, Thermometer, DollarSign,
} from 'lucide-react';
import { useDestination } from '../hooks/useDestinations';
import { useToggleFavorite, useIsFavorited } from '../hooks/useFavorites';
import { useAuthStore } from '../store/authStore';
import { useVisaInfo, useSavePassport, type VisaStatus } from '../hooks/useVisaInfo';
import { COUNTRIES } from '../data/countries';
import type { Destination, TravelerProfile } from '../types';

// ── helpers ───────────────────────────────────────────────────────────────────

const CLIMATE_EMOJI: Record<string, string> = {
  tropical: '🌴', temperado: '🍂', árido: '☀️', frio: '❄️',
};

const VISA_CFG: Record<VisaStatus, { label: string; bg: string; color: string }> = {
  free:       { label: 'Sem visto',         bg: '#DCFCE7', color: '#166534' },
  voa:        { label: 'Visto na chegada',  bg: '#FEF9C3', color: '#854D0E' },
  evisa:      { label: 'e-Visto online',    bg: '#DBEAFE', color: '#1E40AF' },
  required:   { label: 'Visto obrigatório', bg: '#FEE2E2', color: '#991B1B' },
  restricted: { label: 'Acesso restrito',   bg: '#1F2937', color: '#F9FAFB' },
  domestic:   { label: 'País de origem',    bg: '#FFF7ED', color: '#C2410C' },
};

function getBudget(d: Destination): { min: number; max: number } {
  const c = d.country.toLowerCase();
  if (/indonésia|tailândia|vietname|camboja|malásia|filipinas|sri lanka|nepal/.test(c)) return { min: 40, max: 80 };
  if (/índia/.test(c)) return { min: 30, max: 70 };
  if (/japão|coreia|singapura/.test(c)) return { min: 100, max: 180 };
  if (/estados unidos|canadá/.test(c)) return { min: 120, max: 220 };
  if (/austrália|nova zelândia|fiji|polinésia/.test(c)) return { min: 120, max: 200 };
  if (/emirados|catar|arábia|omã/.test(c)) return { min: 130, max: 280 };
  if (/suíça|noruega|dinamarca|islândia|suécia|finlândia/.test(c)) return { min: 120, max: 240 };
  if (/república checa|hungria|polónia|croácia|estónia|roménia|sérvia/.test(c)) return { min: 60, max: 100 };
  if (/brasil|argentina|colômbia|peru|méxico|chile|costa rica|cuba|bolívia|equador/.test(c)) return { min: 50, max: 100 };
  if (/quénia|tanzânia|sul|marrocos|egito|gana|ruanda|maurícias|seychelles|tunísia/.test(c)) return { min: 60, max: 130 };
  const byClimate: Record<string, { min: number; max: number }> = {
    árido: { min: 90, max: 170 }, frio: { min: 100, max: 180 }, tropical: { min: 60, max: 120 },
  };
  return d.climate ? (byClimate[d.climate] ?? { min: 80, max: 150 }) : { min: 80, max: 150 };
}

function getWeather(climate?: string) {
  const m: Record<string, { high: number; low: number; label: string }> = {
    tropical: { high: 32, low: 24, label: 'Quente e húmido' },
    temperado: { high: 24, low: 13, label: 'Temperado' },
    árido:    { high: 40, low: 24, label: 'Quente e seco' },
    frio:     { high: 8,  low: -2, label: 'Frio' },
  };
  return m[climate ?? ''] ?? { high: 22, low: 14, label: 'Agradável' };
}

function getBestSeason(climate?: string) {
  const m: Record<string, { months: string; desc: string }> = {
    tropical: { months: 'Nov–Mar', desc: 'Estação seca' },
    temperado: { months: 'Mai–Set', desc: 'Verão agradável' },
    árido:    { months: 'Out–Abr', desc: 'Temp. amenas' },
    frio:     { months: 'Jun–Ago', desc: 'Dias longos' },
  };
  return m[climate ?? ''] ?? { months: 'Abr–Out', desc: 'Primavera e verão' };
}

function computeCompatibility(
  destination: Destination,
  profile?: TravelerProfile | null,
): { score: number; reasons: string[] } | null {
  if (!profile) return null;
  const tagMap: Record<string, string> = {
    praia: 'Praias & mar', aventura: 'Espírito aventureiro', fotografia: 'Fotografia',
    gastronomia: 'Gastronomia local', cultura: 'Cultura e arte', natureza: 'Contacto com a natureza',
    histórico: 'Património histórico', luxo: 'Experiências premium', romântico: 'Atmosfera romântica',
    mergulho: 'Mergulho', ski: 'Desportos de inverno', família: 'Viagem em família',
    cidade: 'Vida urbana', música: 'Cena musical', 'vida noturna': 'Vida noturna',
  };
  const reasons: string[] = [];
  let pts = 0;
  if (profile.climateType === destination.climate) { pts += 20; reasons.push(`Clima ${destination.climate}`); }
  else if (profile.climateType === 'qualquer') pts += 10;
  (profile.activities ?? []).forEach(act => {
    if (destination.tags.includes(act)) {
      pts += 10;
      if (reasons.length < 3 && tagMap[act]) reasons.push(tagMap[act]!);
    }
  });
  if (profile.travelStyle && destination.tags.includes(profile.travelStyle)) {
    pts += 15;
    if (reasons.length < 3 && tagMap[profile.travelStyle]) reasons.push(tagMap[profile.travelStyle]!);
  }
  if (destination.featured) pts += 5;
  if (reasons.length < 2) {
    destination.tags.slice(0, 3).forEach(t => {
      if (reasons.length < 3 && tagMap[t]) reasons.push(tagMap[t]!);
    });
  }
  const score = Math.min(99, Math.max(52, Math.round(52 + (pts / 70) * 47)));
  return { score, reasons: [...new Set(reasons)].slice(0, 3) };
}

// ── circle progress ───────────────────────────────────────────────────────────

function CircleProgress({ value }: { value: number }) {
  const sz = 130, sw = 9, r = (sz - sw) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ * (1 - value / 100);
  return (
    <div style={{ width: sz, height: sz, position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={sz} height={sz} style={{ position: 'absolute', inset: 0, transform: 'rotate(-90deg)' }}>
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#F3F4F6" strokeWidth={sw} />
        <circle cx={sz/2} cy={sz/2} r={r} fill="none" stroke="#FF6238" strokeWidth={sw}
          strokeDasharray={circ} strokeDashoffset={offset} strokeLinecap="round"
          style={{ transition: 'stroke-dashoffset 1.2s ease-out' }}
        />
      </svg>
      <span style={{ position: 'relative', fontSize: 32, fontWeight: 800, color: '#111827' }}>{value}%</span>
    </div>
  );
}

// ── card style ────────────────────────────────────────────────────────────────

const CARD: React.CSSProperties = {
  background: '#fff',
  borderRadius: 16,
  border: '1px solid #E5E7EB',
  boxShadow: '0 2px 12px rgba(0,0,0,0.04)',
};

type HotelItem = { id: string; name: string; rating?: number; pricePerNight?: number; imageUrl?: string };

// ── page ──────────────────────────────────────────────────────────────────────

export function DestinationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuthStore();

  const { data: destination, isLoading } = useDestination(id!);
  const { data: favorited } = useIsFavorited('DESTINATION', id!);
  const toggleFavorite = useToggleFavorite();

  const [passport, setPassport] = useState<string>(user?.profile?.passportCountry ?? '');
  const { data: visaInfo, isLoading: visaLoading } = useVisaInfo(id!, passport || undefined);
  const savePassport = useSavePassport();

  function handlePassportChange(code: string) {
    setPassport(code);
    if (code && isAuthenticated) savePassport.mutate(code);
  }

  async function handleFavorite() {
    if (!isAuthenticated) { navigate('/entrar'); return; }
    await toggleFavorite.mutateAsync({
      type: 'DESTINATION', referenceId: id!,
      metadata: { name: destination?.name, country: destination?.country, imageUrl: destination?.imageUrl },
    });
  }

  // loading
  if (isLoading) {
    return (
      <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
        <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 32px 40px', display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div style={{ height: 16, width: 56, background: '#E5E7EB', borderRadius: 6 }} />
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', gap: 24 }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
              <div style={{ height: 340, background: '#E5E7EB', borderRadius: 16 }} />
              <div style={{ height: 200, background: '#E5E7EB', borderRadius: 16 }} />
              <div style={{ height: 80,  background: '#E5E7EB', borderRadius: 16 }} />
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ height: 340, background: '#E5E7EB', borderRadius: 16 }} />
              <div style={{ height: 72,  background: '#E5E7EB', borderRadius: 16 }} />
              <div style={{ height: 72,  background: '#E5E7EB', borderRadius: 16 }} />
              <div style={{ height: 72,  background: '#E5E7EB', borderRadius: 16 }} />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // not found
  if (!destination) {
    return (
      <div style={{ background: '#F9FAFB', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12 }}>
        <Globe style={{ width: 48, height: 48, color: '#D1D5DB' }} />
        <p style={{ color: '#6B7280', fontSize: 18 }}>Destino não encontrado</p>
        <Link to="/destinos" style={{ color: '#FF6238', fontSize: 14 }}>← Voltar aos destinos</Link>
      </div>
    );
  }

  const hotels = (destination.hotels ?? []) as HotelItem[];
  const budget = getBudget(destination);
  const weather = getWeather(destination.climate);
  const season = getBestSeason(destination.climate);
  const compat = computeCompatibility(destination, user?.profile);

  return (
    <div style={{ background: '#F9FAFB', minHeight: '100vh' }}>
      <div style={{ maxWidth: 1440, margin: '0 auto', padding: '20px 32px 48px' }}>

        {/* back */}
        <button
          onClick={() => navigate(-1)}
          style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, color: '#6B7280', background: 'none', border: 'none', cursor: 'pointer', marginBottom: 20 }}
          onMouseEnter={e => (e.currentTarget.style.color = '#111827')}
          onMouseLeave={e => (e.currentTarget.style.color = '#6B7280')}
        >
          <ArrowLeft style={{ width: 14, height: 14 }} /> Voltar
        </button>

        {/* ── TWO-COLUMN GRID (hero is LEFT column only) ────────────────── */}
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) 400px', gap: 24, alignItems: 'start' }}>

          {/* ── LEFT COLUMN ────────────────────────────────────────────── */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>

            {/* HERO — lives inside the left column */}
            <div style={{ position: 'relative', height: 340, borderRadius: 16, overflow: 'hidden' }}>
              {destination.imageUrl
                ? <img src={destination.imageUrl} alt={destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
                : <div style={{ width: '100%', height: '100%', background: 'linear-gradient(135deg,#FF8C6E,#FF6238)' }} />
              }
              {/* dark gradient */}
              <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(0,0,0,0.06) 0%, rgba(0,0,0,0.62) 100%)' }} />

              {/* country badge top-left */}
              <div style={{
                position: 'absolute', top: 16, left: 18,
                display: 'flex', alignItems: 'center', gap: 5,
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.22)', borderRadius: 999,
                padding: '5px 12px', color: '#fff', fontSize: 13, fontWeight: 500,
              }}>
                <MapPin style={{ width: 13, height: 13 }} />
                {destination.country}
              </div>

              {/* favorite button top-right */}
              <button
                onClick={handleFavorite}
                disabled={toggleFavorite.isPending}
                style={{
                  position: 'absolute', top: 14, right: 16,
                  width: 42, height: 42, borderRadius: '50%', border: '1.5px solid rgba(255,255,255,0.28)',
                  background: favorited ? '#FF6238' : 'rgba(255,255,255,0.15)',
                  backdropFilter: 'blur(10px)', cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  opacity: toggleFavorite.isPending ? 0.5 : 1,
                }}
              >
                <Heart style={{ width: 18, height: 18, color: '#fff', fill: favorited ? '#fff' : 'transparent' }} />
              </button>

              {/* title + rating + chips at bottom */}
              <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, padding: '0 26px 22px' }}>
                <h1 style={{ margin: 0, fontSize: 56, fontWeight: 800, color: '#fff', lineHeight: 1, letterSpacing: -1 }}>
                  {destination.name}
                </h1>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 8 }}>
                  <Star style={{ width: 14, height: 14, fill: '#FBBF24', color: '#FBBF24' }} />
                  <span style={{ fontSize: 14, color: '#fff', fontWeight: 600 }}>4.8</span>
                  <span style={{ color: 'rgba(255,255,255,0.4)' }}>·</span>
                  <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.75)' }}>{destination.country}</span>
                </div>
                {/* glass info pills */}
                <div style={{ display: 'flex', gap: 8, marginTop: 14, flexWrap: 'wrap' }}>
                  {destination.climate && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999,
                      padding: '5px 12px', color: '#fff', fontSize: 13, fontWeight: 500,
                    }}>
                      {CLIMATE_EMOJI[destination.climate]} {destination.climate}
                    </span>
                  )}
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999,
                    padding: '5px 12px', color: '#fff', fontSize: 13, fontWeight: 500,
                  }}>
                    €{budget.min}–{budget.max}/dia
                  </span>
                  <span style={{
                    display: 'inline-flex', alignItems: 'center', gap: 5,
                    background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                    border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999,
                    padding: '5px 12px', color: '#fff', fontSize: 13, fontWeight: 500,
                  }}>
                    {season.months}
                  </span>
                  {destination.climate && (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: 5,
                      background: 'rgba(255,255,255,0.18)', backdropFilter: 'blur(12px)',
                      border: '1px solid rgba(255,255,255,0.2)', borderRadius: 999,
                      padding: '5px 12px', color: '#fff', fontSize: 13, fontWeight: 500,
                    }}>
                      {weather.low}°–{weather.high}°C
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* ABOUT CARD */}
            <div style={{ ...CARD, padding: 28, height: 200, display: 'flex', alignItems: 'center', gap: 24, overflow: 'hidden' }}>
              <div style={{ flex: 1, minWidth: 0 }}>
                <h2 style={{ margin: '0 0 8px', fontSize: 20, fontWeight: 700, color: '#111827' }}>
                  Sobre {destination.name}
                </h2>
                <p style={{ margin: 0, fontSize: 15, lineHeight: 1.65, color: '#6B7280', display: '-webkit-box', WebkitLineClamp: 4, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {destination.description}
                </p>
              </div>
              {destination.imageUrl && (
                <div style={{ flexShrink: 0, width: 220, height: 140, borderRadius: 12, overflow: 'hidden' }}>
                  <img src={destination.imageUrl} alt={destination.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                </div>
              )}
            </div>

            {/* TAGS */}
            {destination.tags.length > 0 && (
              <div style={{ ...CARD, padding: '18px 22px' }}>
                <p style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Ideal para</p>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {destination.tags.map((tag) => (
                    <span
                      key={tag}
                      style={{
                        display: 'inline-flex', alignItems: 'center',
                        height: 32, padding: '0 14px', fontSize: 13, fontWeight: 500,
                        borderRadius: 999, background: '#FFF4F0', color: '#FF6238',
                        border: '1.5px solid #FFE4DB',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* HOTELS */}
            {hotels.length > 0 && (
              <div style={{ ...CARD, padding: '18px 22px' }}>
                <p style={{ margin: '0 0 14px', fontSize: 16, fontWeight: 700, color: '#111827' }}>Alojamentos sugeridos</p>
                <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 4, scrollbarWidth: 'none' }}>
                  {hotels.map((hotel) => (
                    <div
                      key={hotel.id}
                      style={{ flexShrink: 0, width: 160, borderRadius: 12, overflow: 'hidden', background: '#F9FAFB', border: '1px solid #E5E7EB', cursor: 'pointer' }}
                    >
                      <div style={{ height: 106, overflow: 'hidden', background: '#E5E7EB' }}>
                        {hotel.imageUrl
                          ? <img src={hotel.imageUrl} alt={hotel.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                          : <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                              <Globe style={{ width: 28, height: 28, color: '#D1D5DB' }} />
                            </div>
                        }
                      </div>
                      <div style={{ padding: '8px 10px' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#111827', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{hotel.name}</p>
                        {hotel.rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 2 }}>
                            <Star style={{ width: 11, height: 11, fill: '#FBBF24', color: '#FBBF24' }} />
                            <span style={{ fontSize: 12, color: '#9CA3AF' }}>{hotel.rating}</span>
                          </div>
                        )}
                        {hotel.pricePerNight && (
                          <p style={{ margin: '3px 0 0', fontSize: 13, fontWeight: 700, color: '#FF6238' }}>€{hotel.pricePerNight}<span style={{ fontSize: 11, fontWeight: 400, color: '#9CA3AF' }}>/noite</span></p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ── RIGHT COLUMN — starts at top, runs alongside hero ───────── */}
          <div style={{ position: 'sticky', top: 86, display: 'flex', flexDirection: 'column', gap: 16 }}>

            {/* COMPATIBILITY / CTA CARD */}
            <div style={{ ...CARD, padding: 24 }}>

              {compat && (
                <>
                  {/* header */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
                    <span style={{ fontSize: 15, fontWeight: 700, color: '#111827' }}>Compatibilidade</span>
                    <span style={{
                      display: 'inline-flex', alignItems: 'center',
                      height: 26, padding: '0 10px', borderRadius: 999,
                      background: '#F3F4F6', color: '#9CA3AF', fontSize: 12, fontWeight: 500,
                    }}>Perfil</span>
                  </div>

                  {/* circle centered */}
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
                    <CircleProgress value={compat.score} />
                  </div>
                  <p style={{ textAlign: 'center', fontSize: 13, color: '#9CA3AF', margin: '0 0 18px' }}>
                    compatível com o teu perfil
                  </p>

                  {/* reasons */}
                  {compat.reasons.length > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 20 }}>
                      {compat.reasons.map((r) => (
                        <div key={r} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <CheckCircle2 style={{ width: 16, height: 16, color: '#22C55E', flexShrink: 0 }} />
                          <span style={{ fontSize: 14, color: '#374151' }}>{r}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </>
              )}

              {/* Primary CTA */}
              <Link
                to={`/viagens/nova?destino=${destination.id}&nome=${encodeURIComponent(destination.name)}`}
                style={{ display: 'block', textDecoration: 'none' }}
              >
                <button style={{
                  width: '100%', height: 50, borderRadius: 12,
                  background: '#FF6238', color: '#fff', border: 'none',
                  fontSize: 15, fontWeight: 600, cursor: 'pointer',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
                }}>
                  <Calendar style={{ width: 16, height: 16 }} /> Planear viagem
                </button>
              </Link>

              {/* Secondary CTAs */}
              <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                <Link to={`/playlists?destino=${encodeURIComponent(destination.name)}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', height: 42, borderRadius: 10,
                    background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Music style={{ width: 14, height: 14 }} /> Playlist
                  </button>
                </Link>
                <Link to={`/viagens/nova?destino=${destination.id}`} style={{ flex: 1, textDecoration: 'none' }}>
                  <button style={{
                    width: '100%', height: 42, borderRadius: 10,
                    background: '#fff', color: '#374151', border: '1.5px solid #E5E7EB',
                    fontSize: 13, fontWeight: 500, cursor: 'pointer',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                  }}>
                    <Plus style={{ width: 14, height: 14 }} /> À viagem
                  </button>
                </Link>
              </div>
            </div>

            {/* BUDGET */}
            <div style={{ ...CARD, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <DollarSign style={{ width: 17, height: 17, color: '#FF6238' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>€ / dia</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>€{budget.min} – {budget.max}</p>
              </div>
            </div>

            {/* TEMPERATURE */}
            <div style={{ ...CARD, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Thermometer style={{ width: 17, height: 17, color: '#FF6238' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Temperatura</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>{weather.low}° – {weather.high}°C</p>
              </div>
            </div>

            {/* BEST SEASON */}
            <div style={{ ...CARD, padding: '16px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <Calendar style={{ width: 17, height: 17, color: '#FF6238' }} />
              </div>
              <div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Melhor época</p>
                <p style={{ margin: '2px 0 0', fontSize: 18, fontWeight: 700, color: '#111827' }}>{season.months}</p>
              </div>
            </div>

            {/* VISA */}
            <div style={{ ...CARD, padding: '16px 20px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 12 }}>
                <div style={{ width: 36, height: 36, borderRadius: 10, background: '#FFF4F0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <ShieldCheck style={{ width: 17, height: 17, color: '#FF6238' }} />
                </div>
                <p style={{ margin: 0, fontSize: 11, fontWeight: 600, color: '#9CA3AF', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requisitos de entrada</p>
              </div>
              <select
                value={passport}
                onChange={(e) => handlePassportChange(e.target.value)}
                style={{
                  width: '100%', height: 36, borderRadius: 8, border: '1px solid #E5E7EB',
                  background: '#fff', padding: '0 10px', fontSize: 13,
                  color: passport ? '#111827' : '#9CA3AF', outline: 'none',
                }}
              >
                <option value="">Selecionar passaporte</option>
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>

              {passport && visaLoading && (
                <div style={{ height: 28, background: '#F3F4F6', borderRadius: 6, marginTop: 10 }} />
              )}

              {passport && !visaLoading && visaInfo && (
                <div style={{ marginTop: 10 }}>
                  <span style={{
                    display: 'inline-block', padding: '3px 10px', borderRadius: 999,
                    fontSize: 12, fontWeight: 600,
                    background: VISA_CFG[visaInfo.status].bg, color: VISA_CFG[visaInfo.status].color,
                  }}>
                    {VISA_CFG[visaInfo.status].label}
                  </span>
                  <div style={{ marginTop: 6, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    {visaInfo.days && visaInfo.status !== 'domestic' && (
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
                        Estadia: <strong style={{ color: '#374151' }}>{visaInfo.days} dias</strong>
                      </p>
                    )}
                    {visaInfo.cost && (
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7280' }}>
                        Custo: <strong style={{ color: '#374151' }}>{visaInfo.cost}</strong>
                      </p>
                    )}
                    {visaInfo.notes && (
                      <p style={{ margin: 0, fontSize: 12, color: '#6B7280', fontStyle: 'italic' }}>{visaInfo.notes}</p>
                    )}
                  </div>
                  {visaInfo.link && (
                    <a
                      href={visaInfo.link} target="_blank" rel="noopener noreferrer"
                      style={{ display: 'inline-flex', alignItems: 'center', gap: 4, marginTop: 6, fontSize: 12, fontWeight: 500, color: '#FF6238', textDecoration: 'none' }}
                    >
                      <ExternalLink style={{ width: 11, height: 11 }} /> Informação oficial
                    </a>
                  )}
                </div>
              )}

              {!passport && (
                <p style={{ margin: '8px 0 0', fontSize: 12, color: '#D1D5DB' }}>Seleciona o passaporte para ver os requisitos.</p>
              )}
            </div>

          </div>{/* end right column */}
        </div>{/* end grid */}
      </div>
    </div>
  );
}
