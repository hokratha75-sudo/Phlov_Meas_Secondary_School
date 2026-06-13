import { Router } from "express";
import { db, telegramMessages } from "@workspace/db";
import { eq, desc, count, ilike, or, and } from "drizzle-orm";
import { requireAuth, requireAdmin } from "./auth";
import { sendTelegramMessage } from "../lib/telegram";

const router = Router();

// ─── GET /telegram/messages — Get all messages (paginated) ───────────────
router.get("/messages", requireAuth, async (req, res) => {
  try {
    const limit = Number(req.query["limit"]) || 50;
    const offset = Number(req.query["offset"]) || 0;
    const status = req.query["status"] as string;
    const search = req.query["search"] as string;

    const conditions = [];
    if (status) {
      conditions.push(eq(telegramMessages.status, status));
    }
    if (search) {
      conditions.push(
        or(
          ilike(telegramMessages.username, `%${search}%`),
          ilike(telegramMessages.firstName, `%${search}%`),
          ilike(telegramMessages.lastName, `%${search}%`),
          ilike(telegramMessages.messageText, `%${search}%`)
        )
      );
    }

    const whereClause = conditions.length > 0 ? and(...conditions) : undefined;

    const [items, [total]] = await Promise.all([
      db
        .select()
        .from(telegramMessages)
        .where(whereClause)
        .orderBy(desc(telegramMessages.createdAt))
        .limit(limit)
        .offset(offset),
      db.select({ count: count() }).from(telegramMessages).where(whereClause),
    ]);

    res.json({
      data: items.map((i) => ({
        ...i,
        createdAt: i.createdAt?.toISOString(),
        repliedAt: i.repliedAt?.toISOString(),
      })),
      total: total?.count ?? 0,
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch messages", details: err.message });
  }
});

// ─── GET /telegram/messages/unread — Get unread count and list ───────────────
router.get("/messages/unread", requireAuth, async (req, res) => {
  try {
    const unreadMessages = await db
      .select()
      .from(telegramMessages)
      .where(eq(telegramMessages.status, 'unread'))
      .orderBy(desc(telegramMessages.createdAt));

    res.json({
      count: unreadMessages.length,
      data: unreadMessages.map((i) => ({
        ...i,
        createdAt: i.createdAt?.toISOString(),
        repliedAt: i.repliedAt?.toISOString(),
      })),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch unread messages", details: err.message });
  }
});

// ─── GET /telegram/messages/:id — Get single message ───────────────
router.get("/messages/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const [msg] = await db
      .select()
      .from(telegramMessages)
      .where(eq(telegramMessages.id, id));

    if (!msg) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.json({
      ...msg,
      createdAt: msg.createdAt?.toISOString(),
      repliedAt: msg.repliedAt?.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to fetch message", details: err.message });
  }
});

// ─── POST /telegram/reply — Send reply to user ───────
router.post("/reply", requireAuth, async (req: any, res) => {
  try {
    const { chatId, messageText } = req.body;
    const adminId = req.adminUser?.id;

    if (!chatId || !messageText) {
      res.status(400).json({ error: "chatId and messageText are required" });
      return;
    }

    // Send via Telegram
    const success = await sendTelegramMessage(chatId.toString(), messageText);
    
    if (!success) {
      res.status(500).json({ error: "Failed to send message via Telegram" });
      return;
    }

    // Insert bot reply into telegram_messages
    const [botMsg] = await db.insert(telegramMessages).values({
      messageId: Date.now(), // Fallback ID
      chatId: Number(chatId),
      messageText: messageText,
      isFromBot: true,
      status: "sent",
      repliedBy: adminId,
    }).returning();

    // Mark previous unread messages from this chat as replied
    await db.update(telegramMessages)
      .set({ 
        status: "replied", 
        repliedAt: new Date(),
        repliedBy: adminId 
      })
      .where(and(
        eq(telegramMessages.chatId, Number(chatId)),
        or(
          eq(telegramMessages.status, "unread"),
          eq(telegramMessages.status, "received")
        )
      ));

    res.json({
      ...botMsg,
      createdAt: botMsg.createdAt?.toISOString(),
      repliedAt: botMsg.repliedAt?.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to send reply", details: err.message });
  }
});

// ─── PUT /telegram/messages/:id — Update message status ──────────────
router.put("/messages/:id", requireAuth, async (req, res) => {
  try {
    const id = Number(req.params.id);
    const { status } = req.body;

    if (!status) {
      res.status(400).json({ error: "Status is required" });
      return;
    }

    const [updated] = await db
      .update(telegramMessages)
      .set({ status })
      .where(eq(telegramMessages.id, id))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.json({
      ...updated,
      createdAt: updated.createdAt?.toISOString(),
      repliedAt: updated.repliedAt?.toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to update status", details: err.message });
  }
});

// ─── DELETE /telegram/messages/:id — Delete message (admin only) ──────────────
router.delete("/messages/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const id = Number(req.params.id);

    const [deleted] = await db
      .delete(telegramMessages)
      .where(eq(telegramMessages.id, id))
      .returning();

    if (!deleted) {
      res.status(404).json({ error: "Message not found" });
      return;
    }

    res.json({ message: "Message deleted successfully" });
  } catch (err: any) {
    res.status(500).json({ error: "Failed to delete message", details: err.message });
  }
});

export default router;
