import React, { useState } from 'react';
import {
  ChevronDown,
  Clock,
  CreditCard,
  Instagram,
  MapPin,
  MessageCircle,
} from 'lucide-react';
import type { BusinessHours, FaqItem } from '../types/engine';

interface StudioLocationFaqProps {
  address: string;
  mapsUrl: string;
  instagram: string;
  businessHours: BusinessHours;
  faqs: FaqItem[];
  whatsappDirectUrl: string;
}

const DAY_LABELS: Array<{ key: keyof BusinessHours; label: string }> = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
];

export const StudioLocationFaq: React.FC<StudioLocationFaqProps> = ({
  address,
  mapsUrl,
  instagram,
  businessHours,
  faqs,
  whatsappDirectUrl,
}) => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="ubicacion" className="py-12 sm:py-16 border-t border-[#2B1D14]/10 scroll-mt-20">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
          {/* Columna Izquierda: Ubicación en Madrid, Horarios Claros y Medios de Pago */}
          <div className="lg:col-span-6 space-y-6 min-w-0">
            <div>
              <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2B1D14] tracking-tight">
                Encuéntranos en Madrid, Cundinamarca
              </h2>
              <p className="mt-3 text-base text-[#2B1D14]/75 leading-relaxed">
                Un espacio íntimo y tranquilo en el sector <strong>Hacienda Casablanca</strong>, con horarios claros para que planees tu visita sin contratiempos.
              </p>
            </div>

            {/* Mapa embebido de Hacienda Casablanca, Madrid */}
            <div className="overflow-hidden rounded-2xl border border-[#2B1D14]/12 bg-white shadow-sm">
              <div className="aspect-[16/9] w-full bg-[#F7F7F8]">
                <iframe
                  title="Mapa Evolare Nail Studio — Hacienda Casablanca, Madrid, Cundinamarca"
                  src="https://www.google.com/maps?q=Hacienda+Casablanca,+Madrid,+Cundinamarca,+Colombia&output=embed"
                  className="w-full h-full border-0"
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
              <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white">
                <div className="flex items-start gap-2.5 min-w-0">
                  <MapPin className="w-4 h-4 text-[#6E2331] shrink-0 mt-1" />
                  <span className="text-sm font-medium text-[#2B1D14]">{address}</span>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-press shrink-0 inline-flex items-center justify-center px-4 py-2 rounded-full bg-[#2B1D14] text-white text-xs font-medium hover:bg-[#6E2331]"
                >
                  Abrir en Google Maps
                </a>
              </div>
            </div>

            {/* Horarios claros y Medios de Pago */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-white p-5 border border-[#2B1D14]/10">
                <div className="flex items-center gap-2 text-sm font-semibold text-[#2B1D14] mb-3">
                  <Clock className="w-4 h-4 text-[#6E2331]" />
                  <span>Horarios del Estudio</span>
                </div>
                <dl className="space-y-1.5 text-xs">
                  {DAY_LABELS.map(({ key, label }) => {
                    const sched = businessHours[key];
                    return (
                      <div key={key} className="flex justify-between gap-2">
                        <dt className="text-[#2B1D14]/70">{label}</dt>
                        <dd className="font-medium text-[#2B1D14] tabular-nums">
                          {sched ? `${sched.open} – ${sched.close}` : 'Cerrado'}
                        </dd>
                      </div>
                    );
                  })}
                </dl>
              </div>

              <div className="rounded-2xl bg-white p-5 border border-[#2B1D14]/10 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-semibold text-[#2B1D14] mb-3">
                    <CreditCard className="w-4 h-4 text-[#6E2331]" />
                    <span>Medios de Pago &amp; Redes</span>
                  </div>
                  <p className="text-xs text-[#2B1D14]/75 leading-relaxed">
                    Nequi, Daviplata, transferencia bancaria y efectivo al finalizar tu servicio. Sin anticipo para agendar.
                  </p>
                </div>

                <div className="mt-4 pt-4 border-t border-[#2B1D14]/10 flex flex-wrap gap-2">
                  <a
                    href="https://www.instagram.com/evolare_by.eli/"
                    target="_blank"
                    rel="noreferrer"
                    className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F7F7F8] border border-[#2B1D14]/15 text-xs font-medium text-[#2B1D14] hover:border-[#6E2331]"
                  >
                    <Instagram className="w-3.5 h-3.5 text-[#6E2331]" />
                    <span>{instagram}</span>
                  </a>
                  <a
                    href={whatsappDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-press inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#F3DE9A]/60 text-xs font-medium text-[#2B1D14] hover:bg-[#F3DE9A]"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Columna Derecha: Preguntas Frecuentes */}
          <div className="lg:col-span-6 min-w-0">
            <h3 className="font-serif text-2xl sm:text-3xl font-medium text-[#2B1D14] mb-5">
              Políticas &amp; Preguntas Frecuentes
            </h3>
            <div className="space-y-3">
              {faqs.map((faq, idx) => {
                const isOpen = openIndex === idx;
                return (
                  <div
                    key={faq.question}
                    className="rounded-2xl bg-white border border-[#2B1D14]/10 overflow-hidden"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenIndex(isOpen ? null : idx)}
                      aria-expanded={isOpen}
                      className="w-full flex items-center justify-between gap-4 p-5 text-left"
                    >
                      <span className="text-sm sm:text-base font-medium text-[#2B1D14]">
                        {faq.question}
                      </span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#6E2331] shrink-0 transition-transform duration-200 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="px-5 pb-5 text-sm text-[#2B1D14]/75 leading-relaxed border-t border-[#2B1D14]/5 pt-3">
                        {faq.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
