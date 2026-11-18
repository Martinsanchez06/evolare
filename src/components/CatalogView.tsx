import React, { useMemo, useState } from 'react';
import { ArrowUpRight, CalendarClock, Check, Clock, Sparkles } from 'lucide-react';
import type { ServiceItem } from '../types/engine';

interface LookItem {
  id: string;
  title: string;
  technique: string;
  description: string;
  duration: string;
  maintenance: string;
  image: string;
  imageAlt: string;
  serviceId: string;
}

const LOOKBOOK_ITEMS: LookItem[] = [
  {
    id: 'soft-gel',
    title: 'Soft Gel & Butter Cream',
    technique: 'Extensión ultraligera · Acabado natural',
    description:
      'Cobertura completa flexible con estructura almendrada, base lechosa o amarillo mantequilla, micro-cuadros y detalles en relieve.',
    duration: '90 min',
    maintenance: 'Cada 21 días',
    image: '/images/look-soft-gel.jpg',
    imageAlt: 'Uñas Soft Gel en tono amarillo mantequilla con lazo 3D y micro puntos',
    serviceId: 'soft-gel',
  },
  {
    id: 'ojo-gato',
    title: 'Ojo de Gato Borgoña',
    technique: 'Efecto magnético · Relieve metálico',
    description:
      'Profundidad aterciopelada en tono vino tinto que cambia con la luz, acentuada con trazos orgánicos plateados en 3D.',
    duration: '120 min',
    maintenance: 'Cada 21 días',
    image: '/images/look-ojo-gato.jpg',
    imageAlt: 'Uñas efecto ojo de gato borgoña con relieves metálicos plateados',
    serviceId: 'nail-art-3d',
  },
  {
    id: 'flores-3d',
    title: 'Flores 3D & Francés Texturizado',
    technique: 'Esculpido artesanal · Perlas y dorado',
    description:
      'Pétalos esculpidos a mano sobre base sheer rosada, combinados con puntas francesas en relieve y destellos dorados.',
    duration: '120 min',
    maintenance: 'Cada 21 días',
    image: '/images/look-flores-3d.jpg',
    imageAlt: 'Uñas con flores 3D esculpidas, perlas y francés blanco texturizado',
    serviceId: 'nail-art-3d',
  },
  {
    id: 'carey-cromado',
    title: 'Efecto Carey & Cromados',
    technique: 'Capas traslúcidas · Espejo champán',
    description:
      'Efecto carey ámbar y espresso con profundidad vitral, combinado con chocolate sólido y francés cromado en dorado sutil.',
    duration: '120 min',
    maintenance: 'Cada 15–21 días',
    image: '/images/look-carey-cromado.jpg',
    imageAlt: 'Uñas efecto carey ámbar y chocolate con francés cromado dorado',
    serviceId: 'sistemas-artificiales',
  },
];

interface CatalogViewProps {
  services: ServiceItem[];
  selectedServiceId: string;
  formatPrice: (price: number) => string;
  onQuickBookService: (serviceId: string) => void;
}

export const CatalogView: React.FC<CatalogViewProps> = ({
  services,
  selectedServiceId,
  formatPrice,
  onQuickBookService,
}) => {
  const [activeLookIdx, setActiveLookIdx] = useState(0);
  const [activeCategory, setActiveCategory] = useState<string>('Todos');

  const activeLook = LOOKBOOK_ITEMS[activeLookIdx];

  const categories = useMemo(() => {
    const unique = Array.from(new Set(services.map((s) => s.category || 'Servicios')));
    return ['Todos', ...unique];
  }, [services]);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'Todos') return services;
    return services.filter((s) => (s.category || 'Servicios') === activeCategory);
  }, [activeCategory, services]);

  return (
    <div className="view-enter space-y-12 sm:space-y-16">
      {/* Parte 1: Lookbook Interactivo */}
      <section>
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2B1D14] tracking-tight">
              Lookbook &amp; Carta del Estudio
            </h1>
            <p className="mt-2 text-sm sm:text-base text-[#2B1D14]/75 max-w-xl">
              Toca cualquier acabado o servicio para abrir el agendador rápido sin perder tu lugar.
            </p>
          </div>
          <a
            href="https://www.instagram.com/evolare_by.eli/"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-medium text-[#6E2331] hover:text-[#2B1D14] self-start sm:self-auto"
          >
            <span>Feed completo @evolare_by.eli</span>
            <ArrowUpRight className="w-4 h-4" />
          </a>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
          {/* Imagen destacada */}
          <div className="lg:col-span-6 min-w-0">
            <div className="relative overflow-hidden rounded-2xl bg-[#F7F7F8] border border-[#2B1D14]/10 aspect-[4/4.1]">
              <img
                key={activeLook.id}
                src={activeLook.image}
                alt={activeLook.imageAlt}
                className="w-full h-full object-cover transition-transform duration-500 ease-out hover:scale-[1.02]"
              />
              <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5 bg-gradient-to-t from-[#2B1D14]/85 via-[#2B1D14]/45 to-transparent text-white">
                <div className="flex flex-wrap items-center gap-2 mb-1.5">
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-[#F3DE9A] text-[#2B1D14] text-xs font-medium">
                    <Clock className="w-3 h-3" />
                    {activeLook.duration}
                  </span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-sm text-white text-xs font-medium">
                    Mantenimiento {activeLook.maintenance}
                  </span>
                </div>
                <p className="text-sm font-medium text-white">{activeLook.title}</p>
              </div>
            </div>

            <div className="grid grid-cols-4 gap-2.5 mt-3">
              {LOOKBOOK_ITEMS.map((item, idx) => {
                const isSelected = idx === activeLookIdx;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setActiveLookIdx(idx)}
                    aria-label={`Ver ${item.title}`}
                    className={`btn-press relative rounded-xl overflow-hidden aspect-square border-2 transition-all ${
                      isSelected
                        ? 'border-[#6E2331] ring-2 ring-[#6E2331]/20'
                        : 'border-transparent opacity-70 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={item.image}
                      alt={item.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Lista de estilos */}
          <div className="lg:col-span-6 flex flex-col gap-3 min-w-0">
            {LOOKBOOK_ITEMS.map((item, idx) => {
              const isSelected = idx === activeLookIdx;
              return (
                <div
                  key={item.id}
                  onClick={() => setActiveLookIdx(idx)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      setActiveLookIdx(idx);
                    }
                  }}
                  className={`rounded-2xl p-4 sm:p-5 border transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[#F7F7F8] border-[#6E2331]/40'
                      : 'bg-white border-[#2B1D14]/10 hover:border-[#2B1D14]/25'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h2 className="font-serif text-xl sm:text-2xl font-medium text-[#2B1D14]">
                        {item.title}
                      </h2>
                      <p className="text-xs font-medium text-[#6E2331] mt-0.5">
                        {item.technique}
                      </p>
                    </div>
                    <span
                      className={`shrink-0 w-7 h-7 rounded-full inline-flex items-center justify-center ${
                        isSelected
                          ? 'bg-[#F3DE9A] text-[#2B1D14]'
                          : 'bg-[#F7F7F8] text-[#2B1D14]/45'
                      }`}
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </span>
                  </div>

                  <p className="mt-2.5 text-sm text-[#2B1D14]/75 leading-relaxed">
                    {item.description}
                  </p>

                  {isSelected && (
                    <div className="mt-4 pt-3 border-t border-[#2B1D14]/10 flex flex-wrap items-center justify-between gap-3">
                      <span className="text-xs text-[#2B1D14]/65 tabular-nums">
                        {item.duration} · Retoque {item.maintenance.toLowerCase()}
                      </span>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onQuickBookService(item.serviceId);
                        }}
                        className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#2B1D14] text-white text-xs font-medium hover:bg-[#6E2331]"
                      >
                        <span>Agendar este estilo</span>
                        <ArrowUpRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Parte 2: Carta de Servicios & Mantenimiento */}
      <section className="pt-8 border-t border-[#2B1D14]/10">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2B1D14]">
              Carta de Servicios &amp; Mantenimiento
            </h2>
            <p className="mt-1.5 text-sm text-[#2B1D14]/75">
              Duración exacta de 60 a 120 minutos y recomendación de retoque cada 15–21 días.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const active = cat === activeCategory;
              return (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setActiveCategory(cat)}
                  className={`btn-press px-3.5 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                    active
                      ? 'bg-[#6E2331] text-white border-[#6E2331]'
                      : 'bg-[#F7F7F8] text-[#2B1D14]/80 border-[#2B1D14]/10 hover:border-[#2B1D14]/30'
                  }`}
                >
                  {cat}
                </button>
              );
            })}
          </div>
        </div>

        <div className="divide-y divide-[#2B1D14]/12 border-y border-[#2B1D14]/12">
          {filteredServices.map((service) => {
            const isSelected = service.id === selectedServiceId;
            return (
              <div
                key={service.id}
                className={`py-5 px-3 sm:px-5 transition-colors rounded-xl ${
                  isSelected ? 'bg-[#F3DE9A]/15' : 'hover:bg-[#F7F7F8]/70'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      {service.category && (
                        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full bg-[#F7F7F8] text-[#2B1D14]/75 border border-[#2B1D14]/10">
                          {service.category}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 text-xs font-medium text-[#6E2331] tabular-nums">
                        <Clock className="w-3.5 h-3.5" />
                        {service.duration_minutes} min
                      </span>
                      {service.recurrence_days && (
                        <span className="inline-flex items-center gap-1 text-xs text-[#2B1D14]/60 tabular-nums">
                          <CalendarClock className="w-3.5 h-3.5" />
                          Retoque c/{service.recurrence_days} días
                        </span>
                      )}
                    </div>
                    <h3 className="font-serif text-2xl font-medium text-[#2B1D14]">
                      {service.name}
                    </h3>
                    <p className="mt-1.5 text-sm text-[#2B1D14]/75 leading-relaxed max-w-2xl">
                      {service.description}
                    </p>
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0">
                    <span className="text-lg sm:text-xl font-semibold text-[#2B1D14] tabular-nums">
                      {formatPrice(service.price)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onQuickBookService(service.id)}
                      className={`btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-full text-xs sm:text-sm font-medium ${
                        isSelected
                          ? 'bg-[#6E2331] text-white'
                          : 'bg-[#2B1D14] text-white hover:bg-[#6E2331]'
                      }`}
                    >
                      {isSelected ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Reservar este</span>
                        </>
                      ) : (
                        <span>Reservar</span>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </div>
  );
};
