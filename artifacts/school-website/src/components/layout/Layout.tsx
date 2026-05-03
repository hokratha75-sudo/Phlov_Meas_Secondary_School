import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { MapPin, Phone, Mail, Facebook, Youtube } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const [location] = useLocation();

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
