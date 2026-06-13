import { useState, useEffect } from "react";
import { Download, X, Smartphone } from "lucide-react";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt(): Promise<void>;
}

export default function PWAInstallBanner() {
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already installed as PWA
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Check if user dismissed banner before
    const isDismissed = localStorage.getItem("pwa-banner-dismissed") === "true";
    if (isDismissed) {
      setDismissed(true);
      return;
    }

    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstall);

    // Also listen for when the app is installed
    window.addEventListener("appinstalled", () => {
      setIsInstalled(true);
      setShowBanner(false);
      setInstallPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
    };
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === "accepted") {
      setShowBanner(false);
      setInstallPrompt(null);
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    localStorage.setItem("pwa-banner-dismissed", "true");
    setDismissed(true);
  };

  if (!showBanner || isInstalled || dismissed) return null;

  return (
    <div
      className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:w-[420px] z-[9999]
        bg-primary text-white rounded-2xl shadow-2xl shadow-blue-900/40
        border border-white/10 backdrop-blur-md
        animate-in slide-in-from-bottom-5 fade-in duration-500"
    >
      <div className="flex items-start gap-4 p-4">
        <div className="flex-shrink-0 w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center border border-white/20 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
          <Smartphone size={24} className="text-blue-200" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-sm">ដំឡើងកម្មវិធី</p>
          <p className="text-blue-200 text-xs mt-0.5 leading-relaxed">
            ដំឡើង <span className="font-bold text-white">ផ្លូវមាស</span> ជា App លើទូរសព្ទ ឬ Desktop
            ដើម្បីប្រើប្រាស់ដោយងាយ ដូចជា Application ពិតប្រាកដ!
          </p>
          <div className="flex items-center gap-2 mt-3">
            <button
              onClick={handleInstall}
              className="flex items-center gap-2 bg-white text-primary px-4 py-2 rounded-xl text-xs font-bold transition-all hover:bg-blue-50 active:scale-95 shadow-sm dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
            >
              <Download size={14} />
              ដំឡើងឥឡូវ
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-300 hover:text-white text-xs font-medium transition-colors px-2 py-2"
            >
              ពេលក្រោយ
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="flex-shrink-0 text-blue-300 hover:text-white transition-colors p-1 rounded-lg hover:bg-white/10 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100"
        >
          <X size={16} />
        </button>
      </div>
    </div>
  );
}
