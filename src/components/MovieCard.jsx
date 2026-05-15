import React from 'react';
import { Film, Heart } from 'lucide-react';
import { IMAGE_BASE_URL } from '../lib/constants.jsx';
import { useNavigate } from 'react-router-dom';
import { getAIBadge } from '../lib/utils';

const MovieCard = ({ movie, toggleWatchlist, isInWatchlist }) => {
    const navigate = useNavigate();

    const handleSelect = () => {
        const type = movie.media_type === 'tv' ? 'tv' : 'movie';
        navigate(`/${type}/${movie.id}`);
    };

    const isAdded = isInWatchlist(movie.id);

    return (
        <div
            onClick={handleSelect}
            className="bg-white/5 backdrop-blur-sm rounded-xl overflow-hidden cursor-pointer hover:scale-[1.03] hover:shadow-2xl hover:shadow-cyan-900/30 transition duration-300 group border border-white/10 flex flex-col hover:border-cyan-500/50"
        >
            <div className="aspect-[2/3] relative overflow-hidden bg-slate-900">
                {movie.poster_path ? (
                    <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} alt={movie.title || movie.name} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center text-slate-600"><Film className="w-10 h-10" /></div>
                )}

                <div className={`absolute top-2 right-2 backdrop-blur-md text-white text-[9px] font-bold px-2 py-1 rounded-md border border-white/10 uppercase tracking-wider ${movie.media_type === 'tv' ? 'bg-cyan-600/90' : 'bg-slate-900/90'}`}>
                    {movie.media_type === 'tv' ? 'DİZİ' : 'FİLM'}
                </div>

                {/* Watchlist Heart Icon */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleWatchlist(movie);
                    }}
                    className={`absolute top-2 left-2 p-1.5 rounded-full backdrop-blur-md bg-black/40 hover:bg-black/60 transition opacity-0 group-hover:opacity-100 ${isAdded ? 'opacity-100' : ''}`}
                    title={isAdded ? 'Listeden çıkar' : 'Listeye ekle'}
                >
                    <Heart className={`w-4 h-4 transition ${isAdded ? 'fill-red-500 text-red-500' : 'text-white'}`} />
                </button>

                {movie.vote_average > 0 && (() => {
                    const badge = getAIBadge(movie.vote_average, movie.vote_count);
                    return (
                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black to-transparent p-3 pt-12 flex items-end">
                            <div className={`flex items-center gap-1.5 ${badge.color} text-[11px] bg-black/40 backdrop-blur-md px-2 py-1 rounded-md border border-white/10 shadow-lg`}>
                                <span>{badge.icon}</span> <span>YZ: {badge.text}</span>
                            </div>
                        </div>
                    );
                })()}
            </div>
            <div className="p-4 flex-1 flex flex-col justify-end bg-[#0f172a]">
                <h3 className="font-bold text-sm text-slate-200 line-clamp-2 leading-tight group-hover:text-cyan-400 transition">{movie.title || movie.name}</h3>
                <p className="text-[10px] text-slate-500 mt-2 font-medium">{(movie.release_date || movie.first_air_date || '????').substring(0, 4)}</p>
            </div>
        </div>
    );
};

export default MovieCard;
