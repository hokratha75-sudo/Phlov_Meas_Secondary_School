import QRCode from 'qrcode';
import crypto from 'crypto';

/**
 * Generate QR Code as Base64 PNG image
 * @param text - Text or URL to encode
 * @param options - QRCode options
 * @returns Base64 string of QR Code image
 */
export async function generateQRCodeBase64(
    text: string,
    options: QRCode.QRCodeToDataURLOptions = {
        errorCorrectionLevel: 'H',
        margin: 2,
        width: 300,
        color: {
            dark: '#1e3a6e',  // Primary color
            light: '#ffffff',
        },
    }
): Promise<string> {
    try {
        const dataUrl = await QRCode.toDataURL(text, options);
        return dataUrl;
    } catch (error) {
        console.error('Failed to generate QR Code:', error);
        throw new Error('QR Code generation failed');
    }
}

/**
 * Generate a secure random token
 * @param length - Length of token (default: 32 bytes in hex)
 * @returns Random hex string
 */
export function generateSecureToken(length: number = 32): string {
    return crypto.randomBytes(length).toString('hex');
}
