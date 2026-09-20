import {Portfolio} from "@/components/portfolio";import {copy} from "@/i18n/content";import {isLocale} from "@/i18n/locales";import {notFound} from "next/navigation";
export default async function Page({params}:{params:Promise<{locale:string}>}){const {locale}=await params;if(!isLocale(locale))notFound();return <Portfolio locale={locale} t={copy[locale]}/>}
