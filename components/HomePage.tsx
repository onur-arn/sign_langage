'use client';

import Link from "next/link";
import Image from "next/image";
import { useLanguage } from "@/contexts/LanguageContext";
import { Language } from "@/lib/i18n/translations";
import { GridAnimation } from "./GridAnimation";
import { DarkModeToggle } from "./DarkModeToggle";
import { useDarkMode } from "@/contexts/DarkModeContext";

export default function HomePage() {
  const { language, setLanguage, t } = useLanguage();
  const { dark } = useDarkMode();

  const languages: { code: Language; label: string; flag: string }[] = [
    { code: 'fr', label: 'Français', flag: '🇫🇷' },
    { code: 'en', label: 'English', flag: '🇬🇧' },
    { code: 'tr', label: 'Türkçe', flag: '🇹🇷' },
  ];

  const tx = {
    title:    dark ? 'rgba(255,255,255,0.95)' : '#1e3a40',
    subtitle: dark ? 'rgba(255,255,255,0.55)'  : '#4a7a84',
    card:     dark ? 'rgba(255,255,255,0.06)'  : '#ffffff',
    cardBorder: dark ? 'rgba(91,164,176,0.2)'  : 'rgba(91,164,176,0.2)',
    cardTitle:  dark ? 'rgba(255,255,255,0.9)'  : '#1e3a40',
    cardDesc:   dark ? 'rgba(255,255,255,0.5)'  : '#4a7a84',
    logoBg:   dark ? 'rgba(255,255,255,0.1)'   : '#ffffff',
    sectionBg: dark ? '#05191e' : '#ffffff',
    border:   dark ? 'rgba(91,164,176,0.2)'    : 'rgba(91,164,176,0.2)',
    partnerLabel: dark ? 'rgba(91,164,176,0.7)' : '#5ba4b0',
  };

  return (
    <div style={{ background: tx.sectionBg, transition: 'background 0.5s ease' }}>
      {/* ── HERO — full viewport ── */}
      <section className="relative min-h-screen flex flex-col overflow-hidden">
        {/* Grid animation background */}
        <div className="absolute inset-0 z-0">
          <GridAnimation dark={dark} />
        </div>

        {/* Top bar */}
        <div className="absolute top-6 left-0 right-0 z-30 flex items-center justify-between px-6">
          <DarkModeToggle variant="overlay" />

          {/* Language Selector */}
          <div className="backdrop-blur-xl border rounded-2xl p-1.5 flex gap-1"
            style={{ background: dark ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.85)', borderColor: 'rgba(91,164,176,0.25)' }}>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setLanguage(lang.code)}
                className="px-4 py-2 rounded-xl font-medium text-sm transition-all"
                style={language === lang.code
                  ? { background: '#5ba4b0', color: '#ffffff', fontWeight: 700 }
                  : { color: dark ? 'rgba(255,255,255,0.7)' : '#5ba4b0' }
                }
              >
                <span className="mr-1.5">{lang.flag}</span>
                {lang.label}
              </button>
            ))}
          </div>
        </div>

        {/* Centered hero content */}
        <div className="relative z-20 flex-1 flex flex-col items-center justify-center px-6 text-center">
          <h1 className="text-6xl md:text-7xl lg:text-8xl tracking-tight leading-tight transition-colors duration-500" style={{ color: tx.title }}>
            <span className="font-extralight">{t.hero.title}</span>
            <span className="block font-bold mt-2" style={{ color: '#5ba4b0' }}>
              {t.hero.titleBold}
            </span>
          </h1>
          <p className="mt-6 text-lg md:text-xl max-w-xl font-light leading-relaxed transition-colors duration-500"
            style={{ color: tx.subtitle }}>
            {t.hero.subtitle}
          </p>
          <div className="mt-10 flex items-center justify-center gap-4 flex-wrap">
            <Link
              href="/register"
              className="px-8 py-3.5 rounded-full font-semibold text-sm hover:scale-105 hover:shadow-xl transition-all shadow-md"
              style={{ background: '#5ba4b0', color: '#ffffff' }}
            >
              {t.hero.cta}
            </Link>
            <Link
              href="/login"
              className="px-8 py-3.5 rounded-full font-semibold text-sm transition-all border-2"
              style={dark
                ? { borderColor: 'rgba(255,255,255,0.4)', color: 'rgba(255,255,255,0.85)' }
                : { borderColor: '#5ba4b0', color: '#5ba4b0' }
              }
            >
              {t.hero.login}
            </Link>
          </div>
        </div>

        {/* Scroll hint */}
        <div className="relative z-20 flex justify-center pb-8">
          <div className="flex flex-col items-center gap-2 animate-bounce" style={{ color: 'rgba(91,164,176,0.5)' }}>
            <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 5v14M5 12l7 7 7-7" />
            </svg>
          </div>
        </div>
      </section>

      {/* ── BELOW THE FOLD ── */}
      <section className="relative z-10 px-6 py-20 transition-colors duration-500" style={{ background: tx.sectionBg }}>
        <div className="max-w-5xl mx-auto space-y-16">

          {/* Feature Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { emoji: '📄', title: t.features.pdf.title, desc: t.features.pdf.desc },
              { emoji: '🎤', title: t.features.voice.title, desc: t.features.voice.desc },
              { emoji: '🎥', title: t.features.video.title, desc: t.features.video.desc },
            ].map((f, i) => (
              <div key={i}
                className="group p-9 rounded-3xl transition-all hover:shadow-xl hover:-translate-y-1 duration-300 border"
                style={{ background: tx.card, borderColor: tx.cardBorder, boxShadow: '0 4px 20px rgba(91,164,176,0.08)' }}
              >
                <div className="text-5xl mb-5">{f.emoji}</div>
                <h3 className="text-lg font-semibold mb-3" style={{ color: tx.cardTitle }}>{f.title}</h3>
                <p className="leading-relaxed text-sm" style={{ color: tx.cardDesc }}>{f.desc}</p>
              </div>
            ))}
          </div>

          {/* Partners */}
          <div className="border-t pt-16" style={{ borderColor: tx.border }}>
            <p className="text-center text-xs font-semibold uppercase tracking-widest mb-12"
              style={{ color: tx.partnerLabel }}>
              {language === 'fr' ? 'Partenaires & collaborateurs' : language === 'tr' ? 'Ortaklar & iş birlikçiler' : 'Partners & collaborators'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16">
              {[
                { src: '/logo-project.jpg', alt: 'Project logo', h: 'h-20' },
                { src: '/logo-youthstation.png', alt: 'Youth Station', h: 'h-20' },
                { src: '/logo-ulusal-ajans.png', alt: 'Türkiye Ulusal Ajansı', h: 'h-16' },
                { src: '/logo-eu.png', alt: 'Co-funded by the European Union', h: 'h-24' },
              ].map((logo) => (
                <div key={logo.src}
                  className="rounded-2xl px-7 py-5 transition-all cursor-default border"
                  style={{ background: tx.logoBg, borderColor: 'rgba(91,164,176,0.15)', boxShadow: '0 2px 12px rgba(91,164,176,0.1)' }}
                >
                  <Image
                    src={logo.src}
                    alt={logo.alt}
                    width={260}
                    height={120}
                    className={`object-contain ${logo.h} w-auto`}
                  />
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="border-t mt-8 pt-6 pb-4 text-center" style={{ borderColor: 'rgba(91,164,176,0.15)' }}>
          <p className="text-xs" style={{ color: tx.partnerLabel }}>
            {language === 'fr' && <>Développé par </>}
            {language === 'en' && <>Developed by </>}
            {language === 'tr' && <>Geliştiren: </>}
            <span className="font-semibold">Onur Arslan</span>
            {' · '}
            {language === 'fr' && 'Contact : '}
            {language === 'en' && 'Contact: '}
            {language === 'tr' && 'İletişim: '}
            <a href="mailto:secretaire@youthstation.org" className="hover:underline" style={{ color: '#5ba4b0' }}>
              secretaire@youthstation.org
            </a>
          </p>
        </div>

      </section>
    </div>
  );
}
