export const locales = ["en", "fa", "fr", "ar"] as const;
export type Locale = (typeof locales)[number];
export const isLocale = (value: string): value is Locale => locales.includes(value as Locale);
export const rtlLocales: Locale[] = ["fa", "ar"];
