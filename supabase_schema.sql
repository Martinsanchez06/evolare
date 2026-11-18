-- ============================================================================
-- ESQUEMA OFICIAL MULTI-NEGOCIO PARA SUPABASE (POSTGRESQL)
-- Sistema: Páginas Web (Bolt.new) + Chatbot WhatsApp IA + Agenda & Reagendamiento
-- Instrucciones: Copia todo este archivo, pégalo en "SQL Editor" de Supabase y dale a "Run".
-- ============================================================================

-- 1. TABLA DE NEGOCIOS (Tus Clientes: Barberías, Spas, Uñas, Cejas)
CREATE TABLE IF NOT EXISTS public.businesses (
  id TEXT PRIMARY KEY,                        -- Slug único, ej: 'barberia-imperial'
  name TEXT NOT NULL,                         -- Nombre comercial: 'Barbería Imperial Studio'
  category TEXT DEFAULT 'Belleza & Bienestar',
  currency TEXT DEFAULT '$',
  timezone TEXT DEFAULT 'America/Bogota',
  address TEXT,
  maps_url TEXT,
  phone TEXT,
  instagram TEXT,
  -- Configuración de Personalidad del Asesor Humano en WhatsApp
  assistant_name TEXT DEFAULT 'Mateo',
  greeting_style TEXT,
  emojis TEXT DEFAULT '✨',
  custom_instructions TEXT,
  -- Horarios y Reglas de Reserva en formato JSON flexible
  business_hours JSONB DEFAULT '{
    "monday": {"open": "09:00", "close": "20:00"},
    "tuesday": {"open": "09:00", "close": "20:00"},
    "wednesday": {"open": "09:00", "close": "20:00"},
    "thursday": {"open": "09:00", "close": "20:00"},
    "friday": {"open": "09:00", "close": "20:00"},
    "saturday": {"open": "09:00", "close": "19:00"},
    "sunday": null
  }'::jsonb,
  booking_rules JSONB DEFAULT '{
    "slot_interval_minutes": 30,
    "min_advance_hours": 1,
    "max_advance_days": 30,
    "reschedule_min_hours_before": 2,
    "message_wait_seconds": 10,
    "cancellation_policy": "Puedes reagendar sin costo avisando con al menos 2 horas de anticipación.",
    "deposit_required": false,
    "deposit_info": "Sin anticipo previo."
  }'::jsonb,
  -- Datos de conexión WhatsApp
  whatsapp_config JSONB DEFAULT '{"mode": "qr"}'::jsonb,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. TABLA DE SERVICIOS (Catálogo de cada negocio)
CREATE TABLE IF NOT EXISTS public.services (
  pk UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  id TEXT NOT NULL,                           -- ID del servicio, ej: 'corte-clasico'
  name TEXT NOT NULL,                         -- Nombre: 'Corte Imperial (Fade / Clásico)'
  price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  duration_minutes INTEGER NOT NULL DEFAULT 45,
  description TEXT,
  active BOOLEAN DEFAULT true,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (business_id, id)
);

-- 3. TABLA DE PROFESIONALES / STAFF (Barberos, Manicuristas, Esteticistas)
CREATE TABLE IF NOT EXISTS public.staff (
  pk UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  id TEXT NOT NULL,                           -- ID del profesional, ej: 'alex-master'
  name TEXT NOT NULL,                         -- Nombre: 'Alex (Master Barber)'
  role TEXT,                                  -- Especialidad: 'Especialista en Degradados'
  service_ids TEXT[] DEFAULT '{}',            -- Array de IDs de servicios que realiza
  avatar_url TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (business_id, id)
);

-- 4. TABLA DE PREGUNTAS FRECUENTES (FAQs por negocio)
CREATE TABLE IF NOT EXISTS public.faqs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  question TEXT NOT NULL,
  answer TEXT NOT NULL,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. TABLA CENTRAL DE CITAS (Compartida entre las Páginas Web de Bolt.new y el Bot de WhatsApp)
CREATE TABLE IF NOT EXISTS public.appointments (
  id TEXT PRIMARY KEY,                        -- Código corto de reserva, ej: 'CITA-A101'
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_name TEXT NOT NULL,
  client_phone TEXT NOT NULL,
  service_id TEXT NOT NULL,
  service_name TEXT NOT NULL,
  price NUMERIC(10, 2) DEFAULT 0,
  duration_minutes INTEGER DEFAULT 45,
  staff_id TEXT NOT NULL,
  staff_name TEXT NOT NULL,
  date DATE NOT NULL,                         -- Fecha YYYY-MM-DD
  time TEXT NOT NULL,                         -- Hora inicio HH:MM (24h)
  end_time TEXT NOT NULL,                     -- Hora fin HH:MM (24h)
  status TEXT NOT NULL DEFAULT 'confirmed',   -- 'confirmed' | 'cancelled' | 'completed'
  source TEXT NOT NULL DEFAULT 'whatsapp',    -- 'website' (Bolt.new) | 'whatsapp' | 'admin'
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Índices para búsquedas instantáneas por negocio, fecha y teléfono del cliente
CREATE INDEX IF NOT EXISTS idx_appointments_biz_date ON public.appointments(business_id, date, status);
CREATE INDEX IF NOT EXISTS idx_appointments_client_phone ON public.appointments(business_id, client_phone);

-- 6. TABLA DE HISTORIAL DE CONVERSACIONES DE WHATSAPP (Memoria del Bot por Cliente)
CREATE TABLE IF NOT EXISTS public.chat_messages (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  business_id TEXT NOT NULL REFERENCES public.businesses(id) ON DELETE CASCADE,
  client_phone TEXT NOT NULL,
  client_name TEXT,
  role TEXT NOT NULL,                         -- 'user' | 'assistant'
  content TEXT NOT NULL,
  provider TEXT,
  actions_executed JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_lookup ON public.chat_messages(business_id, client_phone, created_at DESC);

-- ============================================================================
-- PERMISOS Y POLÍTICAS (RLS) PARA QUE BOLT.NEW Y TU MOTOR PUEDAN LEER/ESCRIBIR
-- ============================================================================
ALTER TABLE public.businesses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.faqs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;

-- Políticas de lectura pública para catálogo (necesario para que las webs de Bolt.new muestren servicios, staff y horarios)
DROP POLICY IF EXISTS "Public read businesses" ON public.businesses;
CREATE POLICY "Public read businesses" ON public.businesses FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read services" ON public.services;
CREATE POLICY "Public read services" ON public.services FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read staff" ON public.staff;
CREATE POLICY "Public read staff" ON public.staff FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read faqs" ON public.faqs;
CREATE POLICY "Public read faqs" ON public.faqs FOR SELECT USING (true);

-- Políticas de acceso completo para el backend y creación de citas desde la web
DROP POLICY IF EXISTS "Allow all businesses" ON public.businesses;
CREATE POLICY "Allow all businesses" ON public.businesses FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all services" ON public.services;
CREATE POLICY "Allow all services" ON public.services FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all staff" ON public.staff;
CREATE POLICY "Allow all staff" ON public.staff FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all faqs" ON public.faqs;
CREATE POLICY "Allow all faqs" ON public.faqs FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all appointments" ON public.appointments;
CREATE POLICY "Allow all appointments" ON public.appointments FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Allow all chat_messages" ON public.chat_messages;
CREATE POLICY "Allow all chat_messages" ON public.chat_messages FOR ALL USING (true) WITH CHECK (true);
