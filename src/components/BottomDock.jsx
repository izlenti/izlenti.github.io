import React from 'react';
import { Home, Search, Heart, Sparkles, LayoutGrid } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

const BottomDock = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const menuItems = [
        { id: 'home', icon: <Home className="w-6 h-6" />, label: 'Ana Sayfa', path: '/' },
        { id: 'search', icon: <Search className="w-6 h-6" />, label: 'Ara', path: '/search' },
        { id: 'trending', icon: <Sparkles className="w-6 h-6" />, label: 'Gündem', path: '/category/trending' },
        { id: 'watchlist', icon: <Heart className="w-6 h-6" />, label: 'Listem', path: '/watchlist' },
    ];

    return (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-[95%] max-w-sm">
            {/* Glass Container - Windows 11 Style */}
            <div className="bg-[#202020]/90 backdrop-blur-2xl border border-white/20 rounded-2xl shadow-[0_0_50px_rgba(0,0,0,0.5)] flex items-center justify-around p-3 gap-2 ring-1 ring-white/10">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <button
                            key={item.id}
                            onClick={() => navigate(item.path)}
                            className={`relative group flex flex-col items-center justify-center p-2 rounded-xl transition-all duration-300 ${isActive ? 'bg-white/10 text-cyan-400' : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'}`}
                        >
                            {/* Hover Glow Effect */}
                            <div className="absolute inset-0 bg-cyan-500/20 rounded-xl opacity-0 group-hover:opacity-100 blur-lg transition-opacity duration-300" />

                            {/* Icon with scale animation */}
                            <div className={`relative z-10 transition-transform duration-300 ${isActive ? '-translate-y-1 scale-110' : 'group-hover:-translate-y-1 group-hover:scale-110'}`}>
                                {item.icon}
                            </div>

                            {/* Active Dot */}
                            {isActive && (
                                <div className="absolute bottom-1 w-1 h-1 bg-cyan-400 rounded-full animate-pulse" />
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
};

export default BottomDock;
