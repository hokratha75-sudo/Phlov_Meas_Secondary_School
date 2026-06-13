import { type ReactNode, useEffect, useMemo, useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import {
  LayoutDashboard, Newspaper, Activity, GraduationCap, Users, Mail, LogOut, Menu, School, Settings, FileText, ClipboardList, Award, BookOpen, Languages, ChevronDown, Calendar, Book, Bell, Search, Moon, Sun, Palette
} from "lucide-react";

type Lang = "en" | "km";

const navItems = [
  { href: "/", icon: LayoutDashboard, en: "Dashboard", km: "ផ្ទាំងគ្រប់គ្រង", roles: ["admin", "teacher"] },
  { href: "/news", icon: Newspaper, en: "News", km: "ព័ត៌មាន", roles: ["admin"] },
  { href: "/activities", icon: Activity, en: "Activities", km: "សកម្មភាព", roles: ["admin"] },
  { href: "/teachers", icon: GraduationCap, en: "Teachers", km: "គ្រូបង្រៀន", roles: ["admin"] },
  { href: "/classrooms", icon: School, en: "Classrooms", km: "ថ្នាក់រៀន", roles: ["admin"] },
  { href: "/schedule/master", icon: Calendar, en: "Master Timetable", km: "កាលវិភាគរួម", roles: ["admin"] },
  { href: "/schedule/teacher-load", icon: Users, en: "Teacher Load", km: "ម៉ោងបង្រៀនគ្រូ", roles: ["admin"] },
  { href: "/students", icon: Users, en: "Students", km: "សិស្សានុសិស្ស", roles: ["admin", "teacher"] },
  { href: "/contacts", icon: Mail, en: "Messages", km: "សារទំនាក់ទំនង", roles: ["admin"] },
  { href: "/my-profile", icon: GraduationCap, en: "My Profile", km: "ប្រវត្តិរូបរបស់ខ្ញុំ", roles: ["teacher"] },
  { href: "/documents", icon: FileText, en: "School Documents", km: "ឯកសារសាលារៀន", roles: ["admin", "teacher"] },

  { 
    href: "/administrative", 
    icon: ClipboardList, 
    en: "Admin Work", 
    km: "ការងាររដ្ឋបាល",
    roles: ["admin", "teacher"],
    subItems: [
      { href: "/administrative/attendance", icon: Calendar, en: "Attendance List", km: "បញ្ជីវត្តមាន", roles: ["admin", "teacher"] },
      { href: "/administrative/grades", icon: Award, en: "Grades Management", km: "កម្មវិធីគ្រប់គ្រងពិន្ទុ", roles: ["admin", "teacher"] },

      { href: "/administrative/gradebook", icon: BookOpen, en: "Grade Book", km: "សៀវភៅសិក្ខាគារិកមធ្យមសិក្សា", roles: ["admin", "teacher"] },
      { href: "/administrative/library", icon: Book, en: "Library Log", km: "បញ្ជីខ្ចី-សងសៀវភៅ", roles: ["admin"] },
      { href: "/administrative/cleaning", icon: Calendar, en: "Cleaning Schedule", km: "បញ្ជីវេនសម្អាត", roles: ["admin", "teacher"] },
      { href: "/reports", icon: FileText, en: "Reports", km: "របាយការណ៍", roles: ["admin", "teacher"] },
      { href: "/leave-requests", icon: Bell, en: "Leave Requests", km: "ពាក្យសុំច្បាប់", roles: ["admin", "teacher"], badge: true },
      { href: "/administrative/id-cards", icon: FileText, en: "ID Card Studio", km: "បង្កើតកាតសិស្ស", roles: ["admin", "teacher"] },
    ]
  },
  { 
    href: "/settings", 
    icon: Settings, 
    en: "Site Settings", 
    km: "ការកំណត់គេហទំព័រ", 
    roles: ["admin"],
    subItems: [
      { href: "/settings", icon: Settings, en: "General Settings", km: "ការកំណត់ទូទៅ", roles: ["admin"] },
      { href: "/settings/grading-standards", icon: Award, en: "Grading Standards", km: "កំណត់ស្ដង់ដារពិន្ទុ", roles: ["admin"] },
      { href: "/settings/subjects", icon: BookOpen, en: "Manage Subjects", km: "គ្រប់គ្រងមុខវិជ្ជា", roles: ["admin"] },
    ]
  },
];

import { useTranslation } from "@/lib/i18n";

export default function AdminLayout({ children }: { children: ReactNode }) {
  const { user, logout, token } = useAuth();
  const { lang, setLang, t } = useTranslation();
  const [location, navigate] = useLocation();
  const [open, setOpen] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState<Record<string, boolean>>({});
  const [pendingLeaveCount, setPendingLeaveCount] = useState(0);
  const [unreadContactsCount, setUnreadContactsCount] = useState(0);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);

  // Theme Preset State
  const [themePreset, setThemePreset] = useState(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("app-theme-preset") || "royal";
    }
    return "royal";
  });
  const [showThemePicker, setShowThemePicker] = useState(false);

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", themePreset);
    localStorage.setItem("app-theme-preset", themePreset);
    
    const metaThemeColor = document.getElementById("theme-color-meta");
    if (metaThemeColor) {
      const colors: Record<string, string> = {
        royal: "#1e3a6e",
        emerald: "#08573b",
        violet: "#5b39ad",
        rose: "#ad1f4a",
        slate: "#364152"
      };
      metaThemeColor.setAttribute("content", colors[themePreset] || "#1e3a6e");
    }
  }, [themePreset]);

  // Dark Mode State
  const [isDarkMode, setIsDarkMode] = useState(() => {
    if (typeof window !== "undefined") {
      return document.documentElement.classList.contains("dark") || localStorage.getItem("theme") === "dark";
    }
    return false;
  });

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  }, [isDarkMode]);

  // Fetch notification counts
  useEffect(() => {
    if (!user) return;
    const fetchPending = async () => {
      try {
        const baseUrl = import.meta.env.DEV ? "" : (import.meta.env.VITE_API_BASE_URL || 'http://localhost:8080');
        
        const [leaveRes, contactRes] = await Promise.all([
          fetch(`${baseUrl}/api/leave-requests-pending-count`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include"
          }),
          fetch(`${baseUrl}/api/contacts/unread-count`, {
            headers: { Authorization: `Bearer ${token}` },
            credentials: "include"
          })
        ]);

        if (leaveRes.ok) {
          const data = await leaveRes.json();
          setPendingLeaveCount(data.count ?? 0);
        }
        if (contactRes.ok) {
          const data = await contactRes.json();
          setUnreadContactsCount(data.count ?? 0);
        }
      } catch { /* silent */ }
    };
    fetchPending();
    // Refresh every 60s
    const interval = setInterval(fetchPending, 60000);
    return () => clearInterval(interval);
  }, [user, token]);

  useEffect(() => {
    // Auto-expand menu if active route is inside it
    navItems.forEach(item => {
      if (item.subItems && location.startsWith(item.href)) {
        setExpandedMenus(prev => ({ ...prev, [item.href]: true }));
      }
    });
  }, [location]);

  const toggleMenu = (href: string) => {
    setExpandedMenus(prev => ({ ...prev, [href]: !prev[href] }));
  };

  const labels = {
    signOut: t("signOut"),
    admin: t("admin"),
    language: t("language"),
    viewWebsite: t("viewWebsite"),
    dashboard: t("dashboard"),
    schoolName: t("schoolName"),
    adminPortal: t("adminPortal"),
  };

  const localizedNav = useMemo(() => {
    const userRole = user?.role || "admin"; // Default to admin for legacy sessions
    return navItems
      .filter(item => !item.roles || item.roles.includes(userRole))
      .map(item => ({ 
        ...item, 
        label: lang === "km" ? item.km : item.en,
        subItems: item.subItems?.filter((sub: any) => !sub.roles || sub.roles.includes(userRole))
      }));
  }, [lang, user]);

  return (
    <div className="flex h-screen bg-gray-100 dark:bg-gray-900 overflow-hidden text-gray-900 dark:text-gray-100">
      {/* Sidebar */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 w-64 bg-primary text-white flex flex-col transition-transform duration-300
        lg:relative lg:translate-x-0
        ${open ? "translate-x-0" : "-translate-x-full"}
      `}>
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center shrink-0 overflow-hidden border-2 border-white/20 shadow-inner dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <img src="/logosala.png" alt="Logo" className="w-full h-full object-contain p-1" />
          </div>
          <div className="min-w-0">
            <p className="font-normal text-blue-300 text-sm leading-tight truncate">{labels.schoolName}</p>
            <p className="text-white/60 text-xs uppercase tracking-tighter">{labels.adminPortal}</p>
          </div>
        </div>

        <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
          {localizedNav.map((item) => {
            const hasSub = !!item.subItems;
            const isExpanded = expandedMenus[item.href];
            const active = item.href === "/" ? location === "/" : location.startsWith(item.href);
            
            return (
              <div key={item.href}>
                {hasSub ? (
                  <button
                    onClick={() => toggleMenu(item.href)}
                    className={`w-full flex items-center justify-between px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active && !isExpanded ? "bg-white/10 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <item.icon size={18} />
                      {item.label}
                    </div>
                    <ChevronDown size={16} className={`transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    onClick={() => setOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                      active ? "bg-white/20 text-white" : "text-white/70 hover:bg-white/10 hover:text-white"
                    }`}
                  >
                    <item.icon size={18} />
                    {item.label}
                  </Link>
                )}

                {/* Sub Items */}
                {hasSub && isExpanded && (
                  <div className="mt-1 mb-2 pl-4 space-y-1 border-l-2 border-white/10 ml-6">
                    {item.subItems?.map((sub: any) => {
                      const subActive = location === sub.href;
                      const subLabel = lang === "km" ? sub.km : sub.en;
                      const SubIcon = sub.icon;
                      
                      return (
                        <Link
                          key={sub.href}
                          href={sub.href}
                          onClick={() => setOpen(false)}
                          className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm transition-colors ${
                            subActive ? "bg-white/20 text-white font-medium shadow-sm" : "text-white/60 hover:bg-white/10 hover:text-white"
                          }`}
                        >
                          <SubIcon size={16} className={subActive ? "text-blue-300" : ""} />
                          <span className="flex-1">{subLabel}</span>
                          {sub.badge && pendingLeaveCount > 0 && (
                            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-bold">
                              {pendingLeaveCount > 9 ? "9+" : pendingLeaveCount}
                            </span>
                          )}
                        </Link>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </nav>

        <div className="px-4 py-4 border-t border-white/10">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-sm font-bold dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
              {user?.username?.[0]?.toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold truncate">{user?.username}</p>
              <p className="text-white/50 text-xs">{user?.role === "teacher" ? t("teacher") : t("admin")}</p>
            </div>
          </div>
          <button
            onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2 rounded-lg text-white/70 hover:bg-white/10 hover:text-white text-sm transition-colors dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
          >
            <LogOut size={16} />
            {labels.signOut}
          </button>
        </div>
      </aside>

      {/* Overlay */}
      {open && <div className="fixed inset-0 z-40 bg-black/40 lg:hidden" onClick={() => setOpen(false)} />}

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white dark:bg-[#1e293b] border-b dark:border-gray-800 px-4 lg:px-6 py-3 flex items-center justify-between shrink-0 gap-4 z-10 relative dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <div className="flex items-center gap-4">
            <button className="lg:hidden text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white" onClick={() => setOpen(true)}>
              <Menu size={22} />
            </button>
            <h1 className="text-xl font-bold text-primary dark:text-blue-400 capitalize truncate hidden sm:block">
              {localizedNav.find(n => n.href === "/" ? location === "/" : location.startsWith(n.href))?.label ?? labels.dashboard}
            </h1>
          </div>

          <div className="flex-1 max-w-md hidden md:flex items-center justify-center w-full">
            <div className="relative w-full max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500" size={18} />
              <input 
                type="text" 
                placeholder={lang === "km" ? "ស្វែងរក..." : "Search..."} 
                className="w-full bg-gray-100 dark:bg-gray-800 dark:text-gray-100 border border-transparent focus:bg-white dark:focus:bg-gray-900 focus:border-primary dark:focus:border-blue-500 focus:ring-2 focus:ring-primary/20 dark:focus:ring-blue-500/20 rounded-lg pl-10 pr-4 py-2 text-sm transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3 text-sm shrink-0">
            <div className="hidden xl:flex items-center gap-2 border-r border-gray-200 dark:border-gray-700 pr-3 mr-1">
              <button
                onClick={() => setLang(lang === "en" ? "km" : "en")}
                className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors font-medium dark:bg-gray-900/50"
              >
                <Languages size={16} />
                {lang === "en" ? "EN" : "ខ្មែរ"}
              </button>
              <a href={import.meta.env.VITE_WEBSITE_URL || "http://localhost:3000"} target="_blank" className="text-primary dark:text-blue-400 font-semibold hover:bg-blue-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition-colors border border-transparent">{labels.viewWebsite}</a>
            </div>

            <div className="relative">
              <button 
                onClick={() => setShowThemePicker(!showThemePicker)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative" 
                title={lang === "km" ? "ពណ៌នៃរូបរាង" : "Theme Color"}
              >
                <Palette size={20} />
              </button>

              {showThemePicker && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowThemePicker(false)} />
                  <div className="absolute right-0 mt-2 p-3 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 z-50 animate-in fade-in slide-in-from-top-2 w-48">
                    <h3 className="text-xs font-bold text-gray-500 mb-3 px-1 uppercase tracking-wider">{lang === "km" ? "ជ្រើសរើសពណ៌" : "Select Color"}</h3>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { id: 'royal', color: 'bg-blue-800' },
                        { id: 'emerald', color: 'bg-emerald-700' },
                        { id: 'violet', color: 'bg-violet-700' },
                        { id: 'rose', color: 'bg-rose-700' },
                        { id: 'slate', color: 'bg-slate-700' }
                      ].map(theme => (
                        <button
                          key={theme.id}
                          onClick={() => {
                            setThemePreset(theme.id);
                            setShowThemePicker(false);
                          }}
                          className={`w-8 h-8 rounded-full ${theme.color} transition-transform hover:scale-110 flex items-center justify-center ${themePreset === theme.id ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-gray-800 ring-primary' : ''}`}
                          title={theme.id}
                        />
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            <button 
              onClick={() => setIsDarkMode(!isDarkMode)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative" 
              title={lang === "km" ? "ប្ដូររូបរាងងងឹត" : "Toggle Dark Mode"}
            >
              {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
            </button>

            <div className="relative">
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-primary dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors relative" 
                title={lang === "km" ? "សេចក្ដីជូនដំណឹង" : "Notifications"}
              >
                <Bell size={20} />
                {/* Notification Badge */}
                {(pendingLeaveCount + unreadContactsCount) > 0 && (
                  <span className="absolute top-1 right-1 w-3 h-3 flex items-center justify-center bg-red-500 rounded-full border border-white text-white text-[9px] font-bold">
                    {(pendingLeaveCount + unreadContactsCount) > 9 ? '9+' : (pendingLeaveCount + unreadContactsCount)}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setShowNotifications(false)} />
                  <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-100 dark:border-gray-700 overflow-hidden z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="p-3 border-b border-gray-100 dark:border-gray-700 bg-gray-50 dark:bg-gray-900/50">
                      <h3 className="font-bold text-sm text-gray-800 dark:text-gray-200">{lang === "km" ? "ការជូនដំណឹង" : "Notifications"}</h3>
                    </div>
                    <div className="max-h-64 overflow-y-auto">
                      {pendingLeaveCount > 0 && (
                        <button onClick={() => { setShowNotifications(false); navigate("/leave-requests"); }} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start gap-3 border-b border-gray-50 dark:border-gray-700 transition-colors dark:bg-gray-900/50">
                          <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                            <Bell size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">ពាក្យសុំច្បាប់</p>
                            <p className="text-xs text-gray-500 mt-0.5">អ្នកមាន {pendingLeaveCount} ពាក្យសុំច្បាប់ថ្មីកំពុងរង់ចាំការអនុម័ត។</p>
                          </div>
                        </button>
                      )}
                      {unreadContactsCount > 0 && (
                        <button onClick={() => { setShowNotifications(false); navigate("/contacts"); }} className="w-full text-left p-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 flex items-start gap-3 border-b border-gray-50 dark:border-gray-700 transition-colors dark:bg-gray-900/50">
                          <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
                            <Mail size={16} />
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">សារទំនាក់ទំនង</p>
                            <p className="text-xs text-gray-500 mt-0.5">អ្នកមាន {unreadContactsCount} សារថ្មីមកពីគេហទំព័រសាលា។</p>
                          </div>
                        </button>
                      )}
                      {(pendingLeaveCount + unreadContactsCount) === 0 && (
                        <div className="p-6 text-center text-sm text-gray-500 flex flex-col items-center gap-2">
                          <Bell size={24} className="text-gray-300" />
                          {lang === "km" ? "មិនមានការជូនដំណឹងទេ" : "No notifications"}
                        </div>
                      )}
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="relative">
              <div 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 pl-1 sm:pl-2 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 p-1.5 rounded-lg transition-colors dark:bg-gray-900/50"
              >
                <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm shadow-sm border border-transparent dark:border-gray-600">
                   {user?.username?.[0]?.toUpperCase() || 'A'}
                </div>
                <div className="hidden lg:block text-left min-w-[80px]">
                  <p className="text-sm font-semibold text-gray-700 dark:text-gray-200 leading-tight truncate">{user?.username || 'Admin'}</p>
                  <p className="text-[11px] text-gray-500 dark:text-gray-400 capitalize">{user?.role === "teacher" ? (lang === "km" ? "គ្រូបង្រៀន" : "Teacher") : (lang === "km" ? "រដ្ឋបាល" : "Admin")}</p>
                </div>
                <ChevronDown size={14} className={`text-gray-400 dark:text-gray-500 hidden lg:block transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </div>

              {isProfileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsProfileOpen(false)}></div>
                  <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-xl shadow-lg z-50 overflow-hidden py-1">
                    <Link href="/my-profile" onClick={() => setIsProfileOpen(false)}>
                      <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:bg-gray-900/50">
                        <GraduationCap size={16} />
                        {lang === "km" ? "ប្រវត្តិរូបរបស់ខ្ញុំ" : "My Profile"}
                      </div>
                    </Link>
                    {user?.role === "admin" && (
                      <Link href="/settings" onClick={() => setIsProfileOpen(false)}>
                        <div className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer dark:bg-gray-900/50">
                          <Settings size={16} />
                          {lang === "km" ? "ការកំណត់" : "Settings"}
                        </div>
                      </Link>
                    )}
                    <div className="h-px bg-gray-100 dark:bg-gray-700 my-1"></div>
                    <button 
                      onClick={() => {
                        setIsProfileOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 cursor-pointer text-left font-medium"
                    >
                      <LogOut size={16} />
                      {lang === "km" ? "ចាកចេញ" : "Log Out"}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 lg:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
