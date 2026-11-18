export type PlanId = 'basic' | 'medium' | 'pro';

export interface PlanFeatures {
  web_catalog_supabase: boolean;
  manual_whatsapp_redirect: boolean;
  auto_calendar_booking: boolean;
  whatsapp_ai_bot: boolean;
  anti_noshow_reminder: boolean;
  staff_whatsapp_notify: boolean;
  vip_client_memory: boolean;
  dormant_client_reactivator: boolean;
  google_reviews_booster: boolean;
  owner_whatsapp_mode: boolean;
}

export interface PlanInfo {
  id: PlanId;
  name: string;
  badge: string;
  priceCop: number;
  priceFormatted: string;
  description: string;
  features: PlanFeatures;
}

export interface DaySchedule {
  open: string;
  close: string;
}

export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type BusinessHours = Record<DayOfWeek, DaySchedule | null>;

export interface BookingRules {
  slot_interval_minutes: number;
  min_advance_hours: number;
  max_advance_days: number;
  reschedule_min_hours_before: number;
  cancellation_policy: string;
  deposit_required: boolean;
  deposit_info: string;
  plan?: PlanId;
  owner_phone?: string;
}

export interface BotPersona {
  assistant_name: string;
  greeting_style: string;
  emojis: string;
  custom_instructions: string;
}

export interface ServiceItem {
  id: string;
  name: string;
  price: number;
  duration_minutes: number;
  description: string;
  category?: string;
  recurrence_days?: number;
}

export interface StaffMember {
  id: string;
  name: string;
  role: string;
  phone?: string;
  avatar_url?: string;
  services: string[];
}

export interface FaqItem {
  question: string;
  answer: string;
}

export interface BusinessConfig {
  id: string;
  name: string;
  plan: PlanId;
  owner_phone: string;
  category: string;
  currency: string;
  timezone: string;
  address: string;
  maps_url: string;
  phone: string;
  instagram: string;
  bot_persona: BotPersona;
  booking_rules: BookingRules;
  business_hours: BusinessHours;
  services: ServiceItem[];
  staff: StaffMember[];
  faqs: FaqItem[];
}

export interface AvailableSlot {
  time: string;
  endTime: string;
  availableStaff: Array<{ id: string; name: string; role: string }>;
}

export interface AvailabilityResult {
  available: boolean;
  date: string;
  dayName: DayOfWeek;
  dateFormatted: string;
  service: {
    id: string;
    name: string;
    price: number;
    durationMinutes: number;
  };
  slots: AvailableSlot[];
  reason?: string;
}

export interface DateOption {
  date: string; // YYYY-MM-DD
  dayName: DayOfWeek;
  dayLabelEs: string; // ej. "Lun", "Mar"
  dayNumber: string; // ej. "15"
  monthShortEs: string; // ej. "Nov"
  fullLabelEs: string; // ej. "domingo 15 de noviembre"
  isOpen: boolean;
  isToday: boolean;
}

export interface Appointment {
  id: string;
  businessId: string;
  clientName: string;
  clientPhone: string;
  serviceId: string;
  serviceName: string;
  price: number;
  durationMinutes: number;
  staffId: string;
  staffName: string;
  date: string;
  time: string;
  endTime: string;
  status: 'confirmed' | 'cancelled' | 'completed';
  source: 'website' | 'whatsapp' | 'admin';
  notes?: string;
  createdAt?: string;
}

export interface BookingRequest {
  clientName: string;
  clientPhone: string;
  serviceId: string;
  staffId?: string;
  date: string;
  time: string;
  notes?: string;
}

export interface BookingResponse {
  success: boolean;
  mode: 'auto_calendar_booking' | 'manual_whatsapp_redirect';
  appointment?: Appointment;
  whatsappRedirectUrl?: string;
  whatsappConfirmationUrl?: string;
  message: string;
  error?: string;
}
