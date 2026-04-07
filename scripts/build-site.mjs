import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const frontendDir = path.join(rootDir, 'frontend');
const site = {
  name: 'Taxis Services',
  legalName: 'Taxis Services',
  baseUrl: 'https://taxis-services.be',
  apiBaseUrl: process.env.PUBLIC_API_BASE_URL || '',
  captchaMode: process.env.PUBLIC_CAPTCHA_MODE || '',
  captchaProvider: process.env.PUBLIC_CAPTCHA_PROVIDER || '',
  captchaSiteKey: process.env.PUBLIC_CAPTCHA_SITE_KEY || '',
  locale: 'fr_BE',
  lang: 'fr-BE',
  phone: '+32486067927',
  phoneDisplay: '+32 486 06 79 27',
  whatsapp: 'https://wa.me/32486067927',
  email: 'info@taxis-services.be',
  emailHref: 'mailto:info@taxis-services.be',
  address: 'Anderlues, Hainaut, Belgique',
  areaLabel: 'Anderlues, Chapelle-lez-Herlaimont, Courcelles, Fontaine-l’Évêque, Montigny-le-Tilleul',
  adminPath: 'admin-login.html',
  adminDashboardPath: 'admin-dashboard.html',
  legalPath: 'mentions-legales.html',
  faviconPath: 'assets/img/favicon.svg',
  ogImage: 'assets/img/Transport_vip.jpg',
  year: new Date().getFullYear(),
};

const areas = [
  {
    title: 'Anderlues',
    text: 'Base locale pour les départs rapides et les trajets du quotidien.',
    anchor: 'index.html#zones',
  },
  {
    title: 'Région du Centre',
    text: 'Chapelle-lez-Herlaimont, Courcelles, Fontaine-l’Évêque et alentours.',
    anchor: 'index.html#zones',
  },
  {
    title: 'Belgique',
    text: 'Aéroports, gares, rendez-vous professionnels et longues distances.',
    anchor: 'services.html#zones',
  },
];

const serviceOptions = [
  'Taxi de proximité',
  'Navette aéroport',
  'Transport business',
  'Transport PMR',
  'Livraison de colis',
];

const vehicleOptions = [
  'Berline standard',
  'Berline premium',
  'Véhicule avec grand coffre',
  'Transport adapté selon la demande',
];

const services = [
  {
    key: 'city',
    file: 'city-taxi.html',
    shortName: 'Taxi de proximité',
    label: 'Service local',
    title: 'Taxi local à Anderlues et dans la région du Centre',
    highlight: 'simple et réactif',
    metaTitle: 'Taxi local à Anderlues | Taxis Services',
    metaDescription: 'Déplacements locaux à Anderlues, Chapelle-lez-Herlaimont, Courcelles et alentours avec un service professionnel et réactif.',
    cardSummary: 'Courses locales, rendez-vous, gares et trajets du quotidien avec prise en charge rapide selon disponibilité.',
    heroSummary: 'Pour un déplacement en ville, un rendez-vous médical, une course urgente ou un transfert vers la gare, nous organisons votre trajet avec sérieux et clarté.',
    image: {
      src: 'assets/img/chauffeur-local.webp',
      alt: 'Chauffeur local prêt pour une prise en charge à Anderlues',
      width: 600,
      height: 400,
    },
    features: [
      {
        title: 'Départs du quotidien',
        text: 'Courses locales, trajets domicile-travail et rendez-vous organisés avec une communication simple.',
        icon: 'car',
      },
      {
        title: 'Connaissance du secteur',
        text: 'Service pensé pour Anderlues et les communes voisines avec un itinéraire adapté au contexte local.',
        icon: 'pin',
      },
      {
        title: 'Réponse rapide',
        text: 'Nous confirmons la prise en charge rapidement et vous indiquons la meilleure option disponible.',
        icon: 'clock',
      },
    ],
    ctaTitle: 'Besoin d’un départ rapide ?',
    ctaText: 'Appelez-nous pour une course immédiate ou laissez une demande détaillée via le formulaire.',
    zones: ['Anderlues', 'Chapelle-lez-Herlaimont', 'Courcelles', 'Fontaine-l’Évêque', 'Montigny-le-Tilleul'],
    selectedService: 'Taxi de proximité',
  },
  {
    key: 'airport',
    file: 'navette-aeroport.html',
    shortName: 'Navette aéroport',
    label: 'Transferts',
    title: 'Navette aéroport depuis Anderlues vers Charleroi et Bruxelles',
    highlight: 'ponctuelle et sereine',
    metaTitle: 'Navette aéroport Charleroi et Bruxelles | Taxis Services',
    metaDescription: 'Transferts aéroport depuis Anderlues vers Charleroi, Bruxelles et les principales gares avec organisation anticipée.',
    cardSummary: 'Réservations anticipées pour aéroports et gares avec suivi de l’horaire communiqué et prise en charge planifiée.',
    heroSummary: 'Nous préparons vos transferts aéroport avec une heure de départ cohérente, un véhicule adapté à vos bagages et une communication claire avant le trajet.',
    image: {
      src: 'assets/img/navette-aeroport.jpg',
      alt: 'Navette aéroport au départ d’Anderlues',
      width: 1691,
      height: 1123,
    },
    features: [
      {
        title: 'Réservation anticipée',
        text: 'Idéal pour Charleroi Airport, Brussels Airport et les gares nationales avec confirmation avant le départ.',
        icon: 'plane',
      },
      {
        title: 'Gestion des bagages',
        text: 'Le véhicule est choisi en fonction du volume annoncé pour limiter les mauvaises surprises.',
        icon: 'briefcase',
      },
      {
        title: 'Départs matinaux',
        text: 'Une solution claire pour les trajets tôt le matin, le soir ou les retours planifiés.',
        icon: 'shield',
      },
    ],
    ctaTitle: 'Vous avez un vol à prévoir ?',
    ctaText: 'Précisez votre horaire, votre terminal et vos bagages pour recevoir une organisation adaptée.',
    zones: ['Anderlues', 'Charleroi Airport (CRL)', 'Brussels Airport (BRU)', 'Gares TGV', 'Belgique'],
    selectedService: 'Navette aéroport',
  },
  {
    key: 'business',
    file: 'business-taxi.html',
    shortName: 'Transport business',
    label: 'Professionnels',
    title: 'Chauffeur business pour vos déplacements professionnels',
    highlight: 'sobre et fiable',
    metaTitle: 'Chauffeur business à Anderlues | Taxis Services',
    metaDescription: 'Transport business pour rendez-vous, séminaires, hôtels et transferts professionnels en Belgique.',
    cardSummary: 'Déplacements professionnels avec une présentation soignée, un service discret et une organisation adaptée à votre agenda.',
    heroSummary: 'Pour un rendez-vous client, une réunion, un transfert hôtel ou une journée planifiée, nous proposons un accompagnement professionnel et discret.',
    image: {
      src: 'assets/img/Transport_vip.jpg',
      alt: 'Chauffeur business pour un déplacement professionnel',
      width: 1024,
      height: 655,
    },
    features: [
      {
        title: 'Image professionnelle',
        text: 'Une prise en charge discrète et ponctuelle, adaptée aux rendez-vous d’affaires et aux transferts de direction.',
        icon: 'briefcase',
      },
      {
        title: 'Organisation claire',
        text: 'Horaires, adresses et contraintes logistiques sont confirmés en amont pour réduire les imprévus.',
        icon: 'clock',
      },
      {
        title: 'Trajets flexibles',
        text: 'Aller simple, aller-retour ou enchaînement de rendez-vous selon le programme annoncé.',
        icon: 'star',
      },
    ],
    ctaTitle: 'Un déplacement professionnel à organiser ?',
    ctaText: 'Envoyez votre planning ou contactez-nous directement pour préparer un trajet sobre, ponctuel et discret.',
    zones: ['Anderlues', 'Charleroi', 'Bruxelles', 'Hôtels', 'Centres d’affaires'],
    selectedService: 'Transport business',
  },
  {
    key: 'pmr',
    file: 'pmr-taxi.html',
    shortName: 'Transport PMR',
    label: 'Accessibilité',
    title: 'Transport PMR avec organisation adaptée',
    highlight: 'respectueuse et rassurante',
    metaTitle: 'Transport PMR à Anderlues | Taxis Services',
    metaDescription: 'Transport PMR sur réservation avec préparation adaptée au besoin annoncé et accompagnement attentionné.',
    cardSummary: 'Déplacements organisés avec attention pour les personnes à mobilité réduite, sur réservation et selon le besoin communiqué.',
    heroSummary: 'Nous préparons les trajets PMR avec sérieux, en tenant compte du niveau d’assistance souhaité, du matériel annoncé et du temps nécessaire.',
    image: {
      src: 'assets/img/Transport-pmr.jpeg',
      alt: 'Transport PMR organisé avec accompagnement adapté',
      width: 1024,
      height: 741,
    },
    features: [
      {
        title: 'Préparation en amont',
        text: 'Le type de prise en charge est clarifié avant le départ afin d’organiser le véhicule le plus approprié.',
        icon: 'shield',
      },
      {
        title: 'Temps de montée respecté',
        text: 'Le service est pensé avec plus de souplesse pour éviter les départs précipités et préserver le confort.',
        icon: 'heart',
      },
      {
        title: 'Accompagnement humain',
        text: 'Une communication calme et claire pour les trajets médicaux, administratifs ou personnels.',
        icon: 'star',
      },
    ],
    ctaTitle: 'Un trajet PMR à planifier ?',
    ctaText: 'Indiquez précisément le besoin d’accessibilité pour que nous préparions la meilleure prise en charge possible.',
    zones: ['Anderlues', 'Région du Centre', 'Hôpitaux', 'Cabinets médicaux', 'Belgique'],
    selectedService: 'Transport PMR',
  },
  {
    key: 'parcel',
    file: 'parcel-delivery.html',
    shortName: 'Livraison de colis',
    label: 'Express',
    title: 'Livraison urgente de documents et colis',
    highlight: 'directe et suivie',
    metaTitle: 'Livraison urgente de colis | Taxis Services',
    metaDescription: 'Livraison rapide de documents et colis avec retrait sur demande et confirmation de la prise en charge.',
    cardSummary: 'Acheminement direct de documents, enveloppes et petits colis avec une communication simple du retrait à la remise.',
    heroSummary: 'Pour un document important, un colis urgent ou une remise locale à organiser, nous proposons une solution directe et réactive selon disponibilité.',
    image: {
      src: 'assets/img/colis.jpg',
      alt: 'Livraison de colis urgent en Belgique',
      width: 660,
      height: 439,
    },
    features: [
      {
        title: 'Retrait simple',
        text: 'Le point de retrait, l’horaire souhaité et les coordonnées utiles sont confirmés avant la course.',
        icon: 'pin',
      },
      {
        title: 'Acheminement direct',
        text: 'Nous privilégions un trajet clair et rapide pour limiter les manipulations inutiles.',
        icon: 'car',
      },
      {
        title: 'Communication continue',
        text: 'Vous savez quand le colis est pris en charge et quand il est remis à destination.',
        icon: 'clock',
      },
    ],
    ctaTitle: 'Un envoi urgent à remettre aujourd’hui ?',
    ctaText: 'Précisez le format, l’adresse et le niveau d’urgence pour que nous revenions vers vous rapidement.',
    zones: ['Anderlues', 'Charleroi', 'Bruxelles', 'Belgique', 'Livraison directe'],
    selectedService: 'Livraison de colis',
  },
];

const staticPages = {
  home: {
    file: 'index.html',
    title: 'Taxis Services | Taxi local, aéroport, business et PMR',
    description: 'Service de taxi professionnel à Anderlues pour les trajets locaux, navettes aéroport, déplacements business, transport PMR et livraisons urgentes.',
    navKey: 'home',
  },
  services: {
    file: 'services.html',
    title: 'Nos services | Taxis Services',
    description: 'Découvrez les services de Taxis Services: taxi local, navette aéroport, transport business, transport PMR et livraison de colis.',
    navKey: 'services',
  },
  about: {
    file: 'about.html',
    title: 'À propos | Taxis Services',
    description: 'Taxis Services présente son approche: proximité, ponctualité, clarté et organisation professionnelle pour chaque trajet.',
    navKey: 'about',
  },
  contact: {
    file: 'contact.html',
    title: 'Contact et réservation | Taxis Services',
    description: 'Contactez Taxis Services pour une réservation, une demande de course, un transfert aéroport ou un trajet professionnel.',
    navKey: 'contact',
  },
  legal: {
    file: site.legalPath,
    title: 'Mentions légales | Taxis Services',
    description: 'Consultez les mentions legales, la politique de confidentialite, la declaration d accessibilite et les conditions generales de service de Taxis Services.',
    navKey: '',
  },
  admin: {
    file: site.adminPath,
    title: 'Accès privé | Taxis Services',
    description: 'Connexion administrateur sécurisée pour gérer les réservations et messages du site.',
    navKey: '',
    noindex: true,
  },
  adminDashboard: {
    file: site.adminDashboardPath,
    title: 'Tableau de bord | Taxis Services',
    description: 'Interface d’administration pour gérer les réservations et messages entrants.',
    navKey: '',
    noindex: true,
  },
};

function absoluteUrl(relativePath = '') {
  return new URL(relativePath || '/', `${site.baseUrl}/`).toString();
}

function escapeHtml(value = '') {
  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function pageLink(file) {
  return file === 'index.html' ? site.baseUrl + '/' : absoluteUrl(file);
}

function toId(value = '') {
  return String(value)
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();
}

function icon(name) {
  const icons = {
    arrowRight: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 4l-1.41 1.41L16.17 11H4v2h12.17l-5.58 5.59L12 20l8-8z"/></svg>`,
    arrowLeft: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 11H7.83l5.58-5.59L12 4l-8 8 8 8 1.41-1.41L7.83 13H20z"/></svg>`,
    phone: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/></svg>`,
    mail: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 4-8 5-8-5V6l8 5 8-5v2z"/></svg>`,
    pin: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5S10.62 6.5 12 6.5s2.5 1.12 2.5 2.5S13.38 11.5 12 11.5z"/></svg>`,
    clock: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm.5 5H11v6l5.25 3.15.75-1.23-4.5-2.67V7z"/></svg>`,
    shield: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 1 3 5v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V5l-9-4zm-1 14-4-4 1.41-1.41L11 12.17l5.59-5.58L18 8l-7 7z"/></svg>`,
    car: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M18.92 6.01A1.5 1.5 0 0 0 17.5 5h-11c-.66 0-1.21.42-1.42 1.01L3 12v8a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-1h12v1a1 1 0 0 0 1 1h1a1 1 0 0 0 1-1v-8l-2.08-5.99zM6.5 16A1.5 1.5 0 1 1 8 14.5 1.5 1.5 0 0 1 6.5 16zm11 0a1.5 1.5 0 1 1 1.5-1.5 1.5 1.5 0 0 1-1.5 1.5zM5 11l1.5-4.5h11L19 11H5z"/></svg>`,
    plane: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M21 16v-2l-8-5V3.5C13 2.67 12.33 2 11.5 2S10 2.67 10 3.5V9l-8 5v2l8-2.5V19l-2 1.5V22l3.5-1 3.5 1v-1.5L13 19v-5.5l8 2.5z"/></svg>`,
    briefcase: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 7h-3V6a3 3 0 0 0-3-3h-2a3 3 0 0 0-3 3v1H5a2 2 0 0 0-2 2v9a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3V9a2 2 0 0 0-2-2zM10 6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v1h-4zm9 12a1 1 0 0 1-1 1H6a1 1 0 0 1-1-1v-5h14zm0-7H5V9h14z"/></svg>`,
    star: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 2 3.09 6.26L22 9.27l-5 4.87 1.18 6.86L12 17.77 5.82 21l1.18-6.86-5-4.87 6.91-1.01L12 2z"/></svg>`,
    heart: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m12 21.35-1.45-1.32C5.4 15.36 2 12.28 2 8.5A4.5 4.5 0 0 1 6.5 4c1.74 0 3.41.81 4.5 2.09A6.02 6.02 0 0 1 15.5 4 4.5 4.5 0 0 1 20 8.5c0 3.78-3.4 6.86-8.55 11.54z"/></svg>`,
    menu: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M3 6h18v2H3zm0 5h18v2H3zm0 5h18v2H3z"/></svg>`,
    close: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M19 6.41 17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12z"/></svg>`,
    chevronUp: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m7.41 15.41 4.59-4.58 4.59 4.58L18 14l-6-6-6 6z"/></svg>`,
    check: `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="m9 16.17-3.88-3.88L3.71 13.7 9 19l12-12-1.41-1.41z"/></svg>`,
  };

  return icons[name] || '';
}

function renderJsonLd(data) {
  if (!data || data.length === 0) {
    return '';
  }

  return data
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry)}</script>`)
    .join('\n');
}

function localBusinessSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'TaxiService',
    name: site.legalName,
    url: site.baseUrl,
    telephone: site.phone,
    email: site.email,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Anderlues',
      addressRegion: 'Hainaut',
      addressCountry: 'BE',
    },
    areaServed: [
      'Anderlues',
      'Chapelle-lez-Herlaimont',
      'Courcelles',
      'Fontaine-l’Évêque',
      'Montigny-le-Tilleul',
      'Belgique',
    ],
    serviceType: serviceOptions,
  };
}

function websiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: site.legalName,
    url: site.baseUrl,
    inLanguage: site.lang,
  };
}

function breadcrumbSchema(items) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: pageLink(item.file),
    })),
  };
}

function serviceSchema(service) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Service',
    serviceType: service.shortName,
    provider: {
      '@type': 'LocalBusiness',
      name: site.legalName,
      telephone: site.phone,
      areaServed: service.zones,
    },
    areaServed: service.zones,
    description: service.metaDescription,
  };
}

function navTargets(pageKey) {
  const localZones = new Set(['home', 'services', 'contact']);
  const localBooking = new Set(['home', 'services', 'contact', 'city', 'airport', 'business', 'pmr', 'parcel']);

  return {
    zones: localZones.has(pageKey) ? '#zones' : 'services.html#zones',
    booking: localBooking.has(pageKey) ? '#booking' : 'contact.html#booking',
  };
}

function renderHead({ title, description, canonical, image = site.ogImage, noindex = false, schemas = [], includeServiceAreaMap = false }) {
  const robots = noindex ? 'noindex, nofollow' : 'index, follow';
  const imageUrl = absoluteUrl(image);
  const captchaMode = escapeHtml(site.captchaMode);
  const captchaProvider = escapeHtml(site.captchaProvider);
  const captchaSiteKey = escapeHtml(site.captchaSiteKey);

  return `  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta name="description" content="${escapeHtml(description)}">
  <meta name="robots" content="${robots}">
  <meta name="theme-color" content="#0c0c0c">
  <meta name="app-api-base-url" content="${escapeHtml(site.apiBaseUrl)}">
  <meta name="app-captcha-mode" content="${captchaMode}">
  <meta name="app-captcha-provider" content="${captchaProvider}">
  <meta name="app-captcha-site-key" content="${captchaSiteKey}">
  <link rel="canonical" href="${escapeHtml(canonical)}">
  <link rel="icon" href="${site.faviconPath}" type="image/svg+xml">
  <meta property="og:locale" content="${site.locale}">
  <meta property="og:site_name" content="${site.legalName}">
  <meta property="og:type" content="website">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:url" content="${escapeHtml(canonical)}">
  <meta property="og:image" content="${escapeHtml(imageUrl)}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(title)}">
  <meta name="twitter:description" content="${escapeHtml(description)}">
  <meta name="twitter:image" content="${escapeHtml(imageUrl)}">
  <title>${escapeHtml(title)}</title>
  <link rel="stylesheet" href="assets/css/main.css">
${includeServiceAreaMap ? '  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.css">' : ''}
  <link rel="stylesheet" href="assets/css/custom.css">
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
${renderJsonLd(schemas)}`;
}

function renderNav(pageKey) {
  const targets = navTargets(pageKey);
  const items = [
    { href: 'index.html', label: 'Accueil', key: 'home' },
    { href: 'services.html', label: 'Services', key: 'services' },
    { href: 'about.html', label: 'À propos', key: 'about' },
    { href: targets.zones, label: 'Zones', key: 'zones' },
    { href: 'contact.html', label: 'Contact', key: 'contact' },
  ];

  const navLinks = items
    .map((item) => `<li><a href="${item.href}"${item.key === pageKey ? ' class="active"' : ''}>${item.label}</a></li>`)
    .join('');

  const mobileLinks = items
    .map((item) => `<a href="${item.href}"${item.key === pageKey ? ' class="active"' : ''}>${item.label}</a>`)
    .join('\n    ');

  return `<nav class="navbar">
    <div class="container">
      <div class="nav-inner">
        <a href="index.html" class="nav-logo" aria-label="Retour à l'accueil de Taxis Services">
          <div class="nav-logo-icon">TS</div>
          <span class="nav-logo-text">TAXIS <span>SERVICES</span></span>
        </a>
        <ul class="nav-links">
          ${navLinks}
        </ul>
        <div class="nav-cta">
          <a href="tel:${site.phone}" class="nav-phone">${icon('phone')} ${site.phoneDisplay}</a>
          <a href="${targets.booking}" class="btn btn-primary nav-btn">Réserver</a>
        </div>
        <button class="hamburger" type="button" aria-expanded="false" aria-controls="mobile-menu">
          <span class="visually-hidden">Ouvrir le menu</span>
          <span></span><span></span><span></span>
        </button>
      </div>
    </div>
  </nav>
  <div class="mobile-menu" id="mobile-menu" role="dialog" aria-modal="true" aria-labelledby="mobile-menu-title" hidden>
    <button class="mobile-close" type="button" aria-label="Fermer le menu">${icon('close')}</button>
    <h2 id="mobile-menu-title" class="mobile-menu-title">Navigation</h2>
    ${mobileLinks}
    <a href="tel:${site.phone}" class="text-gold">${site.phoneDisplay}</a>
  </div>`;
}

function renderFooter() {
  const serviceLinks = services
    .map((service) => `<li><a href="${service.file}">${service.shortName}</a></li>`)
    .join('');

  const areaLinks = areas
    .map((area) => `<li><a href="${area.anchor}">${area.title}</a></li>`)
    .join('');

  return `<footer class="footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="index.html" class="nav-logo" aria-label="Taxis Services">
            <div class="nav-logo-icon">TS</div>
            <span class="nav-logo-text">TAXIS <span>SERVICES</span></span>
          </a>
          <p>Service de transport professionnel à Anderlues pour vos trajets locaux, transferts aéroport, déplacements business et demandes spécifiques.</p>
          <div class="footer-social">
            <a href="${site.whatsapp}" class="social-btn" aria-label="WhatsApp" rel="noopener noreferrer">${icon('phone')}</a>
            <a href="${site.emailHref}" class="social-btn" aria-label="Email">${icon('mail')}</a>
          </div>
        </div>
        <div class="footer-col">
          <h5>Services</h5>
          <ul>${serviceLinks}</ul>
        </div>
        <div class="footer-col">
          <h5>Zones desservies</h5>
          <ul>${areaLinks}</ul>
        </div>
        <div class="footer-col">
          <h5>Contact</h5>
          <div class="footer-contact-item">${icon('phone')} <a href="tel:${site.phone}">${site.phoneDisplay}</a></div>
          <div class="footer-contact-item">${icon('mail')} <a href="${site.emailHref}">${site.email}</a></div>
          <div class="footer-contact-item">${icon('pin')} <span>${site.address}</span></div>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© ${site.year} ${site.legalName}. Tous droits réservés.</span>
        <div class="footer-bottom-links">
          <span class="footer-bottom-tag">Service local à Anderlues</span>
          <a href="${site.legalPath}" class="footer-bottom-link">Mentions légales</a>
          <a href="${site.adminPath}" rel="nofollow" class="footer-admin-link">Espace pro</a>
        </div>
      </div>
    </div>
  </footer>`;
}

function renderLayout({
  pageKey,
  title,
  description,
  canonical,
  bodyClass = '',
  image,
  noindex = false,
  schemas = [],
  includeServiceAreaMap = false,
  mainContent,
}) {
  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
${renderHead({ title, description, canonical, image, noindex, schemas, includeServiceAreaMap })}
</head>
<body${bodyClass ? ` class="${bodyClass}"` : ''}>
  <!-- Generated by scripts/build-site.mjs -->
  <a href="#main-content" class="skip-link">Aller au contenu</a>
  ${renderNav(pageKey)}
  <main id="main-content">
${mainContent}
  </main>
  ${renderFooter()}
  <button class="scroll-top" type="button" aria-label="Retour en haut">${icon('chevronUp')}</button>
  <script src="assets/js/app-config.js" defer></script>
  <script src="assets/js/main.js" defer></script>
  ${includeServiceAreaMap ? '<script src="https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/leaflet.min.js" defer></script>' : ''}
  ${includeServiceAreaMap ? '<script src="assets/js/service-area.js" defer></script>' : ''}
  <a href="tel:${site.phone}" class="call-button" aria-label="Appeler ${site.legalName}">
    <i class="fas fa-phone" aria-hidden="true"></i>
  </a>
</body>
</html>`;
}

function renderServiceSelect(selectedService = '') {
  return serviceOptions
    .map((option) => `<option value="${escapeHtml(option)}"${option === selectedService ? ' selected' : ''}>${escapeHtml(option)}</option>`)
    .join('');
}

function renderVehicleSelect() {
  return vehicleOptions
    .map((option) => `<option value="${escapeHtml(option)}">${escapeHtml(option)}</option>`)
    .join('');
}

function renderHoneypotField(fieldId = 'website-hp') {
  return `<div style="position:absolute; left:-9999px; width:1px; height:1px; overflow:hidden;" aria-hidden="true">
      <label for="${fieldId}">Website</label>
      <input id="${fieldId}" type="text" name="website" tabindex="-1" autocomplete="off">
    </div>`;
}

function renderCaptchaFields(formId) {
  const captchaProvider = String(site.captchaProvider || '').trim();
  const captchaSiteKey = String(site.captchaSiteKey || '').trim();
  const captchaMode = String(site.captchaMode || '').trim().toLowerCase();
  const hiddenInput = `<input type="hidden" name="captchaToken" value="">`;

  if (!captchaProvider || !captchaSiteKey || !captchaMode || captchaMode === 'off') {
    return hiddenInput;
  }

  return `${hiddenInput}
    <div class="form-captcha" data-captcha-provider="${escapeHtml(captchaProvider)}" data-captcha-site-key="${escapeHtml(captchaSiteKey)}" data-captcha-mode="${escapeHtml(captchaMode)}">
      <div id="${formId}-captcha" class="form-captcha-widget"></div>
      <p class="form-captcha-note">Protection anti-spam activée avant l'envoi.</p>
    </div>`;
}

function renderServiceAreaSection({
  sectionId = '',
  variant = 'default',
  label = 'Zone locale',
  title = 'Notre zone de proximité',
  highlight = 'visible directement sur la carte',
  intro = 'Depuis Anderlues, nous préparons les courses locales dans la zone de proximité et nous restons disponibles pour les navettes aéroport, les longues distances et les besoins planifiés dans le reste de la Belgique.',
  ctaHref = 'contact.html#booking',
  ctaLabel = 'Demander un trajet',
  compactMap = false,
}) {
  const sectionClass = variant === 'alt' ? 'service-area-section-alt' : 'service-area-section';
  const mapClass = compactMap ? 'service-area-map service-area-map--compact' : 'service-area-map';

  return `<section${sectionId ? ` id="${sectionId}"` : ''} class="section ${sectionClass}">
    <div class="container">
      <div class="service-area-layout service-area-layout--wide">
        <div class="service-area-content" data-animate="left">
          <div class="label">${escapeHtml(label)}</div>
          <h2 class="heading-xl">${escapeHtml(title)}<br><span class="text-gold">${escapeHtml(highlight)}</span></h2>
          <p class="text-muted" style="margin-top: 20px;">${escapeHtml(intro)}</p>
          <div class="service-area-badges">
            ${areas
              .map((area, index) => `<span class="service-area-badge${index === 0 ? ' service-area-badge--dark' : ''}">${escapeHtml(area.title)}</span>`)
              .join('')}
          </div>
          <div class="service-area-note">
            <strong>Important</strong>
            <p>La carte ci-dessous montre la zone locale préparée pour les courses de proximité. Les navettes aéroport, les trajets business et les longues distances restent possibles au-delà de cette zone selon la demande.</p>
          </div>
          <div class="service-area-card">
            <h3>Comment lire cette zone</h3>
            <div class="service-area-rules">
              <div class="service-area-rule">
                <strong>Courses locales</strong>
                <span>La zone affichée correspond à la couverture de proximité autour d'Anderlues pour les départs du quotidien.</span>
              </div>
              <div class="service-area-rule">
                <strong>Navettes aéroport</strong>
                <span>Les transferts aéroport et gares peuvent partir au-delà de cette zone, avec organisation anticipée.</span>
              </div>
              <div class="service-area-rule">
                <strong>Demandes spécifiques</strong>
                <span>PMR, business et longues distances sont confirmés selon le trajet, l'horaire et les contraintes annoncées.</span>
              </div>
            </div>
          </div>
          <a href="${ctaHref}" class="btn btn-primary btn-lg">${ctaLabel}</a>
        </div>
        <div class="service-area-map-panel" data-animate="right">
          <div class="service-area-map-shell">
            <div class="service-area-map-head">
              <div>
                <span class="service-area-map-tag">Anderlues</span>
                <h3>Visualisation de la zone locale</h3>
              </div>
              <p class="service-area-map-subtitle">Affichage indicatif de la zone de proximité actuellement intégrée au site.</p>
            </div>
            <div class="${mapClass}" data-service-area-map data-service-area-src="assets/data/service-area.geojson"></div>
            <p class="service-area-map-caption">La base d'Anderlues est indiquée sur la carte. Pour les demandes hors zone, utilisez le formulaire ou contactez directement Taxis Services.</p>
          </div>
        </div>
      </div>
      <div class="services-grid service-coverage-grid">
        ${renderZonesCards()}
      </div>
    </div>
  </section>`;
}

function renderQuickRequestForm(selectedService = '') {
  return `<div class="hero-card" data-animate="scale">
    <div class="hero-card-title">Demande rapide</div>
    <form class="booking-form" method="POST" action="/api/bookings" data-api-form="booking" data-form-variant="quick" data-requires-contact="true">
      <input type="hidden" name="service" value="${escapeHtml(selectedService || 'Demande rapide')}">
      <input type="hidden" name="source_page" value="Accueil">
      ${renderHoneypotField('hero-website')}
      <div class="form-group hero-form-group">
        <label for="hero-pickup">Adresse de départ <span class="required">*</span></label>
        <input id="hero-pickup" type="text" name="pickup" placeholder="Anderlues, gare, domicile…" required>
      </div>
      <div class="form-group hero-form-group">
        <label for="hero-dropoff">Destination <span class="required">*</span></label>
        <input id="hero-dropoff" type="text" name="dropoff" placeholder="Charleroi, aéroport, rendez-vous…" required>
      </div>
      <div class="form-group hero-form-group">
        <label for="hero-phone">Téléphone ou email <span class="required">*</span></label>
        <input id="hero-phone" type="text" name="contact_quick" placeholder="+32 486 06 79 27 ou votre@email.com" required>
      </div>
      ${renderCaptchaFields('hero')}
      <div class="form-message" aria-live="polite" hidden></div>
      <button type="submit" class="btn btn-primary btn-lg form-submit">Demander un chauffeur</button>
    </form>
  </div>`;
}

function renderBookingForm({ formId, sourceLabel, selectedService = '' }) {
  return `<form class="booking-form" id="${formId}" method="POST" action="/api/bookings" data-api-form="booking" data-form-variant="full" data-requires-contact="true">
    <input type="hidden" name="source_page" value="${escapeHtml(sourceLabel)}">
    ${renderHoneypotField(`${formId}-website`)}
    <div class="form-row">
      <div class="form-group">
        <label for="${formId}-service">Type de service <span class="required">*</span></label>
        <select id="${formId}-service" name="service" required>
          <option value="">Sélectionnez un service…</option>
          ${renderServiceSelect(selectedService)}
        </select>
      </div>
      <div class="form-group">
        <label for="${formId}-passengers">Passagers <span class="required">*</span></label>
        <select id="${formId}-passengers" name="passengers" required>
          <option value="">Selon votre besoin</option>
          <option value="1">1 passager</option>
          <option value="2">2 passagers</option>
          <option value="3">3 passagers</option>
          <option value="4">4 passagers</option>
          <option value="5+">5 passagers ou plus</option>
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="${formId}-name">Nom complet <span class="required">*</span></label>
        <input id="${formId}-name" type="text" name="name" placeholder="Votre nom" required>
      </div>
      <div class="form-group">
        <label for="${formId}-phone">Téléphone <span class="required">*</span></label>
        <input id="${formId}-phone" type="tel" name="phone" placeholder="+32 470 12 34 56" data-contact-field required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="${formId}-email">Adresse email</label>
        <input id="${formId}-email" type="email" name="email" placeholder="vous@exemple.be" data-contact-field>
      </div>
      <div class="form-group">
        <label for="${formId}-company">Entreprise</label>
        <input id="${formId}-company" type="text" name="company" placeholder="Optionnel">
      </div>
    </div>
    <div class="form-row">
      <div class="form-group full-width">
        <label for="${formId}-pickup">Adresse de prise en charge <span class="required">*</span></label>
        <input id="${formId}-pickup" type="text" name="pickup" placeholder="Adresse complète de départ" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group full-width">
        <label for="${formId}-dropoff">Adresse de destination <span class="required">*</span></label>
        <input id="${formId}-dropoff" type="text" name="dropoff" placeholder="Adresse d’arrivée ou lieu à desservir" required>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="${formId}-datetime">Date et heure souhaitées <span class="required">*</span></label>
        <input id="${formId}-datetime" type="datetime-local" name="datetime" required>
      </div>
      <div class="form-group">
        <label for="${formId}-vehicle">Type de véhicule</label>
        <select id="${formId}-vehicle" name="vehicle">
          <option value="">Sélectionnez un véhicule…</option>
          ${renderVehicleSelect()}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="${formId}-luggage">Bagages</label>
        <input id="${formId}-luggage" type="text" name="luggage" placeholder="Cabine, valise, matériel…">
      </div>
      <div class="form-group">
        <label for="${formId}-notes">Précisions utiles</label>
        <textarea id="${formId}-notes" name="notes" placeholder="Vol, terminal, accès PMR, contraintes horaires…"></textarea>
      </div>
    </div>
    <div class="form-check-row">
      <div class="form-check">
        <input type="checkbox" id="${formId}-child-seat" name="child_seat">
        <label for="${formId}-child-seat" class="check-label">Siège enfant nécessaire</label>
      </div>
      <div class="form-check">
        <input type="checkbox" id="${formId}-accessibility" name="accessibility">
        <label for="${formId}-accessibility" class="check-label">Besoin d’accessibilité ou d’assistance</label>
      </div>
    </div>
    ${renderCaptchaFields(formId)}
    <div class="form-message" aria-live="polite" hidden></div>
    <button type="submit" class="btn btn-primary btn-lg form-submit">Envoyer la demande</button>
  </form>`;
}

function renderBookingSection({ pageLabel, selectedService = '' }) {
  const formId = `${toId(pageLabel)}-booking`;

  return `<section id="booking" class="section booking-section">
    <div class="container">
      <div class="booking-inner">
        <div class="booking-details" data-animate="left">
          <div class="label">Demander un trajet</div>
          <h2 class="heading-xl">Réservation claire<br><span class="text-gold">en quelques minutes</span></h2>
          <div class="divider divider-left"></div>
          <p class="text-muted" style="margin-top:20px;">
            Décrivez votre besoin, vos adresses et votre horaire souhaité. Nous revenons vers vous rapidement pour confirmer la meilleure solution disponible.
          </p>
          <ul class="booking-list">
            <li>${icon('check')} Service local, aéroport, business, PMR ou livraison selon le contexte annoncé.</li>
            <li>${icon('check')} Communication simple avant le départ pour confirmer les informations essentielles.</li>
            <li>${icon('check')} Réponse humaine et professionnelle depuis Anderlues et la région du Centre.</li>
          </ul>
        </div>
        <div class="booking-form-container" data-animate="right">
          <div class="booking-form-title">Votre demande</div>
          ${renderBookingForm({ formId, sourceLabel: pageLabel, selectedService })}
        </div>
      </div>
    </div>
  </section>`;
}

function renderContactForm() {
  return `<form class="booking-form" method="POST" action="/api/contacts" data-api-form="contact" data-form-variant="contact" data-requires-contact="true">
    <input type="hidden" name="source_page" value="Contact">
    ${renderHoneypotField('contact-website')}
    <div class="form-row">
      <div class="form-group">
        <label for="contact-name">Nom complet <span class="required">*</span></label>
        <input id="contact-name" type="text" name="name" placeholder="Votre nom" required>
      </div>
      <div class="form-group">
        <label for="contact-service">Sujet de la demande</label>
        <select id="contact-service" name="service">
          <option value="">Choisissez une demande</option>
          ${renderServiceSelect()}
        </select>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group">
        <label for="contact-phone">Téléphone</label>
        <input id="contact-phone" type="tel" name="phone" placeholder="+32 470 12 34 56" data-contact-field>
      </div>
      <div class="form-group">
        <label for="contact-email">Adresse email</label>
        <input id="contact-email" type="email" name="email" placeholder="vous@exemple.be" data-contact-field>
      </div>
    </div>
    <div class="form-row">
      <div class="form-group full-width">
        <label for="contact-message">Message <span class="required">*</span></label>
        <textarea id="contact-message" name="notes" placeholder="Expliquez votre besoin, votre horaire et votre trajet…" required></textarea>
      </div>
    </div>
    ${renderCaptchaFields('contact')}
    <div class="form-message" aria-live="polite" hidden></div>
    <button type="submit" class="btn btn-primary btn-lg form-submit">Nous écrire</button>
  </form>`;
}

function renderServiceCards() {
  return services
    .map((service, index) => `<a href="${service.file}" class="service-img-card" data-animate="${index % 3 === 0 ? 'left' : index % 3 === 2 ? 'right' : 'scale'}">
      <img src="${service.image.src}" alt="${escapeHtml(service.image.alt)}" width="${service.image.width}" height="${service.image.height}" loading="lazy">
      <div class="service-img-overlay">
        <div class="si-icon">${icon(service.features[0].icon)}</div>
        <h3 class="si-title">${service.shortName}</h3>
        <p class="si-desc">${service.cardSummary}</p>
        <span class="si-link">Découvrir ${icon('arrowRight')}</span>
      </div>
    </a>`)
    .join('\n');
}

function renderZonesCards() {
  return areas
    .map((area, index) => `<article class="service-card" data-animate="${index % 2 === 0 ? 'left' : 'right'}">
      <div class="service-icon">${icon(index === 2 ? 'plane' : 'pin')}</div>
      <h3 class="service-name">${area.title}</h3>
      <p class="service-desc">${area.text}</p>
      <a href="${area.anchor}" class="service-link">Voir la zone ${icon('arrowRight')}</a>
    </article>`)
    .join('');
}

function renderGenericCta() {
  return `<section class="section cta">
    <div class="cta-bg"></div>
    <div class="container">
      <div class="cta-inner" data-animate="scale">
        <div class="label">Prêt à partir ?</div>
        <h2 class="heading-xl cta-heading" style="color:#fff;">Réservez votre chauffeur<br><span class="text-gold">en toute simplicité</span></h2>
        <div class="divider"></div>
        <p class="cta-sub">Une course immédiate, une navette aéroport ou une demande professionnelle: nous organisons votre trajet avec une réponse claire.</p>
        <div class="cta-actions">
          <a href="tel:${site.phone}" class="btn btn-primary btn-lg">${icon('phone')} ${site.phoneDisplay}</a>
          <a href="contact.html" class="btn btn-outline btn-lg" style="color:#fff; border-color:#fff;">Nous contacter</a>
        </div>
      </div>
    </div>
  </section>`;
}

function renderBreadcrumb(items) {
  return `<nav class="breadcrumb-nav" aria-label="Fil d’Ariane">
    ${items
      .map((item, index) =>
        index === items.length - 1
          ? `<span class="current">${item.name}</span>`
          : `<a href="${item.file}">${item.name}</a><span class="sep">/</span>`
      )
      .join(' ')}
  </nav>`;
}

function renderPageHero({ label, title, highlight, text, image, breadcrumb }) {
  const titleHtml = `${escapeHtml(title)}<br><span class="text-gold">${escapeHtml(highlight)}</span>`;

  if (image) {
    return `<section class="page-hero">
      <div class="page-hero-bg"></div>
      <div class="page-hero-grid"></div>
      <div class="container">
        <div class="page-hero-inner">
          <div data-animate="left">
            <a href="services.html" class="back-link">${icon('arrowLeft')} Retour aux services</a>
            <div class="label">${label}</div>
            <h1 class="page-hero-title">${titleHtml}</h1>
            <p class="page-hero-sub">${text}</p>
            <div class="hero-actions">
              <a href="#booking" class="btn btn-primary btn-lg">Réserver ce service</a>
              <a href="tel:${site.phone}" class="btn btn-outline btn-lg">${icon('phone')} ${site.phoneDisplay}</a>
            </div>
            ${renderBreadcrumb(breadcrumb)}
          </div>
          <div class="page-hero-visual" data-animate="right">
            <img class="page-hero-image" src="${image.src}" alt="${escapeHtml(image.alt)}" width="${image.width}" height="${image.height}" fetchpriority="high">
          </div>
        </div>
      </div>
    </section>`;
  }

  return `<section class="page-hero">
    <div class="page-hero-bg"></div>
    <div class="page-hero-grid"></div>
    <div class="container">
      <div class="page-hero-content" data-animate="scale">
        <div class="label">${label}</div>
        <h1 class="page-hero-title">${titleHtml}</h1>
        <p class="page-hero-sub">${text}</p>
        ${renderBreadcrumb(breadcrumb)}
      </div>
    </div>
  </section>`;
}

function renderHomeHero() {
  return `<section class="hero">
    <div class="hero-bg" id="heroBg"></div>
    <div class="hero-grid"></div>
    <div class="container">
      <div class="hero-inner">
        <div class="hero-left">
          <div class="hero-tag" data-animate="left">Service local • Réservation • Transferts professionnels</div>
          <h1 class="hero-title" data-animate="left">Votre chauffeur à Anderlues,<br><span class="line-gold">clairement organisé</span></h1>
          <p class="hero-sub" data-animate="left">
            Taxis Services vous accompagne pour les trajets du quotidien, les navettes aéroport, les déplacements business, les besoins PMR et les courses urgentes avec une communication simple et professionnelle.
          </p>
          <div class="hero-actions" data-animate="left">
            <a href="tel:${site.phone}" class="btn btn-primary btn-lg">${icon('phone')} Appeler maintenant</a>
            <a href="services.html" class="btn btn-outline btn-lg">Découvrir les services</a>
          </div>
          <div class="hero-trust" data-animate="left">
            <div class="hero-trust-item">${icon('shield')} Service professionnel</div>
            <div class="hero-trust-item">${icon('clock')} Réponse rapide</div>
            <div class="hero-trust-item">${icon('pin')} Base locale à Anderlues</div>
          </div>
        </div>
        <div class="hero-visual">
          ${renderQuickRequestForm('Demande rapide')}
        </div>
      </div>
    </div>
  </section>`;
}

function renderHomeTrustSection() {
  return `<section class="section trust" style="background: var(--bg-alt);">
    <div class="container">
      <div class="home-trust-inner">
        <div class="home-trust-img-wrapper" data-animate="left">
          <img src="assets/img/se.jpg" alt="Chauffeur professionnel ouvrant la porte d’un véhicule" width="1200" height="654" loading="lazy">
          <div class="experience-badge">
            <span>5</span>
            <p>services organisés</p>
          </div>
        </div>
        <div class="home-trust-content" data-animate="right">
          <div class="label divider-left">Pourquoi nous choisir</div>
          <h2 class="heading-xl trust-heading">Un service de transport<br><span class="text-gold">plus simple à réserver</span></h2>
          <p class="trust-sub" style="margin-bottom: 30px;">
            Nous avons structuré le site et la prise de contact pour aller à l’essentiel: expliquer le besoin, confirmer les détails utiles et organiser un trajet cohérent avec votre situation.
          </p>
          <div class="trust-features">
            <div class="trust-feature" style="background: transparent; padding: 0; border: none; box-shadow: none;">
              <div class="feature-icon">${icon('shield')}</div>
              <div class="feature-text">
                <h4 style="font-size: 1.1rem;">Communication claire</h4>
                <p>Les informations importantes sont confirmées avant le départ pour éviter les malentendus.</p>
              </div>
            </div>
            <div class="trust-feature" style="background: transparent; padding: 0; border: none; box-shadow: none;">
              <div class="feature-icon">${icon('clock')}</div>
              <div class="feature-text">
                <h4 style="font-size: 1.1rem;">Ponctualité préparée</h4>
                <p>Nous anticipons les horaires communiqués et adaptons l’organisation au type de trajet demandé.</p>
              </div>
            </div>
            <div class="trust-feature" style="background: transparent; padding: 0; border: none; box-shadow: none;">
              <div class="feature-icon">${icon('briefcase')}</div>
              <div class="feature-text">
                <h4 style="font-size: 1.1rem;">Approche professionnelle</h4>
                <p>Le site, les formulaires et les pages service sont pensés pour rester lisibles et utiles.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderHomeZonesSection() {
  return renderServiceAreaSection({
    sectionId: 'zones',
    label: 'Zones desservies',
    title: 'Une base locale',
    highlight: 'et une zone visible directement',
    intro:
      'Depuis Anderlues, la zone locale est maintenant affichée directement sur la page d’accueil. Elle sert de repère clair pour les courses de proximité, tandis que les transferts aéroport et les trajets longue distance restent possibles selon la demande.',
    ctaHref: '#booking',
    ctaLabel: 'Réserver un trajet local',
  });
}

function renderAboutSections() {
  return `<section class="section about-content">
    <div class="container">
      <div class="about-grid">
        <div class="about-image" data-animate="left">
          <img src="assets/img/Transport_vip.jpg" alt="Chauffeur prêt pour une prise en charge professionnelle" width="1024" height="655">
        </div>
        <div class="about-text" data-animate="right">
          <div class="label">Notre approche</div>
          <h2>Un service local qui privilégie la clarté, le confort et l’organisation.</h2>
          <p class="about-quote">Nous avons remplacé les promesses marketing trop vagues par une présentation plus honnête: expliquer ce que nous faisons, comment nous le faisons et dans quel cadre nous intervenons.</p>
          <div class="about-features">
            <div class="about-feature">
              <div class="about-feature-icon">${icon('pin')}</div>
              <div class="about-feature-text">
                <strong>Base locale à Anderlues</strong>
                <span>Une présence de proximité pour les trajets du quotidien et les départs planifiés.</span>
              </div>
            </div>
            <div class="about-feature">
              <div class="about-feature-icon">${icon('clock')}</div>
              <div class="about-feature-text">
                <strong>Organisation en amont</strong>
                <span>Les demandes sont préparées selon le type de trajet, l’horaire et les contraintes communiquées.</span>
              </div>
            </div>
            <div class="about-feature">
              <div class="about-feature-icon">${icon('shield')}</div>
              <div class="about-feature-text">
                <strong>Ton plus professionnel</strong>
                <span>Contenus, formulaires et preuves de confiance ont été recentrés sur des informations crédibles et utiles.</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </section>
  <section class="section stats-section">
    <div class="container">
      <div class="stats-grid">
        <article class="stat-card" data-animate="left">
          <div class="stat-number">5</div>
          <p>services clairement présentés</p>
        </article>
        <article class="stat-card" data-animate="scale">
          <div class="stat-number">1</div>
          <p>base locale à Anderlues</p>
        </article>
        <article class="stat-card" data-animate="scale">
          <div class="stat-number">7j/7</div>
          <p>réservations selon le service demandé</p>
        </article>
        <article class="stat-card" data-animate="right">
          <div class="stat-number">BE</div>
          <p>trajets locaux et longue distance</p>
        </article>
      </div>
    </div>
  </section>
  <section class="section values-section">
    <div class="container">
      <div class="values-header">
        <div class="label">Nos priorités</div>
        <h2 class="heading-xl">Des engagements simples<br><span class="text-gold">et cohérents</span></h2>
      </div>
      <div class="values-grid">
        <article class="value-card" data-animate="left">
          <div class="value-icon">${icon('shield')}</div>
          <h4>Clarté</h4>
          <p>Des pages lisibles, des libellés propres et une demande structurée autour des informations vraiment utiles.</p>
        </article>
        <article class="value-card" data-animate="scale">
          <div class="value-icon">${icon('clock')}</div>
          <h4>Ponctualité</h4>
          <p>Nous préparons les trajets à partir de l’horaire communiqué pour réduire les imprévus de dernière minute.</p>
        </article>
        <article class="value-card" data-animate="scale">
          <div class="value-icon">${icon('briefcase')}</div>
          <h4>Présentation sobre</h4>
          <p>Une communication plus professionnelle, sans faux témoignages ni éléments marketing fragiles.</p>
        </article>
        <article class="value-card" data-animate="right">
          <div class="value-icon">${icon('heart')}</div>
          <h4>Attention au besoin</h4>
          <p>Les services PMR, aéroport ou business sont préparés différemment selon le contexte annoncé.</p>
        </article>
      </div>
    </div>
  </section>
  <section class="section timeline-section">
    <div class="container">
      <div class="timeline-header">
        <div class="label">Comment ça se passe</div>
        <h2 class="heading-xl">Une méthode simple<br><span class="text-gold">du premier contact au départ</span></h2>
      </div>
      <div class="timeline">
        <div class="timeline-item" data-animate="left">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <span class="timeline-year">1</span>
            <h4>Vous décrivez votre besoin</h4>
            <p>Type de trajet, horaire, zone de départ et informations utiles via le formulaire ou par téléphone.</p>
          </div>
        </div>
        <div class="timeline-item" data-animate="right">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <span class="timeline-year">2</span>
            <h4>Nous vérifions les éléments clés</h4>
            <p>Accès, bagages, besoin PMR, horaire réel ou destination sont clarifiés lorsque c’est nécessaire.</p>
          </div>
        </div>
        <div class="timeline-item" data-animate="left">
          <div class="timeline-dot"></div>
          <div class="timeline-card">
            <span class="timeline-year">3</span>
            <h4>Le trajet est organisé</h4>
            <p>Nous confirmons la prise en charge possible et préparons le déplacement avec une communication plus propre.</p>
          </div>
        </div>
      </div>
    </div>
  </section>`;
}

function renderContactSection() {
  return `<section class="section contact-section">
    <div class="container">
      <div class="contact-inner">
        <div class="contact-details" data-animate="left">
          <div class="label">Parler de votre trajet</div>
          <h2 class="heading-xl">Réserver, demander un devis<br><span class="text-gold">ou poser une question</span></h2>
          <p class="contact-intro">Le contact a été simplifié pour que l’essentiel soit visible tout de suite: téléphone, email, zone d’intervention et formulaire propre.</p>
          <div class="contact-info-list">
            <div class="contact-info-item">
              <div class="contact-info-icon">${icon('phone')}</div>
              <div class="contact-info-text">
                <h4>Téléphone</h4>
                <a href="tel:${site.phone}">${site.phoneDisplay}</a>
              </div>
            </div>
            <div class="contact-info-item">
              <div class="contact-info-icon">${icon('mail')}</div>
              <div class="contact-info-text">
                <h4>Email</h4>
                <a href="${site.emailHref}">${site.email}</a>
              </div>
            </div>
            <div class="contact-info-item">
              <div class="contact-info-icon">${icon('pin')}</div>
              <div class="contact-info-text">
                <h4>Zone principale</h4>
                <p>${site.areaLabel}</p>
              </div>
            </div>
          </div>
          <div class="contact-hours">
            <h4>${icon('clock')} Disponibilité</h4>
            <div class="contact-hours-row"><span class="day">Trajets locaux</span><span class="time">Selon disponibilité</span></div>
            <div class="contact-hours-row"><span class="day">Aéroport / PMR</span><span class="time">Sur réservation</span></div>
            <div class="contact-hours-row"><span class="day">Demandes business</span><span class="time">Organisation en amont</span></div>
          </div>
        </div>
        <div class="contact-form-wrap" data-animate="right">
          <div class="contact-form-title">Votre message</div>
          <p class="contact-form-sub">Indiquez votre besoin et au moins un moyen de vous recontacter.</p>
          ${renderContactForm()}
        </div>
      </div>
    </div>
  </section>
  <section id="zones" class="section services" style="background: var(--bg-alt);">
    <div class="container">
      <div class="services-header">
        <div class="label">Zones desservies</div>
        <h2 class="heading-xl">Nous intervenons depuis Anderlues<br><span class="text-gold">vers la région et au-delà</span></h2>
      </div>
      <div class="services-grid">
        ${renderZonesCards()}
      </div>
    </div>
  </section>`;
}

function renderHomePage() {
  const meta = staticPages.home;
  return renderLayout({
    pageKey: meta.navKey,
    title: meta.title,
    description: meta.description,
    canonical: pageLink(meta.file),
    schemas: [localBusinessSchema(), websiteSchema()],
    includeServiceAreaMap: true,
    mainContent: `    ${renderHomeHero()}
    <section class="section services">
      <div class="container">
        <div class="services-header" data-animate="scale">
          <div class="label">Nos services</div>
          <h2 class="heading-xl">Une offre claire<br><span class="text-gold">pour chaque besoin</span></h2>
          <div class="divider"></div>
          <p class="text-muted" style="margin-top:18px; max-width: 620px; margin-left:auto; margin-right:auto;">
            Les pages service ont été rationalisées pour expliquer plus vite les cas d’usage, les zones et la façon de réserver.
          </p>
        </div>
        <div class="services-grid">
          ${renderServiceCards()}
        </div>
      </div>
    </section>
    ${renderHomeTrustSection()}
    ${renderHomeZonesSection()}
    ${renderBookingSection({ pageLabel: 'Accueil', selectedService: '' })}
    ${renderGenericCta()}`,
  });
}

function renderServicesPage() {
  const meta = staticPages.services;
  return renderLayout({
    pageKey: meta.navKey,
    title: meta.title,
    description: meta.description,
    canonical: pageLink(meta.file),
    includeServiceAreaMap: true,
    schemas: [
      localBusinessSchema(),
      breadcrumbSchema([
        { name: 'Accueil', file: 'index.html' },
        { name: 'Services', file: meta.file },
      ]),
    ],
    mainContent: `    ${renderPageHero({
      label: 'Nos services',
      title: 'Des trajets mieux présentés',
      highlight: 'et plus faciles à réserver',
      text: 'Chaque service dispose maintenant d’une page plus cohérente: contenu nettoyé, liens corrigés, formulaire homogène et messages en français normalisés.',
      breadcrumb: [
        { name: 'Accueil', file: 'index.html' },
        { name: 'Services', file: meta.file },
      ],
    })}
    <section class="section services">
      <div class="container">
        <div class="services-header">
          <div class="label">Prestations</div>
          <h2 class="heading-xl">Choisissez le service<br><span class="text-gold">adapté à votre trajet</span></h2>
          <div class="divider"></div>
        </div>
        <div class="services-grid">
          ${renderServiceCards()}
        </div>
      </div>
    </section>
    ${renderServiceAreaSection({
      sectionId: 'zones',
      variant: 'alt',
      label: 'Zones desservies',
      title: 'Au départ d’Anderlues',
      highlight: 'vers la région et la Belgique',
      intro:
        'La carte locale complète désormais la page Services pour distinguer clairement la couverture de proximité des trajets aéroport, business et longue distance qui restent organisés sur demande.',
      ctaHref: '#booking',
      ctaLabel: 'Demander un trajet',
      compactMap: true,
    })}
    ${renderBookingSection({ pageLabel: 'Services', selectedService: '' })}
    ${renderGenericCta()}`,
  });
}

function renderServiceDetailPage(service) {
  return renderLayout({
    pageKey: service.key,
    title: service.metaTitle,
    description: service.metaDescription,
    canonical: pageLink(service.file),
    image: service.image.src,
    schemas: [
      localBusinessSchema(),
      serviceSchema(service),
      breadcrumbSchema([
        { name: 'Accueil', file: 'index.html' },
        { name: 'Services', file: 'services.html' },
        { name: service.shortName, file: service.file },
      ]),
    ],
    mainContent: `    ${renderPageHero({
      label: service.label,
      title: service.title,
      highlight: service.highlight,
      text: service.heroSummary,
      image: service.image,
      breadcrumb: [
        { name: 'Accueil', file: 'index.html' },
        { name: 'Services', file: 'services.html' },
        { name: service.shortName, file: service.file },
      ],
    })}
    <section class="page-content">
      <div class="container">
        <div class="page-grid">
          <div>
            <h2 class="page-features-title">Ce que ce service couvre concrètement</h2>
            <div class="page-features">
              ${service.features
                .map(
                  (feature, index) => `<article class="page-feature" data-animate="${index % 2 === 0 ? 'left' : 'right'}">
                    <div class="page-feature-icon">${icon(feature.icon)}</div>
                    <div>
                      <h4>${feature.title}</h4>
                      <p>${feature.text}</p>
                    </div>
                  </article>`
                )
                .join('')}
            </div>
          </div>
          <aside class="page-cta-box" data-animate="scale">
            <h3>${service.ctaTitle}</h3>
            <a class="page-cta-phone" href="tel:${site.phone}">${icon('phone')} ${site.phoneDisplay}</a>
            <p>${service.ctaText}</p>
            <a href="#booking" class="btn btn-primary">Réserver ce service</a>
            <a href="contact.html" class="btn btn-outline">Poser une question</a>
            <div class="page-zones">
              <h4>Zones fréquentes</h4>
              <div class="zone-list">
                ${service.zones.map((zone) => `<span class="zone-tag">${zone}</span>`).join('')}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </section>
    ${renderBookingSection({ pageLabel: service.shortName, selectedService: service.selectedService })}
    ${renderGenericCta()}`,
  });
}

function renderAboutPage() {
  const meta = staticPages.about;
  return renderLayout({
    pageKey: meta.navKey,
    title: meta.title,
    description: meta.description,
    canonical: pageLink(meta.file),
    includeServiceAreaMap: true,
    schemas: [
      localBusinessSchema(),
      breadcrumbSchema([
        { name: 'Accueil', file: 'index.html' },
        { name: 'À propos', file: meta.file },
      ]),
    ],
    mainContent: `    ${renderPageHero({
      label: 'À propos',
      title: 'Une présence locale',
      highlight: 'et une présentation plus professionnelle',
      text: 'La page À propos a été recentrée sur des informations crédibles: approche, méthode, services réellement proposés et points de contact utiles.',
      breadcrumb: [
        { name: 'Accueil', file: 'index.html' },
        { name: 'À propos', file: meta.file },
      ],
    })}
    ${renderAboutSections()}
    ${renderServiceAreaSection({
      variant: 'alt',
      label: 'Zone locale',
      title: 'Notre présence locale',
      highlight: 'est maintenant visible sur la carte',
      intro:
        'La page À propos montre désormais la zone de proximité directement, pour relier la présentation de Taxis Services à son ancrage réel autour d’Anderlues.',
      ctaHref: 'contact.html#booking',
      ctaLabel: 'Parler de votre trajet',
      compactMap: true,
    })}
    ${renderGenericCta()}`,
  });
}

function renderContactPage() {
  const meta = staticPages.contact;
  return renderLayout({
    pageKey: meta.navKey,
    title: meta.title,
    description: meta.description,
    canonical: pageLink(meta.file),
    schemas: [
      localBusinessSchema(),
      breadcrumbSchema([
        { name: 'Accueil', file: 'index.html' },
        { name: 'Contact', file: meta.file },
      ]),
    ],
    mainContent: `    ${renderPageHero({
      label: 'Contact',
      title: 'Parlons de votre trajet',
      highlight: 'ou de votre réservation',
      text: 'Le formulaire de contact et de réservation a été simplifié pour éviter la duplication et rendre les demandes plus claires.',
      breadcrumb: [
        { name: 'Accueil', file: 'index.html' },
        { name: 'Contact', file: meta.file },
      ],
    })}
    ${renderContactSection()}
    ${renderBookingSection({ pageLabel: 'Contact', selectedService: '' })}
    ${renderGenericCta()}`,
  });
}

function renderLegalPage() {
  const meta = staticPages.legal;
  return renderLayout({
    pageKey: meta.navKey,
    title: meta.title,
    description: meta.description,
    canonical: pageLink(meta.file),
    schemas: [
      breadcrumbSchema([
        { name: 'Accueil', file: 'index.html' },
        { name: 'Mentions légales', file: meta.file },
      ]),
    ],
    mainContent: `    ${renderPageHero({
      label: 'Informations légales',
      title: 'Mentions légales, confidentialité',
      highlight: 'et accessibilité',
      text: 'Cette page regroupe les informations légales communiquées par Taxis Services, conformément à la législation belge en vigueur.',
      breadcrumb: [
        { name: 'Accueil', file: 'index.html' },
        { name: 'Mentions légales', file: meta.file },
      ],
    })}
    <section class="section legal-overview">
      <div class="container">
        <div class="legal-overview-grid">
          <article class="legal-card legal-card-highlight" data-animate="left">
            <div class="legal-card-icon">${icon('briefcase')}</div>
            <p class="legal-card-label">Entreprise</p>
            <h2>Taxis Services</h2>
            <p>Responsable de la publication : Taxis Services</p>
            <p>Rue du Pasteur Noir 30<br>6180 Courcelles<br>Belgique</p>
          </article>
          <article class="legal-card" data-animate="scale">
            <div class="legal-card-icon">${icon('phone')}</div>
            <p class="legal-card-label">Contact</p>
            <h2>Coordonnées utiles</h2>
            <p><a href="tel:+32486067927">+32 486 06 79 27</a></p>
            <p><a href="mailto:info@taxis-services.be">info@taxis-services.be</a></p>
          </article>
          <article class="legal-card" data-animate="right">
            <div class="legal-card-icon">${icon('shield')}</div>
            <p class="legal-card-label">Identification</p>
            <h2>Données légales</h2>
            <p>Numéro d'entreprise (BCE/KBO) : 0435.919.978</p>
            <p>Numéro de TVA : BE 0435.919.978</p>
            <p>Hébergement : Combell NV, Belgique</p>
          </article>
        </div>
      </div>
    </section>
    <section class="section legal-content">
      <div class="container">
        <div class="legal-layout">
          <div class="legal-main">
            <article id="informations-legales" class="legal-section-card" data-animate="left">
              <div class="legal-section-head">
                <span class="legal-chip">Éditeur</span>
                <h2>Mentions légales</h2>
              </div>
              <p>Conformément à la législation belge en vigueur, les informations suivantes sont portées à la connaissance des utilisateurs du site.</p>
              <div class="legal-detail-grid">
                <div class="legal-detail-block">
                  <h3>Nom de l'entreprise</h3>
                  <p>Taxis Services</p>
                </div>
                <div class="legal-detail-block">
                  <h3>Adresse du siège</h3>
                  <p>Rue du Pasteur Noir 30<br>6180 Courcelles<br>Belgique</p>
                </div>
                <div class="legal-detail-block">
                  <h3>Contact</h3>
                  <p>Téléphone : <a href="tel:+32486067927">+32 486 06 79 27</a><br>Email : <a href="mailto:info@taxis-services.be">info@taxis-services.be</a></p>
                </div>
                <div class="legal-detail-block">
                  <h3>Responsable de la publication</h3>
                  <p>Taxis Services</p>
                </div>
                <div class="legal-detail-block">
                  <h3>Identification de l'entreprise</h3>
                  <p>Numéro d'entreprise (BCE/KBO) : 0435.919.978<br>Numéro de TVA : BE 0435.919.978</p>
                </div>
                <div class="legal-detail-block">
                  <h3>Hébergement</h3>
                  <p>Le site est hébergé par Combell NV, prestataire situé en Belgique.</p>
                </div>
              </div>
              <p class="legal-note">Taxis Services se réserve le droit de modifier le contenu du site à tout moment, sans préavis.</p>
            </article>

            <article id="politique-confidentialite" class="legal-section-card" data-animate="right">
              <div class="legal-section-head">
                <span class="legal-chip">RGPD</span>
                <h2>Politique de confidentialité</h2>
              </div>
              <p>Chez Taxis Services, la protection de vos données personnelles est une priorité. Cette politique explique comment vos données sont collectées et utilisées conformément au Règlement Général sur la Protection des Données (RGPD).</p>
              <div class="legal-content-block">
                <h3>Responsable du traitement</h3>
                <p>Taxis Services<br>Rue du Pasteur Noir 30, 6180 Courcelles, Belgique<br>Email : <a href="mailto:info@taxis-services.be">info@taxis-services.be</a></p>
              </div>
              <div class="legal-content-block">
                <h3>Données collectées</h3>
                <ul class="legal-list">
                  <li>Nom et prénom</li>
                  <li>Numéro de téléphone et adresse email</li>
                  <li>Informations relatives au transport (lieu de prise en charge, lieu de destination, date, horaires)</li>
                  <li>Informations concernant le type de mobilité (par exemple : fauteuil roulant, aide à la marche), strictement nécessaires à la prestation</li>
                </ul>
                <p class="legal-note"><strong>Important :</strong> Taxis Services ne collecte aucune donnée médicale et ne demande aucun document de santé.</p>
              </div>
              <div class="legal-content-block">
                <h3>Finalités du traitement</h3>
                <ul class="legal-list">
                  <li>Répondre à vos demandes</li>
                  <li>Organiser et fournir des services de transport adaptés</li>
                  <li>Communiquer avec vous dans le cadre du service</li>
                </ul>
                <p>La base légale du traitement est l'exécution d'un service demandé par le client et l'intérêt légitime de Taxis Services.</p>
              </div>
              <div class="legal-content-block">
                <h3>Conservation des données</h3>
                <p>Les données personnelles sont supprimées après la prestation du service, sauf obligation légale ou accord explicite du client pour une conservation ultérieure.</p>
              </div>
              <div class="legal-content-block">
                <h3>Partage des données</h3>
                <p>Vos données personnelles ne sont ni vendues ni cédées. Elles peuvent être partagées uniquement avec les personnes ou partenaires strictement impliqués dans l'exécution du service (par exemple les chauffeurs).</p>
              </div>
              <div class="legal-content-block">
                <h3>Vos droits</h3>
                <p>Conformément au RGPD, vous disposez des droits suivants : droit d'accès, de rectification, à l'effacement et d'opposition.</p>
                <p>Pour exercer vos droits, vous pouvez contacter Taxis Services à l'adresse suivante : <a href="mailto:info@taxis-services.be">info@taxis-services.be</a>. Les demandes sont traitées dans un délai raisonnable, conformément à la législation en vigueur.</p>
              </div>
              <div class="legal-content-block">
                <h3>Réclamation</h3>
                <p>Vous avez le droit d'introduire une réclamation auprès de l'Autorité de protection des données belge (APD/GBA).</p>
              </div>
            </article>

            <article id="declaration-accessibilite" class="legal-section-card" data-animate="left">
              <div class="legal-section-head">
                <span class="legal-chip">Accessibilité</span>
                <h2>Déclaration d'accessibilité</h2>
              </div>
              <p>Taxis Services s'engage à rendre son site internet accessible à toutes les personnes, y compris les personnes à mobilité réduite ou en situation de handicap.</p>
              <div class="legal-content-block">
                <h3>Engagement</h3>
                <p>Notre objectif est de garantir un accès équitable à l'information et aux services proposés sur ce site.</p>
              </div>
              <div class="legal-content-block">
                <h3>Mesures mises en place</h3>
                <ul class="legal-list">
                  <li>Navigation claire et structurée</li>
                  <li>Contenus lisibles et compréhensibles</li>
                  <li>Formulaires conçus pour être accessibles au plus grand nombre</li>
                </ul>
              </div>
              <div class="legal-content-block">
                <h3>Limitations</h3>
                <p>Malgré notre vigilance, certaines sections du site peuvent encore présenter des limitations d'accessibilité. Des améliorations continues sont en cours.</p>
              </div>
              <div class="legal-content-block">
                <h3>Contact accessibilité</h3>
                <p>Si vous rencontrez une difficulté d'accès ou souhaitez une alternative, vous pouvez nous contacter :</p>
                <p>Téléphone : <a href="tel:+32486067927">+32 486 06 79 27</a><br>Email : <a href="mailto:info@taxis-services.be">info@taxis-services.be</a></p>
                <p>Nous nous engageons à vous répondre dans les meilleurs délais.</p>
              </div>
            </article>

            <article id="conditions-service" class="legal-section-card" data-animate="right">
              <div class="legal-section-head">
                <span class="legal-chip">Service</span>
                <h2>Conditions générales de service</h2>
              </div>
              <ol class="legal-numbered-list">
                <li>
                  <strong>Services</strong>
                  <p>Taxis Services propose des services de transport adaptés aux personnes à mobilité réduite, sur demande et selon disponibilité.</p>
                </li>
                <li>
                  <strong>Réservation et annulation</strong>
                  <p>Toute demande de transport doit être confirmée par Taxis Services pour être considérée comme acceptée. Toute annulation doit être signalée dès que possible par téléphone ou par email.</p>
                </li>
                <li>
                  <strong>Tarifs</strong>
                  <p>Les tarifs sont communiqués au client avant la confirmation du service.</p>
                </li>
                <li>
                  <strong>Responsabilité</strong>
                  <p>Taxis Services s'engage à fournir ses services avec sérieux et professionnalisme.</p>
                  <p>L'entreprise ne peut être tenue responsable des retards ou annulations dus à des circonstances indépendantes de sa volonté, telles que le trafic, les conditions météorologiques ou tout cas de force majeure.</p>
                </li>
                <li>
                  <strong>Droit applicable</strong>
                  <p>Les présentes conditions sont soumises au droit belge. Tout litige relève de la compétence exclusive des juridictions belges.</p>
                </li>
              </ol>
            </article>
          </div>
          <aside class="legal-sidebar" data-animate="scale">
            <div class="legal-sidebar-card">
              <h3>Accès rapide</h3>
              <nav aria-label="Navigation des mentions légales">
                <a href="#informations-legales">Mentions légales</a>
                <a href="#politique-confidentialite">Politique de confidentialité</a>
                <a href="#declaration-accessibilite">Déclaration d'accessibilité</a>
                <a href="#conditions-service">Conditions générales</a>
              </nav>
            </div>
            <div class="legal-sidebar-card legal-sidebar-contact">
              <h3>Besoin d'une alternative ?</h3>
              <p>Si vous avez besoin d'une aide pour consulter ces informations ou préférez un autre format, contactez directement Taxis Services.</p>
              <a href="tel:+32486067927" class="btn btn-primary btn-lg">${icon('phone')} +32 486 06 79 27</a>
              <a href="mailto:info@taxis-services.be" class="btn btn-outline btn-lg">info@taxis-services.be</a>
            </div>
          </aside>
        </div>
      </div>
    </section>`,
  });
}

function renderAdminPage() {
  const meta = staticPages.admin;
  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
${renderHead({
  title: meta.title,
  description: meta.description,
  canonical: pageLink(meta.file),
  noindex: true,
  schemas: [],
})}
  <link rel="stylesheet" href="assets/css/admin.css">
</head>
<body class="admin-page admin-login-page" data-admin-page="login">
  <!-- Generated by scripts/build-site.mjs -->
  <main class="admin-shell">
    <section class="admin-auth-card">
      <a href="index.html" class="nav-logo" aria-label="Retour à l'accueil de Taxis Services">
        <div class="nav-logo-icon">TS</div>
        <span class="nav-logo-text">TAXIS <span>SERVICES</span></span>
      </a>
      <p class="admin-auth-badge">Accès administrateur</p>
      <h1>Connexion sécurisée</h1>
      <p class="admin-auth-intro">Cet accès utilise désormais une authentification backend réelle. Connectez-vous pour consulter et gérer les réservations et messages entrants.</p>
      <form id="admin-login-form" class="admin-auth-form" novalidate>
        <div class="form-row">
          <div class="form-group full-width">
            <label for="admin-email">Adresse email</label>
            <input id="admin-email" type="email" name="email" placeholder="admin@taxis-services.be" autocomplete="username" required>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group full-width">
            <label for="admin-password">Mot de passe</label>
            <input id="admin-password" type="password" name="password" placeholder="Votre mot de passe" autocomplete="current-password" required>
          </div>
        </div>
        <div class="form-message" aria-live="polite" hidden></div>
        <button type="submit" class="btn btn-primary btn-lg form-submit">Se connecter</button>
      </form>
      <div class="admin-auth-links">
        <a href="index.html" class="btn btn-outline">Retour au site</a>
        <a href="contact.html" class="btn btn-outline">Besoin d’aide ?</a>
      </div>
      <p class="admin-auth-note">Astuce déploiement: utilisez de préférence un domaine frontend et un sous-domaine API sous la même racine pour des cookies d’administration plus fiables.</p>
    </section>
  </main>
  <script src="assets/js/app-config.js" defer></script>
  <script src="assets/js/admin.js" defer></script>
</body>
</html>`;
}

function renderAdminDashboardPage() {
  const meta = staticPages.adminDashboard;
  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
${renderHead({
  title: meta.title,
  description: meta.description,
  canonical: pageLink(meta.file),
  noindex: true,
  schemas: [],
})}
  <link rel="stylesheet" href="assets/css/admin.css">
</head>
<body class="admin-page admin-dashboard-page" data-admin-page="dashboard">
  <!-- Generated by scripts/build-site.mjs -->
  <main class="admin-shell admin-dashboard-shell">
    <header class="admin-topbar">
      <a href="index.html" class="nav-logo" aria-label="Retour à l'accueil de Taxis Services">
        <div class="nav-logo-icon">TS</div>
        <span class="nav-logo-text">TAXIS <span>SERVICES</span></span>
      </a>
      <div class="admin-topbar-actions">
        <span id="admin-session-email" class="admin-session-email">Chargement...</span>
        <button id="admin-logout-button" type="button" class="btn btn-outline">Se déconnecter</button>
      </div>
    </header>
    <h1 class="visually-hidden">Tableau de bord administrateur Taxis Services</h1>

    <section class="admin-summary-grid">
      <article class="admin-summary-card">
        <p class="admin-summary-label">Réservations</p>
        <strong id="summary-bookings-total" class="admin-summary-value">0</strong>
        <span id="summary-bookings-pending" class="admin-summary-foot">En attente: 0</span>
      </article>
      <article class="admin-summary-card">
        <p class="admin-summary-label">Messages</p>
        <strong id="summary-contacts-total" class="admin-summary-value">0</strong>
        <span id="summary-contacts-new" class="admin-summary-foot">Nouveaux: 0</span>
      </article>
      <article class="admin-summary-card">
        <p class="admin-summary-label">Dernière activité</p>
        <strong id="summary-last-activity" class="admin-summary-value">Aucune</strong>
        <span class="admin-summary-foot">Mise à jour depuis l’API</span>
      </article>
    </section>

    <section class="admin-manage-grid">
      <section class="admin-card">
        <div class="admin-card-head">
          <div>
            <p class="admin-card-kicker">Gestion</p>
            <h2>Réservations</h2>
          </div>
          <div class="admin-filter-row">
            <input id="bookings-search" type="search" placeholder="Nom, email, téléphone..." aria-label="Rechercher une réservation">
            <select id="bookings-status-filter" aria-label="Filtrer les réservations par statut">
              <option value="">Tous les statuts</option>
              <option value="PENDING">En attente</option>
              <option value="IN_REVIEW">En cours</option>
              <option value="CONFIRMED">Confirmée</option>
              <option value="COMPLETED">Terminée</option>
              <option value="CANCELLED">Annulée</option>
              <option value="SPAM">Spam</option>
            </select>
          </div>
        </div>
        <div id="bookings-inline-message" class="admin-inline-message" hidden></div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Client</th>
                <th>Service</th>
                <th>Trajet</th>
                <th>Statut</th>
                <th>Créée</th>
              </tr>
            </thead>
            <tbody id="bookings-table-body"></tbody>
          </table>
        </div>
        <div class="admin-pagination">
          <button id="bookings-prev" type="button" class="btn btn-outline">Précédent</button>
          <span id="bookings-page-info">Page 1</span>
          <button id="bookings-next" type="button" class="btn btn-outline">Suivant</button>
        </div>
      </section>

      <aside class="admin-detail-card">
        <div class="admin-card-head">
          <div>
            <p class="admin-card-kicker">Détail</p>
            <h2>Réservation sélectionnée</h2>
          </div>
        </div>
        <div id="booking-detail-empty" class="admin-empty-state">Sélectionnez une réservation pour afficher ses détails.</div>
        <div id="booking-detail-content" hidden>
          <dl id="booking-detail-fields" class="admin-data-list"></dl>
          <label class="admin-detail-label" for="booking-status-select">Statut</label>
          <select id="booking-status-select">
            <option value="PENDING">En attente</option>
            <option value="IN_REVIEW">En cours</option>
            <option value="CONFIRMED">Confirmée</option>
            <option value="COMPLETED">Terminée</option>
            <option value="CANCELLED">Annulée</option>
            <option value="SPAM">Spam</option>
          </select>
          <div class="admin-action-row">
            <button id="booking-save-button" type="button" class="btn btn-primary">Mettre à jour</button>
            <button id="booking-delete-button" type="button" class="btn btn-outline">Supprimer</button>
          </div>
        </div>
      </aside>
    </section>

    <section class="admin-manage-grid">
      <section class="admin-card">
        <div class="admin-card-head">
          <div>
            <p class="admin-card-kicker">Gestion</p>
            <h2>Messages de contact</h2>
          </div>
          <div class="admin-filter-row">
            <input id="contacts-search" type="search" placeholder="Nom, email, sujet..." aria-label="Rechercher un message">
            <select id="contacts-status-filter" aria-label="Filtrer les messages par statut">
              <option value="">Tous les statuts</option>
              <option value="NEW">Nouveau</option>
              <option value="IN_PROGRESS">En cours</option>
              <option value="RESOLVED">Résolu</option>
              <option value="ARCHIVED">Archivé</option>
              <option value="SPAM">Spam</option>
            </select>
          </div>
        </div>
        <div id="contacts-inline-message" class="admin-inline-message" hidden></div>
        <div class="admin-table-wrap">
          <table class="admin-table">
            <thead>
              <tr>
                <th>Contact</th>
                <th>Sujet</th>
                <th>Statut</th>
                <th>Créé</th>
              </tr>
            </thead>
            <tbody id="contacts-table-body"></tbody>
          </table>
        </div>
        <div class="admin-pagination">
          <button id="contacts-prev" type="button" class="btn btn-outline">Précédent</button>
          <span id="contacts-page-info">Page 1</span>
          <button id="contacts-next" type="button" class="btn btn-outline">Suivant</button>
        </div>
      </section>

      <aside class="admin-detail-card">
        <div class="admin-card-head">
          <div>
            <p class="admin-card-kicker">Détail</p>
            <h2>Message sélectionné</h2>
          </div>
        </div>
        <div id="contact-detail-empty" class="admin-empty-state">Sélectionnez un message pour afficher ses détails.</div>
        <div id="contact-detail-content" hidden>
          <dl id="contact-detail-fields" class="admin-data-list"></dl>
          <label class="admin-detail-label" for="contact-status-select">Statut</label>
          <select id="contact-status-select">
            <option value="NEW">Nouveau</option>
            <option value="IN_PROGRESS">En cours</option>
            <option value="RESOLVED">Résolu</option>
            <option value="ARCHIVED">Archivé</option>
            <option value="SPAM">Spam</option>
          </select>
          <div class="admin-action-row">
            <button id="contact-save-button" type="button" class="btn btn-primary">Mettre à jour</button>
            <button id="contact-delete-button" type="button" class="btn btn-outline">Supprimer</button>
          </div>
        </div>
      </aside>
    </section>
  </main>
  <script src="assets/js/app-config.js" defer></script>
  <script src="assets/js/admin.js" defer></script>
</body>
</html>`;
}

function renderRedirectPage(targetPath) {
  return `<!DOCTYPE html>
<html lang="${site.lang}">
<head>
  <meta charset="UTF-8">
  <meta http-equiv="refresh" content="0; url=${escapeHtml(targetPath)}">
  <meta name="robots" content="noindex, nofollow">
  <title>Redirecting...</title>
  <script>window.location.replace(${JSON.stringify(targetPath)});</script>
</head>
<body>
  <p>Redirecting to <a href="${escapeHtml(targetPath)}">${escapeHtml(targetPath)}</a>...</p>
</body>
</html>`;
}

function renderRobots() {
  return `User-agent: *
Allow: /
Disallow: /${site.adminPath}
Disallow: /${site.adminDashboardPath}

Sitemap: ${site.baseUrl}/sitemap.xml
`;
}

function renderSitemap() {
  const urls = [
    '/',
    '/services.html',
    '/about.html',
    '/contact.html',
    `/${site.legalPath}`,
    ...services.map((service) => `/${service.file}`),
  ];

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((item) => `  <url><loc>${site.baseUrl}${item}</loc></url>`).join('\n')}
</urlset>
`;
}

async function main() {
  await mkdir(frontendDir, { recursive: true });

  const pages = [
    { file: staticPages.home.file, content: renderHomePage() },
    { file: staticPages.services.file, content: renderServicesPage() },
    { file: staticPages.about.file, content: renderAboutPage() },
    { file: staticPages.contact.file, content: renderContactPage() },
    { file: staticPages.legal.file, content: renderLegalPage() },
    { file: staticPages.admin.file, content: renderAdminPage() },
    { file: staticPages.adminDashboard.file, content: renderAdminDashboardPage() },
    ...services.map((service) => ({ file: service.file, content: renderServiceDetailPage(service) })),
  ];

  await Promise.all(
    pages.map(({ file, content }) => writeFile(path.join(frontendDir, file), content, 'utf8'))
  );

  await writeFile(path.join(rootDir, 'robots.txt'), renderRobots(), 'utf8');
  await writeFile(path.join(rootDir, 'sitemap.xml'), renderSitemap(), 'utf8');
  console.log(`Built ${pages.length} pages.`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
