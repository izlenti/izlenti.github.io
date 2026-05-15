import React, { useState } from 'react';
import { Dice5, Film, Tv, Shuffle, X, PlayCircle, Star, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL, BACKDROP_BASE_URL } from '../lib/constants.jsx';
import { fetchRandomPick } from '../lib/api';
import { getAIBadge } from '../lib/utils';

// Film türleri (TMDB genre IDs)
const MOVIE_GENRES = [
    { id: null, name: 'Karışık', icon: '🎲' },
    { id: 28, name: 'Aksiyon', icon: '💥' },
    { id: 35, name: 'Komedi', icon: '😂' },
    { id: 18, name: 'Dram', icon: '🎭' },
    { id: 27, name: 'Korku', icon: '👻' },
    { id: 878, name: 'Bilim Kurgu', icon: '🚀' },
    { id: 10749, name: 'Romantik', icon: '💕' },
    { id: 53, name: 'Gerilim', icon: '⚡' },
    { id: 16, name: 'Animasyon', icon: '🎨' },
    { id: 12, name: 'Macera', icon: '🗺️' },
    { id: 80, name: 'Suç', icon: '🔍' },
    { id: 99, name: 'Belgesel', icon: '📹' },
    { id: 14, name: 'Fantastik', icon: '✨' },
];

// Dizi türleri (TMDB TV genre IDs)
const TV_GENRES = [
    { id: null, name: 'Karışık', icon: '🎲' },
    { id: 10759, name: 'Aksiyon & Macera', icon: '💥' },
    { id: 35, name: 'Komedi', icon: '😂' },
    { id: 18, name: 'Dram', icon: '🎭' },
    { id: 80, name: 'Suç', icon: '🔍' },
    { id: 10765, name: 'Bilim Kurgu & Fantazi', icon: '🚀' },
    { id: 16, name: 'Animasyon', icon: '🎨' },
    { id: 10764, name: 'Reality', icon: '📺' },
    { id: 99, name: 'Belgesel', icon: '📹' },
    { id: 10751, name: 'Aile', icon: '👨‍👩‍👧‍👦' },
];

const RandomPicker = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [mediaType, setMediaType] = useState('all'); // 'all', 'movie', 'tv'
    const [selectedGenre, setSelectedGenre] = useState(null);
    const [pick, setPick] = useState(null);
    const [loading, setLoading] = useState(false);
    const [rolling, setRolling] = useState(false);

    const currentGenres = mediaType === 'tv' ? TV_GENRES : (mediaType === 'movie' ? MOVIE_GENRES : MOVIE_GENRES);

    const handleRoll = async () => {
        setRolling(true);
        setLoading(true);
        setPick(null);

        // Zar atma animasyonu için kısa bekleme
        await new Promise(r => setTimeout(r, 800));

        try {
            const result = await fetchRandomPick(mediaType, selectedGenre);
            setPick(result);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
            setTimeout(() => setRolling(false), 300);
        }
    };

    const handleGoToDetail = () => {
        if (!pick) return;
        const type = pick.media_type === 'tv' ? 'tv' : 'movie';
        onClose();
        navigate(`/${type}/${pick.id}`);
    };

    if (!isOpen) return null;

    const badge = pick ? getAIBadge(pick.vote_average, pick.vote_count) : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-in fade-in duration-300">
            {/* Backdrop */}
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" onClick={onClose} />

            {/* Modal */}
            <div className="relative w-full max-w-lg bg-gradient-to-br from-[#0f172a] via-[#1e1b4b] to-[#0f172a] rounded-3xl border border-white/10 shadow-2xl shadow-purple-900/30 overflow-hidden animate-in zoom-in-95 duration-500 max-h-[90vh] overflow-y-auto">
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-20 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition"
                >
                    <X className="w-5 h-5" />
                </button>

                {/* Header */}
                <div className="relative p-6 pb-4 text-center">
                    <div className="absolute inset-0 bg-gradient-to-b from-purple-600/20 via-transparent to-transparent pointer-events-none" />
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 shadow-lg shadow-purple-500/30 ${rolling ? 'animate-bounce' : ''}`}>
                        <Dice5 className={`w-8 h-8 text-white ${rolling ? 'animate-spin' : ''}`} />
                    </div>
                    <h2 className="text-2xl font-black text-white mb-1">Akşama Ne İzleyelim?</h2>
                    <p className="text-sm text-slate-400">Rastgele bir öneri için zarı at!</p>
                </div>

                {/* Media Type Tabs */}
                <div className="px-6 mb-4">
                    <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
                        <button
                            onClick={() => { setMediaType('all'); setSelectedGenre(null); setPick(null); }}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mediaType === 'all' ? 'bg-gradient-to-r from-cyan-600 to-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Shuffle className="w-3.5 h-3.5" /> Karışık
                        </button>
                        <button
                            onClick={() => { setMediaType('movie'); setSelectedGenre(null); setPick(null); }}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mediaType === 'movie' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Film className="w-3.5 h-3.5" /> Film
                        </button>
                        <button
                            onClick={() => { setMediaType('tv'); setSelectedGenre(null); setPick(null); }}
                            className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${mediaType === 'tv' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                        >
                            <Tv className="w-3.5 h-3.5" /> Dizi
                        </button>
                    </div>
                </div>

                {/* Genre Pills */}
                <div className="px-6 mb-5">
                    <p className="text-[10px] text-slate-500 uppercase tracking-widest font-bold mb-2">Tür Filtresi (Opsiyonel)</p>
                    <div className="flex flex-wrap gap-2">
                        {currentGenres.map((genre) => (
                            <button
                                key={genre.id ?? 'all'}
                                onClick={() => { setSelectedGenre(genre.id); setPick(null); }}
                                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 ${selectedGenre === genre.id
                                    ? 'bg-gradient-to-r from-cyan-500 to-purple-500 text-white shadow-md shadow-purple-500/20 scale-105'
                                    : 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5'
                                    }`}
                            >
                                <span>{genre.icon}</span> {genre.name}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Roll Button */}
                <div className="px-6 mb-6">
                    <button
                        onClick={handleRoll}
                        disabled={loading}
                        className="w-full py-4 rounded-2xl bg-gradient-to-r from-purple-600 via-pink-600 to-orange-500 hover:from-purple-500 hover:via-pink-500 hover:to-orange-400 text-white font-black text-lg transition-all shadow-lg shadow-purple-900/50 hover:shadow-xl hover:shadow-purple-900/60 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 hover:scale-[1.02] active:scale-[0.98]"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="w-6 h-6 animate-spin" />
                                <span>Seçiliyor...</span>
                            </>
                        ) : (
                            <>
                                <Dice5 className="w-6 h-6" />
                                <span>🎲 Zarı At!</span>
                            </>
                        )}
                    </button>
                </div>

                {/* Result Card */}
                {pick && (
                    <div className="px-6 pb-6 animate-in slide-in-from-bottom-4 fade-in duration-500">
                        <div className="bg-white/5 rounded-2xl border border-white/10 overflow-hidden">
                            {/* Backdrop */}
                            {pick.backdrop_path && (
                                <div className="relative h-40 overflow-hidden">
                                    <img
                                        src={`${BACKDROP_BASE_URL}${pick.backdrop_path}`}
                                        alt=""
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a] to-transparent" />
                                    <div className="absolute bottom-3 left-3">
                                        <span className={`text-[10px] font-bold px-2 py-1 rounded-md ${pick.media_type === 'tv' ? 'bg-purple-600' : 'bg-cyan-600'} text-white uppercase`}>
                                            {pick.media_type === 'tv' ? '📺 Dizi' : '🎬 Film'}
                                        </span>
                                    </div>
                                </div>
                            )}

                            <div className="p-5 flex gap-4">
                                {/* Poster */}
                                {pick.poster_path && (
                                    <img
                                        src={`${IMAGE_BASE_URL}${pick.poster_path}`}
                                        alt={pick.title || pick.name}
                                        className="w-24 h-36 object-cover rounded-xl shadow-lg border border-white/10 -mt-14 relative z-10 shrink-0"
                                    />
                                )}

                                <div className="flex-1 min-w-0">
                                    <h3 className="text-lg font-black text-white mb-1 leading-tight">{pick.title || pick.name}</h3>
                                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                                        <span className="text-xs text-slate-400">{(pick.release_date || pick.first_air_date || '').substring(0, 4)}</span>
                                        {badge && (
                                            <span className={`text-xs flex items-center gap-1 ${badge.color}`}>
                                                {badge.icon} {badge.text}
                                            </span>
                                        )}
                                        {pick.vote_average > 0 && (
                                            <span className="flex items-center gap-1 text-yellow-400 text-xs">
                                                <Star className="w-3 h-3 fill-yellow-400" /> {pick.vote_average.toFixed(1)}
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">{pick.overview || 'Konu özeti bulunamadı.'}</p>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="px-5 pb-5 flex gap-3">
                                <button
                                    onClick={handleGoToDetail}
                                    className="flex-1 bg-cyan-600 hover:bg-cyan-500 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition shadow-lg shadow-cyan-900/40"
                                >
                                    <PlayCircle className="w-4 h-4" /> Detayına Git
                                </button>
                                <button
                                    onClick={handleRoll}
                                    disabled={loading}
                                    className="flex-1 bg-white/10 hover:bg-white/20 text-white py-2.5 rounded-xl font-bold text-sm flex items-center justify-center gap-2 transition border border-white/10"
                                >
                                    <Shuffle className="w-4 h-4" /> Başka Seç
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* Decorative Footer */}
                {!pick && !loading && (
                    <div className="px-6 pb-6 text-center">
                        <div className="bg-white/5 rounded-xl p-4 border border-white/5">
                            <Sparkles className="w-5 h-5 text-purple-400 mx-auto mb-2" />
                            <p className="text-xs text-slate-500">Butona bas ve İzlenti sana popüler ve kaliteli yapımlar arasından rastgele bir öneri sunsun!</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default RandomPicker;
