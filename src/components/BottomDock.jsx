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
        { id: 'home', icon: Home, label: 'Ana Sayfa', path: '/' },
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
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-[94vw] max-w-[390px] px-2">
            <div className="bg-[#070b16]/95 backdrop-blur-2xl border border-white/10 rounded-[2rem] shadow-[0_12px_40px_rgba(0,0,0,0.8)] px-4 py-2.5 ring-1 ring-white/5 relative">
                <div className="flex items-center justify-between gap-1 relative">
                    {menuItems.map((item) => {
                        const isActive = isPathActive(item.path, location.pathname, currentType);
                        const Icon = item.icon;
                        const isHome = item.id === 'home';

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-center py-1 transition-all duration-200 active:scale-95 shrink-0 w-12 group
                                    ${isActive ? 'text-white' : 'text-slate-500 hover:text-slate-400'}`}
                            >
                                <Icon className={`w-[17px] h-[17px] transition-all duration-200 ${
                                    isActive
                                        ? 'text-cyan-400 drop-shadow-[0_0_6px_rgba(34,211,238,0.7)]'
                                        : 'hover:text-slate-300'
                                } ${isHome ? 'group-hover:scale-125 duration-300' : 'group-hover:scale-110'}`} />
                                <span className={`text-[8.5px] font-bold mt-1 transition-colors duration-200 whitespace-nowrap ${isActive ? 'text-cyan-400' : 'text-slate-500 group-hover:text-slate-300'}`}>
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
