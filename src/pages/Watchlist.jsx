import React from 'react';
import { Heart, Film } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { IMAGE_BASE_URL } from '../lib/constants.jsx';

const Watchlist = ({ watchlist, toggleWatchlist }) => {
    const navigate = useNavigate();

    return (
        <div className="animate-in fade-in duration-500 pb-20">
            <div className="mb-8">
                <h2 className="text-3xl font-black text-white mb-2 flex items-center gap-3">
                    <Heart className="w-8 h-8 text-red-500 fill-red-500" />
                    İzleme Listem
                </h2>
                <p className="text-slate-400">Favorilerinize eklediğiniz {watchlist.length} yapım</p>
            </div>

            {watchlist.length === 0 ? (
                <div className="text-center py-20">
                    <Heart className="w-20 h-20 text-slate-700 mx-auto mb-4" />
                    <p className="text-slate-500 text-lg mb-4">İzleme listesi boş</p>
                    <button
                        onClick={() => navigate('/')}
                        className="text-cyan-400 hover:text-white transition"
                    >
                        Keşfet →
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                    {watchlist.map((movie) => (
                        <div key={movie.id} className="group relative">
                            <div
                                className="aspect-[2/3] rounded-xl overflow-hidden shadow-lg border border-white/10 hover:border-cyan-500/50 transition cursor-pointer relative"
                                onClick={() => {
                                    const type = movie.media_type === 'tv' ? 'tv' : 'movie';
                                    navigate(`/${type}/${movie.id}`);
                                }}
                            >
                                {movie.poster_path ? (
                                    <img
                                        src={`${IMAGE_BASE_URL}${movie.poster_path}`}
                                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                                        alt={movie.title || movie.name}
                                    />
                                ) : (
                                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                        <Film className="w-12 h-12 text-slate-600" />
                                    </div>
                                )}

                                {/* Remove from watchlist button */}
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggleWatchlist(movie);
                                    }}
                                    className="absolute top-2 right-2 p-2 bg-black/60 hover:bg-red-600 rounded-full transition z-10"
                                    title="Listeden çıkar"
                                >
                                    <Heart className="w-4 h-4 text-white fill-white" />
                                </button>
                            </div>
                            <h3 className="mt-2 text-sm font-medium text-white line-clamp-2">
                                {movie.title || movie.name}
                            </h3>
                            <p className="text-xs text-slate-500">
                                {(movie.release_date || movie.first_air_date || '').substring(0, 4)}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default Watchlist;
