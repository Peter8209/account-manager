type BioLanguage = 'sk' | 'cs' | 'en' | 'de' | 'pl' | 'hu';

type BioOptions = {
  language?: string;
  field?: string;
  tone?: 'neutral' | 'student' | 'professional' | 'creative';
};

const skTemplates = [
  'Študent so záujmom o vzdelávanie, technológie a praktické riešenia.',
  'Profil zameraný na osobný rozvoj, učenie a efektívne digitálne nástroje.',
  'Používateľ, ktorý sa venuje práci s textom, dátami a akademickými projektmi.',
  'Zaujímam sa o moderné technológie, produktivitu a zlepšovanie pracovných postupov.',
  'Profil vytvorený pre správu vzdelávacích, pracovných a digitálnych aktivít.',
];

const enTemplates = [
  'Student interested in education, technology and practical digital tools.',
  'Profile focused on learning, productivity and personal development.',
  'User working with text, data and digital academic projects.',
  'Interested in modern technology, structured work and effective learning.',
  'Profile created for managing educational and digital activities.',
];

const deTemplates = [
  'Profil mit Interesse an Bildung, Technologie und digitalen Werkzeugen.',
  'Nutzerprofil mit Fokus auf Lernen, Produktivität und persönliche Entwicklung.',
  'Profil für akademische, digitale und organisatorische Aktivitäten.',
  'Interessiert an modernen Technologien, strukturiertem Arbeiten und Weiterbildung.',
  'Profil für effizientes Lernen und praktische digitale Lösungen.',
];

const csTemplates = [
  'Student se zájmem o vzdělávání, technologie a praktická digitální řešení.',
  'Profil zaměřený na učení, produktivitu a osobní rozvoj.',
  'Uživatel pracující s textem, daty a akademickými projekty.',
];

const plTemplates = [
  'Profil osoby zainteresowanej edukacją, technologią i narzędziami cyfrowymi.',
  'Użytkownik skupiony na nauce, produktywności i rozwoju osobistym.',
  'Profil do zarządzania aktywnościami edukacyjnymi i cyfrowymi.',
];

const huTemplates = [
  'Oktatás, technológia és digitális eszközök iránt érdeklődő profil.',
  'Tanulásra, produktivitásra és személyes fejlődésre fókuszáló felhasználó.',
  'Profil oktatási és digitális tevékenységek kezelésére.',
];

function normalizeLanguage(language?: string): BioLanguage {
  const value = String(language || 'sk').toLowerCase();

  if (value === 'cs') return 'cs';
  if (value === 'en') return 'en';
  if (value === 'de') return 'de';
  if (value === 'pl') return 'pl';
  if (value === 'hu') return 'hu';

  return 'sk';
}

function pickRandom(items: string[]) {
  return items[Math.floor(Math.random() * items.length)];
}

export function generateSafeBio(options: BioOptions = {}) {
  const language = normalizeLanguage(options.language);

  const templates: Record<BioLanguage, string[]> = {
    sk: skTemplates,
    cs: csTemplates,
    en: enTemplates,
    de: deTemplates,
    pl: plTemplates,
    hu: huTemplates,
  };

  const base = pickRandom(templates[language]);

  const field = String(options.field || '').trim();

  if (!field) return base;

  if (language === 'en') {
    return `${base} Main area of interest: ${field}.`;
  }

  if (language === 'de') {
    return `${base} Hauptinteresse: ${field}.`;
  }

  if (language === 'cs') {
    return `${base} Hlavní oblast zájmu: ${field}.`;
  }

  if (language === 'pl') {
    return `${base} Główny obszar zainteresowania: ${field}.`;
  }

  if (language === 'hu') {
    return `${base} Fő érdeklődési terület: ${field}.`;
  }

  return `${base} Hlavná oblasť záujmu: ${field}.`;
}