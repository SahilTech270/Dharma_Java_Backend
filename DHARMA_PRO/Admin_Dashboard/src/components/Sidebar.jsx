import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export default function Sidebar({ isOpen, toggleSidebar, templeId }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Dynamic Menu Items based on context
    const menuItems = templeId ? [
        { title: 'Dashboard', path: `/temple/${templeId}/dashboard` },
        { title: 'Slot Management', path: `/temple/${templeId}/slots` },
        { title: 'Interactive Map', path: `/temple/${templeId}/heatmap` },
        { title: 'Parking', path: `/temple/${templeId}/parking` },
        { title: 'Surveillance', path: `/temple/${templeId}/camera` },
        { title: 'SarimaX', path: `/temple/${templeId}/sarimax` },
        { title: 'SarimaX', path: `/temple/${templeId}/sarimax` },
        { title: 'Switch Temple', path: '/select-temple' },
    ] : [
        { title: 'Select Temple', path: '/select-temple' },
        { title: 'Add Staff', path: '/add-yourself' },
    ];

    return (
        <aside
            className={`fixed top-0 left-0 z-40 h-screen transition-all duration-300 ease-in-out bg-white/95 backdrop-blur-xl border-r border-slate-200/60 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                } md:translate-x-0 w-72 shadow-[4px_0_24px_rgba(0,0,0,0.02)]`}
        >
            {/* Decorative Top Pattern */}
            <div className="h-1 bg-gradient-to-r from-orange-500 via-red-500 to-orange-500"></div>

            {/* Background Pattern */}


            <div className="h-full px-6 py-8 overflow-y-auto flex flex-col relative z-10">
                {/* Brand */}
                <div className="flex items-center gap-4 mb-10 px-2 cursor-pointer group" onClick={() => navigate('/')}>

                    <div>
                        <h1 className="text-2xl font-bold text-slate-900 tracking-tight leading-none group-hover:text-orange-600 transition-colors font-sans">
                            Dharma
                        </h1>
                        <span className="text-[10px] font-bold text-orange-600 uppercase tracking-[0.25em] mt-1 block">
                            Admin Panel
                        </span>
                    </div>
                </div>

                {/* Navigation */}
                <ul className="space-y-2 font-medium flex-1">
                    {menuItems.map((item) => {
                        const isActive = location.pathname === item.path;
                        return (
                            <li key={item.path}>
                                <button
                                    onClick={() => navigate(item.path)}
                                    className={`flex items-center w-full p-3.5 rounded-xl transition-all duration-300 group relative overflow-hidden ${isActive
                                        ? 'bg-gradient-to-r from-orange-50 to-white text-orange-700 shadow-sm border border-orange-100'
                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                        }`}
                                >
                                    {isActive && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 h-6 w-1 bg-orange-500 rounded-r-full shadow-[0_0_12px_rgba(249,115,22,0.6)]"></div>
                                    )}
                                    <span className={`text-xl transition-transform duration-300 group-hover:scale-110 ${isActive ? 'scale-110 text-orange-600' : 'text-slate-400 group-hover:text-slate-600'}`}>

                                    </span>
                                    <span className={`ml-3.5 font-semibold tracking-wide text-[15px] ${isActive ? 'translate-x-1' : ''} transition-transform duration-300`}>
                                        {item.title}
                                    </span>
                                    {isActive && (
                                        <div className="absolute inset-0 bg-orange-500/5 pointer-events-none"></div>
                                    )}
                                </button>
                            </li>
                        );
                    })}
                </ul>

                {/* Bottom Section */}
                <div className="mt-auto pt-6 border-t border-slate-100">
                    <div className="flex items-center gap-3 p-3 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer group">

                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-slate-800 truncate group-hover:text-orange-700 transition-colors">
                                Admin User
                            </p>
                            <p className="text-xs text-slate-500 font-medium truncate">
                                View Profile
                            </p>
                        </div>
                        <span className="text-slate-300 group-hover:text-orange-400 transition-colors">›</span>
                    </div>
                </div>
            </div>
        </aside>
    );
}
