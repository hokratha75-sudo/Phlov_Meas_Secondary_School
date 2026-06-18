import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from '@/lib/i18n';

const QRLogin: React.FC = () => {
    const [, setLocation] = useLocation();
    
    // Parse query params from window.location
    const searchParams = new URLSearchParams(window.location.search);
    const token = searchParams.get('token');
    const error = searchParams.get('error');
    const { lang } = useTranslation();

    useEffect(() => {
        // If error parameter exists, redirect to login
        if (error) {
            setLocation(`/login?error=${error}`);
            return;
        }

        // If token exists, redirect to backend for verification
        if (token) {
            // The backend will handle verification and set cookie
            // Then redirect back to the frontend
            // In Vite dev, the proxy handles /api
            window.location.href = `/api/auth/qr-login?token=${token}`;
        } else {
            // No token, redirect to login
            setLocation('/login');
        }
    }, [token, error, setLocation]);

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50">
            <div className="text-center">
                <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-primary mx-auto"></div>
                <h2 className="mt-6 text-xl font-semibold text-gray-700">
                    {lang === 'km' ? 'កំពុងផ្ទៀងផ្ទាត់ QR Code...' : 'Verifying QR Code...'}
                </h2>
                <p className="mt-2 text-gray-500">
                    {lang === 'km' ? 'សូមរង់ចាំបន្តិច' : 'Please wait a moment'}
                </p>
            </div>
        </div>
    );
};

export default QRLogin;
