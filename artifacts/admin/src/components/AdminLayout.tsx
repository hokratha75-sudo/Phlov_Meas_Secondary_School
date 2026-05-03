import { type ReactNode, useEffect, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Newspaper, Activity, GraduationCap, Users, Mail, LogOut, Menu, School, Settings, FileText, ClipboardList, Award, BookOpen, Languages
} from "lucide-react";

type Lang = "en" | "km";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/news", icon: Newspaper, label: "News" },
  { href: "/activities", icon: Activity, label: "Activities" },
  { href: "/teachers", icon: GraduationCap, label: "Teachers" },
  { href: "/students", icon: Users, label: "Students" },
  { href: "/contacts", icon: Mail, label: "Messages" },
  { href: "/results", icon: Award, label: "Results" },
  { href: "/standards", icon: BookOpen, label: "Bac II Standards" },
  { href: "/admin-work", icon: ClipboardList, label: "Admin Work" },
  { href: "/reports", icon: FileText, label: "Reports" },
  { href: "/settings", icon: Settings, label: "Site Settings" },
];

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout } = useAuth();
  const [location] = useLocation();
  const [open, setOpen] = useState(false);
  const [lang, setLang] = useState<Lang>(() => (localStorage.getItem("admin-lang") as Lang) || "en");

  useEffect(() => {
    localStorage.setItem("admin-lang", lang);
  }, [lang]);

  const t = {
    dashboard: lang === "km" ? "ផ្ទាំងគ្រប់គ្រង" : "Dashboard",
    viewWebsite: lang === "km" ? "មើលគេហទំព័រ" : "View Website",
    signOut: lang === "km" ? "ចាកចេញ" : "Sign Out",
    admin: lang === "km" ? "អ្នកគ្រប់គ្រង" : "Administrator",
  };

  return (
    <div className="flex h-screen bg-gray-100 overflow-hidden">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-[#1e3a6e] text-white flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center shrink-0">
            <School size={20} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-bold text-sm leading-tight truncate">អនុវិទ្យាល័យត្រែង</p>
            <p className="text-white/60 text-xs">Admin Panel</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {navItems.map(({ href, icon: Icon, label }) => {
            const active = href === "/" ? location === "/" : location.startsWith(href);
            return (
              <Link key={href} href={href}>
                <a
                  onClick={() => setOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                    active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </a>
              </Link>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-white/50 text-xs">{t.admin}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-sm transition-colors"
          >
            <LogOut size={16} />
            {t.signOut}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white border-b px-4 lg:px-6 py-4 flex items-center gap-4 shrink-0">
          <button className="lg:hidden text-gray-600 hover:text-gray-900" onClick={() => setOpen(true)}>
            <Menu size={22} />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <h1 className="font-bold text-gray-800 text-lg capitalize truncate">
              {navItems.find(n => n.href === "/" ? location === "/" : location.startsWith(n.href))?.label ?? t.dashboard}
            </h1>
          </div>
          <div className="ml-auto flex items-center gap-2 text-sm text-gray-500 shrink-0">
            <button
              onClick={() => setLang(lang === "en" ? "km" : "en")}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-gray-700 hover:bg-gray-50"
            >
              <Languages size={14} />
              {lang === "en" ? "KH" : "EN"}
            </button>
            <a href="/" target="_blank" className="text-[#1e3a6e] font-semibold hover:underline">{t.viewWebsite}</a>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
