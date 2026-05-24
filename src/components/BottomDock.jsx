import React from 'react';
import { Home, Heart, Sparkles, Film, Tv } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const BottomDock = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Ana Sayfa ortada, hepsi aynı satırda
    const menuItems = [
        { id: 'movie', icon: <Film />, label: 'Filmler', path: '/category/movie?type=movie' },
        { id: 'tv', icon: <Tv />, label: 'Diziler', path: '/category/tv?type=tv' },
        { id: 'home', icon: <Home />, label: 'Ana Sayfa', path: '/', isCenter: true },
        { id: 'trending', icon: <Sparkles />, label: 'Gündem', path: '/category/trending?type=mixed' },
        { id: 'watchlist', icon: <Heart />, label: 'Listem', path: '/watchlist' },
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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-[96%] max-w-sm">
            <div className="bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-purple-950/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.6)] px-2 py-2 ring-1 ring-cyan-500/20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-[32px] pointer-events-none" />
                <div className="flex items-end justify-around w-full relative z-10">
                    {menuItems.map((item) => {
                        const isActive = isPathActive(item.path, location.pathname, currentType);
                        const isCenter = item.isCenter;
                        const iconSize = isCenter ? 'w-7 h-7' : 'w-5 h-5';

                        return (
                            <button
                                key={item.id}
                                onClick={() => navigate(item.path)}
                                className={`flex flex-col items-center justify-end gap-0.5 px-2 py-1.5 rounded-2xl transition-all duration-300 group
                                    ${isCenter
                                        ? 'pb-2'
                                        : ''
                                    }
                                    ${isActive ? 'text-white' : 'text-slate-400'}
                                `}
                            >
                                {/* İkon Wrapper */}
                                <div className={`relative flex items-center justify-center transition-all duration-300
                                    ${isCenter
                                        ? `w-12 h-12 rounded-full shadow-lg ${isActive
                                            ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-cyan-500/50 scale-110'
                                            : 'bg-gradient-to-br from-cyan-700/80 to-purple-800/80 group-hover:scale-110'
                                          }`
                                        : `group-hover:scale-125 group-hover:-translate-y-1 ${isActive ? '-translate-y-1 scale-110' : ''}`
                                    }
                                `}>
                                    {/* Aktif glow (merkez dışı) */}
                                    {!isCenter && isActive && (
                                        <div className="absolute inset-0 bg-cyan-400/30 rounded-full blur-md scale-150" />
                                    )}
                                    <div className={`relative z-10 ${isActive && !isCenter ? 'drop-shadow-[0_0_6px_rgba(34,211,238,0.9)]' : ''} ${isActive && isCenter ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.8)]' : ''}`}>
                                        {React.cloneElement(item.icon, { className: iconSize })}
                                    </div>
                                </div>

                                {/* Label */}
                                <span className={`text-[9px] font-bold leading-none transition-all duration-200
                                    ${isCenter
                                        ? (isActive ? 'text-cyan-300' : 'text-slate-300')
                                        : (isActive ? 'text-cyan-300 opacity-100' : 'text-slate-500 opacity-0 group-hover:opacity-100')
                                    }
                                `}>
                                    {item.label}
                                </span>

                                {/* Aktif nokta */}
                                {isActive && (
                                    <div className="w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,1)] mt-0.5" />
                                )}
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default BottomDock;
