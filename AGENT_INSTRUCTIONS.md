# 🤖 INSTRUCCIONES PARA EL AGENTE DE IA (DISEÑO FRONTEND DESDE CERO)

Esta carpeta es una **Plantilla Base Headless** ya conectada a **Supabase** y sincronizada con el **Chatbot de WhatsApp**.

## 🚫 LO QUE NO DEBES HACER (Ahorro de Tokens)
1. **NO crees ni modifiques nada dentro de `src/engine/`, `src/hooks/` ni `src/types/`.** Toda la conexión a Supabase, cálculo de disponibilidad, creación/reagendamiento/cancelación de citas y reglas de planes (`basic`, `medium`, `pro`) ya está 100% programada y probada.
2. **NO instales clientes adicionales ni reescribas la lógica de reservas.**

## ✅ LO QUE SÍ DEBES HACER CUANDO EL USUARIO TE PIDA UN NUEVO PROYECTO / DISEÑO
1. **Actualizar los datos del cliente (si aplica):**
   Edita [`src/config/business.config.ts`](src/config/business.config.ts) con el `id`, `name`, `plan`, `services`, `staff`, `business_hours` y `faqs` del negocio. (Al cargar la web, se sincroniza automáticamente con Supabase).
2. **Diseñar el Frontend 100% desde cero y a medida:**
   Reemplaza [`src/App.tsx`](src/App.tsx) (y crea los componentes visuales que necesites en `src/components/`) con una identidad visual única, creativa y completamente distinta para este cliente.
3. **Conectar tu diseño usando únicamente el hook `useBeautyEngine()`:**

```tsx
import { useBeautyEngine } from './hooks/useBeautyEngine';

export default function App() {
  const {
    // 1. Información del negocio (leída de Supabase)
    business,          // { id, name, category, address, phone, instagram, maps_url, business_hours, booking_rules }
    services,          // Array de servicios { id, name, price, duration_minutes, description }
    staff,             // Array de profesionales { id, name, role, services }
    faqs,              // Array de preguntas frecuentes { question, answer }
    planInfo,          // Información del plan actual ('basic' | 'medium' | 'pro')
    hasAutoCalendar,   // true en Plan Medio/Pro, false en Plan Básico

    // 2. Selección interactiva para agendar
    selectedService,
    selectedServiceId,
    setSelectedServiceId,
    eligibleStaff,     // Profesionales filtrados automáticamente para el servicio elegido
    selectedStaffId,
    setSelectedStaffId,
    availableDates,    // Próximos 14 días con { date, dayLabelEs, dayNumber, monthShortEs, isOpen }
    selectedDate,
    setSelectedDate,
    availableSlots,    // Horarios libres reales en Supabase [{ time, endTime, availableStaff }]
    loadingSlots,
    selectedTime,
    setSelectedTime,

    // 3. Formulario del cliente y confirmación
    clientForm,        // { clientName, clientPhone, notes }
    setClientForm,
    isSubmitting,
    bookingResult,     // Respuesta tras agendar (incluye código CITA-XXXX y link de WhatsApp)
    submitBooking,
    resetBooking,

    // 4. Consulta, reagendamiento y cancelación de citas existentes
    lookupQuery,
    setLookupQuery,
    clientAppointments,
    searchClientAppointments,
    rescheduleExistingAppointment,
    cancelExistingAppointment,

    // 5. Utilidades
    formatPrice,       // Formatea precios con la moneda del negocio
    formatDateLabel,   // Formatea YYYY-MM-DD en español ("domingo 15 de noviembre")
    getWhatsAppUrl,    // Genera link directo a WhatsApp del negocio
  } = useBeautyEngine();

  // ... Tu diseño personalizado aquí ...
}
```
