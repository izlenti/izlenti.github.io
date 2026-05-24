import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Film, Star, PlayCircle, Award, ExternalLink, Heart, Clock,
    Brain, ThumbsUp, ChevronRight, Loader2
} from 'lucide-react';
import { TMDB_API_KEY, TMDB_BASE_URL, IMAGE_BASE_URL, BACKDROP_BASE_URL, LOGO_BASE_URL } from '../lib/constants.jsx';
import { generateDeepAnalysis, translateText, getExternalLinks, getAIBadge, getReleaseStatus, formatTurkishDate } from '../lib/utils';

const DetailView = ({ toggleWatchlist, isInWatchlist }) => {
    const { type, id } = useParams(); // Expected route: /:type/:id
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [providers, setProviders] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [trailerKey, setTrailerKey] = useState(null);
    const [showTrailer, setShowTrailer] = useState(false);
    const [expandedReviews, setExpandedReviews] = useState({});

    useEffect(() => {
        const fetchDetails = async () => {
            setLoading(true);
            setError(null);
            try {
                const [detailRes, creditsRes, externalIdsRes, providersRes, recommendationsRes, keywordsRes, reviewsRes, videosRes] = await Promise.all([
                    fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=tr-TR`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/credits?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/external_ids?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/watch/providers?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/recommendations?api_key=${TMDB_API_KEY}&language=tr-TR`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/keywords?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/reviews?api_key=${TMDB_API_KEY}`),
                    fetch(`${TMDB_BASE_URL}/${type}/${id}/videos?api_key=${TMDB_API_KEY}`)
                ]);

                if (!detailRes.ok) throw new Error('Film/Dizi bulunamadı');

                const details = await detailRes.json();
                const credits = await creditsRes.json();
                const externalIds = await externalIdsRes.json();
                const providersData = await providersRes.json();
                const recommendationsData = await recommendationsRes.json();
                const keywordsData = await keywordsRes.json();
                const reviewsData = await reviewsRes.json();
                const videosData = await videosRes.json();

                // Process data
                const keywords = keywordsData.keywords || keywordsData.results || [];
                let reviews = reviewsData.results || [];

                // Trailer
                const trailers = videosData.results?.filter(v => v.site === 'YouTube' && v.type === 'Trailer') || [];
                setTrailerKey(trailers.length > 0 ? trailers[0].key : null);

                reviews = [];

                // Konu özeti yoksa İngilizce'den çek ve çevir
                if (!details.overview || details.overview.length < 20) {
                    try {
                        const enRes = await fetch(`${TMDB_BASE_URL}/${type}/${id}?api_key=${TMDB_API_KEY}&language=en-US`);
                        if (enRes.ok) {
                            const enData = await enRes.json();
                            if (enData.overview && enData.overview.length > 20) {
                                const translated = await translateText(enData.overview, 'en', 'tr');
                                details.overview = translated;
                            }
                        }
                    } catch (_) {/* çeviri başarısız olursa boş bırak */}
                }

                // Providers
                const trProviders = providersData.results?.TR;
                setProviders(trProviders?.flatrate || trProviders?.buy || trProviders?.rent || null);

                // Recommendations
                setRecommendations(recommendationsData.results?.slice(0, 5) || []);

                // Analysis
                const analysisObj = generateDeepAnalysis(details, credits, keywords, reviews, type);
                setAnalysis(analysisObj);

                setMovie({ ...details, media_type: type, external_ids: externalIds });

            } catch (err) {
                console.error(err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchDetails();
        window.scrollTo(0, 0);
    }, [id, type]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center py-32 space-y-4">
                <div className="relative">
                    <div className="absolute inset-0 bg-cyan-500 blur-xl opacity-20"></div>
                    <Loader2 className="w-16 h-16 text-cyan-400 animate-spin relative z-10" />
                </div>
                <p className="text-sm text-cyan-300 animate-pulse font-mono tracking-widest uppercase">Veriler Analiz Ediliyor...</p>
            </div>
        );
    }

    if (error || !movie || !analysis) {
        return (
            <div className="text-center py-20 text-slate-400 bg-white/5 rounded-2xl border border-dashed border-white/10 mt-8">
                <p>{error || "Bir hata oluştu"}</p>
                <button onClick={() => navigate('/')} className="mt-4 text-cyan-400 hover:text-white text-sm">Ana Sayfaya Dön</button>
            </div>
        );
    }

    const links = getExternalLinks(movie, type);

    return (
        <div className="animate-in zoom-in-95 duration-500 pb-20 relative">
            {/* Background */}
            {movie.backdrop_path && (
                <div className="fixed inset-0 z-0 animate-in fade-in duration-1000">
                    <img src={`${BACKDROP_BASE_URL}${movie.backdrop_path}`} alt="Backdrop" className="w-full h-full object-cover opacity-25 scale-105 blur-sm" />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/90 to-[#020617]/40"></div>
                </div>
            )}

            <div className="relative z-10">
                <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-slate-300 hover:text-white mb-8 text-sm transition bg-white/5 px-4 py-2 rounded-full border border-white/10 hover:bg-white/10 w-fit">
                    <ChevronRight className="w-4 h-4 rotate-180" /> Geri
                </button>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">

                    {/* LEFT COL: Poster & Platforms */}
                    <div className="lg:col-span-4 space-y-6">
                        {/* Poster — hover'da fragman overlay */}
                        <div
                            className={`relative rounded-2xl overflow-hidden shadow-2xl border border-white/10 group ${trailerKey ? 'cursor-pointer' : ''}`}
                            onClick={() => trailerKey && setShowTrailer(true)}
                        >
                            {movie.poster_path ? (
                                <img src={`${IMAGE_BASE_URL}${movie.poster_path}`} className="w-full object-cover transition-transform duration-500 group-hover:scale-105" alt="Poster" />
                            ) : (
                                <div className="w-full aspect-[2/3] bg-slate-800 flex items-center justify-center">
                                    <Film className="w-20 h-20 text-slate-600" />
                                </div>
                            )}

                            {/* Hover overlay — sadece fragman varsa */}
                            {trailerKey && (
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                                    <div className="bg-white/20 rounded-full p-4 backdrop-blur-sm">
                                        <PlayCircle className="w-14 h-14 text-white drop-shadow-lg" />
                                    </div>
                                    <span className="text-white font-bold text-base tracking-wide drop-shadow-lg">🎬 Fragmanı İzle</span>
                                </div>
                            )}

                            <div className={`absolute top-4 left-4 text-white text-xs font-bold px-3 py-1 rounded-md border border-white/10 shadow-lg ${type === 'tv' ? 'bg-cyan-600' : 'bg-slate-900'}`}>
                                {analysis.termCap}
                            </div>
                        </div>

                        {/* PLATFORM BİLGİSİ */}
                        <div className="bg-white/5 backdrop-blur-md rounded-2xl border border-white/10 p-5">
                            <h4 className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-4 flex items-center gap-2">
                                <PlayCircle className="w-4 h-4" /> Nerede İzlenir? (TR)
                            </h4>
                            {providers && providers.length > 0 ? (
                                <div className="flex flex-wrap gap-3">
                                    {providers.map((provider) => (
                                        <div key={provider.provider_id} className="group relative" title={provider.provider_name}>
                                            <img
                                                src={`${LOGO_BASE_URL}${provider.logo_path}`}
                                                alt={provider.provider_name}
                                                className="w-12 h-12 rounded-xl shadow-lg hover:scale-110 transition cursor-pointer"
                                            />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <p className="text-slate-500 text-xs">Dijital platform verisi bulunamadı.</p>
                            )}

                            {/* Watchlist Toggle Button (Large) */}
                            <button
                                onClick={() => toggleWatchlist(movie)}
                                className={`w-full mt-4 flex items-center justify-center gap-2 py-3 rounded-xl transition font-bold border ${isInWatchlist(movie.id)
                                    ? 'bg-red-500/20 text-red-500 border-red-500/50 hover:bg-red-500/30'
                                    : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
                                    }`}
                            >
                                <Heart className={`w-5 h-5 ${isInWatchlist(movie.id) ? 'fill-red-500' : ''}`} />
                                {isInWatchlist(movie.id) ? 'Listeden Çıkar' : 'İzleme Listeme Ekle'}
                            </button>
                        </div>

                        {/* ÖDÜL LİNKİ */}
                        <div className="bg-gradient-to-br from-amber-900/40 to-yellow-900/20 border border-amber-500/30 p-5 rounded-2xl relative overflow-hidden backdrop-blur-md">
                            <div className="absolute -right-4 -top-4 opacity-20"><Award className="w-24 h-24 text-amber-400" /></div>
                            <h4 className="text-amber-400 font-bold text-xs uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Award className="w-4 h-4" /> Ödüller
                            </h4>
                            <a href={links.awards} target="_blank" rel="noreferrer" className="flex items-center gap-1 text-xs text-amber-300 hover:text-white transition underline underline-offset-2">
                                IMDb Ödül Sayfası <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>

                    {/* RIGHT COL: Content */}
                    <div className="lg:col-span-8 space-y-8">
                        <div>
                            <h1 className="text-4xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-white to-slate-400 mb-2 tracking-tight leading-tight drop-shadow-lg">
                                {movie.title || movie.name}
                            </h1>
                            {(movie.original_title || movie.original_name) !== (movie.title || movie.name) && (
                                <p className="text-lg text-slate-400 mb-4 font-light italic">
                                    Orijinal: {movie.original_title || movie.original_name}
                                </p>
                            )}
                            <div className="flex flex-wrap items-center gap-3 text-sm text-slate-300 font-medium">
                                <span className="bg-white/10 border border-white/10 px-3 py-1 rounded-md" title={formatTurkishDate(movie.release_date || movie.first_air_date)}>{formatTurkishDate(movie.release_date || movie.first_air_date)}</span>
                                <span className="flex items-center gap-1.5 bg-white/5 px-3 py-1 rounded-md border border-white/5"><Clock className="w-3.5 h-3.5 text-cyan-400" /> {movie.runtime || (movie.episode_run_time ? movie.episode_run_time[0] : '?')} dk</span>
                                {(() => { const rs = getReleaseStatus(movie, type); return (<span className={`flex items-center gap-1.5 px-3 py-1 rounded-md border ${rs.bg} ${rs.color} font-bold text-xs`}>{rs.icon} {rs.label}</span>); })()}
                                {!analysis.isUnreleased && (
                                    <span className="flex items-center gap-1.5 bg-cyan-500/10 px-3 py-1 rounded-md border border-cyan-500/20" title="Yapay Zeka Onayı">
                                        <Brain className="w-3.5 h-3.5 text-cyan-400" />
                                        Yapay Zeka Analizli
                                    </span>
                                )}
                            </div>
                            {/* Sezon/Bölüm Bilgisi (Diziler) */}
                            {analysis.seasonInfo && (
                                <div className="flex flex-wrap items-center gap-2 mt-2 text-xs">
                                    <span className="bg-purple-500/10 border border-purple-500/20 text-purple-300 px-2.5 py-1 rounded-md font-bold">{analysis.seasonInfo.seasons} Sezon</span>
                                    <span className="bg-white/5 border border-white/5 text-slate-400 px-2.5 py-1 rounded-md">{analysis.seasonInfo.episodes} Bölüm</span>
                                    <span className={`px-2.5 py-1 rounded-md font-bold border ${analysis.seasonInfo.statusTr.includes('Devam') ? 'bg-green-500/10 border-green-500/20 text-green-400' : analysis.seasonInfo.statusTr.includes('İptal') ? 'bg-red-500/10 border-red-500/20 text-red-400' : 'bg-slate-500/10 border-slate-500/20 text-slate-400'}`}>{analysis.seasonInfo.statusTr}</span>
                                </div>
                            )}
                            <div className="flex flex-wrap gap-2 mt-3">
                                {movie.genres?.map(g => (
                                    <span key={g.id} className="text-xs text-slate-400 bg-white/5 px-2 py-1 rounded">{g.name}</span>
                                ))}
                            </div>
                        </div>

                        {/* Özet (Üstte, Öne Çıkarılmış) */}
                        <div className="relative bg-gradient-to-br from-white/5 to-transparent p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl overflow-hidden">
                            <div className="absolute -left-[1px] top-6 bottom-6 w-1 bg-gradient-to-b from-cyan-400 to-purple-500 rounded-r-full shadow-[0_0_10px_rgba(34,211,238,0.5)]"></div>
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03] pointer-events-none">
                                <Film className="w-40 h-40 text-white" />
                            </div>
                            <h3 className="text-cyan-400 font-black uppercase text-xs tracking-widest mb-4 flex items-center gap-2 relative z-10">
                                📖 Hikaye & Konu Özeti
                            </h3>
                            <div className="relative z-10 space-y-5">
                                <p className="text-slate-100 leading-relaxed font-light text-lg md:text-[1.15rem] md:leading-[1.8] drop-shadow-sm italic">
                                    "{analysis.epicSynopsis.text}"
                                </p>
                                <div className="p-4 bg-cyan-950/40 border border-cyan-500/20 rounded-2xl flex flex-col md:flex-row items-start gap-4 shadow-inner">
                                    <div className="bg-cyan-500/20 p-2.5 rounded-xl shrink-0"><Brain className="w-6 h-6 text-cyan-400" /></div>
                                    <p className="text-cyan-100 text-sm md:text-[0.95rem] leading-relaxed">
                                        <strong className="text-cyan-400 tracking-wide uppercase text-[10px] mb-1 block">Yapay Zeka Perspektifi</strong>
                                        {analysis.epicSynopsis.aiTouch}
                                    </p>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-6">
                            {/* ANA VERDİKT */}
                            <div className={`bg-gradient-to-r ${analysis.verdictClass} p-5 md:p-6 rounded-2xl shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-center gap-4`}>
                                <div className="absolute inset-0 bg-black/20"></div>
                                <div className="relative z-10 flex items-center gap-4">
                                    <div className="text-5xl">{analysis.verdictIcon}</div>
                                    <div className="text-left">
                                        <h2 className="text-2xl md:text-3xl font-black text-white tracking-tight leading-tight">{analysis.verdict}</h2>
                                        {analysis.runtime > 0 && (
                                            <div className="text-white/80 text-sm font-medium mt-1">
                                                Süre: {analysis.runtime} dk
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* VERDİKT AÇIKLAMASI */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-5">
                                <p className="text-slate-200 leading-relaxed">{analysis.verdictReason}</p>
                            </div>

                            {/* DETAYLI ANALİZ KARTI */}
                            <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-3xl p-8 space-y-6 shadow-2xl relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
                                    <Brain className="w-32 h-32 text-white" />
                                </div>

                                {/* HEDEF KİTLE */}
                                <div className="flex gap-4 relative z-10 bg-white/5 p-4 rounded-xl border border-white/10 items-start">
                                    <div className="text-3xl bg-black/20 p-2 rounded-lg">🎯</div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">{analysis.targetAudience?.title}</h4>
                                        <p className="text-slate-300 text-sm leading-relaxed">{analysis.targetAudience?.desc}</p>
                                    </div>
                                </div>

                                {/* --- YENİ AI ÖZELLİKLERİ --- */}

                                {/* 1. YZ İZLEYİCİ SKORU (Audience Score) */}
                                <div className="relative z-10 bg-slate-900/50 p-4 rounded-xl border border-cyan-500/30">
                                    <div className="flex justify-between items-end mb-2">
                                        <h4 className="text-cyan-400 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                                            <Brain className="w-4 h-4" /> YZ İzleyici Skoru
                                        </h4>
                                        <span className="text-2xl font-black text-cyan-300">{analysis.matchRate}%</span>
                                    </div>
                                    <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                                        <div
                                            className="h-full bg-gradient-to-r from-cyan-600 to-purple-500 relative"
                                            style={{ width: `${analysis.matchRate}%` }}
                                        >
                                            <div className="absolute inset-0 bg-white/30 animate-pulse"></div>
                                        </div>
                                    </div>
                                    <p className="text-[10px] text-slate-500 mt-2 text-right">Dünya genelindeki izleyici reaksiyonlarının AI tabanlı analizi</p>
                                </div>

                                {/* 2. PSİKOLOJİK PROFİL */}
                                {analysis.psychProfile && (
                                    <div className="relative z-10 grid grid-cols-2 gap-4">
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Ruh Hali</div>
                                            <div className="text-white font-bold">{analysis.psychProfile.mood}</div>
                                        </div>
                                        <div className="bg-white/5 p-3 rounded-xl border border-white/5 text-center">
                                            <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Dominant Özellik</div>
                                            <div className="text-white font-bold">{analysis.psychProfile.traits[0] || "Dengeli"}</div>
                                        </div>
                                        {analysis.psychProfile.warning && (
                                            <div className="col-span-2 bg-red-500/10 border border-red-500/20 p-3 rounded-xl flex items-center gap-3">
                                                <div className="text-xl">⚠️</div>
                                                <p className="text-xs text-red-200">{analysis.psychProfile.warning}</p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* ARTILAR VE EKSİLER */}
                                <div className="relative z-10">
                                    <div className="text-slate-200 leading-relaxed text-sm whitespace-pre-line">{analysis.prosAndCons}</div>
                                </div>

                                {/* SON SÖZ */}
                                <div className="relative z-10 border-t border-white/10 pt-6">
                                    <div className="bg-gradient-to-r from-cyan-500/10 to-purple-500/10 p-5 rounded-xl border border-cyan-500/20">
                                        <p className="text-cyan-200 text-base font-medium">💬 {analysis.finalWord}</p>
                                    </div>
                                </div>
                            </div>

                                {/* BÜTÇE-HASILAT (Filmler) */}
                                {analysis.budgetAnalysis && (
                                    <div className="relative z-10 bg-white/5 p-4 rounded-xl border border-white/10">
                                        <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-3 flex items-center gap-2">📊 Bütçe & Hasılat</h4>
                                        <div className="grid grid-cols-2 gap-3 mb-3">
                                            <div className="bg-black/20 p-3 rounded-lg text-center"><div className="text-[10px] text-slate-500 uppercase mb-1">Bütçe</div><div className="text-white font-black text-lg">{analysis.budgetAnalysis.budgetFormatted}</div></div>
                                            <div className="bg-black/20 p-3 rounded-lg text-center"><div className="text-[10px] text-slate-500 uppercase mb-1">Hasılat</div><div className="text-white font-black text-lg">{analysis.budgetAnalysis.revenueFormatted}</div></div>
                                        </div>
                                        {analysis.budgetAnalysis.roi && <div className="text-xs text-cyan-300 font-bold mb-1">ROI: {analysis.budgetAnalysis.roi}</div>}
                                        <p className="text-xs text-slate-400">{analysis.budgetAnalysis.verdict}</p>
                                    </div>
                                )}

                                {/* NE ZAMAN İZLENMELİ */}
                                <div className="relative z-10 bg-white/5 p-4 rounded-xl border border-white/10 flex items-start gap-3">
                                    <div className="text-3xl bg-black/20 p-2 rounded-lg">{analysis.watchTiming.icon}</div>
                                    <div>
                                        <h4 className="text-sm font-bold text-white mb-1">Ne Zaman İzlenmeli?</h4>
                                        <div className="text-cyan-400 font-bold text-xs mb-1">{analysis.watchTiming.title}</div>
                                        <p className="text-slate-400 text-xs">{analysis.watchTiming.desc}</p>
                                    </div>
                                </div>

                                {/* TEKRAR İZLEME DEĞERİ */}
                                <div className="relative z-10 bg-white/5 p-4 rounded-xl border border-white/10 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="text-2xl">{analysis.rewatchValue.icon}</div>
                                        <div><div className="text-xs text-slate-500 uppercase tracking-wider">Tekrar İzleme Değeri</div><div className="text-white font-bold">{analysis.rewatchValue.label}</div></div>
                                    </div>
                                    <div className="flex gap-1">{[...Array(10)].map((_, i) => <div key={i} className={`w-2 h-4 rounded-sm ${i < analysis.rewatchValue.score ? 'bg-cyan-500' : 'bg-white/10'}`} />)}</div>
                                </div>

                                {/* TEMATİK İÇGÖRÜ */}
                                {analysis.thematicInsight && (
                                    <div className="relative z-10 bg-gradient-to-r from-purple-500/10 to-cyan-500/10 p-4 rounded-xl border border-purple-500/20">
                                        <p className="text-purple-200 text-sm italic">🎭 {analysis.thematicInsight}</p>
                                    </div>
                                )}
                        </div>



                        {/* LINKS */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <a href={links.rottenTomatoes} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-red-500/10 hover:border-red-500/30 transition group">
                                <div className="flex items-center gap-3"><div className="bg-red-600 text-white font-bold text-[10px] p-2 rounded-lg">RT</div><div className="text-sm font-bold text-slate-300 group-hover:text-white">Rotten Tomatoes</div></div>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-red-400" />
                            </a>
                            <a href={links.imdb} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-yellow-500/10 hover:border-yellow-500/30 transition group">
                                <div className="flex items-center gap-3"><div className="bg-yellow-500 text-black font-bold text-[10px] p-2 rounded-lg">IMDb</div><div className="text-sm font-bold text-slate-300 group-hover:text-white">IMDb Sayfası</div></div>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-yellow-400" />
                            </a>
                            <a href={links.eksiSozluk} target="_blank" rel="noreferrer" className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5 hover:bg-green-600/10 hover:border-green-600/30 transition group">
                                <div className="flex items-center gap-3"><div className="bg-green-600 text-white font-bold text-[10px] p-2 rounded-lg">EKŞİ</div><div className="text-sm font-bold text-slate-300 group-hover:text-white">Sözlük Yorumları</div></div>
                                <ExternalLink className="w-4 h-4 text-slate-500 group-hover:text-green-400" />
                            </a>
                        </div>
                    </div>
                </div>

                {/* --- ÖNERİ SİSTEMİ --- */}
                {recommendations.length > 0 && (
                    <div className="mt-16 pt-8 border-t border-white/5 animate-in slide-in-from-bottom-10 duration-700">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <ThumbsUp className="w-6 h-6 text-cyan-400" />
                            Bunu Seven Şunları Da Sever (Öneriler)
                        </h3>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                            {recommendations.map((item) => (
                                <div
                                    key={item.id}
                                    onClick={() => navigate(`/${type}/${item.id}`)}
                                    className="group cursor-pointer"
                                >
                                    <div className="aspect-[2/3] rounded-xl overflow-hidden mb-3 border border-white/10 relative">
                                        {item.poster_path ? (
                                            <img src={`${IMAGE_BASE_URL}${item.poster_path}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-500" alt={item.title || item.name} />
                                        ) : (
                                            <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                                                <Film className="w-8 h-8 text-slate-600" />
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                            <PlayCircle className="w-10 h-10 text-white/80" />
                                        </div>
                                    </div>
                                    <h4 className="text-sm font-bold text-slate-300 group-hover:text-white truncate">{item.title || item.name}</h4>
                                    {item.vote_average > 0 && (() => {
                                        const badge = getAIBadge(item.vote_average);
                                        return (
                                            <div className={`flex items-center gap-1 text-xs ${badge.color}`}>
                                                <span>{badge.icon}</span> {badge.text}
                                            </div>
                                        );
                                    })()}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* TRAILER MODAL — viewport'un tam ortasında açılır, scroll yoktur */}
            {showTrailer && trailerKey && (
                <div
                    style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99999, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.95)' }}
                    onClick={() => setShowTrailer(false)}
                >
                    <div
                        style={{ position: 'relative', width: '95vw', maxWidth: '900px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowTrailer(false)}
                            style={{ position: 'absolute', top: '-40px', right: 0, color: 'rgba(255,255,255,0.8)', fontWeight: 'bold', fontSize: '14px', display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer' }}
                        >
                            <span>Kapat</span>
                            <span style={{ fontSize: '20px' }}>✕</span>
                        </button>
                        {/* 16:9 oranında video */}
                        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', borderRadius: '12px' }}
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                                title="Fragman"
                            />
                        </div>
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.3)', fontSize: '12px', marginTop: '10px' }}>Dışarıya tıklayarak kapat</p>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DetailView;
