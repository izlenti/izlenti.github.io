import React from 'react';
import { Home, Heart, Sparkles, Film, Tv } from 'lucide-react';
import { useNavigate, useLocation, useSearchParams } from 'react-router-dom';

const BottomDock = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [searchParams] = useSearchParams();

    const sideItems = [
        [
            { id: 'movie', icon: <Film className="w-[20px] h-[20px]" />, label: 'Filmler', path: '/category/movie?type=movie' },
            { id: 'tv', icon: <Tv className="w-[20px] h-[20px]" />, label: 'Diziler', path: '/category/tv?type=tv' },
        ],
        [
            { id: 'trending', icon: <Sparkles className="w-[20px] h-[20px]" />, label: 'Gündem', path: '/category/trending?type=mixed' },
            { id: 'watchlist', icon: <Heart className="w-[20px] h-[20px]" />, label: 'Listem', path: '/watchlist' },
        ]
    ];
    const centerItem = { id: 'home', icon: <Home className="w-[28px] h-[28px]" />, label: 'Ana Sayfa', path: '/' };

    const isPathActive = (itemPath, currentPath, currentType) => {
        if (itemPath === '/') return currentPath === '/';
        const urlObj = new URL(itemPath, window.location.origin);
        if (currentPath !== urlObj.pathname) return false;
        const itemType = urlObj.searchParams.get('type');
        if (itemType && currentType !== itemType) return false;
        return true;
    };

    const currentType = searchParams.get('type');

    const renderItem = (item) => {
        const isActive = isPathActive(item.path, location.pathname, currentType);
        return (
            <button
                key={item.id}
                onClick={() => navigate(item.path)}
                className={`relative flex flex-col items-center justify-center p-1.5 min-w-[52px] transition-all duration-300 group ${isActive ? 'text-white' : 'text-slate-400'}`}
            >
                <div className={`absolute inset-0 bg-gradient-to-br from-cyan-500/30 to-purple-500/30 rounded-2xl blur-md transition-all duration-300 ${isActive ? 'opacity-100' : 'opacity-0'}`} />
                <div className={`relative z-10 transition-all duration-300 ${isActive ? '-translate-y-1 drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]' : 'group-active:scale-90'}`}>
                    {item.icon}
                </div>
                <span className={`text-[9px] font-bold mt-0.5 transition-all ${isActive ? 'text-cyan-300' : 'text-slate-500'}`}>
                    {item.label}
                </span>
                {isActive && <div className="absolute -bottom-1.5 w-1 h-1 bg-cyan-400 rounded-full shadow-[0_0_6px_rgba(34,211,238,1)]" />}
            </button>
        );
    };

    const isCenterActive = isPathActive(centerItem.path, location.pathname, currentType);

    return (
        /* Wrapper: overflow-visible, center button baskın çıkabilsin */
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[9999] md:hidden w-[96%] max-w-sm">
            {/* Merkez Ana Sayfa butonu — dock'un ÜSTÜNDE, bağımsız konumda */}
            <div className="absolute left-1/2 -translate-x-1/2 -top-7 z-20">
                <button
                    onClick={() => navigate(centerItem.path)}
                    className={`flex flex-col items-center gap-0.5`}
                >
                    <div className={`w-14 h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-300 border-2 ${
                        isCenterActive
                            ? 'bg-gradient-to-br from-cyan-400 to-purple-600 border-cyan-400/60 shadow-cyan-500/50 scale-110'
                            : 'bg-gradient-to-br from-cyan-700 to-purple-800 border-white/10 shadow-black/60'
                    }`}>
                        <div className={`text-white ${isCenterActive ? 'drop-shadow-[0_0_10px_rgba(255,255,255,0.9)]' : ''}`}>
                            {centerItem.icon}
                        </div>
                    </div>
                    <span className={`text-[9px] font-bold ${isCenterActive ? 'text-cyan-300' : 'text-slate-400'}`}>
                        {centerItem.label}
                    </span>
                </button>
            </div>

            {/* Dock bar */}
            <div className="bg-gradient-to-r from-cyan-950/90 via-blue-950/90 to-purple-950/90 backdrop-blur-2xl border border-white/10 rounded-[32px] shadow-[0_20px_50px_rgba(0,0,0,0.6),_inset_0_1px_1px_rgba(255,255,255,0.15)] px-3 py-2 relative ring-1 ring-cyan-500/20">
                <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-r from-cyan-500/5 via-transparent to-purple-500/5 rounded-[32px] pointer-events-none" />

                <div className="flex items-center justify-between w-full">
                    {/* Sol 2 */}
                    {sideItems[0].map(renderItem)}

                    {/* Ortada boş alan — center button için yer tutar */}
                    <div className="w-14" />

                    {/* Sağ 2 */}
                    {sideItems[1].map(renderItem)}
                </div>
            </div>
        </div>
    );
};

export default BottomDock;
