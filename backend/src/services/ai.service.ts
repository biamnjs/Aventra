import OpenAI from 'openai';
import { env } from '../config/env';

const client = new OpenAI({
  baseURL: env.AI_PROXY_BASE_URL,
  apiKey: env.AI_PROXY_KEY,
  timeout: 120000,
});

const MODEL = env.AI_MODEL;

interface TravelerProfile {
  budget?: number | null;
  accommodationType?: string | null;
  favoriteCountries?: string[];
  musicGenres?: string[];
  foodStyle?: string[];
  activities?: string[];
  climateType?: string | null;
  travelStyle?: string | null;
  photography?: boolean;
  socialMedia?: boolean;
  adventureLevel?: string | null;
  travelerType?: string | null;
}

async function ask(system: string, user: string, maxTokens = 2048): Promise<string> {
  const res = await client.chat.completions.create({
    model: MODEL,
    max_tokens: maxTokens,
    messages: [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
  });
  return res.choices[0].message.content ?? '';
}

function parseJson(text: string): unknown {
  const match = text.match(/\{[\s\S]*\}/);
  if (!match) throw new Error('Resposta inválida da IA');
  return JSON.parse(match[0]);
}

export async function recommendDestinations(profile: TravelerProfile) {
  const system = 'És um especialista em viagens personalizadas. Responde APENAS com JSON válido, sem texto extra.';
  const user = `Com base no perfil abaixo, recomenda 6 destinos ideais.

Perfil:
- Orçamento: ${profile.budget ? `€${profile.budget}` : 'não definido'}
- Alojamento: ${profile.accommodationType ?? 'qualquer'}
- Países favoritos: ${profile.favoriteCountries?.join(', ') || 'nenhum'}
- Géneros musicais: ${profile.musicGenres?.join(', ') || 'vários'}
- Gastronomia: ${profile.foodStyle?.join(', ') || 'variada'}
- Actividades: ${profile.activities?.join(', ') || 'várias'}
- Clima: ${profile.climateType ?? 'qualquer'}
- Estilo: ${profile.travelStyle ?? 'misto'}
- Aventura: ${profile.adventureLevel ?? 'moderado'}
- Tipo: ${profile.travelerType ?? 'genérico'}
- Fotografia: ${profile.photography ? 'sim' : 'não'}
- Redes sociais: ${profile.socialMedia ? 'sim' : 'não'}

Formato JSON:
{
  "recommendations": [
    {
      "name": "Nome do Destino",
      "country": "País",
      "reason": "Explicação de 2-3 frases personalizada",
      "highlights": ["destaque 1", "destaque 2", "destaque 3"],
      "bestFor": ["fotografia", "aventura"],
      "estimatedBudget": "€500-€800/semana",
      "bestSeason": "Primavera/Verão"
    }
  ]
}`;

  const text = await ask(system, user, 2000);
  return parseJson(text);
}

export async function generateItinerary(destination: string, days: number, profile: TravelerProfile) {
  const system = 'És um guia turístico especialista. Responde APENAS com JSON válido, sem texto extra.';
  const user = `Cria um roteiro detalhado de ${days} dias para ${destination}.

Perfil:
- Orçamento diário: ${profile.budget ? `€${Math.round(profile.budget / days)}` : 'moderado'}
- Actividades: ${profile.activities?.join(', ') || 'cultura, gastronomia'}
- Estilo: ${profile.adventureLevel ?? 'moderado'}
- Fotografia: ${profile.photography ? 'sim, incluir locais instagramáveis' : 'não prioritário'}

Formato JSON:
{
  "itinerary": [
    {
      "dayNumber": 1,
      "title": "Título do Dia",
      "activities": [
        {
          "time": "09:00",
          "name": "Nome da Actividade",
          "description": "Descrição curta",
          "location": "Localização exacta",
          "estimatedCost": 25,
          "duration": "2 horas",
          "category": "cultura|gastronomia|aventura|compras|natureza|fotografia"
        }
      ],
      "totalEstimatedCost": 120,
      "tips": "Dica especial para o dia"
    }
  ]
}`;

  const text = await ask(system, user, 4000);
  return parseJson(text);
}

export async function generatePlaylist(destination: string, musicGenres: string[], playlistType: string) {
  const typeLabels: Record<string, string> = {
    TRAVEL: 'viagem', STORIES: 'stories de Instagram', REELS: 'reels',
    SUNSET: 'pôr do sol', ROMANTIC: 'romântica', ADVENTURE: 'aventura',
  };

  const system = 'És um DJ e especialista musical. Responde APENAS com JSON válido, sem texto extra.';
  const user = `Cria uma playlist para ${typeLabels[playlistType] || 'viagem'} com destino a ${destination}.

Géneros favoritos: ${musicGenres.join(', ')}

Cria 12 músicas que misturem os géneros favoritos com músicas típicas do destino.

Formato JSON:
{
  "name": "Nome criativo da playlist",
  "description": "Descrição da playlist",
  "songs": [
    {
      "title": "Título da Música",
      "artist": "Nome do Artista",
      "genre": "Género",
      "mood": "animada|relaxante|romântica|intensa|melancólica",
      "reason": "Por que combina com a viagem"
    }
  ]
}`;

  const text = await ask(system, user, 2000);
  return parseJson(text);
}

export async function generateInstagramContent(destination: string, activityDescription: string) {
  const system = 'És um especialista em marketing digital para Instagram. Responde APENAS com JSON válido, sem texto extra.';
  const user = `Destino: ${destination}
Actividade: ${activityDescription}

Formato JSON:
{
  "caption": "Legenda principal (150-200 caracteres)",
  "hashtags": ["hashtag1", "hashtag2"],
  "instagramableSpots": [
    { "name": "Local", "bestTime": "Horário ideal", "tipPhoto": "Dica de composição" }
  ],
  "contentIdeas": [
    { "format": "Reels|Stories|Feed", "idea": "Ideia de conteúdo", "music": "Música sugerida" }
  ]
}`;

  const text = await ask(system, user, 1500);
  return parseJson(text);
}

export async function chatWithAssistant(
  message: string,
  context: { destination?: string; profile?: TravelerProfile },
  history: Array<{ role: 'user' | 'assistant'; content: string }>
) {
  const systemPrompt = `És a Ava, a assistente virtual da Aventra — plataforma de viagens personalizadas.
Respondes sempre em português de Portugal, de forma simpática, útil e concisa.
${context.destination ? `O utilizador está a planear uma viagem para ${context.destination}.` : ''}
${context.profile ? `Perfil: orçamento €${context.profile.budget ?? 'não definido'}, estilo ${context.profile.travelStyle ?? 'variado'}, actividades: ${context.profile.activities?.join(', ') || 'várias'}.` : ''}
Podes ajudar com restaurantes, horários, custos, meteorologia, dicas locais e transporte.`;

  const messages: OpenAI.ChatCompletionMessageParam[] = [
    ...history.map((h) => ({ role: h.role as 'user' | 'assistant', content: h.content })),
    { role: 'user' as const, content: message },
  ];

  const res = await client.chat.completions.create({
    model: MODEL,
    max_tokens: 1000,
    messages: [{ role: 'system', content: systemPrompt }, ...messages],
  });

  return res.choices[0].message.content ?? '';
}

export async function determineTravelerType(profile: TravelerProfile): Promise<string> {
  const system = 'Responde APENAS com JSON válido, sem texto extra.';
  const user = `Com base no perfil, determina o tipo de viajante.

Actividades: ${profile.activities?.join(', ')}
Aventura: ${profile.adventureLevel}
Orçamento: ${profile.budget}
Estilo: ${profile.travelStyle}
Fotografia: ${profile.photography}

Tipos: Explorador, Romântico, Aventureiro, Cultural, Luxo, Económico

JSON: {"type": "TipoAqui", "description": "Descrição curta de 1 frase"}`;

  const text = await ask(system, user, 200);
  try {
    const result = parseJson(text) as { type?: string };
    return result.type ?? 'Explorador';
  } catch {
    return 'Explorador';
  }
}
