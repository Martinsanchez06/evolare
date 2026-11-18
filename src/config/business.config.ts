import type { BusinessConfig } from '../types/engine';

export const LOCAL_BUSINESS_CONFIG: BusinessConfig = {
  id: import.meta.env.VITE_BUSINESS_ID || 'evolare-nail-studio',
  name: 'Evolare Nail Studio',
  plan: 'pro',
  owner_phone: '+573104567890',
  category: 'Nail Studio & Nail Art Personalizado',
  currency: '$',
  timezone: 'America/Bogota',
  address: 'Sector Hacienda Casablanca, Madrid, Cundinamarca',
  maps_url: 'https://maps.google.com/?q=Hacienda+Casablanca+Madrid+Cundinamarca',
  phone: '+57 310 456 7890',
  instagram: '@evolare_by.eli',

  bot_persona: {
    assistant_name: 'Eli (Asistente Evolare)',
    greeting_style:
      'Cálida, cercana, delicada y muy atenta, reflejando el trato personalizado 1 a 1 de un estudio boutique de uñas.',
    emojis: '🦋✨💅',
    custom_instructions:
      '- Atendemos en el sector Hacienda Casablanca en Madrid, Cundinamarca, con cita previa 1 a 1 junto a Eliana.\n- Si preguntan por diseños en tendencia (Ojo de gato, Flores 3D, Efecto Carey, Cromados o Francés con textura), recomienda agendar "Nail Art Personalizado & 3D" o "Soft Gel".\n- Recuerda amablemente nuestra tolerancia de 10 minutos para respetar el turno de cada clienta.',
  },

  booking_rules: {
    slot_interval_minutes: 30,
    min_advance_hours: 2,
    max_advance_days: 30,
    reschedule_min_hours_before: 4,
    cancellation_policy:
      'Puedes reagendar o cancelar sin costo hasta 4 horas antes de tu turno. Contamos con 10 minutos de tolerancia para cuidar la puntualidad de cada sesión.',
    deposit_required: false,
    deposit_info:
      'Reserva tu cita en línea sin anticipo; pagas directamente en el estudio al finalizar tu servicio.',
  },

  business_hours: {
    monday: { open: '09:00', close: '19:00' },
    tuesday: { open: '09:00', close: '19:00' },
    wednesday: { open: '09:00', close: '19:00' },
    thursday: { open: '09:00', close: '19:00' },
    friday: { open: '09:00', close: '20:00' },
    saturday: { open: '08:30', close: '18:00' },
    sunday: null,
  },

  services: [
    {
      id: 'soft-gel',
      name: 'Soft Gel',
      price: 85000,
      duration_minutes: 90,
      category: 'Sistemas & Extensión',
      recurrence_days: 21,
      description:
        'Extensión ultraligera de cobertura completa con acabado natural, flexible y resistente. Incluye preparación de cutícula, nivelación y color liso o brillo sellado.',
    },
    {
      id: 'nail-art-3d',
      name: 'Nail Art Personalizado & 3D',
      price: 125000,
      duration_minutes: 120,
      category: 'Diseño de Autor',
      recurrence_days: 21,
      description:
        'Diseño artesanal a mano alzada y relieve: Ojo de gato magnético, Flores 3D esculpidas, Efecto Carey, cromados metálicos o francés con textura.',
    },
    {
      id: 'sistemas-artificiales',
      name: 'Uñas Acrílicas / Polygel / Gel',
      price: 110000,
      duration_minutes: 120,
      category: 'Sistemas & Extensión',
      recurrence_days: 21,
      description:
        'Esculpido estructural a medida en acrílico, polygel o gel constructor. Ideal para lograr mayor longitud, arquitectura definida y máxima durabilidad.',
    },
    {
      id: 'manicura-semipermanente',
      name: 'Manicura & Semipermanente',
      price: 55000,
      duration_minutes: 60,
      category: 'Manicura Natural',
      recurrence_days: 15,
      description:
        'Limpieza minuciosa de cutícula, perfilado sobre uña natural, base fortalecedora y esmaltado semipermanente de alto brillo hasta por 15–21 días.',
    },
    {
      id: 'mantenimiento-retiro',
      name: 'Mantenimiento / Retiro Seguro',
      price: 45000,
      duration_minutes: 60,
      category: 'Cuidado & Retiro',
      recurrence_days: 15,
      description:
        'Retoque de crecimiento (retoque cada 15–21 días) o retiro cuidadoso sin dañar la lámina natural, con hidratación nutritiva de cutícula.',
    },
  ],

  staff: [
    {
      id: 'eliana-fundadora',
      name: 'Eliana',
      phone: '+573104567890',
      role: 'Fundadora & Nail Artist',
      services: [
        'soft-gel',
        'nail-art-3d',
        'sistemas-artificiales',
        'manicura-semipermanente',
        'mantenimiento-retiro',
      ],
    },
  ],

  faqs: [
    {
      question: '¿Dónde está ubicado el estudio y cómo llego?',
      answer:
        'Atendemos en el sector Hacienda Casablanca, Madrid (Cundinamarca). Al confirmar tu cita recibirás la ubicación exacta y referencias de llegada por WhatsApp.',
    },
    {
      question: '¿Cuáles son los horarios de atención?',
      answer:
        'Atendemos de lunes a jueves de 9:00 a.m. a 7:00 p.m., viernes de 9:00 a.m. a 8:00 p.m. y sábados de 8:30 a.m. a 6:00 p.m. Los domingos descansamos.',
    },
    {
      question: '¿Qué medios de pago reciben?',
      answer:
        'Puedes pagar en efectivo, por Nequi, Daviplata o transferencia bancaria directamente al finalizar tu turno en el estudio.',
    },
    {
      question: '¿Cuál es la política de puntualidad y reagendamiento?',
      answer:
        'Cada sesión es 1 a 1 y reservamos entre 60 y 120 minutos exclusivos para ti. Tienes 10 minutos de tolerancia y puedes reagendar o cancelar sin costo hasta 4 horas antes desde el portal "Mis Citas".',
    },
    {
      question: '¿Cada cuánto debo hacer mantenimiento de mis uñas?',
      answer:
        'Recomendamos agendar tu mantenimiento o retiro seguro cada 15 a 21 días para cuidar la salud de tu uña natural y mantener la estructura intacta.',
    },
  ],
};
