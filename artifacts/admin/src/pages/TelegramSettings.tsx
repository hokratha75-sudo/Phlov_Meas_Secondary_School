import { useState, useEffect, useCallback } from "react";
import { useAuth } from "@/lib/auth";
import { useTranslation } from "@/lib/i18n";
import api, { resolveUrl } from "@/lib/axiosConfig";
import {
  Bot, Send, Link2, Unlink, RefreshCw, CheckCircle, XCircle, MessageSquare, Users, Hash, Copy, ExternalLink, Loader2, Search
} from "lucide-react";

// ─── Types ─────────────────────────────────────────────────────────────────
interface BotInfo {
  id: number;
  name: string;
  username: string;
  isActive: boolean;
}

interface ChannelInfo {
  id: string | undefined;
  name: string;
}

interface TelegramStatus {
  bot: BotInfo;
  channels: {
    main: ChannelInfo;
    teachers: ChannelInfo;
    students: ChannelInfo;
    parents: ChannelInfo;
    botConfigured: boolean;
  };
  stats: {
    linkedTeachers: number;
    totalTeachers: number;
    messagesSent24h: number;
    totalMessagesSent: number;
  };
}

interface LinkedTeacher {
  id: number;
  nameKh: string;
  nameEn: string;
  position: string;
  subjectKh: string;
  telegramChatId: number;
  telegramLinkedAt: string;
  photoUrl: string | null;
}

interface MessageLog {
  id: number;
  channelId: string;
  messageText: string;
  messageType: string;
  status: string;
  errorMessage: string | null;
  sentAt: string;
}

export default function TelegramSettings() {
  const { token } = useAuth();
  const { lang } = useTranslation();

  const [status, setStatus] = useState<TelegramStatus | null>(null);
  const [linkedTeachers, setLinkedTeachers] = useState<LinkedTeacher[]>([]);
  const [messageLogs, setMessageLogs] = useState<MessageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"overview" | "teachers" | "logs">("overview");
  const [testMessage, setTestMessage] = useState("");
  const [testChannelId, setTestChannelId] = useState("");
  const [sending, setSending] = useState(false);
  const [linkCode, setLinkCode] = useState<{ code: string; teacherName: string; instructions: string } | null>(null);
  const [copiedCode, setCopiedCode] = useState(false);

  const headers = { Authorization: `Bearer ${token}` };

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [statusRes, teachersRes, logsRes] = await Promise.all([
        api.get("/telegram/status", { headers }),
        api.get("/telegram/linked-teachers", { headers }),
        api.get("/telegram/message-log?limit=30", { headers }),
      ]);
      setStatus(statusRes.data);
      setLinkedTeachers(teachersRes.data.data || []);
      setMessageLogs(logsRes.data.data || []);
    } catch (err) {
      console.error("Failed to load Telegram data:", err);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSendTest = async () => {
    if (!testChannelId || !testMessage) return;
    setSending(true);
    try {
      await api.post("/telegram/send-test", { channelId: testChannelId, message: testMessage }, { headers });
      setTestMessage("");
      fetchData();
    } catch (err) {
      console.error("Test message failed:", err);
    } finally {
      setSending(false);
    }
  };

  const handleGenerateCode = async (teacherId: number) => {
    try {
      const res = await api.post(`/telegram/generate-link-code/${teacherId}`, {}, { headers });
      setLinkCode(res.data);
    } catch (err: any) {
      console.error("Generate link code failed:", err);
      alert(err.response?.data?.error || "Failed to generate code");
    }
  };

  const handleUnlink = async (teacherId: number) => {
    if (!window.confirm(lang === "km" ? "តើអ្នកពិតជាចង់ផ្ដាច់គណនី Telegram នេះមែនទេ?" : "Are you sure you want to unlink this teacher?")) return;
    try {
      await api.post(`/telegram/unlink/${teacherId}`, {}, { headers });
      fetchData();
    } catch (err) {
      console.error("Unlink failed:", err);
    }
  };

  const copyCode = () => {
    if (linkCode) {
      navigator.clipboard.writeText(`/link ${linkCode.code}`);
      setCopiedCode(true);
      setTimeout(() => setCopiedCode(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="animate-spin text-blue-600" size={32} />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-primary dark:text-blue-400 flex items-center gap-2">
            <Bot size={24} />
            {lang === "km" ? "ការគ្រប់គ្រង Telegram" : "Telegram Management"}
          </h2>
          <p className="text-gray-500 dark:text-gray-400 text-sm mt-1">
            {lang === "km" ? "គ្រប់គ្រង Bot, Channel និងការភ្ជាប់គណនីគ្រូ" : "Manage Bot, Channels & Teacher Linking"}
          </p>
        </div>
        <button onClick={fetchData} className="flex items-center gap-2 px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 dark:border-gray-600 dark:text-gray-300 transition-colors dark:bg-gray-900/50">
          <RefreshCw size={16} />
          {lang === "km" ? "ធ្វើឱ្យថ្មី" : "Refresh"}
        </button>
      </div>

      {/* Bot Status Banner */}
      <div className={`rounded-xl p-4 mb-6 flex items-center gap-4 ${status?.bot?.isActive
        ? "bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 dark:from-green-900/20 dark:to-emerald-900/20 dark:border-green-800"
        : "bg-gradient-to-r from-red-50 to-orange-50 border border-red-200 dark:from-red-900/20 dark:to-orange-900/20 dark:border-red-800"
      }`}>
        <div className={`w-12 h-12 rounded-full flex items-center justify-center ${status?.bot?.isActive
          ? "bg-green-100 text-green-600 dark:bg-green-900/50 dark:text-green-400"
          : "bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400"
        }`}>
          <Bot size={24} />
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {status?.bot?.isActive ? (status.bot.name || "Phlov Meas Bot") : "Bot Offline"}
            </h3>
            {status?.bot?.isActive && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" /> Active
              </span>
            )}
          </div>
          {status?.bot?.username && (
            <p className="text-sm text-gray-500 dark:text-gray-400">@{status.bot.username}</p>
          )}
        </div>
        {status?.bot?.username && (
          <a href={`https://t.me/${status.bot.username}`} target="_blank" rel="noreferrer"
            className="flex items-center gap-1 px-3 py-2 text-sm bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
            <ExternalLink size={14} /> Open Bot
          </a>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: lang === "km" ? "គ្រូបានភ្ជាប់" : "Linked Teachers", value: `${status?.stats?.linkedTeachers || 0}/${status?.stats?.totalTeachers || 0}`, icon: Users, color: "text-blue-600 bg-blue-50 dark:bg-blue-900/30 dark:text-blue-400" },
          { label: lang === "km" ? "សារ ២៤ម៉ោង" : "Messages 24h", value: status?.stats?.messagesSent24h || 0, icon: MessageSquare, color: "text-green-600 bg-green-50 dark:bg-green-900/30 dark:text-green-400" },
          { label: lang === "km" ? "Channel សកម្ម" : "Active Channels", value: [status?.channels?.main?.id, status?.channels?.teachers?.id, status?.channels?.students?.id, status?.channels?.parents?.id].filter(Boolean).length, icon: Hash, color: "text-purple-600 bg-purple-50 dark:bg-purple-900/30 dark:text-purple-400" },
          { label: lang === "km" ? "សារសរុប" : "Total Messages", value: status?.stats?.totalMessagesSent || 0, icon: Send, color: "text-orange-600 bg-orange-50 dark:bg-orange-900/30 dark:text-orange-400" },
        ].map((stat, i) => (
          <div key={i} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${stat.color}`}>
                <stat.icon size={20} />
              </div>
              <div>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{stat.value}</p>
                <p className="text-xs text-gray-500 dark:text-gray-400">{stat.label}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 mb-6 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
        {[
          { id: "overview" as const, label: lang === "km" ? "ទិដ្ឋភាពរួម" : "Overview", icon: Hash },
          { id: "teachers" as const, label: lang === "km" ? "គ្រូភ្ជាប់" : "Teachers", icon: Users },
          { id: "logs" as const, label: lang === "km" ? "កំណត់ហេតុសារ" : "Message Logs", icon: MessageSquare },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-all ${
              activeTab === tab.id
                ? "bg-white dark:bg-gray-700 text-primary dark:text-blue-400 shadow-sm"
                : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
            }`}
          >
            <tab.icon size={16} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          {/* Channels */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
              {lang === "km" ? "📡 Channel ទាំងអស់" : "📡 All Channels"}
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {status && Object.entries(status.channels).filter(([k]) => k !== "botConfigured").map(([key, ch]) => {
                const channel = ch as ChannelInfo;
                const isConnected = !!channel?.id;
                return (
                  <div key={key} className={`flex items-center gap-3 p-3 rounded-lg border ${isConnected
                    ? "border-green-200 bg-green-50/50 dark:border-green-800 dark:bg-green-900/20"
                    : "border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-900/20"
                  }`}>
                    {isConnected ? <CheckCircle size={18} className="text-green-500" /> : <XCircle size={18} className="text-gray-400" />}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 dark:text-gray-100 capitalize">{key} Channel</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{channel?.name || "Not configured"}</p>
                    </div>
                    {isConnected && (
                      <button
                        onClick={() => setTestChannelId(channel.id!)}
                        className="text-xs px-2 py-1 bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 rounded hover:bg-blue-200 dark:hover:bg-blue-900/50 transition-colors"
                      >
                        Test
                      </button>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Test Message Sender */}
          <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 p-6">
            <h3 className="font-bold text-gray-900 dark:text-gray-100 mb-4">
              {lang === "km" ? "📤 ផ្ញើសារសាកល្បង" : "📤 Send Test Message"}
            </h3>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                value={testChannelId}
                onChange={(e) => setTestChannelId(e.target.value)}
                placeholder="Channel ID"
                className="flex-1 border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <input
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder={lang === "km" ? "សារសាកល្បង..." : "Test message..."}
                className="flex-[2] border dark:border-gray-600 rounded-lg px-3 py-2 text-sm dark:bg-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={handleSendTest}
                disabled={sending || !testChannelId || !testMessage}
                className="flex items-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed text-sm transition-colors"
              >
                {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                {lang === "km" ? "ផ្ញើ" : "Send"}
              </button>
            </div>
          </div>
        </div>
      )}

      {activeTab === "teachers" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700 flex items-center justify-between">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {lang === "km" ? "គ្រូដែលបានភ្ជាប់ Telegram" : "Telegram-Linked Teachers"} ({linkedTeachers.length})
            </h3>
          </div>
          {linkedTeachers.length > 0 ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b dark:border-gray-700">
                <tr>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400">{lang === "km" ? "គ្រូ" : "Teacher"}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden md:table-cell">{lang === "km" ? "មុខវិជ្ជា" : "Subject"}</th>
                  <th className="text-left px-4 py-3 font-semibold text-gray-600 dark:text-gray-400 hidden lg:table-cell">{lang === "km" ? "ភ្ជាប់នៅ" : "Linked At"}</th>
                  <th className="px-4 py-3 text-right">{lang === "km" ? "សកម្មភាព" : "Actions"}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                {linkedTeachers.map((t) => (
                  <tr key={t.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors dark:bg-gray-900/50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 text-xs font-bold overflow-hidden">
                          {t.photoUrl ? <img src={resolveUrl(t.photoUrl)} alt="" className="w-full h-full object-cover" /> : t.nameKh[0]}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 dark:text-gray-100">{t.nameKh}</p>
                          <p className="text-xs text-gray-500 dark:text-gray-400">{t.nameEn}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-gray-600 dark:text-gray-300 hidden md:table-cell">{t.subjectKh || t.position || "—"}</td>
                    <td className="px-4 py-3 text-gray-500 dark:text-gray-400 hidden lg:table-cell">
                      {t.telegramLinkedAt ? new Date(t.telegramLinkedAt).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => handleUnlink(t.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                      >
                        <Unlink size={12} /> {lang === "km" ? "ផ្ដាច់" : "Unlink"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <Users size={40} className="mx-auto mb-3 opacity-50" />
              <p>{lang === "km" ? "មិនទាន់មានគ្រូភ្ជាប់ Telegram ទេ" : "No teachers linked yet"}</p>
              <p className="text-xs mt-1">{lang === "km" ? "សូម Generate Link Code ពីទំព័រគ្រូបង្រៀន" : "Generate Link Codes from Teachers page"}</p>
            </div>
          )}
        </div>
      )}

      {activeTab === "logs" && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700 overflow-hidden">
          <div className="p-4 border-b border-gray-100 dark:border-gray-700">
            <h3 className="font-bold text-gray-900 dark:text-gray-100">
              {lang === "km" ? "កំណត់ហេតុសារ" : "Message Log"} ({messageLogs.length})
            </h3>
          </div>
          {messageLogs.length > 0 ? (
            <div className="divide-y divide-gray-100 dark:divide-gray-700 max-h-[500px] overflow-y-auto">
              {messageLogs.map((log) => (
                <div key={log.id} className="px-4 py-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors dark:bg-gray-900/50">
                  <div className="flex items-start gap-3">
                    <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${log.status === "sent" ? "bg-green-500" : "bg-red-500"}`} />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-gray-900 dark:text-gray-100 truncate">{log.messageText}</p>
                      <div className="flex items-center gap-3 mt-1">
                        <span className={`text-xs px-1.5 py-0.5 rounded ${
                          log.messageType === "dm" ? "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400"
                          : log.messageType === "notification" ? "bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400"
                          : "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                        }`}>{log.messageType}</span>
                        <span className="text-xs text-gray-400">{new Date(log.sentAt).toLocaleString()}</span>
                        {log.errorMessage && <span className="text-xs text-red-500 truncate max-w-[200px]">{log.errorMessage}</span>}
                      </div>
                    </div>
                    <span className={`text-xs font-semibold px-2 py-1 rounded-full shrink-0 ${
                      log.status === "sent"
                        ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400"
                        : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                    }`}>{log.status}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <MessageSquare size={40} className="mx-auto mb-3 opacity-50" />
              <p>{lang === "km" ? "មិនមានកំណត់ហេតុសារទេ" : "No message logs yet"}</p>
            </div>
          )}
        </div>
      )}

      {/* Link Code Modal */}
      {linkCode && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setLinkCode(null)}>
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mx-auto mb-4">
                <Link2 size={28} className="text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-2">Link Code Generated!</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
                {lang === "km" ? `សម្រាប់គ្រូ ${linkCode.teacherName}` : `For teacher ${linkCode.teacherName}`}
              </p>
              <div className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 mb-4">
                <p className="text-2xl font-mono font-bold text-primary dark:text-blue-400 tracking-wider">
                  {linkCode.code}
                </p>
              </div>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">{linkCode.instructions}</p>
              <div className="flex gap-3">
                <button onClick={copyCode} className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-primary text-white rounded-lg hover:opacity-90 transition-colors text-sm">
                  {copiedCode ? <CheckCircle size={16} /> : <Copy size={16} />}
                  {copiedCode ? "Copied!" : "Copy Command"}
                </button>
                <button onClick={() => setLinkCode(null)} className="px-4 py-2 border dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 text-sm dark:text-gray-300 transition-colors dark:bg-gray-900/50">
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
