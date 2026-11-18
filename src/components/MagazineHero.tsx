import React from 'react';
import { ArrowRight, MapPin, MessageCircle, Sparkles, Star } from 'lucide-react';

interface MagazineHeroProps {
  nextAvailableLabel: string;
  whatsappDirectUrl: string;
  onQuickBook: (serviceId?: string) => void;
  onGoCatalog: () => void;
}

export const MagazineHero: React.FC<MagazineHeroProps> = ({
  nextAvailableLabel,
  whatsappDirectUrl,
  onQuickBook,
  onGoCatalog,
}) => {
  return (
    <section id="inicio" className="scroll-mt-24 pt-4 sm:pt-8 min-w-0">
      {/* Encabezado Editorial Centrado */}
      <div className="max-w-3xl mx-auto text-center min-w-0">
        <h1 className="font-serif text-4xl sm:text-5xl lg:text-[62px] font-medium text-[#2B1D14] leading-[1.06] tracking-tight">
          Arte en tus manos, pensado solo para ti.
        </h1>
        <p className="mt-4 sm:mt-5 text-base sm:text-lg text-[#2B1D14]/75 leading-relaxed">
          <strong className="font-semibold text-[#2B1D14]">Evolare Nail Studio</strong> por Eliana en Hacienda Casablanca, Madrid (Cundinamarca). Sesiones privadas 1 a 1 de Soft Gel, sistemas estructurales y Nail Art 3D.
        </p>

        {/* Acciones principales */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
          <button
            type="button"
            onClick={() => onQuickBook()}
            className="btn-press inline-flex items-center justify-center gap-2 px-7 py-3.5 rounded-full bg-[#2B1D14] text-white text-sm font-medium hover:bg-[#6E2331]"
          >
            <span>Agendar mi turno</span>
            <ArrowRight className="w-4 h-4" />
          </button>

          <a
            href={whatsappDirectUrl}
            target="_blank"
            rel="noreferrer"
            className="btn-press inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-full bg-[#F3DE9A] text-[#2B1D14] text-sm font-medium hover:bg-[#D9A738]/40 border border-[#D9A738]/40"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Escribir por WhatsApp</span>
          </a>
        </div>

        {/* Sello de confianza 5.0 ★ Google y hechos reales */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs sm:text-sm text-[#2B1D14]/75">
          <span className="inline-flex items-center gap-1.5 font-medium text-[#2B1D14] tabular-nums">
            <Star className="w-4 h-4 fill-[#D9A738] text-[#D9A738]" />
            5.0 / 5.0 en Google · 3 años
          </span>
          <span className="inline-flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#6E2331]" />
            Atención 1 a 1 con Eliana
          </span>
          <span className="inline-flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#6E2331]" />
            Hacienda Casablanca, Madrid
          </span>
        </div>
      </div>

      {/* Tríptico Fotográfico Asimétrico */}
      <div className="mt-8 sm:mt-10 grid grid-cols-1 md:grid-cols-12 gap-4 items-stretch">
        {/* Lateral Izquierdo: Soft Gel & Butter */}
        <button
          type="button"
          onClick={() => onQuickBook('soft-gel')}
          className="btn-press group hidden md:block md:col-span-3 relative rounded-2xl overflow-hidden border border-[#2B1D14]/10 bg-[#F7F7F8] text-left min-h-[280px]"
        >
          <img
            src="/images/look-soft-gel.jpg"
            alt="Soft Gel en amarillo mantequilla con lazo 3D"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-[#2B1D14]/80 to-transparent text-white">
            <p className="text-xs font-medium">Soft Gel &amp; Butter</p>
            <p className="text-[11px] text-white/80 tabular-nums">90 min · Agendar →</p>
          </div>
        </button>

        {/* Centro Protagonista: El Estudio */}
        <div className="md:col-span-6 relative rounded-3xl overflow-hidden border border-[#2B1D14]/10 bg-[#F7F7F8] min-h-[260px] sm:min-h-[320px] shadow-sm">
          <img
            src="/images/studio-hero.jpg"
            alt="Estudio minimalista de manicura Evolare Nail Studio en Madrid, Cundinamarca"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-x-3 bottom-3 sm:inset-x-4 sm:bottom-4 rounded-2xl bg-white/95 backdrop-blur-md p-3.5 sm:p-4 border border-[#2B1D14]/10 shadow-sm flex items-center justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-[#6E2331]">
                Próximo turno disponible
              </p>
              <p className="text-sm sm:text-base font-semibold text-[#2B1D14] tabular-nums truncate">
                {nextAvailableLabel}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onQuickBook()}
              className="btn-press shrink-0 px-4 py-2 rounded-full bg-[#6E2331] text-white text-xs font-medium hover:bg-[#2B1D14]"
            >
              Reservar
            </button>
          </div>
        </div>

        {/* Lateral Derecho: Carey & Cromados */}
        <button
          type="button"
          onClick={() => onQuickBook('sistemas-artificiales')}
          className="btn-press group hidden md:block md:col-span-3 relative rounded-2xl overflow-hidden border border-[#2B1D14]/10 bg-[#F7F7F8] text-left min-h-[280px]"
        >
          <img
            src="/images/look-carey-cromado.jpg"
            alt="Efecto carey y francés cromado dorado"
            className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.03]"
          />
          <div className="absolute inset-x-0 bottom-0 p-3.5 bg-gradient-to-t from-[#2B1D14]/80 to-transparent text-white">
            <p className="text-xs font-medium">Efecto Carey &amp; Cromados</p>
            <p className="text-[11px] text-white/80 tabular-nums">120 min · Agendar →</p>
          </div>
        </button>
      </div>

      {/* Acceso rápido al Lookbook en móvil */}
      <div className="mt-4 md:hidden flex justify-center">
        <button
          type="button"
          onClick={onGoCatalog}
          className="text-xs font-medium text-[#6E2331] underline underline-offset-4"
        >
          Ver galería de técnicas y carta completa
        </button>
      </div>
    </section>
  );
};
