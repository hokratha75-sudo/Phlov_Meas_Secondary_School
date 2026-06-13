import { useState } from "react";
import { useListContacts, useMarkContactRead, useDeleteContact } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Mail, MailOpen, Trash2, RefreshCw, Eye, EyeOff, Search, CheckCheck } from "lucide-react";

type Filter = "all" | "read" | "unread";

export default function ContactsPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const { data, refetch, isFetching } = useListContacts(undefined, { request: { headers } });
  const { mutate: markRead } = useMarkContactRead({ request: { headers } });
  const { mutate: remove } = useDeleteContact({ request: { headers } });
  const [filter, setFilter] = useState<Filter>("all");
  const [search, setSearch] = useState("");

  const unreadCount = data?.data.filter(m => !m.isRead).length ?? 0;
  const filtered = data?.data.filter(msg => {
    const matchesFilter = filter === "all" ? true : filter === "read" ? msg.isRead : !msg.isRead;
    const q = search.toLowerCase();
    const matchesSearch =
      msg.fullName.toLowerCase().includes(q) ||
      (msg.phone ?? "").toLowerCase().includes(q) ||
      (msg.email ?? "").toLowerCase().includes(q) ||
      msg.message.toLowerCase().includes(q);
    return matchesFilter && matchesSearch;
  }) ?? [];

  const markAllRead = () => {
    const unread = data?.data.filter(m => !m.isRead) ?? [];
    if (!unread.length) return;
    let remaining = unread.length;
    unread.forEach(msg => {
      markRead({ id: msg.id }, {
        onSuccess: () => {
          remaining--;
          if (remaining === 0) refetch();
        },
      });
    });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div>
            <h2 className="text-xl text-primary">Contact Messages</h2>
            <p className="text-gray-500 text-sm">{data?.total ?? 0} total messages</p>
          </div>
          {unreadCount > 0 && (
            <span className="bg-primary text-white text-xs font-bold px-2.5 py-1 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-2 border rounded-lg px-3 py-1.5 bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <Search size={14} className="text-gray-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search messages..." className="text-sm outline-none" />
          </div>
          <select value={filter} onChange={e => setFilter(e.target.value as Filter)} className="border rounded-lg px-3 py-1.5 text-sm bg-white dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <option value="all">All</option>
            <option value="unread">Unread</option>
            <option value="read">Read</option>
          </select>
          {unreadCount > 0 && (
            <button
              onClick={markAllRead}
              className="flex items-center gap-1.5 text-sm text-primary font-medium border border-primary/30 rounded-lg px-3 py-1.5 hover:bg-primary/5 transition-colors"
            >
              <CheckCheck size={14} />
              Mark all read
            </button>
          )}
          <button
            onClick={() => refetch()}
            disabled={isFetching}
            className="flex items-center gap-1.5 text-sm text-gray-500 border rounded-lg px-3 py-1.5 hover:bg-gray-50 transition-colors disabled:opacity-50 dark:bg-gray-900/50"
          >
            <RefreshCw size={14} className={isFetching ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filtered.map(msg => (
          <div
            key={msg.id}
            className={`bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-xl p-5 shadow-sm flex gap-4 transition-all ${!msg.isRead ? "border-l-4 border-l-primary" : ""}`}
          >
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!msg.isRead ? "bg-blue-50 text-primary" : "bg-gray-50 text-gray-400"}`}>
              {msg.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1 flex-wrap">
                <p className="font-bold text-primary">{msg.fullName}</p>
                {!msg.isRead && (
                  <span className="bg-primary text-white text-xs px-2 py-0.5 rounded-full">New</span>
                )}
                <span className="text-xs text-gray-400 ml-auto shrink-0">
                  {new Date(msg.createdAt).toLocaleString()}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                {msg.phone && (
                  <span className="flex items-center gap-1">
                    <span>📞</span> {msg.phone}
                  </span>
                )}
                {msg.email && (
                  <span className="flex items-center gap-1">
                    <span>✉</span> {msg.email}
                  </span>
                )}
              </div>
              <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed whitespace-pre-wrap">{msg.message}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {!msg.isRead && (
                <button
                  onClick={() => markRead({ id: msg.id }, { onSuccess: () => refetch() })}
                  title="Mark as read"
                  className="p-2 text-gray-400 hover:text-primary border rounded-lg hover:bg-blue-50 transition-colors"
                >
                  <MailOpen size={14} />
                </button>
              )}
              {msg.isRead && (
                <div title="Read" className="p-2 text-green-600 border rounded-lg bg-green-50">
                  <Eye size={14} />
                </div>
              )}
              {!msg.isRead && (
                <div title="Unread" className="p-2 text-amber-600 border rounded-lg bg-amber-50">
                  <EyeOff size={14} />
                </div>
              )}
              <button
                onClick={() => {
                  if (confirm("Delete this message?")) {
                    remove({ id: msg.id }, { onSuccess: () => refetch() });
                  }
                }}
                title="Delete"
                className="p-2 text-gray-400 hover:text-red-600 border rounded-lg hover:bg-red-50 transition-colors"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}

        {!filtered.length && (
          <div className="bg-white border rounded-xl py-16 text-center text-gray-400 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-100">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p className="font-medium">No messages yet.</p>
            <p className="text-sm mt-1">Messages from the contact form will appear here.</p>
          </div>
        )}
      </div>
    </div>
  );
}
