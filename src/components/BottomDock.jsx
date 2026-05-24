import React from 'react';
import { Home, Heart, Sparkles, Film, Tv } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const BottomDock = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const menuItems = [
        { id: 'movie', icon: Film, label: 'Filmler', path: '/category/movie?type=movie' },
        { id: 'tv', icon: Tv, label: 'Diziler', path: '/category/tv?type=tv' },
        { id: 'home', icon: Home, label: 'Ana Sayfa', path: '/', isCenter: true },
        { id: 'trending', icon: Sparkles, label: 'Gündem', path: '/category/trending?type=mixed' },
        { id: 'watchlist', icon: Heart, label: 'Listem', path: '/watchlist' },
    ];

    const isPathActive = (itemPath, currentPath, currentType) => {
        if (itemPath === '/') return currentPath === '/';
        const urlObj = new URL(itemPath, window.location.origin);
        if (currentPath !== urlObj.pathname) return false;
        const itemType = urlObj.searchParams.get('type');
        if (itemType && currentType !== itemType) return false;
        return true;
    };

    const currentType = searchParams.get('type');

    return (
        <div className="fixed bottom-2 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-auto">
            <div className="bg-[#0a0f1e]/95 backdrop-blur-xl border border-white/10 rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.6)] px-2.5 py-1 ring-1 ring-white/5">
                <div className="flex items-center gap-0.5">
                    {menuItems.map((item) => {
                        const isActive = isPathActive(item.path, location.pathname, currentType);
                        const Icon = item.icon;
                        const isCenter = item.isCenter;

                        if (isCenter) {
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => navigate(item.path)}
                                    className="flex flex-col items-center justify-center px-1.5 py-0.5 mx-0.5 transition-transform duration-200 active:scale-95"
                                >
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-md shadow-cyan-500/40 scale-105'
                                            : 'bg-gradient-to-br from-cyan-700/60 to-purple-800/60 hover:scale-120'
                                    }`}>
                                        <Icon className={`w-4 h-4 text-white ${isActive ? 'drop-shadow-[0_0_6px_rgba(255,255,255,0.7)]' : ''}`} />
                                    </div>
                                    <span className={`text-[7px] font-bold mt-0.5 transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-400'}`}>
                                        {item.label}
                                    </span>
                                </button>
                            );
                        }

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center px-2 py-0.5 rounded-full transition-all duration-200 active:scale-95
                                    ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                            >
                                <Icon className={`w-[15px] h-[15px] transition-all duration-200 ${
                                    isActive
                                        ? 'text-cyan-400 drop-shadow-[0_0_5px_rgba(34,211,238,0.7)]'
                                        : 'hover:text-slate-300'
                                }`} />
                                <span className={`text-[7px] font-bold mt-0.5 transition-colors duration-200 ${isActive ? 'text-cyan-400' : 'text-slate-500'}`}>
                                    {item.label}
                                </span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BottomDock;
