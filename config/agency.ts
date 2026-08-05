/**
 * CONFIGURACION GENERAL DEL DASHBOARD
 * ------------------------------------
 * Este es el UNICO archivo que deberias tocar para adaptar el dashboard a tu agencia
 * (nombre, marca, colores, moneda, catalogo de servicios, columnas de pipeline/kanban,
 * equipo y textos de la interfaz). Nada de esto esta repartido en los componentes.
 *
 * Los clientes, proyectos, tareas, leads del pipeline y pagos SI se editan desde la
 * propia interfaz del dashboard (se guardan en la base de datos), no desde aca.
 *
 * Cambiaste algo en este archivo? Hace commit + push (o "vercel --prod" si desplegas
 * a mano) para que el cambio se vea en produccion.
 */

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type StageDef = { id: string; label: string; color: string };
export type ServiceType = "proyecto" | "retainer";

export type Service = {
  id: string;
  name: string;
  description: string;
  price: string; // texto libre: "USD 500", "Desde USD 1.200", etc.
  type: ServiceType;
};

export type TeamMember = {
  id: string;
  name: string;
  role: string;
  color: string; // color de acento para avatar/badges de este miembro
  avatarUrl?: string; // opcional, si no hay se muestran las iniciales
  email: string; // con esta dirección esta persona entra al dashboard (misma contraseña para todos, ver DASHBOARD_PASSWORD)
};

export type ClientStatus = { id: string; label: string; color: string };
export type Priority = { id: string; label: string; color: string };

// ---------------------------------------------------------------------------
// Identidad y marca
// ---------------------------------------------------------------------------

export const agency = {
  name: "Cinthia Crisálida",
  tagline: "Implementación digital e inteligencia artificial para negocios y marcas",
  logoUrl: "", // ej: "/logo.svg". Vacio = se usa la inicial del nombre.

  // Moneda y formato numerico para todo el modulo de Finanzas y montos de contrato.
  currency: "ARS",
  locale: "es-AR",

  // Colores de marca. Se inyectan como variables CSS (ver app/layout.tsx) y se usan
  // en todo el dashboard vía las clases bg-brand-primary / text-brand-accent / etc.,
  // y vía los tokens de fondo/texto (paper, surface, ink, inkstrong, inkmuted, line).
  colors: {
    primary: "#bf653b", // terracota - botones, links activos, foco de inputs
    secondary: "#956a94", // malva - acentos secundarios
    accent: "#65695a", // oliva - acentos terciarios / gráficos
    background: "#e4d2c6", // fondo general de la app
    surface: "#f7eee6", // fondo de tarjetas y paneles
    text: "#562e41", // color de texto principal (la mayoría de los textos)
    textStrong: "#000000", // texto de mayor jerarquía: título de página y cifras destacadas
    textMuted: "#8a6473", // texto secundario, hints, timestamps
    border: "#d9c2ab", // bordes y separadores
  },

  // ---------------------------------------------------------------------------
  // Catalogo de servicios por defecto. Si la base de datos no tiene servicios,
  // se usan estos como fallback inicial.
  // ---------------------------------------------------------------------------
  services: [
    {
      id: "automatizaciones",
      name: "Automatizaciones",
      description: "Flujos automatizados entre herramientas para eliminar tareas manuales.",
      price: "Desde $ 400.000",
      type: "proyecto",
    },
    {
      id: "chatbots-ia",
      name: "Chatbots / Agentes IA",
      description: "Agentes conversacionales con IA para ventas, soporte o atención al cliente.",
      price: "Desde $ 600.000",
      type: "proyecto",
    },
    {
      id: "presencia-digital",
      name: "Presencia digital",
      description: "Sitio web, landing pages y activos digitales de marca.",
      price: "Desde $ 350.000",
      type: "proyecto",
    },
    {
      id: "sistemas-internos",
      name: "Sistemas internos",
      description: "Paneles y herramientas a medida para operar el negocio del cliente.",
      price: "Desde $ 900.000",
      type: "proyecto",
    },
    {
      id: "integraciones",
      name: "Integraciones",
      description: "Conexión de APIs y plataformas (CRM, pagos, mensajería, etc.).",
      price: "Desde $ 300.000",
      type: "proyecto",
    },
    {
      id: "retainer-mensual",
      name: "Retainer mensual",
      description: "Soporte, mantenimiento y mejoras continuas mes a mes.",
      price: "$ 450.000 / mes",
      type: "retainer",
    },
  ] satisfies Service[],

  // ---------------------------------------------------------------------------
  // Estados del ciclo de vida del cliente (modulo Clientes). No confundir con las
  // columnas del pipeline: esto es un unico campo de estado por cliente.
  // ---------------------------------------------------------------------------
  clientStatuses: [
    { id: "lead", label: "Lead", color: "#94A3B8" },
    { id: "propuesta-enviada", label: "Propuesta enviada", color: "#60A5FA" },
    { id: "activo", label: "Activo", color: "#34D399" },
    { id: "en-pausa", label: "En pausa", color: "#FBBF24" },
    { id: "finalizado", label: "Finalizado", color: "#818CF8" },
    { id: "perdido", label: "Perdido", color: "#F87171" },
  ] satisfies ClientStatus[],

  // ---------------------------------------------------------------------------
  // Columnas del pipeline de ventas (Kanban). El orden del array define el orden
  // de las columnas en pantalla.
  // ---------------------------------------------------------------------------
  pipelineStages: [
    { id: "lead", label: "Lead", color: "#94A3B8" },
    { id: "contactado", label: "Contactado", color: "#60A5FA" },
    { id: "propuesta-enviada", label: "Propuesta enviada", color: "#818CF8" },
    { id: "negociacion", label: "Negociación", color: "#FBBF24" },
    { id: "ganado", label: "Ganado", color: "#34D399" },
    { id: "perdido", label: "Perdido", color: "#F87171" },
  ] satisfies StageDef[],

  // ---------------------------------------------------------------------------
  // Columnas del kanban de trabajo (modulo Proyectos y tareas).
  // ---------------------------------------------------------------------------
  taskStages: [
    { id: "por-hacer", label: "Por hacer", color: "#94A3B8" },
    { id: "en-progreso", label: "En progreso", color: "#60A5FA" },
    { id: "revision", label: "Revisión", color: "#FBBF24" },
    { id: "entregado", label: "Entregado", color: "#34D399" },
  ] satisfies StageDef[],

  priorities: [
    { id: "baja", label: "Baja", color: "#94A3B8" },
    { id: "media", label: "Media", color: "#60A5FA" },
    { id: "alta", label: "Alta", color: "#F87171" },
  ] satisfies Priority[],

  // ---------------------------------------------------------------------------
  // Equipo. Agrega tantas filas como personas tengas: el dashboard no tiene
  // ningun limite de miembros en la logica.
  // ---------------------------------------------------------------------------
  team: [
    {
      id: "cinthia",
      name: "Cinthia",
      role: "Fundadora · Estrategia & Cuentas",
      color: "#956a94",
      email: "cinthiaespinozamkt@gmail.com",
    },
    {
      id: "socia-2",
      name: "Luciano",
      role: "Implementación técnica & IA",
      color: "#65695a",
      email: "lucianovillalbaweb@gmail.com",
    },
  ] satisfies TeamMember[],

  // ---------------------------------------------------------------------------
  // Textos de la interfaz. Cambia estos strings para ajustar el tono/idioma sin
  // tocar componentes.
  // ---------------------------------------------------------------------------
  copy: {
    nav: {
      overview: "Panel general",
      clients: "Clientes",
      pipeline: "Pipeline",
      projects: "Proyectos",
      services: "Servicios",
      finance: "Finanzas",
      team: "Equipo",
      calendar: "Calendario",
    },
    emptyStates: {
      clients: "Aún no tenés clientes. Agregá el primero para empezar a hacer seguimiento.",
      leads: "No hay prospectos en esta columna todavía.",
      tasks: "No hay tareas en esta columna todavía.",
      projects: "Todavía no creaste ningún proyecto.",
      payments: "Todavía no cargaste pagos o facturas.",
      activity: "Sin actividad reciente por ahora.",
      calendar: "No hay fechas próximas cargadas.",
    },
    cta: {
      newClient: "Nuevo cliente",
      newLead: "Nuevo prospecto",
      newProject: "Nuevo proyecto",
      newTask: "Nueva tarea",
      newPayment: "Nuevo pago/factura",
      save: "Guardar",
      cancel: "Cancelar",
      delete: "Eliminar",
      edit: "Editar",
      addNote: "Agregar nota",
      addLink: "Agregar link",
    },
  },
} as const;

export type Agency = typeof agency;
