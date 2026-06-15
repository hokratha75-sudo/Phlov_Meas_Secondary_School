import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";

export default function Login() {
  const { login } = useAuth();
  const { t } = useTranslation();
  const [, setLocation] = useLocation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      await login(username, password);
      setLocation("/");
    } catch (err: any) {
      const errorMessage = err.response?.data?.error || err.response?.data?.message || err.message || "Invalid credentials";
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative flex items-center justify-center p-4 bg-primary overflow-hidden">
      {/* Kbach Watermark Background */}
      <div className="absolute inset-0 z-0 opacity-[0.08] pointer-events-none flex items-center justify-center">
        <img 
          src="/kbach-01.png" 
          alt="" 
          className="w-[800px] h-[800px] max-w-none object-contain filter invert"
        />
      </div>
      {/* Corner Kbach Motifs */}
      <div className="absolute -top-32 -left-32 z-0 opacity-10 pointer-events-none">
        <img src="/kbach-01.png" alt="" className="w-96 h-96 object-contain filter invert" />
      </div>
      <div className="absolute -bottom-32 -right-32 z-0 opacity-10 pointer-events-none transform rotate-180">
        <img src="/kbach-01.png" alt="" className="w-96 h-96 object-contain filter invert" />
      </div>
      
      {/* Dark gradient overlay to give it depth */}
      <div className="absolute inset-0 z-0 pointer-events-none bg-gradient-to-br from-transparent to-black/30" />

      {/* Login Card */}
      <div className="relative z-10 bg-white rounded-xl shadow-2xl w-full max-w-md overflow-hidden dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
        <div className="bg-primary px-8 py-8 text-center">
          <img src="/logosala.png" alt="Logo" className="h-20 w-20 rounded-full object-contain mx-auto mb-4 border-4 border-white/30 bg-white p-1 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100" />
          <h1 className="text-white text-xl leading-tight">{t("schoolName")}</h1>
          <p className="text-white/70 text-sm mt-1">{t("adminPortal")}</p>
        </div>
        <div className="px-8 py-8">
          <h2 className="text-2xl text-primary mb-6 text-center">{t("signIn")}</h2>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 mb-4 text-sm">
              {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("username")}</label>
              <input
                type="text"
                value={username}
                onChange={e => setUsername(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t("username")}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">{t("password")}</label>
              <input
                type="password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
                placeholder={t("password")}
                required
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-primary text-white font-bold py-3 rounded-lg hover:opacity-90 transition-colors disabled:opacity-60 mt-2"
            >
              {loading ? t("signingIn") : t("signIn")}
            </button>
          </form>
          <p className="text-center text-xs text-gray-400 mt-6">
            Treng Secondary School — Admin Portal
          </p>
        </div>
      </div>
    </div>
  );
}
