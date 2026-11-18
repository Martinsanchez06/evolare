import React, { useEffect, useMemo, useState } from 'react';
import {
  Calendar,
  CheckCircle2,
  Clock,
  Loader2,
  MessageCircle,
  RefreshCw,
  Search,
  Sparkles,
  UserCheck,
  XCircle,
} from 'lucide-react';
import type {
  Appointment,
  AvailableSlot,
  BookingResponse,
  BusinessConfig,
  DateOption,
  ServiceItem,
  StaffMember,
} from '../types/engine';
import { getInstantLocalAvailability } from '../engine/bookingEngine';

type TimePeriod = 'manana' | 'tarde' | 'noche';

interface BookingAtelierProps {
  activeTab: 'book' | 'manage';
  onTabChange: (tab: 'book' | 'manage') => void;
  business: BusinessConfig;
  services: ServiceItem[];
  selectedService: ServiceItem;
  selectedServiceId: string;
  onSelectServiceId: (id: string) => void;
  eligibleStaff: StaffMember[];
  availableDates: DateOption[];
  selectedDate: string;
  onSelectDate: (date: string) => void;
  availableSlots: AvailableSlot[];
  loadingSlots: boolean;
  slotsReason?: string;
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
  lookupQuery: string;
  setLookupQuery: (q: string) => void;
  clientAppointments: Appointment[];
  loadingLookup: boolean;
  lookupMessage: string;
  onSearchAppointments: (override?: string) => Promise<Appointment[]>;
  onRescheduleAppointment: (
    apt: Appointment,
    newDate: string,
    newTime: string
  ) => Promise<{ success: boolean; message: string }>;
  onCancelAppointment: (
    apt: Appointment
  ) => Promise<{ success: boolean; message: string }>;
  formatPrice: (price: number) => string;
  formatDateLabel: (dateStr: string) => string;
  whatsappDirectUrl: string;
}

function getPeriodFromTime(time: string): TimePeriod {
  const hour = parseInt(time.split(':')[0] || '0', 10);
  if (hour < 12) return 'manana';
  if (hour < 18) return 'tarde';
  return 'noche';
}

const PERIOD_LABELS: Record<TimePeriod, { label: string; range: string }> = {
  manana: { label: 'Mañana', range: '9:00 – 11:30' },
  tarde: { label: 'Tarde', range: '12:00 – 17:30' },
  noche: { label: 'Noche', range: '18:00 – 20:00' },
};

export const BookingAtelier: React.FC<BookingAtelierProps> = ({
  activeTab,
  onTabChange,
  business,
  services,
  selectedService,
  selectedServiceId,
  onSelectServiceId,
  eligibleStaff,
  availableDates,
  selectedDate,
  onSelectDate,
  availableSlots,
  loadingSlots,
  slotsReason,
  selectedTime,
  onSelectTime,
  clientForm,
  setClientForm,
  isSubmitting,
  bookingResult,
  onSubmitBooking,
  onResetBooking,
  lookupQuery,
  setLookupQuery,
  clientAppointments,
  loadingLookup,
  lookupMessage,
  onSearchAppointments,
  onRescheduleAppointment,
  onCancelAppointment,
  formatPrice,
  formatDateLabel,
  whatsappDirectUrl,
}) => {
  const [period, setPeriod] = useState<TimePeriod>('manana');
  const [rescheduleTargetId, setRescheduleTargetId] = useState<string | null>(null);
  const [rescheduleDate, setRescheduleDate] = useState<string>('');
  const [rescheduleTime, setRescheduleTime] = useState<string>('');
  const [cancelConfirmId, setCancelConfirmId] = useState<string | null>(null);
  const [actionBusyId, setActionBusyId] = useState<string | null>(null);

  const groupedSlots = useMemo(() => {
    const groups: Record<TimePeriod, AvailableSlot[]> = {
      manana: [],
      tarde: [],
      noche: [],
    };
    for (const slot of availableSlots) {
      groups[getPeriodFromTime(slot.time)].push(slot);
    }
    return groups;
  }, [availableSlots]);

  // Ajustar automáticamente la franja si la actual queda vacía al cambiar fecha/servicio
  useEffect(() => {
    if (groupedSlots[period].length > 0) return;
    if (groupedSlots.manana.length > 0) setPeriod('manana');
    else if (groupedSlots.tarde.length > 0) setPeriod('tarde');
    else if (groupedSlots.noche.length > 0) setPeriod('noche');
  }, [groupedSlots, period]);

  const currentPeriodSlots = groupedSlots[period];

  const rescheduleSlots = useMemo(() => {
    if (!rescheduleTargetId || !rescheduleDate) return [];
    const target = clientAppointments.find((a) => a.id === rescheduleTargetId);
    if (!target) return [];
    return getInstantLocalAvailability(business, {
      date: rescheduleDate,
      serviceId: target.serviceId,
      staffId: target.staffId,
    }).slots;
  }, [business, clientAppointments, rescheduleDate, rescheduleTargetId]);

  const startReschedule = (apt: Appointment) => {
    const firstOpen = availableDates.find((d) => d.isOpen);
    const defaultDate = firstOpen ? firstOpen.date : apt.date;
    setRescheduleTargetId(apt.id);
    setRescheduleDate(defaultDate);
    const slots = getInstantLocalAvailability(business, {
      date: defaultDate,
      serviceId: apt.serviceId,
      staffId: apt.staffId,
    }).slots;
    setRescheduleTime(slots[0]?.time || '');
    setCancelConfirmId(null);
  };

  const confirmReschedule = async (apt: Appointment) => {
    if (!rescheduleDate || !rescheduleTime) return;
    setActionBusyId(apt.id);
    await onRescheduleAppointment(apt, rescheduleDate, rescheduleTime);
    setActionBusyId(null);
    setRescheduleTargetId(null);
  };

  const confirmCancel = async (apt: Appointment) => {
    setActionBusyId(apt.id);
    await onCancelAppointment(apt);
    setActionBusyId(null);
    setCancelConfirmId(null);
  };

  return (
    <section id="agenda" className="py-12 sm:py-16 border-t border-[#2B1D14]/10 scroll-mt-20">
      <div className="max-w-5xl mx-auto">
        {/* Encabezado y selector de modo */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div className="max-w-xl">
            <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-medium text-[#2B1D14] tracking-tight">
              Reserva tu Turno en Tiempo Real
            </h2>
            <p className="mt-3 text-base text-[#2B1D14]/75 leading-relaxed">
              Elige tu servicio, fecha y franja horaria sin esperar respuesta por chat. También puedes consultar o reagendar una cita existente.
            </p>
          </div>

          <div
            role="tablist"
            aria-label="Modo de agenda"
            className="inline-flex p-1 rounded-full bg-[#F7F7F8] border border-[#2B1D14]/10 self-start md:self-auto"
          >
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'book'}
              onClick={() => onTabChange('book')}
              className={`btn-press px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'book'
                  ? 'bg-[#2B1D14] text-white shadow-sm'
                  : 'text-[#2B1D14]/75 hover:text-[#2B1D14]'
              }`}
            >
              Agendar Cita
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={activeTab === 'manage'}
              onClick={() => onTabChange('manage')}
              className={`btn-press px-4 py-2 rounded-full text-xs sm:text-sm font-medium transition-colors ${
                activeTab === 'manage'
                  ? 'bg-[#6E2331] text-white shadow-sm'
                  : 'text-[#2B1D14]/75 hover:text-[#2B1D14]'
              }`}
            >
              Mis Citas
            </button>
          </div>
        </div>

        {/* MODO 1: RESERVAR NUEVO TURNO */}
        {activeTab === 'book' && (
          <div className="rounded-3xl border border-[#2B1D14]/12 bg-[#F7F7F8]/60 p-4 sm:p-8">
            {bookingResult?.success ? (
              <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#2B1D14]/10 text-center max-w-xl mx-auto">
                <div className="w-12 h-12 rounded-full bg-[#F3DE9A] text-[#2B1D14] flex items-center justify-center mx-auto mb-4">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="font-serif text-3xl font-medium text-[#2B1D14]">
                  ¡Tu turno está confirmado!
                </h3>
                <p className="mt-2 text-sm text-[#2B1D14]/75 leading-relaxed">
                  {bookingResult.message}
                </p>

                {bookingResult.appointment && (
                  <div className="mt-6 text-left rounded-2xl bg-[#F7F7F8] p-5 border border-[#2B1D14]/10 space-y-2.5 text-sm">
                    <div className="flex justify-between gap-2">
                      <span className="text-[#2B1D14]/65">Código de cita</span>
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
                    <div className="flex justify-between gap-2">
                      <span className="text-[#2B1D14]/65">Especialista</span>
                      <span className="font-medium text-[#2B1D14]">
                        {bookingResult.appointment.staffName}
                      </span>
                    </div>
                    <div className="flex justify-between gap-2 pt-2 border-t border-[#2B1D14]/10">
                      <span className="text-[#2B1D14]/65">Total en estudio</span>
                      <span className="font-semibold text-[#2B1D14] tabular-nums">
                        {formatPrice(bookingResult.appointment.price)}
                      </span>
                    </div>
                  </div>
                )}

                <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3">
                  <a
                    href={bookingResult.whatsappConfirmationUrl || whatsappDirectUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-press w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-3 rounded-full bg-[#2B1D14] text-white text-sm font-medium hover:bg-[#6E2331]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Guardar recordatorio en WhatsApp</span>
                  </a>
                  <button
                    type="button"
                    onClick={onResetBooking}
                    className="btn-press w-full sm:w-auto px-5 py-3 rounded-full border border-[#2B1D14]/20 bg-white text-[#2B1D14] text-sm font-medium hover:bg-[#F7F7F8]"
                  >
                    Agendar otra cita
                  </button>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
                {/* Pasos 1, 2 y 3 */}
                <div className="lg:col-span-7 space-y-6 min-w-0">
                  {/* Paso 1: Servicio */}
                  <div className="bg-white rounded-2xl p-5 border border-[#2B1D14]/10 min-w-0">
                    <label
                      htmlFor="service-select"
                      className="block text-sm font-semibold text-[#2B1D14] mb-3"
                    >
                      1. Elige tu servicio
                    </label>
                    <select
                      id="service-select"
                      value={selectedServiceId}
                      onChange={(e) => onSelectServiceId(e.target.value)}
                      className="w-full max-w-full min-w-0 rounded-xl border border-[#2B1D14]/20 bg-white px-4 py-3 text-base sm:text-sm text-[#2B1D14] focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30 focus:border-[#6E2331]"
                    >
                      {services.map((srv) => (
                        <option key={srv.id} value={srv.id}>
                          {srv.name} — {srv.duration_minutes} min ({formatPrice(srv.price)})
                        </option>
                      ))}
                    </select>
                    {selectedService && (
                      <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-xs text-[#2B1D14]/70">
                        <span className="inline-flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-[#6E2331]" />
                          Atención 1 a 1 con{' '}
                          <strong className="font-medium text-[#2B1D14]">
                            {eligibleStaff[0]?.name || 'Eliana'}
                          </strong>
                        </span>
                        <span className="tabular-nums font-medium text-[#2B1D14]">
                          {selectedService.duration_minutes} min ·{' '}
                          {formatPrice(selectedService.price)}
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Paso 2: Fecha */}
                  <div className="bg-white rounded-2xl p-5 border border-[#2B1D14]/10 min-w-0 overflow-hidden">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-sm font-semibold text-[#2B1D14]">
                        2. Selecciona el día
                      </span>
                      <span className="text-xs text-[#2B1D14]/60 capitalize truncate">
                        {formatDateLabel(selectedDate)}
                      </span>
                    </div>

                    <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1 max-w-full">
                      {availableDates.map((d) => {
                        const isSelected = d.date === selectedDate;
                        return (
                          <button
                            key={d.date}
                            type="button"
                            disabled={!d.isOpen}
                            onClick={() => onSelectDate(d.date)}
                            className={`btn-press shrink-0 w-[64px] py-2.5 px-2 rounded-xl border text-center transition-colors ${
                              !d.isOpen
                                ? 'bg-[#F7F7F8] border-[#2B1D14]/5 text-[#2B1D14]/30 cursor-not-allowed'
                                : isSelected
                                  ? 'bg-[#6E2331] border-[#6E2331] text-white'
                                  : 'bg-white border-[#2B1D14]/15 text-[#2B1D14] hover:border-[#2B1D14]/40'
                            }`}
                          >
                            <span className="block text-[11px] uppercase tracking-wider opacity-80">
                              {d.isToday ? 'Hoy' : d.dayLabelEs}
                            </span>
                            <span className="block text-lg font-semibold tabular-nums leading-tight mt-0.5">
                              {d.dayNumber}
                            </span>
                            <span className="block text-[10px] opacity-75">
                              {d.monthShortEs}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Paso 3: Franja horaria (Mañana / Tarde / Noche) */}
                  <div className="bg-white rounded-2xl p-5 border border-[#2B1D14]/10">
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="text-sm font-semibold text-[#2B1D14]">
                        3. Escoge tu franja horaria
                      </span>
                      {loadingSlots && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-[#6E2331]">
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Actualizando
                        </span>
                      )}
                    </div>

                    {/* Pestañas Mañana / Tarde / Noche */}
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {(['manana', 'tarde', 'noche'] as TimePeriod[]).map((p) => {
                        const count = groupedSlots[p].length;
                        const active = period === p;
                        return (
                          <button
                            key={p}
                            type="button"
                            onClick={() => setPeriod(p)}
                            className={`btn-press rounded-xl py-2 px-2.5 text-left border transition-colors ${
                              active
                                ? 'bg-[#F3DE9A]/55 border-[#D9A738] text-[#2B1D14]'
                                : 'bg-[#F7F7F8] border-[#2B1D14]/10 text-[#2B1D14]/75 hover:border-[#2B1D14]/25'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1">
                              <span className="text-xs sm:text-sm font-semibold">
                                {PERIOD_LABELS[p].label}
                              </span>
                              <span className="text-[11px] font-medium tabular-nums text-[#6E2331]">
                                {count}
                              </span>
                            </div>
                            <span className="block text-[10px] text-[#2B1D14]/65 mt-0.5 tabular-nums">
                              {PERIOD_LABELS[p].range}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Horas de la franja seleccionada */}
                    {availableSlots.length === 0 ? (
                      <div className="rounded-xl bg-[#F7F7F8] p-4 text-center text-sm text-[#2B1D14]/70">
                        {slotsReason ||
                          'No hay turnos disponibles para esta fecha. Prueba seleccionando otro día.'}
                      </div>
                    ) : currentPeriodSlots.length === 0 ? (
                      <div className="rounded-xl bg-[#F7F7F8] p-4 text-center text-sm text-[#2B1D14]/70">
                        Sin disponibilidad en la franja de {PERIOD_LABELS[period].label.toLowerCase()}. Selecciona otra franja arriba.
                      </div>
                    ) : (
                      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                        {currentPeriodSlots.map((slot) => {
                          const isSelected = slot.time === selectedTime;
                          return (
                            <button
                              key={slot.time}
                              type="button"
                              onClick={() => onSelectTime(slot.time)}
                              className={`btn-press py-2.5 px-2 rounded-xl text-sm font-medium tabular-nums border transition-colors ${
                                isSelected
                                  ? 'bg-[#6E2331] border-[#6E2331] text-white shadow-sm'
                                  : 'bg-white border-[#2B1D14]/15 text-[#2B1D14] hover:border-[#2B1D14]/45'
                              }`}
                            >
                              {slot.time}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>

                {/* Paso 4: Datos del cliente + Resumen */}
                <form
                  onSubmit={onSubmitBooking}
                  className="lg:col-span-5 bg-white rounded-2xl p-5 sm:p-6 border border-[#2B1D14]/10 space-y-4 min-w-0"
                >
                  <h3 className="font-serif text-2xl font-medium text-[#2B1D14]">
                    4. Confirma tus datos
                  </h3>

                  <div className="rounded-xl bg-[#F3DE9A]/30 border border-[#D9A738]/30 p-4 space-y-1.5 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-[#2B1D14] truncate">
                        {selectedService?.name}
                      </span>
                      <span className="font-semibold text-[#2B1D14] tabular-nums shrink-0">
                        {selectedService ? formatPrice(selectedService.price) : ''}
                      </span>
                    </div>
                    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#2B1D14]/75">
                      <span className="inline-flex items-center gap-1 capitalize">
                        <Calendar className="w-3.5 h-3.5 text-[#6E2331]" />
                        {formatDateLabel(selectedDate)}
                      </span>
                      <span className="inline-flex items-center gap-1 tabular-nums">
                        <Clock className="w-3.5 h-3.5 text-[#6E2331]" />
                        {selectedTime || 'Por elegir'} ({selectedService?.duration_minutes} min)
                      </span>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="client-name"
                      className="block text-xs font-medium text-[#2B1D14]/80 mb-1.5"
                    >
                      Tu nombre completo
                    </label>
                    <input
                      id="client-name"
                      type="text"
                      required
                      placeholder="Ej. Laura Martínez"
                      value={clientForm.clientName}
                      onChange={(e) =>
                        setClientForm((prev) => ({ ...prev, clientName: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#2B1D14]/20 bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#2B1D14] placeholder:text-[#2B1D14]/40 focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30 focus:border-[#6E2331]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="client-phone"
                      className="block text-xs font-medium text-[#2B1D14]/80 mb-1.5"
                    >
                      WhatsApp / Celular (para tus recordatorios)
                    </label>
                    <input
                      id="client-phone"
                      type="tel"
                      inputMode="tel"
                      required
                      placeholder="Ej. 310 456 7890"
                      value={clientForm.clientPhone}
                      onChange={(e) =>
                        setClientForm((prev) => ({ ...prev, clientPhone: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#2B1D14]/20 bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#2B1D14] placeholder:text-[#2B1D14]/40 focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30 focus:border-[#6E2331]"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="client-notes"
                      className="block text-xs font-medium text-[#2B1D14]/80 mb-1.5"
                    >
                      Estilo o notas (opcional)
                    </label>
                    <textarea
                      id="client-notes"
                      rows={2}
                      placeholder="Ej. Quiero ojo de gato borgoña o flores 3D"
                      value={clientForm.notes}
                      onChange={(e) =>
                        setClientForm((prev) => ({ ...prev, notes: e.target.value }))
                      }
                      className="w-full rounded-xl border border-[#2B1D14]/20 bg-white px-3.5 py-2.5 text-base sm:text-sm text-[#2B1D14] placeholder:text-[#2B1D14]/40 focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30 focus:border-[#6E2331]"
                    />
                  </div>

                  {bookingResult && !bookingResult.success && (
                    <div className="rounded-xl bg-[#6E2331]/10 border border-[#6E2331]/25 p-3 text-xs text-[#6E2331]">
                      {bookingResult.message}
                    </div>
                  )}

                  <button
                    type="submit"
                    disabled={isSubmitting || !selectedTime}
                    className="btn-press w-full inline-flex items-center justify-center gap-2 rounded-full bg-[#2B1D14] text-white py-3.5 px-6 text-sm font-medium hover:bg-[#6E2331] disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Reservando turno...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Confirmar cita con Eliana</span>
                      </>
                    )}
                  </button>

                  <p className="text-[11px] text-center text-[#2B1D14]/65 leading-relaxed">
                    Sin anticipo para reservar. Recibirás recordatorios automáticos antes de tu cita y puedes reagendar cuando lo necesites.
                  </p>
                </form>
              </div>
            )}
          </div>
        )}

        {/* MODO 2: PORTAL MIS CITAS */}
        {activeTab === 'manage' && (
          <div className="rounded-3xl border border-[#2B1D14]/12 bg-[#F7F7F8]/60 p-5 sm:p-8">
            <div className="max-w-2xl mx-auto">
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  onSearchAppointments();
                }}
                className="flex flex-col sm:flex-row gap-3"
              >
                <div className="relative flex-1 min-w-0">
                  <Search className="w-4 h-4 text-[#2B1D14]/45 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={lookupQuery}
                    onChange={(e) => setLookupQuery(e.target.value)}
                    placeholder="Ingresa tu celular o código de cita"
                    className="w-full rounded-full border border-[#2B1D14]/20 bg-white pl-10 pr-4 py-3 text-base sm:text-sm text-[#2B1D14] placeholder:text-[#2B1D14]/45 focus:outline-none focus:ring-2 focus:ring-[#6E2331]/30 focus:border-[#6E2331]"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loadingLookup || !lookupQuery.trim()}
                  className="btn-press inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-[#2B1D14] text-white text-sm font-medium hover:bg-[#6E2331] disabled:opacity-50"
                >
                  {loadingLookup ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Buscar cita</span>
                  )}
                </button>
              </form>

              {lookupMessage && (
                <div className="mt-4 rounded-2xl bg-white border border-[#2B1D14]/10 p-4 text-sm text-[#2B1D14]/80 text-center">
                  {lookupMessage}
                </div>
              )}

              {clientAppointments.length > 0 && (
                <div className="mt-6 space-y-4">
                  {clientAppointments.map((apt) => {
                    const isRescheduling = rescheduleTargetId === apt.id;
                    const isConfirmingCancel = cancelConfirmId === apt.id;
                    const isBusy = actionBusyId === apt.id;

                    return (
                      <div
                        key={apt.id}
                        className="bg-white rounded-2xl p-5 border border-[#2B1D14]/12 shadow-sm"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-2 mb-1">
                              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-[#F3DE9A] text-[#2B1D14] tabular-nums">
                                {apt.id}
                              </span>
                              <span className="text-xs font-medium text-[#6E2331]">
                                {apt.status === 'confirmed' ? 'Confirmada' : apt.status}
                              </span>
                            </div>
                            <h3 className="font-serif text-2xl font-medium text-[#2B1D14]">
                              {apt.serviceName}
                            </h3>
                            <p className="text-sm text-[#2B1D14]/75 mt-1 capitalize tabular-nums">
                              {formatDateLabel(apt.date)} · {apt.time} ({apt.durationMinutes} min)
                            </p>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <button
                              type="button"
                              onClick={() =>
                                isRescheduling ? setRescheduleTargetId(null) : startReschedule(apt)
                              }
                              disabled={isBusy}
                              className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#2B1D14]/20 text-xs font-medium text-[#2B1D14] hover:bg-[#F7F7F8]"
                            >
                              <RefreshCw className="w-3.5 h-3.5" />
                              <span>{isRescheduling ? 'Cerrar' : 'Reagendar'}</span>
                            </button>

                            {!isConfirmingCancel ? (
                              <button
                                type="button"
                                onClick={() => {
                                  setCancelConfirmId(apt.id);
                                  setRescheduleTargetId(null);
                                }}
                                disabled={isBusy}
                                className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-full border border-[#6E2331]/25 text-xs font-medium text-[#6E2331] hover:bg-[#6E2331]/5"
                              >
                                <XCircle className="w-3.5 h-3.5" />
                                <span>Cancelar</span>
                              </button>
                            ) : (
                              <button
                                type="button"
                                onClick={() => confirmCancel(apt)}
                                disabled={isBusy}
                                className="btn-press inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#6E2331] text-white text-xs font-medium"
                              >
                                {isBusy ? 'Cancelando...' : 'Confirmar cancelación'}
                              </button>
                            )}
                          </div>
                        </div>

                        {isRescheduling && (
                          <div className="mt-4 pt-4 border-t border-[#2B1D14]/10 space-y-3">
                            <p className="text-xs font-semibold text-[#2B1D14]">
                              Elige nueva fecha y hora:
                            </p>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                              <select
                                value={rescheduleDate}
                                onChange={(e) => {
                                  const nd = e.target.value;
                                  setRescheduleDate(nd);
                                  const nextSlots = getInstantLocalAvailability(business, {
                                    date: nd,
                                    serviceId: apt.serviceId,
                                    staffId: apt.staffId,
                                  }).slots;
                                  setRescheduleTime(nextSlots[0]?.time || '');
                                }}
                                className="rounded-xl border border-[#2B1D14]/20 px-3 py-2.5 text-base sm:text-sm text-[#2B1D14]"
                              >
                                {availableDates
                                  .filter((d) => d.isOpen)
                                  .map((d) => (
                                    <option key={d.date} value={d.date}>
                                      {d.fullLabelEs}
                                    </option>
                                  ))}
                              </select>

                              <select
                                value={rescheduleTime}
                                onChange={(e) => setRescheduleTime(e.target.value)}
                                className="rounded-xl border border-[#2B1D14]/20 px-3 py-2.5 text-base sm:text-sm text-[#2B1D14] tabular-nums"
                              >
                                {rescheduleSlots.length === 0 ? (
                                  <option value="">Sin horarios</option>
                                ) : (
                                  rescheduleSlots.map((s) => (
                                    <option key={s.time} value={s.time}>
                                      {s.time}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            <button
                              type="button"
                              disabled={!rescheduleTime || isBusy}
                              onClick={() => confirmReschedule(apt)}
                              className="btn-press px-5 py-2.5 rounded-full bg-[#2B1D14] text-white text-xs font-medium hover:bg-[#6E2331] disabled:opacity-50"
                            >
                              {isBusy ? 'Guardando cambio...' : 'Confirmar nuevo horario'}
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {clientAppointments.length === 0 && !lookupMessage && (
                <p className="mt-5 text-center text-xs text-[#2B1D14]/60">
                  Puedes consultar con el número de WhatsApp con el que agendaste o con tu código de cita.
                </p>
              )}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};
