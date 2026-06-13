import React from 'react';

interface PrintButtonProps {
    onClick?: () => void;
    className?: string;
    label?: string;
}

const PrintButton: React.FC<PrintButtonProps> = ({ onClick, className = '', label = 'បោះពុម្ព (Print)' }) => {
    const handlePrint = () => {
        if (onClick) onClick();
        window.print();
    };

    return (
        <button 
            onClick={handlePrint}
            className={`flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-md hover:bg-slate-900 transition-colors shadow-sm print:hidden ${className}`}
        >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
            </svg>
            <span className="font-medium text-sm">{label}</span>
        </button>
    );
};

export default PrintButton;
