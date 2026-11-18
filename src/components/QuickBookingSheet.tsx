import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  Sparkles,
  X,
} from 'lucide-react';
import type {
  AvailableSlot,
  BookingResponse,
  DateOption,
  ServiceItem,
} from '../types/engine';

type TimePeriod = 'manana' | 'tarde' | 'noche';

const PERIOD_LABELS: Record<TimePeriod, string> = {
  manana: 'Mañana',
  tarde: 'Tarde',
  noche: 'Noche',
};

function getPeriod(time: string): TimePeriod {
  const hour = parseInt(time.split(':')[0] || '0', 10);
  if (hour < 12) return 'manana';
  if (hour < 18) return 'tarde';
  return 'noche';
}

interface QuickBookingSheetProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenFullAgenda: () => void;
  services: ServiceItem[];
  selectedService: ServiceItem;
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  availableDates: DateOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableSlots: AvailableSlot[];
  loadingSlots: boolean;
  selectedTime: string;
  onSelectTime: (time: string) => void;
  clientForm: { clientName: string; clientPhone: string; notes: string };
  setClientForm: React.Dispatch<
    React.SetStateAction<{ clientName: string; clientPhone: string; notes: string }>
  >;
  isSubmitting: boolean;
  bookingResult: BookingResponse | null;
  onSubmitBooking: (e?: { preventDefault?: () => void }) => Promise<BookingResponse>;
  onResetBooking: () => void;
  formatPrice: (price: number) => string;
  formatDateLabel: (dateStr: string) => string;
  whatsappDirectUrl: string;
}

export const QuickBookingSheet: React.FC<QuickBookingSheetProps> = ({
  isOpen,
  onClose,
  onOpenFullAgenda,
  services,
  selectedService,
  selectedServiceId,
  onSelectServiceId,
  availableDates,
  selectedDate,
  onSelectDate,
  availableSlots,
  loadingSlots,
  selectedTime,
  onSelectTime,
  clientForm,
  setClientForm,
  isSubmitting,
  bookingResult,
  onSubmitBooking,
  onResetBooking,
  formatPrice,
  formatDateLabel,
  whatsappDirectUrl,
}) => {
  const [period, setPeriod] = useState<TimePeriod>('manana');

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isOpen, onClose]);

  const groupedSlots = useMemo(() => {
    const groups: Record<TimePeriod, AvailableSlot[]> = {
      manana: [],
      tarde: [],
      noche: [],
    };
    for (const s of availableSlots) {
      groups[getPeriod(s.time)].push(s);
    }
    return groups;
  }, [availableSlots]);

  useEffect(() => {
    if (groupedSlots[period].length > 0) return;
    if (groupedSlots.manana.length > 0) setPeriod('manana');
    else if (groupedSlots.tarde.length > 0) setPeriod('tarde');
    else if (groupedSlots.noche.length > 0) setPeriod('noche');
  }, [groupedSlots, period]);

  if (!isOpen) return null;

  const currentSlots = groupedSlots[period];

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center sm:justify-end bg-[#2B1D14]/45 backdrop-blur-[2px]"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Reserva rápida de turno"
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="sheet-enter sheet-scroll w-full sm:w-[460px] max-h-[90dvh] sm:h-full sm:max-h-none bg-white rounded-t-3xl sm:rounded-none sm:rounded-l-3xl shadow-2xl border-t sm:border-l border-[#2B1D14]/15 flex flex-col overflow-hidden"
      >
        {/* Cabecera del Sheet */}
        <div className="px-5 py-4 border-b border-[#2B1D14]/10 flex items-center justify-between gap-3 shrink-0 bg-white">
          <div className="min-w-0">
            <h2 className="font-serif text-2xl font-medium text-[#2B1D14] truncate">
              Reserva rápida 1 a 1
            </h2>
            <p className="text-xs text-[#6E2331]">
              Con Eliana · Hacienda Casablanca
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar panel de reserva"
            className="btn-press w-9 h-9 rounded-full bg-[#F7F7F8] text-[#2B1D14] flex items-center justify-center hover:bg-[#F3DE9A]"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Contenido desplazable */}
        <div className="flex-1 overflow-y-auto sheet-scroll p-5 space-y-5 pb-[calc(1.5rem+env(safe-area-inset-bottom))]">
          {bookingResult?.success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#F3DE9A] text-[#2B1D14] flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h3 className="font-serif text-3xl font-medium text-[#2B1D14]">
                ¡Cita confirmada!
              </h3>
              <p className="text-sm text-[#2B1D14]/75">{bookingResult.message}</p>

              {bookingResult.appointment && (
                <div className="text-left rounded-2xl bg-[#F7F7F8] p-4 border border-[#2B1D14]/10 space-y-2 text-sm">
                  <div className="flex justify-between gap-2">
                    <span className="text-[#2B1D14]/65">Código</span>
                    <span className="font-semibold text-[#6E2331] tabular-nums">
                      {bookingResult.appointment.id}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#2B1D14]/65">Servicio</span>
                    <span className="font-medium text-[#2B1D14] text-right">
                      {bookingResult.appointment.serviceName}
                    </span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-[#2B1D14]/65">Fecha y hora</span>
                    <span className="font-medium text-[#2B1D14] tabular-nums text-right">
                      {formatDateLabel(bookingResult.appointment.date)} ·{' '}
                      {bookingResult.appointment.time}
                    </span>
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-2.5 pt-2">
                <a
                  href={bookingResult.whatsappConfirmationUrl || whatsappDirectUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="btn-press inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#2B1D14] text-white text-sm font-medium"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>Guardar en WhatsApp</span>
                </a>
                <button
                  type="button"
                  onClick={() => {
                    onResetBooking();
                    onClose();
                  }}
                  className="btn-press px-5 py-2.5 rounded-full border border-[#2B1D14]/20 text-sm font-medium text-[#2B1D14]"
                >
                  Listo
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={onSubmitBooking} className="space-y-5">
              {/* Servicio */}
              <div>
                <label
                  htmlFor="sheet-service"
                  className="block text-xs font-semibold text-[#2B1D14] mb-1.5"
                >
                  Servicio
                </label>
                <select
                  id="sheet-service"
                  value={selectedServiceId}
                  onChange={(e) => onSelectServiceId(e.target.value)}
                  className="w-full max-w-full min-w-0 rounded-xl border border-[#2B1D14]/20 bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#2B1D14] focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30"
                >
                  {services.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.name} — {s.duration_minutes} min ({formatPrice(s.price)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Fecha */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#2B1D14]">Día</span>
                  <span className="text-xs text-[#2B1D14]/65 capitalize">
                    {formatDateLabel(selectedDate)}
                  </span>
                </div>
                <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                  {availableDates.map((d) => {
                    const isSelected = d.date === selectedDate;
                    return (
                      <button
                        key={d.date}
                        type="button"
                        disabled={!d.isOpen}
                        onClick={() => onSelectDate(d.date)}
                        className={`btn-press shrink-0 w-[58px] py-2 px-1.5 rounded-xl border text-center ${
                          !d.isOpen
                            ? 'bg-[#F7F7F8] border-[#2B1D14]/5 text-[#2B1D14]/30 cursor-not-allowed'
                            : isSelected
                              ? 'bg-[#6E2331] border-[#6E2331] text-white'
                              : 'bg-white border-[#2B1D14]/15 text-[#2B1D14]'
                        }`}
                      >
                        <span className="block text-[10px] uppercase opacity-80">
                          {d.isToday ? 'Hoy' : d.dayLabelEs}
                        </span>
                        <span className="block text-base font-semibold tabular-nums">
                          {d.dayNumber}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Franja + Horas */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-semibold text-[#2B1D14]">
                    Franja horaria
                  </span>
                  {loadingSlots && (
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-[#6E2331]" />
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mb-3">
                  {(['manana', 'tarde', 'noche'] as TimePeriod[]).map((p) => {
                    const active = period === p;
                    return (
                      <button
                        key={p}
                        type="button"
                        onClick={() => setPeriod(p)}
                        className={`btn-press py-2 px-2 rounded-xl text-xs font-medium border flex items-center justify-between ${
                          active
                            ? 'bg-[#F3DE9A]/60 border-[#D9A738] text-[#2B1D14]'
                            : 'bg-[#F7F7F8] border-[#2B1D14]/10 text-[#2B1D14]/75'
                        }`}
                      >
                        <span>{PERIOD_LABELS[p]}</span>
                        <span className="tabular-nums text-[#6E2331]">
                          {groupedSlots[p].length}
                        </span>
                      </button>
                    );
                  })}
                </div>

                {currentSlots.length === 0 ? (
                  <p className="text-xs text-[#2B1D14]/65 bg-[#F7F7F8] rounded-xl p-3 text-center">
                    Sin horarios en esta franja. Prueba otra franja o día.
                  </p>
                ) : (
                  <div className="grid grid-cols-3 gap-2">
                    {currentSlots.map((slot) => {
                      const active = slot.time === selectedTime;
                      return (
                        <button
                          key={slot.time}
                          type="button"
                          onClick={() => onSelectTime(slot.time)}
                          className={`btn-press py-2 rounded-xl text-sm font-medium tabular-nums border ${
                            active
                              ? 'bg-[#6E2331] border-[#6E2331] text-white'
                              : 'bg-white border-[#2B1D14]/15 text-[#2B1D14]'
                          }`}
                        >
                          {slot.time}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Datos */}
              <div className="space-y-3 pt-1">
                <input
                  type="text"
                  required
                  placeholder="Tu nombre completo"
                  value={clientForm.clientName}
                  onChange={(e) =>
                    setClientForm((prev) => ({ ...prev, clientName: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#2B1D14]/20 px-3.5 py-2.5 text-base sm:text-sm text-[#2B1D14] placeholder:text-[#2B1D14]/45 focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30"
                />
                <input
                  type="tel"
                  inputMode="tel"
                  required
                  placeholder="Tu WhatsApp (Ej. 310 456 7890)"
                  value={clientForm.clientPhone}
                  onChange={(e) =>
                    setClientForm((prev) => ({ ...prev, clientPhone: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#2B1D14]/20 px-3.5 py-2.5 text-base sm:text-sm text-[#2B1D14] placeholder:text-[#2B1D14]/45 focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30"
                />
                <input
                  type="text"
                  placeholder="Nota opcional (ej. flores 3D, ojo de gato)"
                  value={clientForm.notes}
                  onChange={(e) =>
                    setClientForm((prev) => ({ ...prev, notes: e.target.value }))
                  }
                  className="w-full rounded-xl border border-[#2B1D14]/20 px-3.5 py-2.5 text-base sm:text-sm text-[#2B1D14] placeholder:text-[#2B1D14]/45 focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30"
                />
              </div>

              {/* Resumen */}
              <div className="rounded-xl bg-[#F3DE9A]/35 border border-[#D9A738]/30 p-3.5 text-xs flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="font-semibold text-[#2B1D14] truncate">
                    {selectedService?.name}
                  </p>
                  <p className="text-[#2B1D14]/75 mt-0.5 flex items-center gap-2 tabular-nums">
                    <span className="inline-flex items-center gap-1 capitalize">
                      <Calendar className="w-3 h-3 text-[#6E2331]" />
                      {formatDateLabel(selectedDate)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Clock className="w-3 h-3 text-[#6E2331]" />
                      {selectedTime || '--:--'}
                    </span>
                  </p>
                </div>
                <span className="font-semibold text-sm text-[#2B1D14] tabular-nums shrink-0">
                  {selectedService ? formatPrice(selectedService.price) : ''}
                </span>
              </div>

              {bookingResult && !bookingResult.success && (
                <div className="rounded-xl bg-[#6E2331]/10 border border-[#6E2331]/25 p-3 text-xs text-[#6E2331]">
                  {bookingResult.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting || !selectedTime}
                className="btn-press w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2B1D14] text-white py-3.5 px-5 text-sm font-medium hover:bg-[#6E2331] disabled:opacity-50"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Reservando...</span>
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" />
                    <span>Confirmar turno</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  onOpenFullAgenda();
                }}
                className="w-full text-center text-xs font-medium text-[#6E2331] hover:underline py-1"
              >
                ¿Buscas una cita anterior? Ir al portal Mis Citas
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
