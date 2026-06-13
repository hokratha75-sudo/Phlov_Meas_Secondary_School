import { env } from 'process';
import { db, telegramMessageLog } from '@workspace/db';

const TELEGRAM_BOT_TOKEN = env.TELEGRAM_BOT_TOKEN;
const MAIN_CHANNEL_ID = env.TELEGRAM_MAIN_CHANNEL_ID || env.TELEGRAM_MAIN_CHANNEL_NAME;
const TEACHERS_CHANNEL_ID = env.TELEGRAM_TEACHERS_CHANNEL_ID || env.TELEGRAM_TEACHERS_CHANNEL_NAME;
const STUDENTS_CHANNEL_ID = env.TELEGRAM_STUDENTS_CHANNEL_ID || env.TELEGRAM_STUDENTS_CHANNEL_NAME;
const PARENTS_CHANNEL_ID = env.TELEGRAM_PARENTS_CHANNEL_ID || env.TELEGRAM_PARENTS_CHANNEL_NAME;

// ─── Message Delivery Logging ──────────────────────────────────────────────
async function logMessage(channelId: string, messageText: string, messageType: string, status: string, errorMessage?: string) {
  try {
    await db.insert(telegramMessageLog).values({
      channelId,
      messageText: messageText.substring(0, 2000), // Truncate long messages
      messageType,
      status,
      errorMessage: errorMessage || null,
    });
  } catch (err: any) {
    console.error('Failed to log telegram message:', err.message);
  }
}

// ─── Core Send Functions ───────────────────────────────────────────────────

export async function sendTelegramMessage(chatId: string, message: string, parseMode: 'HTML' | 'MarkdownV2' | 'Markdown' = 'HTML', pin: boolean = false, replyMarkup?: any): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: parseMode,
        disable_web_page_preview: false,
        reply_markup: replyMarkup
      })
    });
    
    const result = await response.json() as any;
    
    if (result.ok) {
      console.log(`✅ Telegram message sent to ${chatId}`);
      if (pin) {
        const messageId = result.result.message_id;
        const pinUrl = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/pinChatMessage`;
        await fetch(pinUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            message_id: messageId,
            disable_notification: false
          })
        });
        console.log(`📌 Telegram message pinned in ${chatId}`);
      }
      return true;
    } else {
      console.error(`❌ Telegram error: ${result.description}`);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Failed to send Telegram message:', error.message);
    return false;
  }
}

// ─── Direct Message (DM) to a specific user ────────────────────────────────

export async function sendDirectMessage(telegramChatId: number, message: string, parseMode: 'HTML' | 'MarkdownV2' | 'Markdown' = 'HTML'): Promise<boolean> {
  const success = await sendTelegramMessage(String(telegramChatId), message, parseMode);
  await logMessage(String(telegramChatId), message, 'dm', success ? 'sent' : 'failed', success ? undefined : 'DM delivery failed');
  return success;
}

// ─── Photo Sending ─────────────────────────────────────────────────────────

export async function sendPhotoToChannel(chatId: string, photoUrl: string, caption: string = ''): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) {
    console.error('❌ TELEGRAM_BOT_TOKEN not configured');
    return false;
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendPhoto`;

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        photo: photoUrl,
        caption,
        parse_mode: 'HTML',
      })
    });

    const result = await response.json() as any;
    if (result.ok) {
      console.log(`✅ Telegram photo sent to ${chatId}`);
      await logMessage(chatId, `[PHOTO] ${caption}`, 'broadcast', 'sent');
      return true;
    } else {
      console.error(`❌ Telegram photo error: ${result.description}`);
      await logMessage(chatId, `[PHOTO] ${caption}`, 'broadcast', 'failed', result.description);
      return false;
    }
  } catch (error: any) {
    console.error('❌ Failed to send Telegram photo:', error.message);
    await logMessage(chatId, `[PHOTO] ${caption}`, 'broadcast', 'failed', error.message);
    return false;
  }
}

// ─── Unpin Message ─────────────────────────────────────────────────────────

export async function unpinMessage(chatId: string, messageId?: number): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return false;

  const url = messageId 
    ? `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/unpinChatMessage`
    : `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/unpinAllChatMessages`;

  try {
    const body: any = { chat_id: chatId };
    if (messageId) body.message_id = messageId;

    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const result = await response.json() as any;
    return result.ok;
  } catch (error: any) {
    console.error('❌ Failed to unpin Telegram message:', error.message);
    return false;
  }
}

// ─── Inline Keyboard & Callback Queries ────────────────────────────────────

export async function editTelegramMessageText(chatId: string | number, messageId: number, message: string, parseMode: 'HTML' | 'MarkdownV2' | 'Markdown' = 'HTML', replyMarkup?: any): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return false;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/editMessageText`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        message_id: messageId,
        text: message,
        parse_mode: parseMode,
        reply_markup: replyMarkup
      })
    });
    const result = await response.json() as any;
    return result.ok;
  } catch (error: any) {
    console.error('❌ Failed to edit Telegram message:', error.message);
    return false;
  }
}

export async function answerCallbackQuery(callbackQueryId: string, text?: string, showAlert: boolean = false): Promise<boolean> {
  if (!TELEGRAM_BOT_TOKEN) return false;
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/answerCallbackQuery`;
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        callback_query_id: callbackQueryId,
        text,
        show_alert: showAlert
      })
    });
    const result = await response.json() as any;
    return result.ok;
  } catch (error: any) {
    console.error('❌ Failed to answer callback query:', error.message);
    return false;
  }
}


// ─── Channel-Specific Senders ──────────────────────────────────────────────

// ផ្ញើសារទៅ Main Channel
export async function sendToMainChannel(message: string, pin: boolean = false): Promise<boolean> {
  if (!MAIN_CHANNEL_ID) return false;
  const success = await sendTelegramMessage(MAIN_CHANNEL_ID, message, 'HTML', pin);
  await logMessage(MAIN_CHANNEL_ID, message, 'broadcast', success ? 'sent' : 'failed');
  return success;
}

// ផ្ញើសារទៅ Teachers Channel
export async function sendToTeachersChannel(message: string, pin: boolean = false): Promise<boolean> {
  if (!TEACHERS_CHANNEL_ID) return false;
  const success = await sendTelegramMessage(TEACHERS_CHANNEL_ID, message, 'HTML', pin);
  await logMessage(TEACHERS_CHANNEL_ID, message, 'notification', success ? 'sent' : 'failed');
  return success;
}

// ផ្ញើសារទៅ Students Channel
export async function sendToStudentsChannel(message: string, pin: boolean = false): Promise<boolean> {
  if (!STUDENTS_CHANNEL_ID) return false;
  const success = await sendTelegramMessage(STUDENTS_CHANNEL_ID, message, 'HTML', pin);
  await logMessage(STUDENTS_CHANNEL_ID, message, 'broadcast', success ? 'sent' : 'failed');
  return success;
}

// ផ្ញើសារទៅ Parents Channel
export async function sendToParentsChannel(message: string, pin: boolean = false): Promise<boolean> {
  if (!PARENTS_CHANNEL_ID) return false;
  const success = await sendTelegramMessage(PARENTS_CHANNEL_ID, message, 'HTML', pin);
  await logMessage(PARENTS_CHANNEL_ID, message, 'broadcast', success ? 'sent' : 'failed');
  return success;
}

// ─── Broadcast Functions ───────────────────────────────────────────────────

// Broadcast to all channels
export async function broadcastToAllChannels(message: string, pin: boolean = false): Promise<boolean[]> {
  return Promise.all([
    sendToMainChannel(message, pin),
    sendToTeachersChannel(message, pin),
    sendToStudentsChannel(message, pin),
    sendToParentsChannel(message, pin),
  ]);
}

// Broadcast to selected channels only
export type ChannelTarget = 'main' | 'teachers' | 'students' | 'parents';

export async function broadcastToTargetedChannels(message: string, channels: ChannelTarget[], pin: boolean = false): Promise<boolean[]> {
  const channelMap: Record<ChannelTarget, (msg: string, pin: boolean) => Promise<boolean>> = {
    main: sendToMainChannel,
    teachers: sendToTeachersChannel,
    students: sendToStudentsChannel,
    parents: sendToParentsChannel,
  };

  const promises = channels.map(ch => channelMap[ch](message, pin));
  return Promise.all(promises);
}

// ─── Utility ───────────────────────────────────────────────────────────────

// ផ្ញើសារទៅកាន់ Channel ណាមួយ
export async function sendToChannel(channelUsername: string, message: string): Promise<boolean> {
  return sendTelegramMessage(channelUsername, message);
}

// Get bot info
export async function getBotInfo(): Promise<any | null> {
  if (!TELEGRAM_BOT_TOKEN) return null;
  
  try {
    const response = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
    const result = await response.json() as any;
    return result.ok ? result.result : null;
  } catch {
    return null;
  }
}

// Get channel info for status display
export function getChannelConfig() {
  return {
    main: { id: MAIN_CHANNEL_ID, name: env.TELEGRAM_MAIN_CHANNEL_NAME || 'Main Channel' },
    teachers: { id: TEACHERS_CHANNEL_ID, name: env.TELEGRAM_TEACHERS_CHANNEL_NAME || 'Teachers Channel' },
    students: { id: STUDENTS_CHANNEL_ID, name: env.TELEGRAM_STUDENTS_CHANNEL_NAME || 'Students Channel' },
    parents: { id: PARENTS_CHANNEL_ID, name: env.TELEGRAM_PARENTS_CHANNEL_NAME || 'Parents Channel' },
    botConfigured: !!TELEGRAM_BOT_TOKEN,
  };
}
