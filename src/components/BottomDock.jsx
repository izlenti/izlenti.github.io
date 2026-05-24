import React from 'react';
import { Home, Heart, Sparkles, Film, Tv } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const BottomDock = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    // Ana Sayfa ortada (index 2) olacak şekilde sıralandı
    const menuItems = [
        { id: 'movie', icon: <Film className="w-[20px] h-[20px]" />, label: 'Filmler', path: '/category/movie?type=movie' },
        { id: 'tv', icon: <Tv className="w-[20px] h-[20px]" />, label: 'Diziler', path: '/category/tv?type=tv' },
        { id: 'home', icon: <Home className="w-[26px] h-[26px]" />, label: 'Ana Sayfa', path: '/', isCenter: true },
        { id: 'trending', icon: <Sparkles className="w-[20px] h-[20px]" />, label: 'Gündem', path: '/category/trending?type=mixed' },
        { id: 'watchlist', icon: <Heart className="w-[20px] h-[20px]" />, label: 'Listem', path: '/watchlist' },
    ];

    const handleItemClick = (path) => {
        navigate(path);
    };

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
            <div className="bg-gradient-to-r from-cyan-950/80 via-blue-950/80 to-purple-950/80 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.5),_inset_0_1px_1px_rgba(255,255,255,0.2)] p-2 px-3 relative overflow-hidden ring-1 ring-cyan-500/20">

                {/* Arka plan parıltısı */}
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/10 via-transparent to-purple-500/10 animate-pulse pointer-events-none"></div>

                <div className="flex items-center justify-between w-full relative z-10">
                    {menuItems.map((item) => {
                        const isActive = isPathActive(item.path, location.pathname, currentType);

                        // Merkez Ana Sayfa — daha büyük, yükseltilmiş
                        if (item.isCenter) {
                            return (
                                <button
                                    key={item.id}
                                    onClick={() => handleItemClick(item.path)}
                                    className="relative flex flex-col items-center justify-center -mt-6"
                                >
                                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-xl transition-all duration-300 ${
                                        isActive
                                            ? 'bg-gradient-to-br from-cyan-500 to-purple-600 shadow-cyan-500/60 scale-110'
                                            : 'bg-gradient-to-br from-cyan-700 to-purple-800 shadow-black/50 hover:scale-105'
                                    }`}>
                                        <div className={`text-white transition-all duration-300 ${isActive ? 'drop-shadow-[0_0_8px_rgba(255,255,255,0.9)]' : ''}`}>
                                            {item.icon}
                                        </div>
                                    </div>
                                    <span className={`text-[9px] font-bold mt-1 transition-all ${isActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                                        {item.label}
                                    </span>
                                    {isActive && (
                                        <div className="absolute -bottom-1 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" />
                                    )}
                                </button>
                            );
                        }

                        // Normal sekmeler
                        return (
                            <button
                                key={item.id}
                                onClick={() => handleItemClick(item.path)}
                                className={`relative flex flex-col items-center justify-center p-1.5 min-w-[52px] transition-all duration-500 group ${isActive ? 'text-white' : 'text-slate-400 hover:text-slate-200'}`}
                            >
                                <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-2xl blur-md transition-all duration-300 ${isActive ? 'opacity-100 scale-100' : 'opacity-0 scale-50'}`} />
                                <div className={`absolute inset-1 bg-gradient-to-b from-white/10 to-transparent rounded-2xl transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />

                                <div className={`relative z-10 transition-all duration-500 ease-out ${isActive ? '-translate-y-2' : 'group-active:scale-90 group-hover:-translate-y-1'}`}>
                                    <div className={`${isActive ? 'filter drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : ''}`}>
                                        {item.icon}
                                    </div>
                                </div>

                                <span className={`text-[9px] font-bold tracking-wide transition-all duration-500 absolute bottom-1 ${isActive ? 'opacity-100 translate-y-0 text-cyan-50' : 'opacity-0 translate-y-2'}`}>
                                    {item.label}
                                </span>

                                {isActive && (
                                    <div className="absolute -bottom-1 w-1.5 h-1.5 bg-cyan-400 rounded-full shadow-[0_0_10px_rgba(34,211,238,1)]" />
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
