import en from './en.json'
import uk from './uk.json'
import de from './de.json'
import fr from './fr.json'
import es from './es.json'
import pt from './pt.json'

const translations: Record<string, typeof en> = { en, uk, de, fr, es, pt }

export const supportedLocales = ['en', 'uk', 'de', 'fr', 'es', 'pt'] as const
export type Locale = (typeof supportedLocales)[number]

export const localeNames: Record<Locale, string> = {
  en: '🇬🇧 English',
  uk: '🇺🇦 Українська',
  de: '🇩🇪 Deutsch',
  fr: '🇫🇷 Français',
  es: '🇪🇸 Español',
  pt: '🇵🇹 Português',
}

export function getLocale(url: URL): Locale {
  const [, lang] = url.pathname.split('/')
  if (lang && supportedLocales.includes(lang as Locale)) {
    return lang as Locale
  }
  return 'en'
}

export function t(locale: Locale): typeof en {
  return translations[locale] ?? translations.en
}

export function localePath(path: string, locale: Locale): string {
  if (locale === 'en') return path
  return `/${locale}${path}`
}
