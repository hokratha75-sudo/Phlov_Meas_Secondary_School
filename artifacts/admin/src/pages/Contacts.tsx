import { useListContacts, useMarkContactRead, useDeleteContact } from "@workspace/api-client-react";
import { useAuth } from "@/lib/auth";
import { Mail, MailOpen, Trash2 } from "lucide-react";

export default function ContactsPage() {
  const { token } = useAuth();
  const headers = { Authorization: `Bearer ${token}` };
  const { data, refetch } = useListContacts(undefined, { request: { headers } });
  const { mutate: markRead } = useMarkContactRead({ request: { headers } });
  const { mutate: remove } = useDeleteContact({ request: { headers } });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-gray-800">Contact Messages</h2>
          <p className="text-gray-500 text-sm">{data?.total ?? 0} total messages</p>
        </div>
      </div>

      <div className="space-y-3">
        {data?.data.map(msg => (
          <div key={msg.id} className={`bg-white border rounded-xl p-5 shadow-sm flex gap-4 ${!msg.isRead ? "border-l-4 border-l-[#1e3a6e]" : ""}`}>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${!msg.isRead ? "bg-blue-50 text-[#1e3a6e]" : "bg-gray-50 text-gray-400"}`}>
              {msg.isRead ? <MailOpen size={18} /> : <Mail size={18} />}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <p className="font-bold text-gray-800">{msg.fullName}</p>
                {!msg.isRead && <span className="bg-[#1e3a6e] text-white text-xs px-2 py-0.5 rounded-full">New</span>}
                <span className="text-xs text-gray-400 ml-auto shrink-0">{new Date(msg.createdAt).toLocaleDateString()}</span>
              </div>
              <div className="flex flex-wrap gap-3 text-xs text-gray-500 mb-2">
                {msg.phone && <span>📞 {msg.phone}</span>}
                {msg.email && <span>✉ {msg.email}</span>}
              </div>
              <p className="text-sm text-gray-700 leading-relaxed">{msg.message}</p>
            </div>
            <div className="flex flex-col gap-2 shrink-0">
              {!msg.isRead && (
                <button onClick={() => markRead({ id: msg.id }, { onSuccess: () => refetch() })}
                  title="Mark as read"
                  className="p-2 text-gray-400 hover:text-[#1e3a6e] border rounded-lg hover:bg-blue-50 transition-colors">
                  <MailOpen size={14} />
                </button>
              )}
              <button onClick={() => { if (confirm("Delete message?")) remove({ id: msg.id }, { onSuccess: () => refetch() }); }}
                title="Delete"
                className="p-2 text-gray-400 hover:text-red-600 border rounded-lg hover:bg-red-50 transition-colors">
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        ))}
        {!data?.data.length && (
          <div className="bg-white border rounded-xl py-12 text-center text-gray-400">
            <Mail size={40} className="mx-auto mb-3 opacity-30" />
            <p>No messages yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
