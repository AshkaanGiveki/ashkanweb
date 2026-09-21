"use client";

import { useRef, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { projects } from "@/data/portfolio";
import type { Copy } from "@/i18n/content";
import type { Locale } from "@/i18n/locales";
import { siDocker, siGithub, siGit, siMongodb, siNextdotjs, siNodedotjs, siPostgresql, siReact, siTailwindcss, siTypescript, siVercel, siPrisma, siFigma } from "simple-icons";
import type { SimpleIcon } from "simple-icons";
import LogoLoop from "./LogoLoop";
import MaskedHeading from "./MaskedHeading";

type Form = { name: string; contact: string; subject: string; message: string };
const initial: Form = { name: "", contact: "", subject: "", message: "" };
const languageOptions: Array<[Locale, string, string]> = [["en", "EN", "English"], ["fa", "FA", "فارسی"], ["ar", "AR", "العربية"], ["fr", "FR", "Français"]];
const reveal = { hidden: { opacity: 0, y: 22 }, visible: { opacity: 1, y: 0 } };
const softReveal = { hidden: { opacity: 0, scale: .985 }, visible: { opacity: 1, scale: 1 } };

function Arrow({ up = false }: { up?: boolean }) { return <svg className={up ? "arrow arrow-up" : "arrow"} aria-hidden="true" viewBox="0 0 24 24" fill="none"><path d="M5 12h13" /><path d="m13 6 6 6-6 6" /></svg>; }
function ChevronDown() { return <svg className="language-chevron" aria-hidden="true" viewBox="0 0 16 16" fill="none"><path d="m4 6 4 4 4-4" /></svg>; }
function Logo({ icon }: { icon: SimpleIcon }) { return <svg className="brand-icon" role="img" aria-label={icon.title} viewBox="0 0 24 24"><path d={icon.path} /></svg>; }
function LinkedInLogo() { return <svg className="brand-icon" role="img" aria-label="LinkedIn" viewBox="0 0 24 24"><path d="M20.45 20.45h-3.55v-5.57c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28ZM5.34 7.43a2.06 2.06 0 1 1 0-4.12 2.06 2.06 0 0 1 0 4.12ZM3.56 20.45h3.56V9H3.56v11.45Z" /></svg>; }
function MailIcon() { return <svg className="brand-icon" viewBox="0 0 24 24" role="img" aria-label="Email"><path d="M2.5 5.5h19v13h-19v-13Zm2 2v.6l7.5 4.7 7.5-4.7v-.6H4.5Zm15 2.95-6.44 4.03a2 2 0 0 1-2.12 0L4.5 10.45v6.05h15v-6.05Z" /></svg>; }

export function Portfolio({ locale, t }: { locale: Locale; t: Copy }) {
  const router = useRouter();
  const reduceMotion = useReducedMotion();
  const motionInitial = reduceMotion ? false : "hidden";
  const [menu, setMenu] = useState(false);
  const [languageOpen, setLanguageOpen] = useState(false);
  const [method, setMethod] = useState<"email" | "sms">(locale === "fa" ? "sms" : "email");
  const [stage, setStage] = useState<"form" | "otp" | "success">("form");
  const [form, setForm] = useState(initial);
  const [code, setCode] = useState("");
  const [challenge, setChallenge] = useState("");
  const [masked, setMasked] = useState("");
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const otpRefs = useRef<Array<HTMLInputElement | null>>([]);
  const nav = ["#home", "#about", "#projects", "#experience", "#contact"];
  const visitor = () => { const key = "ashkan_portfolio_visitor_id"; let value = localStorage.getItem(key); if (!value) { value = crypto.randomUUID(); localStorage.setItem(key, value); } return value; };
  const update = (key: keyof Form, value: string) => setForm({ ...form, [key]: value });

  async function requestOtp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice("");
    const contact = method === "sms" ? form.contact.replace(/\s/g, "").replace(/^0/, "+98") : form.contact.trim();
    try {
      const response = await fetch("/api/contact/otp/request", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ method, contact, locale, visitorId: visitor(), honeypot: "" }) });
      const data = await response.json(); if (!response.ok) throw Error(data.error);
      setChallenge(data.challengeId); setMasked(data.maskedDestination); setForm({ ...form, contact }); setCode(""); setStage("otp"); setTimeout(() => otpRefs.current[0]?.focus(), 0);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to send verification code."); } finally { setBusy(false); }
  }
  async function sendMessage(token: string) {
    setBusy(true);
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ ...form, locale, visitorId: visitor(), verificationToken: token, page: location.href, submissionAttemptId: crypto.randomUUID() }) });
      const data = await response.json(); if (!response.ok) throw Error(data.error); setStage("success");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Unable to deliver your message."); } finally { setBusy(false); }
  }
  async function verifyOtp(e: React.FormEvent) {
    e.preventDefault(); setBusy(true); setNotice("");
    try {
      const response = await fetch("/api/contact/otp/verify", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ challengeId: challenge, code }) });
      const data = await response.json(); if (!response.ok) throw Error(data.error); await sendMessage(data.verificationToken);
    } catch (error) { setNotice(error instanceof Error ? error.message : "Verification failed."); setBusy(false); }
  }
  const setDigit = (index: number, value: string) => { const digit = value.replace(/\D/g, "").slice(-1); const next = code.split(""); next[index] = digit; setCode(next.join("").slice(0, 6)); if (digit && index < 5) otpRefs.current[index + 1]?.focus(); };
  const skillItems: Array<[SimpleIcon, string, string]> = [[siNextdotjs, "Next.js", "mono"], [siReact, "React", "react"], [siTypescript, "TypeScript", "ts"], [siNodedotjs, "Node.js", "node"], [siPostgresql, "PostgreSQL", "postgres"], [siMongodb, "MongoDB", "mongo"], [siDocker, "Docker", "docker"], [siVercel, "Vercel", "mono"], [siTailwindcss, "Tailwind CSS", "tailwind"], [siPrisma, "Prisma", "prisma"], [siGit, "Git", "git"], [siFigma, "Figma", "figma"]];
  const scrollLabel = locale === "fa" ? "اسکرول کنید" : locale === "ar" ? "مرر للأسفل" : locale === "fr" ? "Défiler" : "Scroll Down";
  const smsMethod = locale === "fa" ? "ایران (+۹۸ پیامک)" : locale === "ar" ? "إيران (+٩٨ رسالة نصية)" : locale === "fr" ? "Iran (+98 SMS)" : "Iran (+98 SMS)";
  const emailMethod = locale === "fa" ? "بین‌المللی (ایمیل)" : locale === "ar" ? "دولي (البريد الإلكتروني)" : locale === "fr" ? "International (e-mail)" : "International (Email)";
  const otpLabel = locale === "fa" ? "کد تأیید شش رقمی" : locale === "ar" ? "رمز التحقق المكوّن من ستة أرقام" : locale === "fr" ? "Code de vérification à six chiffres" : "Six digit verification code";
  const digitLabel = locale === "fa" ? "رقم" : locale === "ar" ? "الرقم" : locale === "fr" ? "Chiffre" : "Digit";

  return <div className="site-shell">
    <motion.header className="site-header" initial={reduceMotion ? false : { opacity: 0, y: -14 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: .6, ease: "easeOut" }}>
      <a className="brand" href="#home"><Image className="brand-logo" src="/images/logo.png" alt="AG" width={34} height={34} priority /><span>ASHKAN GIVEKI</span></a>
      <nav>{t.nav.map((item, index) => <a className={index === 0 ? "active" : ""} key={item} href={nav[index]}>{item}</a>)}</nav>
      <div className="headtools">
        <div className="language-wrap">
          <button className="language" aria-label={t.form.language} aria-haspopup="listbox" aria-expanded={languageOpen} onClick={() => setLanguageOpen(!languageOpen)}><span className="language-globe" aria-hidden="true">◎</span><strong>{locale.toUpperCase()}</strong><ChevronDown /></button>
          <AnimatePresence>{languageOpen && <motion.div className="language-menu" role="listbox" aria-label={t.form.language} initial={reduceMotion ? false : { opacity: 0, y: -5, scale: .97 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={reduceMotion ? undefined : { opacity: 0, y: -5, scale: .97 }} transition={{ duration: .18 }}>{languageOptions.map(([value, code, label]) => <button key={value} className={value === locale ? "selected" : ""} role="option" aria-selected={value === locale} onClick={() => { setLanguageOpen(false); router.push(`/${value}${location.hash}`); }}><strong>{code}</strong><span>{label}</span>{value === locale && <i aria-hidden="true">✓</i>}</button>)}</motion.div>}</AnimatePresence>
        </div>
        <button className="hamb" onClick={() => setMenu(!menu)} aria-label={t.form.menu} aria-expanded={menu}><span /><span /><span /></button>
      </div>
      <AnimatePresence>{menu && <motion.div className="mobilemenu" initial={reduceMotion ? false : { opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} exit={reduceMotion ? undefined : { opacity: 0, y: -8 }} transition={{ duration: .22 }}>{t.nav.map((item, index) => <motion.a key={item} href={nav[index]} onClick={() => setMenu(false)} initial={reduceMotion ? false : { opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: index * .035 }}>{item}<Arrow /></motion.a>)}</motion.div>}</AnimatePresence>
    </motion.header>
    <motion.main initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: .9, delay: .1, ease: "easeOut" }}>
      <section id="home" className="hero"><div className="hero-copy"><p className="eyebrow">{t.intro}</p><h1>{t.hero}<br /><em>{t.accent}</em></h1><p className="lede">{t.bio}</p><div className="actions"><a className="btn primary" href="#projects">{t.work}<Arrow /></a><a className="btn" href="#contact">{t.talk}<Arrow /></a></div><div className="facts">{t.metrics.map(([label, value]) => <span key={label}><b>{value}</b><small>{label}</small></span>)}</div><div className="built-with"><small>{t.builtWith}</small>{skillItems.slice(0, 3).map(([icon, name, color]) => <span className={color} key={name}><Logo icon={icon} />{name}</span>)}</div><div className="scroll-hint"><span>◯</span> {scrollLabel}</div></div><div className="hero-image"><Image src="/images/hero/workspace.png" alt={t.heroQuote.join(" ")} fill priority sizes="(max-width:800px) 100vw, 62vw" /><p>{t.heroQuote[0]}<br />{t.heroQuote[1]}</p></div></section>
      <section id="about" className="section about"><div className="section-intro"><p className="marker">/ 01<br /><span>{t.about}</span></p><h2>{t.statement}</h2></div><div className="about-copy"><p>{t.aboutCopy}</p><p className="about-meta">⌖ &nbsp; {t.aboutMeta}</p></div><div className="orbit" aria-label={t.about}><Image src="/images/about/ideas-impact-pattern.png" alt={t.statement} fill sizes="(max-width: 800px) 100vw, 280px" /></div></section>
      <section id="projects" className="section projects-section"><div className="section-heading"><p className="marker">/ 02<br /><span>{t.projects}</span></p><a href="#projects" className="view-all">{t.viewAll} <Arrow /></a></div><div className="projects">{projects.map(([name, url, _description, tags, tone], index) => <motion.article className={`project ${tone}`} key={name} initial={motionInitial} whileInView="visible" viewport={{ once: true, amount: .18 }} variants={{ hidden: { opacity: 0, y: 28 }, visible: { opacity: 1, y: 0, transition: { duration: .55, delay: index * .08, ease: "easeOut" } } }}><a className="thumb" href={url} target="_blank" rel="noopener noreferrer" aria-label={`${t.form.openProject} ${name}`}><span className="thumb-title">{name}</span><strong>{t.projectPreviews[index][0]}</strong><span className="mobile-preview-copy"><b>{name}</b><small>{t.projectPreviews[index][1]}</small><span className="tags">{tags.slice(0, 3).map(tag => <i key={tag}>{tag}</i>)}</span></span></a><div className="project-content"><h3>{name}<a href={url} target="_blank" rel="noopener noreferrer" aria-label={`${t.form.openProject} ${name}`}><Arrow /></a></h3><p>{t.projectDescriptions[index]}</p><div className="tags">{tags.map(tag => <i key={tag}>{tag}</i>)}</div></div></motion.article>)}</div></section>
      <section className="section skills"><div className="skills-copy"><p className="marker">/ 03<br /><span>{t.skills === "Tools I turn ideas into reality with." ? "SKILLS" : t.experience === "تجربه" ? "مهارت‌ها" : t.experience === "الخبرة" ? "المهارات" : "COMPÉTENCES"}</span></p><h2>{t.skills}</h2></div><div className="skill-loops">{([[6, "desktop"], [4, "tablet"]] as const).map(([size, mode]) => Array.from({ length: Math.ceil(skillItems.length / size) }, (_, row) => <LogoLoop key={`${mode}-${row}`} className={`tools-loop tools-loop-${mode}`} logos={skillItems.slice(row * size, row * size + size).map(([icon, name, color]) => ({ icon, name, color }))} speed={36} direction={row % 2 ? "right" : "left"} logoHeight={24} gap={30} pauseOnHover fadeOut fadeOutColor="#071114" scaleOnHover ariaLabel={`${mode} technology tools`} renderItem={(item: { icon: SimpleIcon; name: string; color: string }) => <span className={`loop-tool ${item.color}`}><Logo icon={item.icon} /><small>{item.name}</small></span>} />))}{Array.from({ length: 3 }, (_, column) => <LogoLoop key={`mobile-${column}`} className="tools-loop tools-loop-mobile" logos={skillItems.slice(column * 4, column * 4 + 4).map(([icon, name, color]) => ({ icon, name, color }))} speed={28} direction={column % 2 ? "down" : "up"} logoHeight={24} gap={30} pauseOnHover fadeOut fadeOutColor="#071114" scaleOnHover ariaLabel={`mobile technology tools column ${column + 1}`} renderItem={(item: { icon: SimpleIcon; name: string; color: string }) => <span className={`loop-tool ${item.color}`}><Logo icon={item.icon} /><small>{item.name}</small></span>} />)}</div></section>
      <section id="experience" className="section experience"><div className="section-intro"><p className="marker">/ 04<br /><span>{t.experience}</span></p></div><div className="timeline">{t.experienceItems.map(([date, role, company, description], index) => <motion.article key={`${date}-${company}`} className={index === 0 ? "current" : ""} initial={motionInitial} whileInView="visible" viewport={{ once: true, amount: .3 }} variants={{ hidden: { opacity: 0, x: -24 }, visible: { opacity: 1, x: 0, transition: { duration: .5, delay: index * .1, ease: "easeOut" } } }}><i /><small>{date}</small><h3>{role}</h3><b>{company}</b><p>{description}</p></motion.article>)}</div><div className="experience-quote"><span>“</span><p>Continuous<br />learning,<br /><em>better products.</em></p><i /></div></section>
      <section id="contact" className="section contact"><div className="contact-copy"><p className="marker">/ 05<br /><span>{t.contact}</span></p><MaskedHeading text={t.contactTitle} tag="h2" className="contact-title" src="/images/hero/workspace.png" align="left" weight={700} fillScale={1.3} parallax={18} drift={10} brightness={1.05} saturation={.72} reveal="rise" duration={1.05} stagger={.08} trigger="view" textScale={.105} /><p className="lede">{t.contactText}</p></div><div className="formbox">{stage === "success" ? <div className="success"><b>✓</b><h3>{t.form.successTitle}</h3><p>{t.form.successText}</p></div> : stage === "otp" ? <form onSubmit={verifyOtp}><p>{t.form.sentCode} <b dir="ltr">{masked}</b>.</p><div className="otp-cells" role="group" aria-label={otpLabel}>{Array.from({ length: 6 }, (_, index) => <input key={index} ref={element => { otpRefs.current[index] = element; }} value={code[index] || ""} inputMode="numeric" autoComplete={index === 0 ? "one-time-code" : "off"} maxLength={1} aria-label={`${digitLabel} ${index + 1}`} onChange={e => setDigit(index, e.target.value)} required />)}</div><button className="btn primary" disabled={busy}>{busy ? t.form.verifying : t.form.verify}</button><button type="button" className="text-button" onClick={() => setStage("form")}>{t.form.change}</button></form> : <form onSubmit={requestOtp}><div className="method"><button type="button" className={method === "sms" ? "active" : ""} onClick={() => setMethod("sms")}>{smsMethod}</button><button type="button" className={method === "email" ? "active" : ""} onClick={() => setMethod("email")}>{emailMethod}</button></div><div className="form-row"><label>{t.form.name}<input required minLength={2} value={form.name} onChange={e => update("name", e.target.value)} /></label><label>{method === "sms" ? t.form.mobile : t.form.email}<input required dir="ltr" value={form.contact} onChange={e => update("contact", e.target.value)} placeholder={method === "sms" ? "0912 123 4567" : "your@email.com"} /></label></div><label>{t.form.subject}<input required minLength={2} value={form.subject} onChange={e => update("subject", e.target.value)} /></label><label>{t.form.message}<textarea required minLength={10} value={form.message} onChange={e => update("message", e.target.value)} /></label><button className="btn primary" disabled={busy}>{busy ? t.form.sending : t.form.send}<Arrow /></button></form>}{stage !== "success" && <p className="privacy" aria-live="polite">{notice || t.privacy}</p>}</div></section>
    </motion.main>
    <footer><div className="footer-main"><a className="brand" href="#home"><Image className="brand-logo" src="/images/logo.png" alt="AG" width={34} height={34} /><span>ASHKAN GIVEKI<br /><small>{t.form.footerRole}</small></span></a><div className="footer-nav">{t.nav.map((item, index) => index === 3 ? null : <a key={item} href={nav[index]}>{item}</a>)}</div><div className="socials"><a href="https://github.com/AshkaanGiveki" aria-label="GitHub"><Logo icon={siGithub} /></a><a href="https://linkedin.com/in/AshkanGiveki" aria-label="LinkedIn"><LinkedInLogo /></a><a href="mailto:givekiashkaan@gmail.com" aria-label="Email"><MailIcon /></a></div><p className="footer-quote">“{t.form.footerQuote[0]}<br />{t.form.footerQuote[1]}”</p></div><div className="footer-bottom"><p>© {new Date().getFullYear()} Ashkan Giveki. {t.form.copyright}</p><div><a className="backtop" href="#home" aria-label={t.form.backToTop}><Arrow up /></a></div></div></footer>
  </div>;
}
