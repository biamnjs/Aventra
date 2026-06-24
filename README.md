# Aventra — Plataforma de Viagens Personalizadas

App full-stack de planeamento de viagens com IA integrada.

## Stack

- **Frontend:** React 18 + Vite + TypeScript + Tailwind CSS
- **Backend:** Express + TypeScript + Prisma + PostgreSQL
- **IA:** Claude (via proxy Eter) — recomendações, roteiros, playlists, chat

## URLs

| Ambiente | URL |
|----------|-----|
| Produção | http://187.124.39.3:3008 |
| API | http://187.124.39.3:3008/api/v1 |
| Local frontend | http://localhost:5173 |
| Local backend | http://localhost:3001 |

## Desenvolvimento local

```bash
# 1. Túnel SSH para a base de dados
ssh -i ~/.ssh/id_ed25519 -L 5433:localhost:5433 -N root@187.124.39.3

# 2. Backend
cd backend && npm run dev

# 3. Frontend
cd frontend && npm run dev
```

## Deploy para produção (VPS 187.124.39.3)

```bash
# Build e cópia do frontend
cd frontend && npm run build
scp -r dist/* root@187.124.39.3:/opt/aventra/frontend/

# Build e cópia do backend
scp -r src prisma package.json tsconfig.json root@187.124.39.3:/opt/aventra/backend/
ssh root@187.124.39.3 "cd /opt/aventra/backend && npm install && npx tsc --outDir dist && pm2 restart aventra"
```

## Funcionalidades

- Autenticação (registo/login com JWT)
- Explorar 27+ destinos com filtros
- Criar e gerir viagens
- Geração de roteiros com IA
- Playlists musicais personalizadas por destino
- Sistema de favoritos
- Chat com assistente Ava
- Questionário de perfil de viajante
