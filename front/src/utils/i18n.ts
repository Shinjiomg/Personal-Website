import { translations, type Language, type Translations } from './translations';

export function getTranslations(lang: Language): Translations {
    return translations[lang] || translations.es;
}

export function getLanguage(): Language {
    if (typeof window === 'undefined') return 'es';
    const saved = localStorage.getItem('language') as Language;
    return saved && (saved === 'es' || saved === 'en') ? saved : 'es';
}

export function setLanguage(lang: Language): void {
    if (typeof window === 'undefined') return;
    localStorage.setItem('language', lang);
    document.documentElement.setAttribute('lang', lang);
    document.documentElement.setAttribute('data-language', lang);
}
