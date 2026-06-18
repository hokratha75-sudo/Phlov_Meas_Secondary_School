import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { useTranslation } from '@/lib/i18n';
import api from '@/lib/axiosConfig';
import { useAuth } from '@/lib/auth';

const QRLogin: React.FC = () => {
    const [, setLocation] = useLocation();
    const { login } = useAuth();
    
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
            // Make AJAX request to verify token and set cookies
            api.get(`/auth/qr-login?token=${token}`)
                .then((res) => {
                    // Update auth state in localStorage
                    login('', undefined, res.data.accessToken, res.data.user).then(() => {
                        // Use wouter to navigate without full page reload
                        setLocation('/');
                    });
                })
                .catch((err: any) => {
                    console.error('QR Login failed:', err);
                    setLocation('/login?error=invalid_token');
                });
        } else {
            // No token, redirect to login
            setLocation('/login');
        }
    }, [token, error, setLocation, login]);

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
