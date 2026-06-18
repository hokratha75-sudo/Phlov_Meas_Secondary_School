import QRCode from 'qrcode';
import crypto from 'crypto';

async function test() {
    try {
        const url = 'http://localhost:5173/auth/qr-login?token=abc';
        const dataUrl = await QRCode.toDataURL(url, {
            errorCorrectionLevel: 'H',
            margin: 2,
            width: 300,
            color: {
                dark: '#1e3a6e',
                light: '#ffffff',
            },
        });
        console.log("SUCCESS length:", dataUrl.length);
    } catch (e) {
        console.error("FAIL", e);
    }
}

test();
