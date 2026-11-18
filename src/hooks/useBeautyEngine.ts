import { useCallback, useEffect, useMemo, useState } from 'react';
import { LOCAL_BUSINESS_CONFIG } from '../config/business.config';
import type {
  Appointment,
  AvailableSlot,
  BookingResponse,
  BusinessConfig,
  DateOption,
  ServiceItem,
  StaffMember,
} from '../types/engine';
import {
  cancelWebBooking,
  checkAvailability,
  createWebBooking,
  formatSpanishDateLabel,
  getInstantLocalAvailability,
  getStaffForService,
  getUpcomingDates,
  lookupClientAppointments,
  rescheduleWebBooking,
} from '../engine/bookingEngine';
import {
  buildDirectWhatsAppLink,
  getBusinessPlanInfo,
  hasFeature,
} from '../engine/planGate';
import {
  fetchBusinessFromSupabase,
  getSupabaseConfig,
  syncBusinessToSupabase,
} from '../engine/supabaseClient';

export function useBeautyEngine() {
  const [business, setBusiness] = useState<BusinessConfig>(LOCAL_BUSINESS_CONFIG);
  const [loadingBusiness, setLoadingBusiness] = useState<boolean>(false);
  const [supabaseConnected, setSupabaseConnected] = useState<boolean>(false);

  // Estado del flujo de reserva (inicializado al instante sin pantalla de carga)
  const [selectedServiceId, setSelectedServiceId] = useState<string>(
    LOCAL_BUSINESS_CONFIG.services[0]?.id || ''
  );
  const [selectedStaffId, setSelectedStaffId] = useState<string>(''); // '' = Cualquier profesional disponible
  const [selectedDate, setSelectedDate] = useState<string>(() => {
    const initialDates = getUpcomingDates(LOCAL_BUSINESS_CONFIG, 14);
    const firstOpen = initialDates.find((d) => d.isOpen) || initialDates[0];
    return firstOpen ? firstOpen.date : '';
  });
  const [availableSlots, setAvailableSlots] = useState<AvailableSlot[]>(() => {
    const initialDates = getUpcomingDates(LOCAL_BUSINESS_CONFIG, 14);
    const firstOpen = initialDates.find((d) => d.isOpen) || initialDates[0];
    if (!firstOpen) return [];
    return getInstantLocalAvailability(LOCAL_BUSINESS_CONFIG, {
      date: firstOpen.date,
      serviceId: LOCAL_BUSINESS_CONFIG.services[0]?.id,
    }).slots;
  });
  const [selectedTime, setSelectedTime] = useState<string>(() => {
    const initialDates = getUpcomingDates(LOCAL_BUSINESS_CONFIG, 14);
    const firstOpen = initialDates.find((d) => d.isOpen) || initialDates[0];
    if (!firstOpen) return '';
    const initSlots = getInstantLocalAvailability(LOCAL_BUSINESS_CONFIG, {
      date: firstOpen.date,
      serviceId: LOCAL_BUSINESS_CONFIG.services[0]?.id,
    }).slots;
    return initSlots[0]?.time || '';
  });
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [slotsReason, setSlotsReason] = useState<string | undefined>(undefined);

  const [clientForm, setClientForm] = useState({
    clientName: '',
    clientPhone: '',
    notes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [bookingResult, setBookingResult] = useState<BookingResponse | null>(null);

  // Estado de consulta / reagendamiento / cancelación de citas del cliente
  const [lookupQuery, setLookupQuery] = useState<string>('');
  const [clientAppointments, setClientAppointments] = useState<Appointment[]>([]);
  const [loadingLookup, setLoadingLookup] = useState<boolean>(false);
  const [lookupMessage, setLookupMessage] = useState<string>('');

  // 1. Sincronizar silenciosamente en segundo plano con Supabase sin bloquear la vista
  useEffect(() => {
    let mounted = true;
    async function init() {
      const sb = getSupabaseConfig();
      if (sb.enabled && import.meta.env.VITE_AUTO_SYNC_CONFIG === 'true') {
        syncBusinessToSupabase(LOCAL_BUSINESS_CONFIG).catch(() => {});
      }

      const { business: loaded, fromCloud } = await fetchBusinessFromSupabase(
        LOCAL_BUSINESS_CONFIG.id,
        LOCAL_BUSINESS_CONFIG
      );

      if (!mounted) return;
      setBusiness(loaded);
      setSupabaseConnected(fromCloud);
      setSelectedServiceId((prev) =>
        loaded.services.some((s) => s.id === prev) ? prev : loaded.services[0]?.id || ''
      );
      setLoadingBusiness(false);
    }

    init();
    return () => {
      mounted = false;
    };
  }, []);

  const planInfo = useMemo(() => getBusinessPlanInfo(business), [business]);

  const selectedService: ServiceItem = useMemo(() => {
    return (
      business.services.find((s) => s.id === selectedServiceId) || business.services[0]
    );
  }, [business.services, selectedServiceId]);

  const eligibleStaff: StaffMember[] = useMemo(() => {
    if (!selectedService) return business.staff;
    return getStaffForService(business, selectedService.id);
  }, [business, selectedService]);

  const availableDates: DateOption[] = useMemo(() => {
    return getUpcomingDates(business, 14);
  }, [business]);

  // 2. Recalcular horarios disponibles instantáneamente y luego sincronizar con Supabase en segundo plano
  const refreshAvailability = useCallback(async () => {
    if (!selectedDate || !selectedService) return;
    // Cálculo local instantáneo (0ms) para que no parpadee la interfaz
    const instant = getInstantLocalAvailability(business, {
      date: selectedDate,
      serviceId: selectedService.id,
      staffId: selectedStaffId || undefined,
    });
    setAvailableSlots(instant.slots);
    setSlotsReason(instant.reason);
    setSelectedTime((prev) =>
      instant.slots.some((s) => s.time === prev) ? prev : instant.slots[0]?.time || ''
    );

    // Sincronización silenciosa con las citas en Supabase
    setLoadingSlots(true);
    const res = await checkAvailability(business, {
      date: selectedDate,
      serviceId: selectedService.id,
      staffId: selectedStaffId || undefined,
    });
    setAvailableSlots(res.slots);
    setSlotsReason(res.reason);
    setLoadingSlots(false);

    setSelectedTime((prev) =>
      res.slots.some((s) => s.time === prev) ? prev : res.slots[0]?.time || ''
    );
  }, [business, selectedDate, selectedService, selectedStaffId]);

  useEffect(() => {
    refreshAvailability();
  }, [refreshAvailability]);

  // 3. Crear reserva
  const submitBooking = useCallback(
    async (e?: { preventDefault?: () => void }) => {
      if (e?.preventDefault) e.preventDefault();
      if (!selectedService || !selectedDate || !selectedTime) {
        const fail: BookingResponse = {
          success: false,
          mode: 'auto_calendar_booking',
          message: 'Selecciona un servicio, una fecha y un horario disponible.',
          error: 'MISSING_FIELDS',
        };
        setBookingResult(fail);
        return fail;
      }

      setIsSubmitting(true);
      const res = await createWebBooking(business, {
        clientName: clientForm.clientName,
        clientPhone: clientForm.clientPhone,
        serviceId: selectedService.id,
        staffId: selectedStaffId || undefined,
        date: selectedDate,
        time: selectedTime,
        notes: clientForm.notes,
      });
      setIsSubmitting(false);
      setBookingResult(res);

      if (res.success && res.mode === 'auto_calendar_booking') {
        await refreshAvailability();
      }

      return res;
    },
    [
      business,
      clientForm,
      refreshAvailability,
      selectedDate,
      selectedService,
      selectedStaffId,
      selectedTime,
    ]
  );

  const resetBooking = useCallback(() => {
    setBookingResult(null);
    setClientForm({ clientName: '', clientPhone: '', notes: '' });
    refreshAvailability();
  }, [refreshAvailability]);

  // 4. Consultar, reagendar y cancelar citas existentes del cliente
  const searchClientAppointments = useCallback(
    async (queryOverride?: string) => {
      const q = (queryOverride ?? lookupQuery).trim();
      if (!q) return [];
      setLoadingLookup(true);
      setLookupMessage('');
      const list = await lookupClientAppointments(business, q);
      setClientAppointments(list);
      setLoadingLookup(false);
      if (list.length === 0) {
        setLookupMessage('No encontramos citas activas con ese teléfono o código.');
      }
      return list;
    },
    [business, lookupQuery]
  );

  const rescheduleExistingAppointment = useCallback(
    async (appointment: Appointment, newDate: string, newTime: string) => {
      const res = await rescheduleWebBooking(business, {
        appointment,
        newDate,
        newTime,
      });
      if (res.success) {
        setLookupMessage(res.message);
        await searchClientAppointments(appointment.clientPhone);
        await refreshAvailability();
      } else {
        setLookupMessage(res.message);
      }
      return res;
    },
    [business, refreshAvailability, searchClientAppointments]
  );

  const cancelExistingAppointment = useCallback(
    async (appointment: Appointment) => {
      const res = await cancelWebBooking(appointment);
      if (res.success) {
        setLookupMessage(res.message);
        await searchClientAppointments(appointment.clientPhone);
        await refreshAvailability();
      }
      return res;
    },
    [refreshAvailability, searchClientAppointments]
  );

  // Helpers de formato y enlaces
  const formatPrice = useCallback(
    (price: number) => {
      return `${business.currency || '$'}${Number(price).toLocaleString('es-CO')}`;
    },
    [business.currency]
  );

  const getWhatsAppUrl = useCallback(
    (customMessage?: string) => buildDirectWhatsAppLink(business, customMessage),
    [business]
  );

  return {
    // Datos del negocio y estado de conexión
    business,
    services: business.services,
    staff: business.staff,
    faqs: business.faqs,
    planInfo,
    hasAutoCalendar: hasFeature(business, 'auto_calendar_booking'),
    loadingBusiness,
    supabaseConnected,

    // Selección de reserva
    selectedService,
    selectedServiceId,
    setSelectedServiceId,
    eligibleStaff,
    selectedStaffId,
    setSelectedStaffId,
    availableDates,
    selectedDate,
    setSelectedDate,
    availableSlots,
    loadingSlots,
    slotsReason,
    selectedTime,
    setSelectedTime,

    // Formulario de cliente y envío
    clientForm,
    setClientForm,
    isSubmitting,
    bookingResult,
    submitBooking,
    resetBooking,
    refreshAvailability,

    // Consulta, reagendamiento y cancelación de citas
    lookupQuery,
    setLookupQuery,
    clientAppointments,
    loadingLookup,
    lookupMessage,
    searchClientAppointments,
    rescheduleExistingAppointment,
    cancelExistingAppointment,

    // Utilidades listas para cualquier UI
    formatPrice,
    formatDateLabel: formatSpanishDateLabel,
    getWhatsAppUrl,
  };
}
