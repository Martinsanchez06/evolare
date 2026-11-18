import type {
  Appointment,
  AvailabilityResult,
  AvailableSlot,
  BookingRequest,
  BookingResponse,
  BusinessConfig,
  DateOption,
  DayOfWeek,
  ServiceItem,
  StaffMember,
} from '../types/engine';
import {
  buildBasicPlanWhatsAppLink,
  buildConfirmedBookingWhatsAppLink,
  hasFeature,
} from './planGate';
import {
  fetchAppointmentsByDate,
  fetchClientAppointmentsFromSupabase,
  upsertAppointmentInSupabase,
} from './supabaseClient';

const DAYS_MAP: DayOfWeek[] = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const DAYS_ES_FULL = [
  'domingo',
  'lunes',
  'martes',
  'miércoles',
  'jueves',
  'viernes',
  'sábado',
];

const DAYS_ES_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const MONTHS_ES_FULL = [
  'enero',
  'febrero',
  'marzo',
  'abril',
  'mayo',
  'junio',
  'julio',
  'agosto',
  'septiembre',
  'octubre',
  'noviembre',
  'diciembre',
];

const MONTHS_ES_SHORT = [
  'Ene',
  'Feb',
  'Mar',
  'Abr',
  'May',
  'Jun',
  'Jul',
  'Ago',
  'Sep',
  'Oct',
  'Nov',
  'Dic',
];

const LOCAL_STORAGE_KEY = 'beauty_engine_local_appointments_v1';

export function getDateString(offsetDays = 0): string {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const dd = String(d.getDate()).padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export function formatSpanishDateLabel(dateStr: string): string {
  const d = new Date(`${dateStr}T12:00:00`);
  if (isNaN(d.getTime())) return dateStr;
  return `${DAYS_ES_FULL[d.getDay()]} ${d.getDate()} de ${MONTHS_ES_FULL[d.getMonth()]}`;
}

export function timeToMinutes(timeStr: string): number {
  const [hh, mm] = String(timeStr || '00:00')
    .split(':')
    .map(Number);
  return (hh || 0) * 60 + (mm || 0);
}

export function minutesToTime(totalMinutes: number): string {
  const hh = String(Math.floor(totalMinutes / 60)).padStart(2, '0');
  const mm = String(totalMinutes % 60).padStart(2, '0');
  return `${hh}:${mm}`;
}

export function normalizePhone(phone: string): string {
  return String(phone || '').replace(/[^\d+]/g, '');
}

function generateBookingCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let suffix = '';
  for (let i = 0; i < 4; i++) {
    suffix += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CITA-${suffix}`;
}

function loadLocalAppointments(): Appointment[] {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveLocalAppointment(appt: Appointment): void {
  try {
    const list = loadLocalAppointments().filter((a) => a.id !== appt.id);
    list.push(appt);
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(list));
  } catch {
    // Ignore storage errors
  }
}

export function findService(business: BusinessConfig, serviceId?: string): ServiceItem {
  if (!serviceId) return business.services[0];
  return (
    business.services.find((s) => s.id === serviceId) ||
    business.services.find((s) => s.name.toLowerCase().includes(serviceId.toLowerCase())) ||
    business.services[0]
  );
}

export function getStaffForService(business: BusinessConfig, serviceId: string): StaffMember[] {
  const capable = business.staff.filter(
    (st) => !st.services || st.services.length === 0 || st.services.includes(serviceId)
  );
  return capable.length > 0 ? capable : business.staff;
}

/**
 * Genera la lista de los próximos N días indicando cuáles están abiertos según `business_hours`
 */
export function getUpcomingDates(business: BusinessConfig, daysCount = 14): DateOption[] {
  const result: DateOption[] = [];
  for (let i = 0; i < daysCount; i++) {
    const dateStr = getDateString(i);
    const d = new Date(`${dateStr}T12:00:00`);
    const dayIdx = d.getDay();
    const dayName = DAYS_MAP[dayIdx];
    const schedule = business.business_hours?.[dayName];
    const isOpen = Boolean(schedule && schedule.open && schedule.close);

    result.push({
      date: dateStr,
      dayName,
      dayLabelEs: DAYS_ES_SHORT[dayIdx],
      dayNumber: String(d.getDate()).padStart(2, '0'),
      monthShortEs: MONTHS_ES_SHORT[d.getMonth()],
      fullLabelEs: formatSpanishDateLabel(dateStr),
      isOpen,
      isToday: i === 0,
    });
  }
  return result;
}

/**
 * Calcula disponibilidad instantánea (0ms, síncrona) con base en la configuración local y caché
 * para que la interfaz nunca muestre pantallas de carga al abrir o cambiar de día.
 */
export function getInstantLocalAvailability(
  business: BusinessConfig,
  params: { date: string; serviceId?: string; staffId?: string },
  cloudAppointments?: Appointment[] | null
): AvailabilityResult {
  const targetDate = params.date || getDateString(0);
  const parsedDate = new Date(`${targetDate}T12:00:00`);
  const service = findService(business, params.serviceId);

  if (isNaN(parsedDate.getTime())) {
    return {
      available: false,
      date: targetDate,
      dayName: 'monday',
      dateFormatted: targetDate,
      service: {
        id: service.id,
        name: service.name,
        price: service.price,
        durationMinutes: service.duration_minutes,
      },
      slots: [],
      reason: 'Formato de fecha inválido (usa YYYY-MM-DD).',
    };
  }

  const dayName = DAYS_MAP[parsedDate.getDay()];
  const dayHours = business.business_hours?.[dayName];

  if (!dayHours || !dayHours.open || !dayHours.close) {
    return {
      available: false,
      date: targetDate,
      dayName,
      dateFormatted: formatSpanishDateLabel(targetDate),
      service: {
        id: service.id,
        name: service.name,
        price: service.price,
        durationMinutes: service.duration_minutes,
      },
      slots: [],
      reason: `${business.name} no tiene atención los días ${DAYS_ES_FULL[parsedDate.getDay()]}.`,
    };
  }

  const duration = Number(service.duration_minutes) || 45;
  const interval = Number(business.booking_rules?.slot_interval_minutes) || 30;

  let candidateStaff = getStaffForService(business, service.id);
  if (params.staffId) {
    const filtered = candidateStaff.filter((st) => st.id === params.staffId);
    if (filtered.length > 0) candidateStaff = filtered;
  }

  const localAppts = loadLocalAppointments().filter(
    (a) => a.businessId === business.id && a.date === targetDate && a.status === 'confirmed'
  );

  const mergedMap = new Map<string, Appointment>();
  for (const a of localAppts) mergedMap.set(a.id, a);
  if (cloudAppointments) {
    for (const a of cloudAppointments) mergedMap.set(a.id, a);
  }
  const dayAppointments = Array.from(mergedMap.values()).filter(
    (a) => a.status === 'confirmed'
  );

  const openMin = timeToMinutes(dayHours.open);
  const closeMin = timeToMinutes(dayHours.close);
  const slots: AvailableSlot[] = [];

  const todayStr = getDateString(0);
  const now = new Date();
  const currentMinutesToday =
    targetDate === todayStr ? now.getHours() * 60 + now.getMinutes() + 30 : -1;

  for (let start = openMin; start + duration <= closeMin; start += interval) {
    if (currentMinutesToday > 0 && start < currentMinutesToday) {
      continue;
    }

    const end = start + duration;
    const freeStaff = candidateStaff.filter((st) => {
      const hasConflict = dayAppointments.some((appt) => {
        if (appt.staffId !== st.id) return false;
        const apptStart = timeToMinutes(appt.time);
        const apptEnd = appt.endTime
          ? timeToMinutes(appt.endTime)
          : apptStart + (appt.durationMinutes || 45);
        return start < apptEnd && end > apptStart;
      });
      return !hasConflict;
    });

    if (freeStaff.length > 0) {
      slots.push({
        time: minutesToTime(start),
        endTime: minutesToTime(end),
        availableStaff: freeStaff.map((s) => ({
          id: s.id,
          name: s.name,
          role: s.role,
        })),
      });
    }
  }

  return {
    available: slots.length > 0,
    date: targetDate,
    dayName,
    dateFormatted: formatSpanishDateLabel(targetDate),
    service: {
      id: service.id,
      name: service.name,
      price: service.price,
      durationMinutes: duration,
    },
    slots,
    reason:
      slots.length === 0
        ? `No quedan turnos disponibles para ${service.name} el ${formatSpanishDateLabel(targetDate)}.`
        : undefined,
  };
}

/**
 * Calcula los horarios disponibles reales en una fecha consultando las citas activas en Supabase
 * (tanto las agendadas en la web como las agendadas por el Bot de WhatsApp).
 */
export async function checkAvailability(
  business: BusinessConfig,
  params: { date: string; serviceId?: string; staffId?: string }
): Promise<AvailabilityResult> {
  const targetDate = params.date || getDateString(0);
  const cloudAppts = await fetchAppointmentsByDate(business.id, targetDate);
  return getInstantLocalAvailability(business, params, cloudAppts);
}

/**
 * Crea una cita desde la página web respetando el Plan del negocio y sincronizándola con Supabase.
 */
export async function createWebBooking(
  business: BusinessConfig,
  req: BookingRequest
): Promise<BookingResponse> {
  const clientName = String(req.clientName || '').trim();
  const clientPhone = normalizePhone(req.clientPhone);

  if (!clientName) {
    return {
      success: false,
      mode: 'auto_calendar_booking',
      message: 'Por favor ingresa tu nombre completo.',
      error: 'MISSING_NAME',
    };
  }

  if (!clientPhone || clientPhone.length < 7) {
    return {
      success: false,
      mode: 'auto_calendar_booking',
      message: 'Por favor ingresa un número de WhatsApp válido.',
      error: 'INVALID_PHONE',
    };
  }

  const service = findService(business, req.serviceId);

  // Si el negocio está en Plan Básico ($19.900), redirige la solicitud al WhatsApp del dueño
  if (!hasFeature(business, 'auto_calendar_booking')) {
    const waLink = buildBasicPlanWhatsAppLink(business, {
      clientName,
      serviceName: service.name,
      date: req.date,
      time: req.time,
    });

    return {
      success: true,
      mode: 'manual_whatsapp_redirect',
      whatsappRedirectUrl: waLink,
      message:
        'Solicitud lista. Serás redirigido al WhatsApp del negocio para confirmar tu turno.',
    };
  }

  // Plan Medio / Pro: Verificar disponibilidad en tiempo real antes de insertar
  const availability = await checkAvailability(business, {
    date: req.date,
    serviceId: service.id,
    staffId: req.staffId,
  });

  const matchingSlot = availability.slots.find((s) => s.time === req.time);
  if (!matchingSlot) {
    return {
      success: false,
      mode: 'auto_calendar_booking',
      message: `El horario de las ${req.time} ya no está disponible. Por favor elige otro turno.`,
      error: 'SLOT_TAKEN',
    };
  }

  const chosenStaff =
    (req.staffId && matchingSlot.availableStaff.find((s) => s.id === req.staffId)) ||
    matchingSlot.availableStaff[0];

  const appointment: Appointment = {
    id: generateBookingCode(),
    businessId: business.id,
    clientName,
    clientPhone,
    serviceId: service.id,
    serviceName: service.name,
    price: service.price,
    durationMinutes: service.duration_minutes,
    staffId: chosenStaff.id,
    staffName: chosenStaff.name,
    date: req.date,
    time: matchingSlot.time,
    endTime: matchingSlot.endTime,
    status: 'confirmed',
    source: 'website',
    notes: req.notes || 'Reserva creada desde la página web',
    createdAt: new Date().toISOString(),
  };

  saveLocalAppointment(appointment);
  await upsertAppointmentInSupabase(appointment);

  const whatsappConfirmationUrl = buildConfirmedBookingWhatsAppLink(business, {
    bookingCode: appointment.id,
    clientName: appointment.clientName,
    serviceName: appointment.serviceName,
    staffName: appointment.staffName,
    date: formatSpanishDateLabel(appointment.date),
    time: appointment.time,
  });

  return {
    success: true,
    mode: 'auto_calendar_booking',
    appointment,
    whatsappConfirmationUrl,
    message: `¡Reserva confirmada! Tu código es ${appointment.id} con ${appointment.staffName}.`,
  };
}

/**
 * Busca citas confirmadas de un cliente por teléfono o por código `CITA-XXXX`
 */
export async function lookupClientAppointments(
  business: BusinessConfig,
  phoneOrCode: string
): Promise<Appointment[]> {
  const clean = phoneOrCode.trim();
  if (!clean) return [];

  const cloudList = await fetchClientAppointmentsFromSupabase(business.id, clean);
  const localList = loadLocalAppointments().filter((a) => {
    if (a.businessId !== business.id || a.status !== 'confirmed') return false;
    if (clean.toUpperCase().startsWith('CITA-')) {
      return a.id.toUpperCase() === clean.toUpperCase();
    }
    const digits = clean.replace(/[^\d]/g, '');
    return digits.length >= 6 && a.clientPhone.replace(/[^\d]/g, '').includes(digits);
  });

  const merged = new Map<string, Appointment>();
  for (const a of localList) merged.set(a.id, a);
  if (cloudList) {
    for (const a of cloudList) merged.set(a.id, a);
  }

  return Array.from(merged.values()).sort((a, b) =>
    `${a.date} ${a.time}`.localeCompare(`${b.date} ${b.time}`)
  );
}

/**
 * Reagenda una cita existente en Supabase verificando disponibilidad en el nuevo horario
 */
export async function rescheduleWebBooking(
  business: BusinessConfig,
  params: {
    appointment: Appointment;
    newDate: string;
    newTime: string;
    newServiceId?: string;
  }
): Promise<BookingResponse> {
  const targetService = findService(
    business,
    params.newServiceId || params.appointment.serviceId
  );

  const availability = await checkAvailability(business, {
    date: params.newDate,
    serviceId: targetService.id,
  });

  const slot = availability.slots.find((s) => s.time === params.newTime);
  if (!slot) {
    return {
      success: false,
      mode: 'auto_calendar_booking',
      message: `El horario ${params.newTime} del ${formatSpanishDateLabel(
        params.newDate
      )} no está disponible.`,
      error: 'SLOT_UNAVAILABLE',
    };
  }

  const assignedStaff =
    slot.availableStaff.find((s) => s.id === params.appointment.staffId) ||
    slot.availableStaff[0];

  const updated: Appointment = {
    ...params.appointment,
    serviceId: targetService.id,
    serviceName: targetService.name,
    price: targetService.price,
    durationMinutes: targetService.duration_minutes,
    staffId: assignedStaff.id,
    staffName: assignedStaff.name,
    date: params.newDate,
    time: slot.time,
    endTime: slot.endTime,
    notes: `Reagendada desde la web (antes ${params.appointment.date} ${params.appointment.time})`,
  };

  saveLocalAppointment(updated);
  await upsertAppointmentInSupabase(updated);

  return {
    success: true,
    mode: 'auto_calendar_booking',
    appointment: updated,
    message: `Cita ${updated.id} reagendada para el ${formatSpanishDateLabel(
      updated.date
    )} a las ${updated.time}.`,
  };
}

/**
 * Cancela una cita existente en Supabase y libera el horario inmediatamente
 */
export async function cancelWebBooking(appointment: Appointment): Promise<{
  success: boolean;
  message: string;
}> {
  const cancelled: Appointment = {
    ...appointment,
    status: 'cancelled',
    notes: 'Cancelada por el cliente desde la página web',
  };

  saveLocalAppointment(cancelled);
  await upsertAppointmentInSupabase(cancelled);

  return {
    success: true,
    message: `Tu cita ${appointment.id} ha sido cancelada y el turno quedó liberado.`,
  };
}
