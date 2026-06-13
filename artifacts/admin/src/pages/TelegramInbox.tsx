import { useState } from "react";
import { 
  useGetTelegramMessages, 
  usePostTelegramReply, 
  usePutTelegramMessagesId 
} from "@workspace/api-client-react";
import { Search, Send, CheckCircle, Clock, User, Reply, MessageCircle } from "lucide-react";
import { useTranslation } from "@/lib/i18n";
import { useQueryClient } from "@tanstack/react-query";

export default function TelegramInbox() {
  const { lang } = useTranslation();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [selectedChatId, setSelectedChatId] = useState<number | null>(null);
  const [replyText, setReplyText] = useState("");

  const { data: response, isLoading } = useGetTelegramMessages({
    search: search || undefined,
    status: statusFilter || undefined,
    limit: 100,
  });

  const replyMutation = usePostTelegramReply();
  const statusMutation = usePutTelegramMessagesId();

  const messages = response?.data || [];

  // Group messages by chat
  const chats = messages.reduce((acc, msg) => {
    if (!acc[msg.chatId]) {
      acc[msg.chatId] = {
        chatId: msg.chatId,
        user: msg.firstName ? `${msg.firstName} ${msg.lastName || ''}`.trim() : (msg.username || 'Unknown User'),
        messages: [],
        hasUnread: false,
        lastDate: msg.createdAt,
      };
    }
    acc[msg.chatId].messages.push(msg);
    if (msg.status === 'unread') {
      acc[msg.chatId].hasUnread = true;
    }
    return acc;
  }, {} as Record<number, any>);

  const chatList = Object.values(chats).sort((a: any, b: any) => 
    new Date(b.lastDate).getTime() - new Date(a.lastDate).getTime()
  );

  const selectedChat = selectedChatId ? chats[selectedChatId] : null;
  // Sort messages in chat chronologically
  const chatMessages = selectedChat?.messages.sort((a: any, b: any) => 
    new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  ) || [];

  const handleSendReply = async () => {
    if (!replyText.trim() || !selectedChatId) return;
    
    try {
      await replyMutation.mutateAsync({
        data: { chatId: selectedChatId, messageText: replyText }
      });
      setReplyText("");
      queryClient.invalidateQueries({ queryKey: ["/api/telegram/messages"] });
    } catch (err) {
      console.error("Failed to send reply", err);
      alert(lang === "km" ? "បរាជ័យក្នុងការផ្ញើសារ" : "Failed to send message");
    }
  };

  const markAsRead = async (id: number) => {
    try {
      await statusMutation.mutateAsync({
        id,
        data: { status: "received" }
      });
      queryClient.invalidateQueries({ queryKey: ["/api/telegram/messages"] });
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="flex h-[calc(100vh-6rem)] bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden shadow-sm">
      
      {/* Left Sidebar - Chat List */}
      <div className="w-1/3 border-r border-gray-200 dark:border-gray-700 flex flex-col bg-gray-50 dark:bg-gray-800/50">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-3">
            {lang === "km" ? "ប្រអប់សារ Telegram" : "Telegram Inbox"}
          </h2>
          <div className="relative mb-3">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
            <input 
              type="text" 
              placeholder={lang === "km" ? "ស្វែងរក..." : "Search..."}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg pl-9 pr-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
          <div className="flex gap-2 text-sm">
            <select 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg px-2 py-1 outline-none text-gray-700 dark:text-gray-200 flex-1"
            >
              <option value="">{lang === "km" ? "ទាំងអស់" : "All"}</option>
              <option value="unread">{lang === "km" ? "មិនទាន់អាន" : "Unread"}</option>
              <option value="received">{lang === "km" ? "បានអានរួច" : "Read"}</option>
              <option value="replied">{lang === "km" ? "បានឆ្លើយតប" : "Replied"}</option>
            </select>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {isLoading ? (
            <div className="p-4 text-center text-gray-500">Loading...</div>
          ) : chatList.length === 0 ? (
            <div className="p-4 text-center text-gray-500">No messages found.</div>
          ) : (
            chatList.map((chat: any) => (
              <button
                key={chat.chatId}
                onClick={() => setSelectedChatId(chat.chatId)}
                className={`w-full text-left p-4 border-b border-gray-200 dark:border-gray-700 transition-colors ${
                  selectedChatId === chat.chatId 
                    ? 'bg-blue-50 dark:bg-blue-900/20' 
                    : 'hover:bg-gray-100 dark:hover:bg-gray-700/50'
                }`}
              >
                <div className="flex justify-between items-start mb-1">
                  <span className="font-semibold text-gray-800 dark:text-gray-200 truncate">{chat.user}</span>
                  {chat.hasUnread && (
                    <span className="w-2.5 h-2.5 bg-blue-500 rounded-full mt-1.5 shrink-0" />
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {chat.messages[chat.messages.length - 1].messageText}
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Thread */}
      <div className="flex-1 flex flex-col bg-white dark:bg-gray-900">
        {selectedChatId && selectedChat ? (
          <>
            {/* Header */}
            <div className="p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between bg-white dark:bg-gray-800">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
                  <User size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-gray-800 dark:text-gray-100">{selectedChat.user}</h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400">ID: {selectedChat.chatId}</p>
                </div>
              </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {chatMessages.map((msg: any) => (
                <div 
                  key={msg.id} 
                  className={`flex flex-col ${msg.isFromBot ? 'items-end' : 'items-start'}`}
                >
                  <div 
                    className={`max-w-[70%] rounded-2xl px-4 py-2 ${
                      msg.isFromBot 
                        ? 'bg-blue-600 text-white rounded-br-none' 
                        : 'bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-100 rounded-bl-none border border-gray-200 dark:border-gray-700'
                    }`}
                  >
                    <p className="whitespace-pre-wrap text-sm">{msg.messageText}</p>
                  </div>
                  <div className="flex items-center gap-2 mt-1 px-1">
                    <span className="text-[10px] text-gray-400">
                      {new Date(msg.createdAt).toLocaleString()}
                    </span>
                    {!msg.isFromBot && msg.status === 'unread' && (
                      <button 
                        onClick={() => markAsRead(msg.id)}
                        className="text-[10px] text-blue-500 hover:underline"
                      >
                        {lang === "km" ? "ចំណាំថាបានអាន" : "Mark read"}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* Reply Input */}
            <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800">
              <div className="flex gap-2">
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder={lang === "km" ? "វាយបញ្ចូលសារតប..." : "Type a reply..."}
                  className="flex-1 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg p-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none resize-none h-14"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendReply();
                    }
                  }}
                />
                <button
                  onClick={handleSendReply}
                  disabled={!replyText.trim() || replyMutation.isPending}
                  className="bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white rounded-lg px-4 flex items-center justify-center transition-colors"
                >
                  <Send size={20} />
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400">
            <MessageCircle size={48} className="mb-4 opacity-20" />
            <p>{lang === "km" ? "ជ្រើសរើសការសន្ទនាដើម្បីមើលសារ" : "Select a conversation to view messages"}</p>
          </div>
        )}
      </div>
    </div>
  );
}
