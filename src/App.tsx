import React, { useMemo, useState } from 'react';
import { CalendarCheck, Check, Menu, MessageCircle, ShieldCheck, Star, X } from 'lucide-react';
import { useBeautyEngine } from './hooks/useBeautyEngine';
import { ButterflyMark } from './components/ButterflyMark';
import { MagazineHero } from './components/MagazineHero';
import { CatalogView } from './components/CatalogView';
import { BookingAtelier } from './components/BookingAtelier';
import { StudioLocationFaq } from './components/StudioLocationFaq';
import { QuickBookingSheet } from './components/QuickBookingSheet';

const WHATSAPP_DIRECT_LINK = 'https://wa.link/vvy9v4';

export function App() {
  const engine = useBeautyEngine();
  const [agendaTab, setAgendaTab] = useState<'book' | 'manage'>('book');
  const [sheetOpen, setSheetOpen] = useState<boolean>(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);

  const scrollToSection = (sectionId: string) => {
    setMobileMenuOpen(false);
    const el = document.getElementById(sectionId);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const openQuickBook = (serviceId?: string) => {
    setMobileMenuOpen(false);
    if (serviceId) {
      engine.setSelectedServiceId(serviceId);
    }
    setSheetOpen(true);
  };

  const openManageAppointments = () => {
    setMobileMenuOpen(false);
    setAgendaTab('manage');
    scrollToSection('agenda');
  };

  const nextAvailableLabel = useMemo(() => {
    const openDate = engine.availableDates.find(
      (d) => d.date === engine.selectedDate && d.isOpen
    );
    const firstSlot = engine.availableSlots[0];
    if (!openDate || !firstSlot) {
      return 'Agenda abierta esta semana';
    }
    const dayPrefix = openDate.isToday ? 'Hoy' : `${openDate.dayLabelEs} ${openDate.dayNumber}`;
    return `${dayPrefix} · ${firstSlot.time}`;
  }, [engine.availableDates, engine.availableSlots, engine.selectedDate]);

  return (
    <div className="min-h-screen w-full max-w-full overflow-x-clip bg-white text-[#2B1D14] flex flex-col">
      {/* Barra superior simétrica de revista (Propuesta C) */}
      <header className="sticky top-0 z-40 w-full bg-white/95 backdrop-blur-md border-b border-[#2B1D14]/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex md:grid md:grid-cols-3 items-center justify-between gap-3">
          {/* Enlaces izquierda (escritorio) */}
          <nav
            aria-label="Navegación izquierda"
            className="hidden md:flex items-center gap-6 text-sm font-medium text-[#2B1D14]/80"
          >
            <a
              href="#catalogo"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('catalogo');
              }}
              className="py-1 border-b-2 border-transparent hover:border-[#6E2331] hover:text-[#6E2331] transition-colors"
            >
              Lookbook &amp; Carta
            </a>
            <a
              href="#eliana"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('eliana');
              }}
              className="py-1 border-b-2 border-transparent hover:border-[#6E2331] hover:text-[#6E2331] transition-colors"
            >
              El Estudio
            </a>
            <a
              href="#ubicacion"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('ubicacion');
              }}
              className="py-1 border-b-2 border-transparent hover:border-[#6E2331] hover:text-[#6E2331] transition-colors"
            >
              Ubicación
            </a>
          </nav>

          {/* Logo centrado con mariposa arriba (desktop) / izquierda (móvil) */}
          <a
            href="#inicio"
            onClick={(e) => {
              e.preventDefault();
              scrollToSection('inicio');
            }}
            aria-label="Evolare Nail Studio Inicio"
            className="flex md:flex-col items-center md:justify-center gap-2 md:gap-0.5 text-[#2B1D14] min-w-0 justify-self-start md:justify-self-center"
          >
            <ButterflyMark className="w-6 h-6 sm:w-7 sm:h-7 shrink-0" />
            <div className="flex flex-col md:items-center leading-none">
              <span className="font-serif text-base sm:text-lg tracking-[0.22em] font-medium uppercase">
                EVOLARE
              </span>
              <span className="text-[8px] tracking-[0.28em] uppercase text-[#2B1D14]/65 mt-0.5">
                NAIL STUDIO
              </span>
            </div>
          </a>

          {/* Acciones derecha */}
          <div className="flex items-center justify-end gap-2 shrink-0">
            <button
              type="button"
              onClick={openManageAppointments}
              className="btn-press hidden sm:inline-flex px-3.5 py-2 rounded-full text-xs sm:text-sm font-medium text-[#2B1D14] border border-[#2B1D14]/20 hover:border-[#6E2331] hover:text-[#6E2331]"
            >
              Mis Citas
            </button>
            <button
              type="button"
              onClick={() => openQuickBook()}
              className="btn-press px-4 sm:px-5 py-2 rounded-full bg-[#2B1D14] text-white text-xs sm:text-sm font-medium hover:bg-[#6E2331]"
            >
              Agendar
            </button>
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Cerrar menú' : 'Abrir menú'}
              aria-expanded={mobileMenuOpen}
              className="md:hidden btn-press w-9 h-9 rounded-full border border-[#2B1D14]/15 flex items-center justify-center text-[#2B1D14]"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Menú desplegable móvil */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-[#2B1D14]/10 bg-white px-4 py-4 space-y-1.5">
            <a
              href="#catalogo"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('catalogo');
              }}
              className="block py-2.5 px-3 rounded-xl text-sm font-medium text-[#2B1D14] hover:bg-[#F7F7F8]"
            >
              Lookbook &amp; Carta de Servicios
            </a>
            <a
              href="#eliana"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('eliana');
              }}
              className="block py-2.5 px-3 rounded-xl text-sm font-medium text-[#2B1D14] hover:bg-[#F7F7F8]"
            >
              Sobre Eliana &amp; El Estudio
            </a>
            <a
              href="#agenda"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('agenda');
              }}
              className="block py-2.5 px-3 rounded-xl text-sm font-medium text-[#2B1D14] hover:bg-[#F7F7F8]"
            >
              Agenda en Tiempo Real
            </a>
            <a
              href="#ubicacion"
              onClick={(e) => {
                e.preventDefault();
                scrollToSection('ubicacion');
              }}
              className="block py-2.5 px-3 rounded-xl text-sm font-medium text-[#2B1D14] hover:bg-[#F7F7F8]"
            >
              Ubicación &amp; Horarios
            </a>
            <div className="pt-2 border-t border-[#2B1D14]/10 flex items-center gap-2">
              <button
                type="button"
                onClick={openManageAppointments}
                className="btn-press flex-1 py-2.5 px-4 rounded-full border border-[#2B1D14]/20 text-xs font-medium text-[#2B1D14]"
              >
                Mis Citas
              </button>
              <a
                href={WHATSAPP_DIRECT_LINK}
                target="_blank"
                rel="noreferrer"
                className="btn-press flex-1 inline-flex items-center justify-center gap-1.5 py-2.5 px-4 rounded-full bg-[#F3DE9A] text-xs font-medium text-[#2B1D14]"
              >
                <MessageCircle className="w-3.5 h-3.5" />
                <span>WhatsApp</span>
              </a>
            </div>
          </div>
        )}
      </header>

      {/* Contenido Principal */}
      <main className="flex-1 min-w-0 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-10 space-y-14 sm:space-y-20">
        {/* 1. Portada Revista Serene White + Tríptico */}
        <MagazineHero
          nextAvailableLabel={nextAvailableLabel}
          whatsappDirectUrl={WHATSAPP_DIRECT_LINK}
          onQuickBook={openQuickBook}
          onGoCatalog={() => scrollToSection('catalogo')}
        />

        {/* 2. Lookbook & Carta de Alta Costura */}
        <div id="catalogo" className="pt-8 border-t border-[#2B1D14]/10 scroll-mt-24">
          <CatalogView
            services={engine.services}
            selectedServiceId={engine.selectedServiceId}
            formatPrice={engine.formatPrice}
            onQuickBookService={(serviceId) => openQuickBook(serviceId)}
          />
        </div>

        {/* 3. Sobre Eliana & Estándar del Estudio */}
        <section
          id="eliana"
          className="scroll-mt-24 rounded-3xl bg-[#F7F7F8] border border-[#2B1D14]/10 p-6 sm:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center"
        >
          <div className="lg:col-span-7 min-w-0">
            <h2 className="font-serif text-3xl sm:text-4xl font-medium text-[#2B1D14] tracking-tight">
              El estándar de Eliana en cada mesa
            </h2>
            <p className="mt-3 text-sm sm:text-base text-[#2B1D14]/75 leading-relaxed">
              Durante tres años, Evolare ha crecido gracias a clientas que vuelven cada 15 o 21 días por uñas que duran intactas, higiene rigurosa y un espacio sereno. Como cuando estoy en turno no puedo soltar el pincel para responder mensajes, aquí reservas en segundos viendo mis horas reales.
            </p>

            <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#F3DE9A] text-[#2B1D14] flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2B1D14]">
                    Reserva sin esperar en chat
                  </p>
                  <p className="text-xs text-[#2B1D14]/70 mt-0.5">
                    Disponibilidad en vivo 24/7 y recordatorios automáticos antes de tu cita.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <span className="w-7 h-7 rounded-full bg-[#F3DE9A] text-[#2B1D14] flex items-center justify-center shrink-0 mt-0.5">
                  <ShieldCheck className="w-4 h-4" />
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-[#2B1D14]">
                    Esterilización &amp; salud ungueal
                  </p>
                  <p className="text-xs text-[#2B1D14]/70 mt-0.5">
                    Herramientas sanitizadas y retiros seguros sin dañar tu uña natural.
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 min-w-0">
            <div className="rounded-2xl bg-[#F3DE9A]/45 border border-[#D9A738]/35 p-6 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h3 className="font-serif text-2xl font-medium text-[#2B1D14]">
                    {engine.staff[0]?.name || 'Eliana'}
                  </h3>
                  <p className="text-xs font-medium text-[#6E2331] mt-0.5">
                    {engine.staff[0]?.role || 'Fundadora & Nail Artist'}
                  </p>
                </div>
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-white text-[#2B1D14] text-xs font-semibold tabular-nums shrink-0 border border-[#2B1D14]/10">
                  <Star className="w-3.5 h-3.5 fill-[#D9A738] text-[#D9A738]" />
                  5.0
                </span>
              </div>

              <p className="font-serif italic text-lg text-[#2B1D14]/85 leading-relaxed">
                &ldquo;Cada set cuenta una historia distinta: desde un Soft Gel limpio para tu semana hasta flores 3D esculpidas a mano para tu día especial.&rdquo;
              </p>

              <div className="pt-4 border-t border-[#2B1D14]/12 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={openManageAppointments}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#6E2331] hover:text-[#2B1D14]"
                >
                  <CalendarCheck className="w-4 h-4" />
                  <span>Consultar o reagendar mi cita</span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* 4. Agenda en Tiempo Real + Portal Mis Citas */}
        <BookingAtelier
          activeTab={agendaTab}
          onTabChange={setAgendaTab}
          business={engine.business}
          services={engine.services}
          selectedService={engine.selectedService}
          selectedServiceId={engine.selectedServiceId}
          onSelectServiceId={engine.setSelectedServiceId}
          eligibleStaff={engine.eligibleStaff}
          availableDates={engine.availableDates}
          selectedDate={engine.selectedDate}
          onSelectDate={engine.setSelectedDate}
          availableSlots={engine.availableSlots}
          loadingSlots={engine.loadingSlots}
          slotsReason={engine.slotsReason}
          selectedTime={engine.selectedTime}
          onSelectTime={engine.setSelectedTime}
          clientForm={engine.clientForm}
          setClientForm={engine.setClientForm}
          isSubmitting={engine.isSubmitting}
          bookingResult={engine.bookingResult}
          onSubmitBooking={engine.submitBooking}
          onResetBooking={engine.resetBooking}
          lookupQuery={engine.lookupQuery}
          setLookupQuery={engine.setLookupQuery}
          clientAppointments={engine.clientAppointments}
          loadingLookup={engine.loadingLookup}
          lookupMessage={engine.lookupMessage}
          onSearchAppointments={engine.searchClientAppointments}
          onRescheduleAppointment={engine.rescheduleExistingAppointment}
          onCancelAppointment={engine.cancelExistingAppointment}
          formatPrice={engine.formatPrice}
          formatDateLabel={engine.formatDateLabel}
          whatsappDirectUrl={WHATSAPP_DIRECT_LINK}
        />

        {/* 5. Ubicación en Madrid, Horarios Claros & FAQ */}
        <StudioLocationFaq
          address={engine.business.address}
          mapsUrl={engine.business.maps_url}
          instagram={engine.business.instagram}
          businessHours={engine.business.business_hours}
          faqs={engine.faqs}
          whatsappDirectUrl={WHATSAPP_DIRECT_LINK}
        />
      </main>

      <footer className="border-t border-[#2B1D14]/10 py-8 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#2B1D14]/65">
          <span>
            Evolare Nail Studio · Sector Hacienda Casablanca, Madrid, Cundinamarca
          </span>
          <div className="flex items-center gap-4">
            <a
              href="https://www.instagram.com/evolare_by.eli/"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#6E2331]"
            >
              @evolare_by.eli
            </a>
            <span>·</span>
            <a
              href={WHATSAPP_DIRECT_LINK}
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#6E2331]"
            >
              WhatsApp Directo
            </a>
            <span>·</span>
            <span>{engine.supabaseConnected ? 'Agenda en vivo' : 'Modo estudio'}</span>
          </div>
        </div>
      </footer>

      {/* Sheet deslizable de Reserva Rápida */}
      <QuickBookingSheet
        isOpen={sheetOpen}
        onClose={() => setSheetOpen(false)}
        onOpenFullAgenda={openManageAppointments}
        services={engine.services}
        selectedService={engine.selectedService}
        selectedServiceId={engine.selectedServiceId}
        onSelectServiceId={engine.setSelectedServiceId}
        availableDates={engine.availableDates}
        selectedDate={engine.selectedDate}
        onSelectDate={engine.setSelectedDate}
        availableSlots={engine.availableSlots}
        loadingSlots={engine.loadingSlots}
        selectedTime={engine.selectedTime}
        onSelectTime={engine.setSelectedTime}
        clientForm={engine.clientForm}
        setClientForm={engine.setClientForm}
        isSubmitting={engine.isSubmitting}
        bookingResult={engine.bookingResult}
        onSubmitBooking={engine.submitBooking}
        onResetBooking={engine.resetBooking}
        formatPrice={engine.formatPrice}
        formatDateLabel={engine.formatDateLabel}
        whatsappDirectUrl={WHATSAPP_DIRECT_LINK}
      />
    </div>
  );
}

export default App;
