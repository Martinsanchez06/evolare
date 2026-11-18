# ⚡ Plantilla Web Base (Headless) — Belleza, Barberías & Spas

Esta es tu **carpeta base maestra** para crear demos y páginas web de clientes sin gastar tiempo ni tokens reprogramando la base de datos o la lógica de negocio.

Ya viene conectada en tiempo real a la misma base de datos de **Supabase** que usa tu repositorio del **Chatbot de WhatsApp** (`chatbot whatsapp`).

---

## 🚀 Flujo de Trabajo: Cómo usar esta plantilla para cada nuevo cliente

1. **Duplica esta carpeta completa** y ponle el nombre de tu nuevo cliente (ej. `web-barberia-don-carlos` o `web-aura-spa`).
2. Abre la carpeta duplicada y edita **[`src/config/business.config.ts`](src/config/business.config.ts)** con los datos del cliente (ID, nombre, servicios, precios, profesionales y horarios) y actualiza `VITE_BUSINESS_ID` en `.env`.
3. **Diseña el Frontend desde cero:**
   - Si lo diseñas con un agente de IA, solo dile:
     > *"Lee `AGENT_INSTRUCTIONS.md` y diseña desde cero en `src/App.tsx` una página web única para este negocio usando `useBeautyEngine()`."*
   - El agente no tocará nada del backend ni gastará tokens creando lógica: solo diseñará la interfaz visual en `src/App.tsx`.
4. Inicia el proyecto:
   ```bash
   npm install
   npm run dev
   ```

---

## 🔗 ¿Qué incluye ya conectado (`src/engine/` y `src/hooks/useBeautyEngine.ts`)?

- **Sincronización Automática con Supabase:** Al abrir la web, si el negocio de `src/config/business.config.ts` no existe todavía en Supabase, lo crea/actualiza automáticamente en las tablas `businesses`, `services`, `staff` y `faqs`.
- **Disponibilidad Real Compartida con WhatsApp:** Lee las citas confirmadas en la tabla `appointments` de Supabase para que nunca se crucen horarios entre la Web y el Bot de WhatsApp.
- **Soporte Nativo de tus 3 Planes Comerciales (`planGate.ts`):**
  - `basic` ($19.900/mes): Muestra el catálogo y redirige la solicitud de cita al WhatsApp del dueño.
  - `medium` ($79.900/mes) y `pro` ($149.900/mes): Agenda automáticamente en el calendario de Supabase (`source: 'website'`) generando código `CITA-XXXX`.
- **Módulo de Reagendamiento y Cancelación Web:** Permite que el cliente busque su cita por teléfono o código `CITA-XXXX`, la reagende o la cancele en vivo.
