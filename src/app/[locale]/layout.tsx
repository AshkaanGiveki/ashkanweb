import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isLocale, rtlLocales, type Locale } from "@/i18n/locales";

const names: Record<Locale, string> = {
  en: "Ashkan Giveki | Senior Frontend Engineer & Full-Stack TypeScript Engineer",
  fa: "اشکان گیوکی | مهندس ارشد فرانت‌اند",
  fr: "Ashkan Giveki | Senior Frontend Engineer",
  ar: "أشكان جيواكي | مهندس واجهات أمامية أول"
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  return {
    title: names[locale],
    description: "Senior Frontend Engineer and Full-Stack TypeScript Engineer building modern product experiences with Next.js, React and TypeScript.",
    icons: { icon: "/images/logo.png", apple: "/images/logo.png" },
    alternates: { canonical: `https://ashkanweb.vercel.app/${locale}`, languages: { en: "/en", fa: "/fa", fr: "/fr", ar: "/ar", "x-default": "/en" } },
    openGraph: { title: names[locale], description: "Product engineering with Next.js, React and TypeScript.", type: "website", images: ["/images/logo.png"] }
  };
}

export default async function Layout({ children, params }: { children: React.ReactNode; params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();
  return <html lang={locale} dir={rtlLocales.includes(locale) ? "rtl" : "ltr"}><body>{children}</body></html>;
}
