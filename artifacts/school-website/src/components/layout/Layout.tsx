import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Phone, Mail, MapPin, Facebook, Menu, X, Youtube } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useState, useEffect, useRef } from "react";
import { cn } from "@/lib/utils";
import schoolBanner from "@assets/image_1777794982386.png";

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [navStuck, setNavStuck] = useState(false);
  const [location] = useLocation();
  const navRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const sentinel = document.getElementById("nav-sentinel");
    if (!sentinel) return;
    const observer = new IntersectionObserver(
      ([entry]) => setNavStuck(!entry.isIntersecting),
      { threshold: 0 }
    );
    observer.observe(sentinel);
    return () => observer.disconnect();
  }, []);

  const navLinks = [
    { href: "/", en: "Home", kh: "ទំព័រដើម" },
    { href: "/results", en: "General Results", kh: "លទ្ធផលសិក្សាទូទៅ" },
    { href: "/standards", en: "Bac II Standards", kh: "ស្តង់ដារបាក់ឌុប" },
    { href: "/admin-work", en: "Administrative Work", kh: "កិច្ចការរដ្ឋបាល" },
    { href: "/reports", en: "School Reports", kh: "របាយការណ៍សាលា" },
    { href: "/about", en: "About", kh: "អំពីយើង" },
    { href: "/academics", en: "Academics", kh: "ការសិក្សា" },
    { href: "/activities", en: "Activities", kh: "សកម្មភាព" },
    { href: "/news", en: "News", kh: "ព័ត៌មាន" },
    { href: "/contact", en: "Contact", kh: "ទំនាក់ទំនង" },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${lang === "kh" ? "font-khmer" : "font-sans"}`}>

      <div className="relative w-full overflow-hidden border-b border-white/10">
        <div className="absolute inset-0">
          <img src={schoolBanner} alt="School Banner" className="w-full h-full object-cover object-center" />
          <div className="absolute inset-0 bg-[#0d2550]/92" />
        </div>
        <div className="relative px-4 md:px-8 py-4 md:py-5">
          <div className="flex items-center gap-4 md:gap-6">
            <Link href="/" className="shrink-0">
              <img
                src="/school-logo.png"
                alt="School Logo"
                className="h-16 w-16 md:h-24 md:w-24 object-cover rounded-full border-4 border-white shadow-xl bg-white"
              />
            </Link>
            <div className="min-w-0 flex-1">
              <p className="text-[10px] md:text-xs font-bold tracking-[0.24em] uppercase text-secondary/90 font-sans truncate">
                {t("Ministry of Education, Youth and Sport", "ក្រសួងអប់រំ យុវជន និងកីឡា")}
              </p>
              <h1 className="text-xl md:text-4xl font-extrabold leading-tight text-white font-khmer">
                {t("Treng Secondary School", "វិទ្យាល័យត្រែង")}
              </h1>
              <p className="text-sm md:text-lg font-extrabold text-secondary font-khmer drop-shadow">
                {t("Welcome to our school!", "សូមស្វាគមន៍!")}
              </p>
            </div>
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-x-6 gap-y-2 text-white/85 text-xs xl:text-sm lg:justify-end">
            <div className="flex items-center gap-2">
              <Phone size={12} className="text-secondary shrink-0" />
              <span>012 345 678</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail size={12} className="text-secondary shrink-0" />
              <span>trengsecondaryschool@gmail.com</span>
            </div>
            <div className="flex items-center gap-3 pl-0 lg:pl-3 lg:border-l border-white/15">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary/20 hover:text-secondary transition-colors" aria-label="Facebook">
                <Facebook size={14} />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary/20 hover:text-secondary transition-colors" aria-label="YouTube">
                <Youtube size={14} />
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer" className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary/20 hover:text-secondary transition-colors" aria-label="TikTok">
                <SiTiktok size={12} />
              </a>
            </div>
            <div className="flex items-center gap-2 pl-0 lg:pl-3 lg:border-l border-white/15">
              <button onClick={() => setLang("en")} className={cn("text-xs font-medium transition-colors hover:text-secondary", lang === "en" ? "text-secondary" : "")}>EN</button>
              <span className="text-white/30 text-xs">|</span>
              <button onClick={() => setLang("kh")} className={cn("text-xs font-khmer font-medium transition-colors hover:text-secondary", lang === "kh" ? "text-secondary" : "")}>ខ្មែរ</button>
            </div>
          </div>
        </div>
      </div>

      <div className="sticky top-0 z-40 w-full bg-[#1a3a6b] shadow-sm border-b border-white/10">
        <div className="container mx-auto px-4 md:px-8 flex items-center gap-3 md:gap-4 overflow-x-auto whitespace-nowrap no-scrollbar">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "shrink-0 px-4 md:px-5 py-3 text-[12px] md:text-[13px] font-semibold font-khmer transition-colors border-b-2",
                location === link.href
                  ? "text-white border-secondary bg-white/15 shadow-[inset_0_-2px_0_0_rgba(255,255,255,0.12)]"
                  : "text-white/85 border-transparent hover:text-white hover:border-secondary/60 hover:bg-white/5"
              )}
            >
              {lang === "kh" ? link.kh : link.en}
            </Link>
          ))}
          <div className="ml-auto flex items-center gap-2 shrink-0">
            <button onClick={() => setLang("en")} className={cn("text-xs font-medium transition-colors hover:text-secondary", lang === "en" ? "text-secondary" : "text-white/80")}>EN</button>
            <span className="text-white/30 text-xs">|</span>
            <button onClick={() => setLang("kh")} className={cn("text-xs font-khmer font-medium transition-colors hover:text-secondary", lang === "kh" ? "text-secondary" : "text-white/80")}>ខ្មែរ</button>
              <button
                className="md:hidden text-white p-2 flex items-center gap-2"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
              {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="md:hidden bg-[#0d2550] border-t border-white/10">
            <nav className="flex flex-col">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-3 text-sm font-semibold font-khmer transition-colors border-b border-white/10",
                    location === link.href ? "text-secondary bg-white/10 border-l-4 border-l-secondary" : "text-white/80 hover:text-white hover:bg-white/5"
                  )}
                >
                  {lang === "kh" ? link.kh : link.en}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </div>

      {/* ── Main Content ── */}
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {/* ── Footer ── */}
      <footer className="bg-[#0d2550] text-white pt-16 pb-8 border-t-[6px] border-secondary">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/school-logo.png" alt="School Logo" className="h-14 w-14 object-cover rounded-full border-2 border-secondary" />
              <div className="flex flex-col">
                <span className="font-bold text-xl font-khmer text-white leading-tight">
                  {t("Treng Secondary School", "វិទ្យាល័យត្រែង")}
                </span>
                <span className="text-secondary text-xs font-semibold uppercase tracking-wider">
                  Treng Secondary School
                </span>
              </div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed mb-6">
              {t(
                "Dedicated to providing quality education, fostering academic excellence, and developing the future leaders of Cambodia through integrity and knowledge.",
                "ប្តេជ្ញាផ្តល់ការអប់រំប្រកបដោយគុណភាព លើកកម្ពស់ឧត្តមភាពសិក្សា និងអភិវឌ្ឍអ្នកដឹកនាំនាពេលអនាគតរបស់កម្ពុជាតាមរយៈសុចរិតភាពនិងចំណេះដឹង។"
              )}
            </p>
            <div className="flex items-center gap-3">
              <a href="https://www.facebook.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Facebook size={16} />
              </a>
              <a href="https://www.youtube.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <Youtube size={16} />
              </a>
              <a href="https://www.tiktok.com" target="_blank" rel="noopener noreferrer"
                className="w-9 h-9 rounded-full bg-white/10 flex items-center justify-center hover:bg-secondary transition-colors">
                <SiTiktok size={14} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5 text-secondary uppercase tracking-widest border-b border-white/20 pb-2">
              {t("Quick Links", "តំណភ្ជាប់រហ័ស")}
            </h3>
            <ul className="space-y-2.5">
              {navLinks.slice(1).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/65 hover:text-secondary transition-colors flex items-center gap-2 text-sm">
                    <span className="text-secondary text-[10px]">▶</span>
                    {lang === "kh" ? link.kh : link.en}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-bold mb-5 text-secondary uppercase tracking-widest border-b border-white/20 pb-2">
              {t("Contact Us", "ទំនាក់ទំនង")}
            </h3>
            <ul className="space-y-4 text-white/70 text-sm">
              <li className="flex items-start gap-3">
                <MapPin className="text-secondary mt-0.5 shrink-0" size={16} />
                <span>{t("Treng District, Stung Treng Province, Cambodia", "ស្រុកត្រែង ខេត្តស្ទឹងត្រែង ប្រទេសកម្ពុជា")}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-secondary shrink-0" size={16} />
                <span>012 345 678</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-secondary shrink-0" size={16} />
                <span>trengsecondaryschool@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="container mx-auto px-4 md:px-8 border-t border-white/10 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-white/40 text-xs">
            &copy; {new Date().getFullYear()} {t("Treng Secondary School. All Rights Reserved.", "វិទ្យាល័យត្រែង. រក្សាសិទ្ធិគ្រប់យ៉ាង.")}
          </p>
          <div className="text-white/40 text-xs flex gap-4">
            <Link href="/privacy" className="hover:text-white transition-colors">{t("Privacy Policy", "គោលការណ៍ឯកជនភាព")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("Terms of Service", "លក្ខខណ្ឌប្រើប្រាស់")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
