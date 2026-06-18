import { Router } from 'express';
import { eq, and, gt, lt, desc } from 'drizzle-orm';
import { db } from '@workspace/db';
import { qrLoginTokens } from '@workspace/db/schema';
import { teachers } from '@workspace/db/schema';
import { generateQRCodeBase64, generateSecureToken } from '../lib/qr-generator';
import { requireAuth, requireAdmin } from './auth';
import { generateTokens } from '../utils/securityFunctions.js';

const router = Router();

// ============================================
// 1. Admin: Generate QR Code for Teacher
// ============================================
router.post(
    '/teachers/:teacherId/qr-code',
    requireAuth,
    requireAdmin,
    async (req: any, res: any, next: any) => {
        try {
            const teacherId = parseInt(req.params.teacherId);
            const adminId = req.adminUser.id;

            // Validate teacher exists
            const teacher = await db.select()
                .from(teachers)
                .where(eq(teachers.id, teacherId))
                .limit(1);

            if (teacher.length === 0) {
                return res.status(404).json({ error: 'រកមិនឃើញគ្រូបង្រៀន' });
            }

            // Clean up expired tokens for this teacher (optional)
            await db.delete(qrLoginTokens)
                .where(and(
                    eq(qrLoginTokens.userId, teacherId),
                    lt(qrLoginTokens.expiresAt, new Date())
                ));

            // Generate token
            const token = generateSecureToken(32);
            const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes

            // Save to database
            const [newToken] = await db.insert(qrLoginTokens).values({
                userId: teacherId,
                token: token,
                expiresAt: expiresAt,
                createdBy: adminId,
            }).returning();

            // Generate QR Code
            const frontendUrl = req.headers.origin || process.env.FRONTEND_URL || 'http://localhost:5173';
            const loginUrl = `${frontendUrl}/auth/qr-login?token=${token}`;
            const qrCodeBase64 = await generateQRCodeBase64(loginUrl);

            // Audit log (optional but recommended)
            console.log(`[AUDIT] QR Code generated for Teacher ${teacherId} by Admin ${adminId}`);

            res.json({
                success: true,
                teacherId: teacherId,
                teacherName: teacher[0].nameKh || teacher[0].nameEn,
                token: token,
                qrCode: qrCodeBase64,
                expiresAt: expiresAt.toISOString(),
                message: 'QR Code ត្រូវបានបង្កើតដោយជោគជ័យ',
            });
        } catch (error) {
            console.error('[QR-Code Generation Error]:', error);
            res.status(500).json({ error: 'មានបញ្ហាក្នុងការបង្កើត QR Code' });
        }
    }
);

// ============================================
// 2. Public: QR Login (Teacher scans QR)
// ============================================
router.get('/auth/qr-login', async (req: any, res: any) => {
    const { token } = req.query;

    if (!token || typeof token !== 'string') {
        return res.redirect('/login?error=missing_token');
    }

    try {
        // Find valid token (not used, not expired)
        const [tokenRecord] = await db.select()
            .from(qrLoginTokens)
            .where(and(
                eq(qrLoginTokens.token, token),
                eq(qrLoginTokens.isUsed, false),
                gt(qrLoginTokens.expiresAt, new Date())
            ))
            .limit(1);

        if (!tokenRecord) {
            return res.redirect('/login?error=invalid_token');
        }

        // Mark as used (Prevent replay attack)
        await db.update(qrLoginTokens)
            .set({ isUsed: true })
            .where(eq(qrLoginTokens.id, tokenRecord.id));

        // Get teacher data
        const [teacher] = await db.select()
            .from(teachers)
            .where(eq(teachers.id, tokenRecord.userId))
            .limit(1);

        if (!teacher) {
            return res.redirect('/login?error=teacher_not_found');
        }

        // Generate JWT for teacher
        const { accessToken, refreshToken } = generateTokens({
            id: teacher.id,
            username: teacher.username || `qr-teacher-${teacher.id}`,
            role: "teacher",
        });

        // Set cookies
        res.cookie('admin_token', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'lax',
            maxAge: 15 * 60 * 1000 // 15 mins
        });
        res.cookie("refresh_token", refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            sameSite: "lax",
            path: "/api/auth/refresh-token",
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
        });

        // Audit log
        console.log(`[AUDIT] Teacher ${teacher.id} logged in via QR Code`);

        // Redirect to dashboard
        return res.redirect('/');
    } catch (error) {
        console.error('QR Login error:', error);
        return res.redirect('/login?error=server_error');
    }
});

// ============================================
// 3. Admin: Get QR Code history for a teacher
// ============================================
router.get(
    '/teachers/:teacherId/qr-history',
    requireAuth,
    requireAdmin,
    async (req: any, res: any) => {
        const teacherId = parseInt(req.params.teacherId);

        const history = await db.select()
            .from(qrLoginTokens)
            .where(eq(qrLoginTokens.userId, teacherId))
            .orderBy(desc(qrLoginTokens.createdAt))
            .limit(50);

        res.json({
            success: true,
            history: history.map(h => ({
                id: h.id,
                createdAt: h.createdAt,
                expiresAt: h.expiresAt,
                isUsed: h.isUsed,
                token: h.token.substring(0, 8) + '...', // Mask token for security
            })),
        });
    }
);

export default router;
