import type { BusinessConfig, PlanId, PlanInfo } from '../types/engine';

export const PLANS_CATALOG: Record<PlanId, PlanInfo> = {
  basic: {
    id: 'basic',
    name: 'Plan Básico',
    badge: '🥉 Básico',
    priceCop: 19900,
    priceFormatted: '$19.900 COP/mes',
    description:
      'Página Web conectada a Supabase + Envío de solicitud al WhatsApp del dueño (sin Bot IA ni agenda automática).',
    features: {
      web_catalog_supabase: true,
      manual_whatsapp_redirect: true,
      auto_calendar_booking: false,
      whatsapp_ai_bot: false,
      anti_noshow_reminder: false,
      staff_whatsapp_notify: false,
      vip_client_memory: false,
      dormant_client_reactivator: false,
      google_reviews_booster: false,
      owner_whatsapp_mode: false,
    },
  },
  medium: {
    id: 'medium',
    name: 'Plan Medio',
    badge: '🥈 Medio',
    priceCop: 79900,
    priceFormatted: '$79.900 COP/mes',
    description:
      'Agenda Automática + Chatbot WhatsApp IA Humano 24/7 + Recordatorio Anti-Plantones + Notificación al Staff.',
    features: {
      web_catalog_supabase: true,
      manual_whatsapp_redirect: true,
      auto_calendar_booking: true,
      whatsapp_ai_bot: true,
      anti_noshow_reminder: true,
      staff_whatsapp_notify: true,
      vip_client_memory: false,
      dormant_client_reactivator: false,
      google_reviews_booster: false,
      owner_whatsapp_mode: false,
    },
  },
  pro: {
    id: 'pro',
    name: 'Plan Pro',
    badge: '🥇 Pro',
    priceCop: 149900,
    priceFormatted: '$149.900 COP/mes',
    description:
      'Automatización Total: Todo el Plan Medio + Memoria VIP + Reactivador Clientes + Reseñas Google 5⭐ + Modo Dueño.',
    features: {
      web_catalog_supabase: true,
      manual_whatsapp_redirect: true,
      auto_calendar_booking: true,
      whatsapp_ai_bot: true,
      anti_noshow_reminder: true,
      staff_whatsapp_notify: true,
      vip_client_memory: true,
      dormant_client_reactivator: true,
      google_reviews_booster: true,
      owner_whatsapp_mode: true,
    },
  },
};

export function normalizePlanId(rawPlan?: string): PlanId {
  const raw = String(rawPlan || 'pro')
    .toLowerCase()
    .trim();
  if (raw === 'basico' || raw === 'básico' || raw === 'basic') return 'basic';
  if (raw === 'medio' || raw === 'medium') return 'medium';
  return 'pro';
}

export function getBusinessPlanInfo(business: Pick<BusinessConfig, 'plan' | 'booking_rules'>): PlanInfo {
  const planId = normalizePlanId(business.plan || business.booking_rules?.plan);
  return PLANS_CATALOG[planId] || PLANS_CATALOG.pro;
}

export function hasFeature(
  business: Pick<BusinessConfig, 'plan' | 'booking_rules'>,
  featureKey: keyof PlanInfo['features']
): boolean {
  const plan = getBusinessPlanInfo(business);
  return Boolean(plan.features[featureKey]);
}

export function cleanWhatsAppPhone(phone?: string): string {
  return String(phone || '+573001234567').replace(/[^\d]/g, '');
}

/**
 * Enlace de WhatsApp para clientes en Plan Básico ($19.900)
 */
export function buildBasicPlanWhatsAppLink(
  business: Pick<BusinessConfig, 'name' | 'phone'>,
  params: { clientName: string; serviceName: string; date: string; time: string }
): string {
  const phone = cleanWhatsAppPhone(business.phone);
  const text = `¡Hola *${business.name}*! Soy *${params.clientName}*, vi en su página web el servicio *${params.serviceName}* y me gustaría consultar disponibilidad para el día *${params.date}* a las *${params.time}*.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Enlace de WhatsApp post-reserva para confirmar o hablar con el asistente IA (Plan Medio / Pro)
 */
export function buildConfirmedBookingWhatsAppLink(
  business: Pick<BusinessConfig, 'name' | 'phone'>,
  params: {
    bookingCode: string;
    clientName: string;
    serviceName: string;
    staffName: string;
    date: string;
    time: string;
  }
): string {
  const phone = cleanWhatsAppPhone(business.phone);
  const text = `¡Hola *${business.name}*! Acabo de agendar en su página web:\n• *Código:* ${params.bookingCode}\n• *Cliente:* ${params.clientName}\n• *Servicio:* ${params.serviceName}\n• *Profesional:* ${params.staffName}\n• *Fecha y Hora:* ${params.date} a las ${params.time}`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}

/**
 * Enlace directo al WhatsApp del negocio con mensaje libre
 */
export function buildDirectWhatsAppLink(
  business: Pick<BusinessConfig, 'name' | 'phone'>,
  customMessage?: string
): string {
  const phone = cleanWhatsAppPhone(business.phone);
  const text =
    customMessage ||
    `¡Hola *${business.name}*! Vengo desde su página web y me gustaría recibir información.`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
}
