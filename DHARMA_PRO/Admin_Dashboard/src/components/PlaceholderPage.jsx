import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function PlaceholderPage({ title, icon }) {
    const navigate = useNavigate();

    return (
        <div className="min-h-[60vh] flex flex-col items-center justify-center text-center p-8">
            <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center text-6xl mb-6 animate-bounce">
                {icon}
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">{title}</h1>
            <p className="text-xl text-gray-500 mb-8 max-w-md">
                This feature is currently under development. Please check back later.
            </p>
            <button
                onClick={() => navigate('/')}
                className="px-6 py-3 bg-white border border-gray-300 rounded-xl text-gray-700 font-semibold hover:bg-gray-50 transition-colors shadow-sm"
            >
                ← Back to Dashboard
            </button>
        </div>
    );
}
