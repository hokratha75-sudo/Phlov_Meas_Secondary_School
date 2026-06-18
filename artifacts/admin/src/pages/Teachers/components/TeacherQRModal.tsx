import React, { useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import api from '@/lib/axiosConfig';
import { useToast } from '@/hooks/use-toast';
import { Download, RefreshCw, X } from 'lucide-react';
import { useTranslation } from '@/lib/i18n';

interface TeacherQRModalProps {
    teacherId: number;
    teacherName: string;
    onClose: () => void;
}

interface QRData {
    qrCode: string;
    token: string;
    expiresAt: string;
}

const TeacherQRModal: React.FC<TeacherQRModalProps> = ({ teacherId, teacherName, onClose }) => {
    const [qrData, setQrData] = useState<QRData | null>(null);
    const [loading, setLoading] = useState(false);
    const [history, setHistory] = useState<any[]>([]);
    const { toast } = useToast();
    const { lang } = useTranslation();

    const generateQR = async () => {
        setLoading(true);
        try {
            const response = await api.post(`/teachers/${teacherId}/qr-code`);
            setQrData(response.data);
            toast({
                title: lang === 'km' ? 'ជោគជ័យ' : 'Success',
                description: lang === 'km' ? 'QR Code បានបង្កើតដោយជោគជ័យ!' : 'QR Code generated successfully!',
            });
            // Fetch history
            const historyRes = await api.get(`/teachers/${teacherId}/qr-history`);
            setHistory(historyRes.data.history);
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: lang === 'km' ? 'បរាជ័យ' : 'Failed',
                description: error?.response?.data?.error || (lang === 'km' ? 'មិនអាចបង្កើត QR Code បានទេ' : 'Failed to generate QR Code'),
            });
        } finally {
            setLoading(false);
        }
    };

    const downloadQR = () => {
        if (!qrData) return;
        const link = document.createElement('a');
        link.download = `qr-${teacherName}-${Date.now()}.png`;
        link.href = qrData.qrCode;
        link.click();
        toast({
            title: lang === 'km' ? 'ជោគជ័យ' : 'Success',
            description: lang === 'km' ? 'QR Code ត្រូវបានទាញយករួចរាល់' : 'QR Code downloaded successfully',
        });
    };

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden">
                {/* Header */}
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">
                        🎯 QR Code សម្រាប់ {teacherName}
                    </h3>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-gray-100 rounded-full transition"
                    >
                        <X className="w-5 h-5 text-gray-500" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-6 overflow-y-auto">
                    {!qrData ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600 mb-4">
                                {lang === 'km' ? 'ចុចប៊ូតុងខាងក្រោមដើម្បីបង្កើត QR Code' : 'Click the button below to generate QR Code'}
                            </p>
                            <button
                                onClick={generateQR}
                                disabled={loading}
                                className="bg-primary text-white px-6 py-3 rounded-lg hover:bg-primary/90 transition disabled:opacity-50"
                            >
                                {loading ? (lang === 'km' ? 'កំពុងបង្កើត...' : 'Generating...') : (lang === 'km' ? '🔄 បង្កើត QR Code' : '🔄 Generate QR Code')}
                            </button>
                        </div>
                    ) : (
                        <div className="flex flex-col md:flex-row gap-8 items-start">
                            {/* Left Side: QR Code & Actions */}
                            <div className="w-full md:w-1/2 flex flex-col items-center">
                                {/* QR Code Display */}
                                <div className="bg-white p-4 rounded-lg shadow-md inline-block">
                                    <img src={qrData.qrCode} alt="QR Code" width={220} height={220} />
                                </div>

                                {/* Expiry Info */}
                                <p className="text-sm text-gray-500 mt-3">
                                    ⏰ {lang === 'km' ? 'ផុតកំណត់នៅ' : 'Expires at'}: {new Date(qrData.expiresAt).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US')}
                                </p>

                                {/* Action Buttons */}
                                <div className="flex gap-3 mt-4 justify-center flex-wrap">
                                    <button
                                        onClick={downloadQR}
                                        className="bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition flex items-center gap-2"
                                    >
                                        <Download className="w-4 h-4" /> {lang === 'km' ? 'ទាញយក' : 'Download'}
                                    </button>
                                    <button
                                        onClick={generateQR}
                                        className="bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition flex items-center gap-2"
                                    >
                                        <RefreshCw className="w-4 h-4" /> {lang === 'km' ? 'បង្កើតថ្មី' : 'Regenerate'}
                                    </button>
                                </div>
                            </div>

                            {/* Right Side: Instructions & History */}
                            <div className="w-full md:w-1/2 flex flex-col space-y-6">
                                {/* Instruction for Teacher */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm text-blue-800 text-left w-full">
                                    <p className="font-semibold">📌 {lang === 'km' ? 'ការណែនាំសម្រាប់គ្រូ៖' : 'Instructions for Teacher:'}</p>
                                    <ol className="list-decimal ml-5 mt-2 space-y-1">
                                        <li>{lang === 'km' ? 'បើកកម្មវិធីស្កេន QR Code (Telegram, Google Lens)' : 'Open QR Scanner app (Telegram, Google Lens)'}</li>
                                        <li>{lang === 'km' ? 'ស្កេន QR Code ខាងឆ្វេងនេះ' : 'Scan the QR Code on the left'}</li>
                                        <li>{lang === 'km' ? 'ប្រព័ន្ធនឹង Login ដោយស្វ័យប្រវត្តិ' : 'The system will auto-login'}</li>
                                        <li className="text-xs text-red-600 mt-2 font-medium">⚠️ {lang === 'km' ? 'QR Code នេះមានសុពលភាពត្រឹមតែ ៥ នាទីប៉ុណ្ណោះ' : 'This QR Code is valid for 5 minutes only'}</li>
                                    </ol>
                                </div>

                                {/* History (if available) */}
                                {history.length > 0 && (
                                    <div className="border border-gray-100 rounded-lg p-4 bg-gray-50/50 w-full">
                                        <h4 className="text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
                                            📋 {lang === 'km' ? 'ប្រវត្តិ QR Code' : 'QR Code History'}
                                        </h4>
                                        <div className="max-h-32 overflow-y-auto space-y-2 pr-2 custom-scrollbar">
                                            {history.slice(0, 5).map((item) => (
                                                <div key={item.id} className="text-xs flex justify-between items-center bg-white border border-gray-100 p-2 rounded">
                                                    <span className="text-gray-500 font-medium">{new Date(item.createdAt).toLocaleString(lang === 'km' ? 'km-KH' : 'en-US')}</span>
                                                    <span className={`px-2 py-1 rounded-full text-[10px] font-bold ${item.isUsed ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                                        {item.isUsed ? (lang === 'km' ? 'បានប្រើរួច' : 'Used') : (lang === 'km' ? 'មិនទាន់ប្រើ' : 'Unused')}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default TeacherQRModal;
