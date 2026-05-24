import React from 'react';

const Footer = () => {
    return (
        <footer className="border-t border-white/5 bg-[#020617]/90 backdrop-blur-md relative z-10 mt-auto">
            <div className="max-w-6xl mx-auto px-4 pt-5 pb-24 md:pb-5">
                <div className="flex flex-col md:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <img
                            src="https://www.themoviedb.org/assets/2/v4/logos/v2/blue_short-8e7b30f73a4020692ccca9c88bafe5dcb6f8a62a4c6bc55cd9ba82bb2cd95f6c.svg"
                            alt="TMDB Logo"
                            className="h-4 opacity-60"
                        />
                        <span className="text-[10px] text-slate-600 leading-tight">
                            This product uses the TMDB API but is not endorsed or certified by TMDB.
                        </span>
                    </div>

                    {/* Tasarımcı Adı */}
                    <div className="flex flex-col items-center md:items-end gap-0.5">
                        <span className="text-[10px] text-slate-500">Tasarım & Geliştirme</span>
                        <span className="text-xs font-bold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-purple-400 tracking-wide">
                            Mustafa Alper TEYMUR
                        </span>
                    </div>

                    <div className="text-[10px] text-slate-700">
                        İzlenti © 2026
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
