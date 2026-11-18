import type {
  Appointment,
  BusinessConfig,
  FaqItem,
  ServiceItem,
  StaffMember,
} from '../types/engine';
import { normalizePlanId } from './planGate';

export function getSupabaseConfig() {
  const url = String(import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
  const key = String(import.meta.env.VITE_SUPABASE_ANON_KEY || '').trim();
  return {
    url,
    key,
    enabled: Boolean(url && key && !url.includes('tu-proyecto')),
  };
}

async function sbRequest<T = any>(
  endpoint: string,
  options: {
    method?: 'GET' | 'POST' | 'PATCH' | 'DELETE';
    body?: any;
    prefer?: string;
  } = {}
): Promise<{ ok: boolean; status: number; data: T | null; disabled?: boolean }> {
  const { url, key, enabled } = getSupabaseConfig();
  if (!enabled) {
    return { ok: false, status: 0, data: null, disabled: true };
  }

  const headers: Record<string, string> = {
    apikey: key,
    Authorization: `Bearer ${key}`,
    'Content-Type': 'application/json',
  };
  if (options.prefer) {
    headers.Prefer = options.prefer;
  }

  try {
    const res = await fetch(`${url}/rest/v1/${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body !== undefined ? JSON.stringify(options.body) : undefined,
    });

    const text = await res.text();
    let data: any = null;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }

    return { ok: res.ok, status: res.status, data };
  } catch (err) {
    console.warn('[Supabase Client] Error de red:', err);
    return { ok: false, status: 500, data: null };
  }
}

/**
 * Sincroniza el objeto local `BusinessConfig` hacia las tablas de Supabase
 * (`businesses`, `services`, `staff`, `faqs`) para que el Chatbot de WhatsApp
 * y la Página Web tengan siempre la misma configuración.
 */
export async function syncBusinessToSupabase(biz: BusinessConfig): Promise<{
  success: boolean;
  reason?: string;
}> {
  const { enabled } = getSupabaseConfig();
  if (!enabled) return { success: false, reason: 'Supabase no configurado' };

  const bizRow = {
    id: biz.id,
    name: biz.name,
    category: biz.category || 'Belleza & Bienestar',
    currency: biz.currency || '$',
    timezone: biz.timezone || 'America/Bogota',
    address: biz.address || '',
    maps_url: biz.maps_url || '',
    phone: biz.phone || '',
    instagram: biz.instagram || '',
    assistant_name: biz.bot_persona?.assistant_name || 'Mateo',
    greeting_style: biz.bot_persona?.greeting_style || '',
    emojis: biz.bot_persona?.emojis || '✨',
    custom_instructions: biz.bot_persona?.custom_instructions || '',
    business_hours: biz.business_hours || {},
    booking_rules: {
      ...(biz.booking_rules || {}),
      plan: biz.plan || biz.booking_rules?.plan || 'pro',
      owner_phone: biz.owner_phone || biz.booking_rules?.owner_phone || '',
    },
    active: true,
    updated_at: new Date().toISOString(),
  };

  const bizRes = await sbRequest('businesses?on_conflict=id', {
    method: 'POST',
    body: bizRow,
    prefer: 'resolution=merge-duplicates,return=minimal',
  });

  if (!bizRes.ok) {
    return { success: false, reason: 'No se pudo sincronizar la tabla businesses' };
  }

  if (Array.isArray(biz.services) && biz.services.length > 0) {
    const serviceRows = biz.services.map((s, idx) => ({
      business_id: biz.id,
      id: s.id,
      name: s.name,
      price: Number(s.price) || 0,
      duration_minutes: Number(s.duration_minutes) || 45,
      description: s.description || '',
      active: true,
      sort_order: idx + 1,
    }));

    await sbRequest('services?on_conflict=business_id,id', {
      method: 'POST',
      body: serviceRows,
      prefer: 'resolution=merge-duplicates,return=minimal',
    });
  }

  if (Array.isArray(biz.staff) && biz.staff.length > 0) {
    const staffRows = biz.staff.map((st) => ({
      business_id: biz.id,
      id: st.id,
      name: st.name,
      role: st.role || '',
      service_ids: Array.isArray(st.services) ? st.services : [],
      avatar_url: st.avatar_url || null,
      active: true,
    }));

    await sbRequest('staff?on_conflict=business_id,id', {
      method: 'POST',
      body: staffRows,
      prefer: 'resolution=merge-duplicates,return=minimal',
    });
  }

  return { success: true };
}

/**
 * Descarga un negocio completo desde Supabase (businesses + services + staff + faqs).
 * Si aún no existe en Supabase y `fallbackConfig` está presente, lo sube automáticamente.
 */
export async function fetchBusinessFromSupabase(
  businessId: string,
  fallbackConfig: BusinessConfig
): Promise<{ business: BusinessConfig; fromCloud: boolean }> {
  const { enabled } = getSupabaseConfig();
  if (!enabled) {
    return { business: fallbackConfig, fromCloud: false };
  }

  const encodedId = encodeURIComponent(businessId);
  const [bizRes, svcRes, staffRes, faqRes] = await Promise.all([
    sbRequest<any[]>(`businesses?id=eq.${encodedId}&select=*`),
    sbRequest<any[]>(
      `services?business_id=eq.${encodedId}&active=eq.true&order=sort_order.asc`
    ),
    sbRequest<any[]>(`staff?business_id=eq.${encodedId}&active=eq.true`),
    sbRequest<any[]>(`faqs?business_id=eq.${encodedId}&order=sort_order.asc`),
  ]);

  if (!bizRes.ok || !Array.isArray(bizRes.data) || bizRes.data.length === 0) {
    // Si el negocio no existe aún en Supabase, lo creamos automáticamente desde la plantilla local
    await syncBusinessToSupabase(fallbackConfig);
    return { business: fallbackConfig, fromCloud: true };
  }

  const row = bizRes.data[0];

  const services: ServiceItem[] =
    Array.isArray(svcRes.data) && svcRes.data.length > 0
      ? svcRes.data.map((s) => ({
          id: s.id,
          name: s.name,
          price: Number(s.price) || 0,
          duration_minutes: Number(s.duration_minutes) || 45,
          description: s.description || '',
        }))
      : fallbackConfig.services;

  const staff: StaffMember[] =
    Array.isArray(staffRes.data) && staffRes.data.length > 0
      ? staffRes.data.map((st) => ({
          id: st.id,
          name: st.name,
          role: st.role || '',
          avatar_url: st.avatar_url || undefined,
          services: Array.isArray(st.service_ids) ? st.service_ids : [],
        }))
      : fallbackConfig.staff;

  const faqs: FaqItem[] =
    Array.isArray(faqRes.data) && faqRes.data.length > 0
      ? faqRes.data.map((f) => ({
          question: f.question,
          answer: f.answer,
        }))
      : fallbackConfig.faqs;

  const rules = {
    ...fallbackConfig.booking_rules,
    ...(row.booking_rules || {}),
  };

  const merged: BusinessConfig = {
    id: row.id,
    name: row.name || fallbackConfig.name,
    plan: normalizePlanId(row.booking_rules?.plan || fallbackConfig.plan),
    owner_phone: row.booking_rules?.owner_phone || fallbackConfig.owner_phone,
    category: row.category || fallbackConfig.category,
    currency: row.currency || fallbackConfig.currency,
    timezone: row.timezone || fallbackConfig.timezone,
    address: row.address || fallbackConfig.address,
    maps_url: row.maps_url || fallbackConfig.maps_url,
    phone: row.phone || fallbackConfig.phone,
    instagram: row.instagram || fallbackConfig.instagram,
    bot_persona: {
      assistant_name: row.assistant_name || fallbackConfig.bot_persona.assistant_name,
      greeting_style: row.greeting_style || fallbackConfig.bot_persona.greeting_style,
      emojis: row.emojis || fallbackConfig.bot_persona.emojis,
      custom_instructions:
        row.custom_instructions || fallbackConfig.bot_persona.custom_instructions,
    },
    booking_rules: rules,
    business_hours: row.business_hours || fallbackConfig.business_hours,
    services,
    staff,
    faqs,
  };

  return { business: merged, fromCloud: true };
}

function mapRowToAppointment(r: any): Appointment {
  return {
    id: r.id,
    businessId: r.business_id,
    clientName: r.client_name,
    clientPhone: r.client_phone,
    serviceId: r.service_id,
    serviceName: r.service_name,
    price: Number(r.price) || 0,
    durationMinutes: Number(r.duration_minutes) || 45,
    staffId: r.staff_id,
    staffName: r.staff_name,
    date: r.date,
    time: r.time,
    endTime: r.end_time || r.time,
    status: r.status || 'confirmed',
    source: r.source || 'website',
    notes: r.notes || '',
    createdAt: r.created_at,
  };
}

/**
 * Descarga las citas activas de un negocio en una fecha dada desde Supabase
 */
export async function fetchAppointmentsByDate(
  businessId: string,
  date: string
): Promise<Appointment[] | null> {
  const { enabled } = getSupabaseConfig();
  if (!enabled) return null;

  const query = `appointments?business_id=eq.${encodeURIComponent(
    businessId
  )}&date=eq.${encodeURIComponent(date)}&status=eq.confirmed&select=*`;

  const res = await sbRequest<any[]>(query);
  if (!res.ok || !Array.isArray(res.data)) return null;
  return res.data.map(mapRowToAppointment);
}

/**
 * Busca las citas confirmadas de un cliente por teléfono o por código de cita (ej. CITA-A101)
 */
export async function fetchClientAppointmentsFromSupabase(
  businessId: string,
  phoneOrCode: string
): Promise<Appointment[] | null> {
  const { enabled } = getSupabaseConfig();
  if (!enabled) return null;

  const clean = phoneOrCode.trim();
  if (!clean) return [];

  const isCode = clean.toUpperCase().startsWith('CITA-');
  const encodedBiz = encodeURIComponent(businessId);

  let query = `appointments?business_id=eq.${encodedBiz}&status=eq.confirmed&order=date.asc,time.asc&select=*`;
  if (isCode) {
    query += `&id=eq.${encodeURIComponent(clean.toUpperCase())}`;
  } else {
    const digits = clean.replace(/[^\d]/g, '');
    query += `&client_phone=ilike.*${encodeURIComponent(digits)}*`;
  }

  const res = await sbRequest<any[]>(query);
  if (!res.ok || !Array.isArray(res.data)) return null;
  return res.data.map(mapRowToAppointment);
}

/**
 * Inserta o actualiza una cita en la tabla `appointments` de Supabase
 */
export async function upsertAppointmentInSupabase(appt: Appointment): Promise<boolean> {
  const { enabled } = getSupabaseConfig();
  if (!enabled) return false;

  const row = {
    id: appt.id,
    business_id: appt.businessId,
    client_name: appt.clientName,
    client_phone: appt.clientPhone,
    service_id: appt.serviceId,
    service_name: appt.serviceName,
    price: Number(appt.price) || 0,
    duration_minutes: Number(appt.durationMinutes) || 45,
    staff_id: appt.staffId,
    staff_name: appt.staffName,
    date: appt.date,
    time: appt.time,
    end_time: appt.endTime,
    status: appt.status,
    source: appt.source || 'website',
    notes: appt.notes || '',
    updated_at: new Date().toISOString(),
  };

  const res = await sbRequest('appointments?on_conflict=id', {
    method: 'POST',
    body: row,
    prefer: 'resolution=merge-duplicates,return=minimal',
  });

  return res.ok;
}
