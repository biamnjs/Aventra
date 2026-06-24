import { Link } from 'react-router-dom';
import { Search, MapPin, Music, Brain, Star, ArrowRight, Globe, Camera, Compass } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../lib/api';
import type { Destination } from '../types';
import { Button } from '../components/ui/Button';
import { useAuthStore } from '../store/authStore';

function DestinationCard({ destination }: { destination: Destination }) {
  return (
    <Link to={`/destinos/${destination.id}`} className="group block">
      <div className="relative overflow-hidden rounded-2xl aspect-[4/3] bg-gray-100">
        {destination.imageUrl ? (
          <img
            src={destination.imageUrl}
            alt={destination.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-brand-200 to-brand-400 flex items-center justify-center">
            <MapPin className="w-12 h-12 text-white opacity-50" />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-4">
          <h3 className="text-white font-semibold text-lg leading-tight">{destination.name}</h3>
          <p className="text-white/80 text-sm">{destination.country}</p>
          <div className="flex flex-wrap gap-1 mt-2">
            {destination.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-white/20 text-white px-2 py-0.5 rounded-full backdrop-blur-sm">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

const features = [
  {
    icon: Brain,
    title: 'Recomendações com IA',
    description: 'A nossa IA analisa o teu perfil e sugere destinos que combinam contigo.',
  },
  {
    icon: Compass,
    title: 'Roteiros Personalizados',
    description: 'Gera roteiros completos dia a dia, com horários, custos e localizações.',
  },
  {
    icon: Music,
    title: 'Playlists de Viagem',
    description: 'Músicas selecionadas para cada destino e tipo de experiência.',
  },
  {
    icon: Camera,
    title: 'Planeador de Instagram',
    description: 'Descobre locais instagramáveis, poses e legendas para os teus conteúdos.',
  },
  {
    icon: Search,
    title: 'Pesquisa Inteligente',
    description: 'Encontra voos, hotéis e experiências ordenados pelo teu perfil.',
  },
  {
    icon: Globe,
    title: 'Assistente Virtual',
    description: 'Tira dúvidas sobre qualquer destino com a nossa IA disponível 24/7.',
  },
];

export function Home() {
  const { isAuthenticated } = useAuthStore();

  const { data: featuredData } = useQuery({
    queryKey: ['destinations', 'featured'],
    queryFn: async () => {
      const res = await api.get('/destinations/featured');
      return res.data.data as Destination[];
    },
  });

  return (
    <div>
      {/* Hero */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden bg-gradient-to-br from-gray-950 via-gray-900 to-brand-950">
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1600')`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-br from-gray-950/80 via-gray-900/60 to-brand-950/80" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm text-white/90 text-sm px-4 py-2 rounded-full mb-8 border border-white/20">
            <Star className="w-3.5 h-3.5 text-brand-400 fill-brand-400" />
            Plataforma de viagens com Inteligência Artificial
          </div>

          <h1 className="text-5xl sm:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
            Descubra o mundo com{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-400 to-orange-300">
              a sua personalidade
            </span>
          </h1>

          <p className="text-xl text-white/70 max-w-2xl mx-auto mb-10 leading-relaxed">
            A Aventra conhece os teus gostos, orçamento e estilo de vida para criar viagens únicas e
            roteiros feitos a pensar em ti.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {isAuthenticated ? (
              <Link to="/painel">
                <Button size="lg" className="shadow-lg shadow-brand-500/30">
                  Ir para o Painel
                  <ArrowRight className="w-4 h-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link to="/registar">
                  <Button size="lg" className="shadow-lg shadow-brand-500/30">
                    Começar Gratuitamente
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                </Link>
                <Link to="/entrar">
                  <Button size="lg" variant="secondary">
                    Já tenho conta
                  </Button>
                </Link>
              </>
            )}
          </div>

          <div className="flex items-center justify-center gap-8 mt-16 text-white/60 text-sm">
            <div className="text-center">
              <div className="text-2xl font-bold text-white">10k+</div>
              <div>Destinos</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">50k+</div>
              <div>Viajantes</div>
            </div>
            <div className="w-px h-8 bg-white/20" />
            <div className="text-center">
              <div className="text-2xl font-bold text-white">98%</div>
              <div>Satisfação</div>
            </div>
          </div>
        </div>
      </section>

      {/* Destinos em Destaque */}
      {featuredData && featuredData.length > 0 && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p className="text-brand-500 font-medium text-sm mb-2">Explorar</p>
              <h2 className="text-3xl font-bold text-gray-900">Destinos em Destaque</h2>
            </div>
            <Link to="/destinos" className="text-brand-500 text-sm font-medium hover:text-brand-600 flex items-center gap-1">
              Ver todos <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featuredData.map((d) => (
              <DestinationCard key={d.id} destination={d} />
            ))}
          </div>
        </section>
      )}

      {/* Funcionalidades */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-16">
            <p className="text-brand-500 font-medium text-sm mb-2">Porquê a Aventra?</p>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Tudo o que precisas numa só plataforma</h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Desde a descoberta do destino até à playlist da viagem — a Aventra acompanha-te em cada etapa.
            </p>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map(({ icon: Icon, title, description }) => (
              <div key={title} className="p-6 rounded-2xl border border-gray-100 hover:border-brand-200 hover:shadow-sm transition-all">
                <div className="w-10 h-10 bg-brand-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-5 h-5 text-brand-500" />
                </div>
                <h3 className="font-semibold text-gray-900 mb-2">{title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Final */}
      {!isAuthenticated && (
        <section className="py-20 max-w-7xl mx-auto px-4 sm:px-6">
          <div className="bg-gradient-to-br from-brand-500 to-brand-700 rounded-3xl p-12 text-center text-white">
            <h2 className="text-3xl font-bold mb-4">Pronto para a tua próxima aventura?</h2>
            <p className="text-white/80 mb-8 max-w-md mx-auto">
              Cria o teu perfil de viajante em minutos e deixa a IA trabalhar por ti.
            </p>
            <Link to="/registar">
              <Button size="lg" variant="secondary">
                Criar conta gratuita
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-950 text-gray-400 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 text-center text-sm">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="w-6 h-6 bg-brand-500 rounded-md flex items-center justify-center">
              <MapPin className="w-3 h-3 text-white" />
            </div>
            <span className="text-white font-semibold">Aventra</span>
          </div>
          <p>© {new Date().getFullYear()} Aventra. Descubra o mundo com a sua personalidade.</p>
        </div>
      </footer>
    </div>
  );
}
