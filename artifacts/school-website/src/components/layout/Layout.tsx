import { Link, useLocation } from "wouter";
import { useI18n } from "@/lib/i18n";
import { Phone, Mail, MapPin, Facebook, Menu, X, Youtube } from "lucide-react";
import { SiTiktok } from "react-icons/si";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

export function Layout({ children }: { children: React.ReactNode }) {
  const { lang, setLang, t } = useI18n();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [location] = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { href: "/", en: "Home", kh: "ទំព័រដើម" },
    { href: "/about", en: "About", kh: "អំពីយើង" },
    { href: "/academics", en: "Academics", kh: "ការសិក្សា" },
    { href: "/activities", en: "Activities", kh: "សកម្មភាព" },
    { href: "/news", en: "News", kh: "ព័ត៌មាន" },
    { href: "/contact", en: "Contact", kh: "ទំនាក់ទំនង" },
  ];

  return (
    <div className={`min-h-screen flex flex-col ${lang === 'kh' ? 'font-khmer' : 'font-sans'}`}>
      {/* Top Info Bar */}
      <div className="bg-primary text-white text-sm py-2 px-4 md:px-8 flex justify-between items-center z-50 relative">
        <div className="hidden md:flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <Phone size={14} />
            <span>096 944 7122</span>
          </div>
          <div className="flex items-center space-x-2">
            <Mail size={14} />
            <span>vmc.sdaosantepheap@gmail.com</span>
          </div>
        </div>
        <div className="flex items-center space-x-4 ml-auto">
          <a href="https://www.facebook.com/highschool2k15" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors" aria-label="Facebook">
            <Facebook size={16} />
          </a>
          <a href="https://www.youtube.com/@SdaoSantepheap" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors" aria-label="YouTube">
            <Youtube size={16} />
          </a>
          <a href="https://www.tiktok.com/@user3802703881381" target="_blank" rel="noopener noreferrer" className="hover:text-secondary transition-colors" aria-label="TikTok">
            <SiTiktok size={14} />
          </a>
          <div className="h-4 w-px bg-white/30"></div>
          <div className="flex items-center space-x-2">
            <button 
              onClick={() => setLang('en')} 
              className={cn("hover:text-secondary font-medium transition-colors", lang === 'en' ? 'text-secondary' : '')}
            >
              EN
            </button>
            <span className="text-white/50">|</span>
            <button 
              onClick={() => setLang('kh')} 
              className={cn("hover:text-secondary font-khmer font-medium transition-colors", lang === 'kh' ? 'text-secondary' : '')}
            >
              ខ្មែរ
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Navbar */}
      <header 
        className={cn(
          "sticky top-0 z-40 w-full transition-all duration-300 border-b",
          isScrolled ? "bg-white/95 backdrop-blur-md shadow-sm py-2" : "bg-white py-4"
        )}
      >
        <div className="container mx-auto px-4 md:px-8 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <img src="/school-logo.png" alt="School Logo" className="h-12 w-12 md:h-16 md:w-16 object-cover rounded-full" />
            <div className="flex flex-col">
              <span className="text-primary font-bold text-lg md:text-xl font-khmer leading-tight">
                អនុវិទ្យាល័យត្រែង
              </span>
              <span className="text-muted-foreground text-xs md:text-sm font-semibold uppercase tracking-wider">
                Treng Junior High School
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.href} 
                href={link.href}
                className={cn(
                  "font-semibold text-[15px] transition-colors relative py-2 hover:text-secondary",
                  location === link.href ? "text-secondary" : "text-primary"
                )}
              >
                {t(link.en, link.kh)}
                {location === link.href && (
                  <span className="absolute bottom-0 left-0 w-full h-0.5 bg-secondary rounded-full" />
                )}
              </Link>
            ))}
          </nav>

          {/* Mobile Menu Toggle */}
          <button 
            className="md:hidden text-primary p-2"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden absolute top-full left-0 w-full bg-white shadow-lg border-b animate-in slide-in-from-top-2">
            <nav className="flex flex-col p-4">
              {navLinks.map((link) => (
                <Link 
                  key={link.href} 
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "font-semibold py-3 border-b border-gray-100 transition-colors",
                    location === link.href ? "text-secondary" : "text-primary"
                  )}
                >
                  {t(link.en, link.kh)}
                </Link>
              ))}
            </nav>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 flex flex-col w-full">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-primary text-white pt-16 pb-8 border-t-[6px] border-secondary">
        <div className="container mx-auto px-4 md:px-8 grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/school-logo.png" alt="School Logo" className="h-14 w-14 object-cover rounded-full" />
              <div className="flex flex-col">
                <span className="font-bold text-xl font-khmer text-white leading-tight">
                  អនុវិទ្យាល័យត្រែង
                </span>
                <span className="text-white/80 text-sm font-semibold uppercase tracking-wider">
                  Treng Junior High School
                </span>
              </div>
            </div>
            <p className="text-white/70 max-w-md leading-relaxed mb-6">
              {t(
                "Dedicated to providing quality education, fostering academic excellence, and developing the future leaders of Cambodia through integrity and knowledge.",
                "ប្តេជ្ញាផ្តល់ការអប់រំប្រកបដោយគុណភាព លើកកម្ពស់ឧត្តមភាពសិក្សា និងអភិវឌ្ឍអ្នកដឹកនាំនាពេលអនាគតរបស់កម្ពុជាតាមរយៈសុចរិតភាពនិងចំណេះដឹង។"
              )}
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-bold mb-6 text-white border-b border-white/20 pb-2 inline-block">
              {t("Quick Links", "តំណភ្ជាប់រហ័ស")}
            </h3>
            <ul className="space-y-3">
              {navLinks.slice(1).map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="text-white/70 hover:text-secondary transition-colors flex items-center gap-2">
                    <span className="text-secondary text-xs">▶</span> {t(link.en, link.kh)}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-6 text-white border-b border-white/20 pb-2 inline-block">
              {t("Contact Us", "ទំនាក់ទំនង")}
            </h3>
            <ul className="space-y-4 text-white/70">
              <li className="flex items-start gap-3">
                <MapPin className="text-secondary mt-1 shrink-0" size={18} />
                <span>
                  {t(
                    "Sdau Commune, Rotanak Mondol District, Battambang, Cambodia",
                    "ឃុំស្ដៅ ស្រុករតនៈមណ្ឌល ខេត្តបាត់ដំបង ប្រទេសកម្ពុជា"
                  )}
                </span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="text-secondary shrink-0" size={18} />
                <span>096 944 7122</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="text-secondary shrink-0" size={18} />
                <span>vmc.sdaosantepheap@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="container mx-auto px-4 md:px-8 border-t border-white/10 pt-6 text-center md:flex md:justify-between md:text-left">
          <p className="text-white/50 text-sm">
            &copy; {new Date().getFullYear()} {t("Treng Junior High School. All Rights Reserved.", "អនុវិទ្យាល័យត្រែង. រក្សាសិទ្ធិគ្រប់យ៉ាង.")}
          </p>
          <div className="text-white/50 text-sm mt-2 md:mt-0 flex gap-4 justify-center">
            <Link href="/privacy" className="hover:text-white transition-colors">{t("Privacy Policy", "គោលការណ៍ឯកជនភាព")}</Link>
            <Link href="/terms" className="hover:text-white transition-colors">{t("Terms of Service", "លក្ខខណ្ឌប្រើប្រាស់")}</Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
