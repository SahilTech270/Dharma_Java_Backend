import React, { useState } from 'react';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import Sidebar from './Sidebar';

export default function Layout({ children, user, onLogout }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { templeId } = useParams(); // Get templeId from URL
    const isAuthPage = location.pathname === '/login' || location.pathname === '/register';
    const [sidebarOpen, setSidebarOpen] = useState(false);

    if (isAuthPage) {
        return <>{children}</>;
    }

    // Helper to get temple name (Mock)
    const getTempleName = (id) => {
        if (!id) return null;
        if (id.includes('Somnath')) return 'Somnath Temple';
        if (id.includes('Dwarka')) return 'Dwarkadhish Temple';
        return 'Temple Dashboard';
    };

    const currentTempleName = getTempleName(templeId);

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Mobile Header */}
            <div className="md:hidden fixed top-0 left-0 right-0 z-50 bg-white border-b border-slate-200 px-4 h-16 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <button
                        onClick={() => setSidebarOpen(!sidebarOpen)}
                        className="p-2 rounded-lg hover:bg-slate-100 text-slate-600 font-bold"
                    >
                        MENU
                    </button>
                    <span className="font-bold text-slate-800">Dharma Admin</span>
                </div>
                <button
                    title="Logout"
                >
                    LOGOUT
                </button>
            </div>

            {/* Sidebar */}
            <Sidebar
                isOpen={sidebarOpen}
                toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                templeId={templeId} // Pass templeId to Sidebar
            />

            {/* Overlay for mobile */}
            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm"
                    onClick={() => setSidebarOpen(false)}
                ></div>
            )}

            {/* Main Content */}
            <div className="md:ml-64 min-h-screen flex flex-col transition-all duration-300">
                {/* Topbar (Desktop) */}
                <header className="hidden md:flex h-16 bg-white border-b border-slate-200 items-center justify-between px-8 sticky top-0 z-20 shadow-sm">
                    <div className="flex items-center gap-4">
                        {templeId && (
                            <div className="flex items-center gap-2 text-slate-500 text-sm">
                                <span className="cursor-pointer hover:text-orange-600" onClick={() => navigate('/')}>Temples</span>
                                <span>/</span>
                                <span className="font-semibold text-slate-800">{currentTempleName}</span>
                            </div>
                        )}
                        <h2 className="text-lg font-semibold text-slate-800 ml-4">
                            {location.pathname === '/' ? 'Temple Selection' :
                                location.pathname.includes('/dashboard') ? 'Overview' :
                                    location.pathname.split('/').pop().split('-').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                        </h2>
                    </div>

                    <div className="flex items-center gap-4">
                        <button className="p-2 text-slate-400 hover:text-slate-600 transition-colors relative font-bold text-sm">
                            ALERTS
                            <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border border-white"></span>
                        </button>
                        <div className="h-8 w-px bg-slate-200 mx-2"></div>
                        <div className="flex items-center gap-3">
                            <div className="text-right cursor-pointer hover:opacity-80" onClick={() => navigate('/profile')}>
                                <p className="text-sm font-medium text-slate-700">{user?.name || 'Admin'}</p>
                                <p className="text-xs text-slate-500">Super Admin</p>
                            </div>
                            <button
                                onClick={onLogout}
                                className="px-4 py-2 bg-red-50 text-red-600 hover:bg-red-100 rounded-lg transition-colors text-sm font-medium"
                                title="Logout"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </header>

                <main className="flex-grow p-4 md:p-8 overflow-x-hidden pt-20 md:pt-8">
                    <div className="max-w-7xl mx-auto w-full animate-fade-in">
                        {children}
                    </div>
                </main>

            </div>
        </div>
    );
}
