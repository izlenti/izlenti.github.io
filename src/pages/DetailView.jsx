import React, { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useParams, useNavigate } from 'react-router-dom';
import {
    Film, Star, PlayCircle, Award, ExternalLink, Heart, Clock,
    Brain, ThumbsUp, ChevronRight, Loader2, AlertTriangle, CheckCircle2, XCircle, Sparkles
} from 'lucide-react';
import { TMDB_API_KEY, TMDB_BASE_URL, IMAGE_BASE_URL, BACKDROP_BASE_URL, LOGO_BASE_URL } from '../lib/constants.jsx';
import { generateDeepAnalysis, translateText, getExternalLinks, getAIBadge, getReleaseStatus, formatTurkishDate } from '../lib/utils';
import { fetchGeminiReview, getGeminiVerdictStyle, getWatchRecStyle, getGeminiCriticAvatar } from '../lib/gemini';

const DetailView = ({ toggleWatchlist, isInWatchlist }) => {
    const { type, id } = useParams();
    const navigate = useNavigate();

    const [movie, setMovie] = useState(null);
    const [credits, setCredits] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [analysis, setAnalysis] = useState(null);
    const [geminiReview, setGeminiReview] = useState(null);
    const [geminiLoading, setGeminiLoading] = useState(false);
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

                // Analysis (fallback / yardımcı veriler)
                const analysisObj = generateDeepAnalysis(details, credits, keywords, reviews, type);
                setAnalysis(analysisObj);

                setMovie({ ...details, media_type: type, external_ids: externalIds });
                setCredits(credits);

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

    // Akıllı eleştirmen motorunu film ve ekip verileri hazır olduğunda tetikleyen reaktif useEffect
    useEffect(() => {
        if (!movie || !credits) {
            setGeminiReview(null);
            return;
        }

        setGeminiLoading(true);
        fetchGeminiReview(movie, credits, type)
            .then(result => {
                if (result.success) {
                    setGeminiReview(result.data);
                } else {
                    setGeminiReview(null);
                }
            })
            .catch(err => {
                console.error('[Gemini]', err);
                setGeminiReview(null);
            })
            .finally(() => setGeminiLoading(false));
    }, [movie, credits, type]);

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
        <div className="pb-20 relative">
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

                        {/* 📖 OBJEKTİF FİLM KONUSU */}
                        <div className="bg-white/5 border border-white/10 rounded-2xl p-5 md:p-6 space-y-3 relative overflow-hidden backdrop-blur-md">
                            <h3 className="text-slate-400 font-bold uppercase text-[10px] tracking-wider flex items-center gap-2">
                                📖 Objektif Konu Özeti
                            </h3>
                            <p className="text-slate-200 text-sm md:text-base leading-relaxed font-light">
                                {movie.overview || "Bu yapım hakkında henüz detaylı bir konu özeti bulunmamaktadır."}
                            </p>
                        </div>

                        {/* ============================================================ */}
                        {/* 🤖 İZLENTİ AI — GEMİNİ TABANLI GERÇEK YAPAY ZEKA ANALİZİ    */}
                        {/* ============================================================ */}
                        <div className="bg-[#030712]/90 backdrop-blur-2xl border border-cyan-500/20 rounded-[2rem] p-5 md:p-8 space-y-6 shadow-[0_20px_50px_rgba(0,0,0,0.8)] relative overflow-hidden ring-1 ring-white/5">
                            {/* Neon glow effects */}
                            <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none"></div>
                            <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-purple-500/10 rounded-full blur-[100px] pointer-events-none"></div>

                             {/* Header */}
                             <div className="flex items-center justify-between border-b border-white/10 pb-4 relative z-10">
                                 <div className="flex items-center gap-3">
                                     <div className="bg-gradient-to-tr from-cyan-500 to-purple-600 p-2.5 rounded-xl text-white shadow-lg shadow-cyan-500/20">
                                         <Sparkles className="w-5 h-5" />
                                     </div>
                                     <div>
                                         <h4 className="text-white font-black text-sm md:text-base tracking-wide uppercase">İZLENTİ AI YAPAY ZEKA ELEŞTİRİSİ</h4>
                                         <p className="text-[9px] text-cyan-400 font-mono tracking-widest uppercase mt-0.5 flex items-center gap-1.5">
                                             <span className={`w-1.5 h-1.5 rounded-full ${geminiLoading ? 'bg-amber-500 animate-ping' : geminiReview ? 'bg-emerald-500' : 'bg-slate-500'}`}></span>
                                             {geminiLoading ? 'YAPAY ZEKA ELEŞTİRMENİ DÜŞÜNÜYOR...' : 'YAPAY ZEKA ANALİZİ TAMAMLANDI'}
                                         </p>
                                     </div>
                                 </div>
                                 <span className="bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                                     İzlenti AI Eleştirmeni
                                 </span>
                             </div>

                             {/* CONTENT: Gemini Loading / Gemini Review / Fallback */}
                             <div className="relative z-10">

                                {/* --- GEMİNİ YÜKLEME ANİMASYONU --- */}
                                {geminiLoading && !geminiReview && (
                                    <div className="flex flex-col items-center justify-center py-12 space-y-4">
                                        <div className="relative">
                                            <div className="absolute inset-0 bg-cyan-500 blur-2xl opacity-20 animate-pulse"></div>
                                            <Sparkles className="w-12 h-12 text-cyan-400 animate-spin relative z-10" style={{ animationDuration: '3s' }} />
                                        </div>
                                        <div className="text-center space-y-1">
                                            <p className="text-cyan-300 text-sm font-bold animate-pulse">Yapay zeka eleştirmeni filmi inceliyor...</p>
                                            <p className="text-slate-500 text-xs">Dürüst, cesur ve derinlikli bir sinematik analiz yazılıyor</p>
                                        </div>
                                        <div className="flex gap-1">
                                            {[0,1,2,3,4].map(i => (
                                                <div key={i} className="w-2 h-2 rounded-full bg-cyan-500 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* --- GEMİNİ GERÇEK YAPAY ZEKA YORUMU --- */}
                                {geminiReview && (
                                    <div className="space-y-5">

                                        {/* Verdict + Score Header with Critic Avatar */}
                                        {(() => {
                                            const vs = getGeminiVerdictStyle(geminiReview.verdict);
                                            const wr = getWatchRecStyle(geminiReview.watchRecommendation);
                                            const avatar = getGeminiCriticAvatar(geminiReview.verdict);
                                            return (
                                                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 bg-[#0b0f19]/80 border border-white/10 rounded-2xl p-4 md:p-5">
                                                    {/* Critic Portrait & Info */}
                                                    <div className="flex items-center gap-4">
                                                        <div className={`w-14 h-14 rounded-2xl ${avatar.bg} border ${avatar.color} flex items-center justify-center text-3xl shadow-xl shrink-0`}>
                                                            {avatar.face}
                                                        </div>
                                                        <div>
                                                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">Eleştirmen Tepkisi</span>
                                                            <h5 className="text-white font-black text-xs md:text-sm tracking-wide mt-0.5">{avatar.title}</h5>
                                                            <span className="text-[10px] text-slate-400 block mt-0.5">{avatar.desc}</span>
                                                        </div>
                                                    </div>

                                                    {/* Verdict and Score */}
                                                    <div className="flex flex-wrap items-center gap-4 w-full md:w-auto border-t md:border-t-0 border-white/5 pt-3 md:pt-0">
                                                        <div>
                                                            <span className="text-[8px] text-slate-500 font-bold uppercase tracking-wider block">AI Kararı</span>
                                                            <span className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${vs.gradient} px-2.5 py-1 rounded-lg text-white font-black text-[11px] md:text-xs shadow-lg mt-1`}>
                                                                {vs.icon} {geminiReview.verdict}
                                                            </span>
                                                        </div>
                                                        
                                                        {geminiReview.score && (
                                                            <div className="text-center px-2">
                                                                <span className="text-[8px] text-slate-500 font-bold uppercase block">AI Puan</span>
                                                                <span className={`text-xl font-black ${vs.color}`}>{geminiReview.score}</span>
                                                                <span className="text-slate-600 text-[10px]">/10</span>
                                                            </div>
                                                        )}

                                                        <div className={`flex items-center gap-1.5 px-3 py-2 rounded-xl border font-bold text-[10px] md:text-xs ${wr.bg} ${wr.color}`}>
                                                            <span className="text-sm">{wr.icon}</span>
                                                            {wr.label}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })()}

                                        {/* Keskin Özet */}
                                        {geminiReview.summary && (
                                            <div className="bg-cyan-950/20 border border-cyan-500/15 rounded-xl p-4 md:p-5">
                                                <p className="text-slate-200 text-sm md:text-base leading-relaxed font-medium">
                                                    {geminiReview.summary}
                                                </p>
                                            </div>
                                        )}

                                        {/* Derinlemesine Analiz */}
                                        {geminiReview.review && (
                                            <div className="bg-[#0b0f19]/60 border border-white/5 rounded-2xl p-5 md:p-6 space-y-4">
                                                <h5 className="text-cyan-400 font-bold text-xs uppercase tracking-wider flex items-center gap-2">
                                                    <Brain className="w-4 h-4" /> Derinlemesine Yapay Zeka Analizi
                                                </h5>
                                                <div className="text-slate-300 text-sm md:text-[15px] leading-[1.8] space-y-3 font-light">
                                                    {geminiReview.review.split('\n').filter(p => p.trim()).map((paragraph, idx) => (
                                                        <p key={idx}>{paragraph}</p>
                                                    ))}
                                                </div>
                                            </div>
                                        )}

                                        {/* Güçlü ve Zayıf Yönler — Yan Yana */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {/* Güçlü Yönler */}
                                            {geminiReview.strengths?.length > 0 && (
                                                <div className="bg-emerald-500/5 border border-emerald-500/15 rounded-xl p-4 space-y-2.5">
                                                    <span className="text-emerald-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                                        <CheckCircle2 className="w-3.5 h-3.5" /> GÜÇLÜ YÖNLERİ
                                                    </span>
                                                    <ul className="space-y-2">
                                                        {geminiReview.strengths.map((s, i) => (
                                                            <li key={i} className="text-slate-300 text-xs md:text-sm leading-relaxed flex items-start gap-2">
                                                                <span className="text-emerald-500 mt-0.5 shrink-0">✓</span>
                                                                <span>{s}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                            {/* Zayıf Yönler */}
                                            {geminiReview.weaknesses?.length > 0 && (
                                                <div className="bg-rose-500/5 border border-rose-500/15 rounded-xl p-4 space-y-2.5">
                                                    <span className="text-rose-400 font-bold text-[10px] uppercase tracking-wider flex items-center gap-1.5">
                                                        <XCircle className="w-3.5 h-3.5" /> ZAYIF YÖNLERİ
                                                    </span>
                                                    <ul className="space-y-2">
                                                        {geminiReview.weaknesses.map((w, i) => (
                                                            <li key={i} className="text-slate-300 text-xs md:text-sm leading-relaxed flex items-start gap-2">
                                                                <span className="text-rose-500 mt-0.5 shrink-0">✕</span>
                                                                <span>{w}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>

                                        {/* Hedef Kitle */}
                                        {geminiReview.targetAudience && (
                                            <div className="bg-white/[0.03] border border-white/10 rounded-xl p-4 flex items-start gap-3">
                                                <span className="text-lg shrink-0">🎯</span>
                                                <div>
                                                    <span className="text-slate-500 text-[9px] font-bold uppercase tracking-wider block mb-1">Kime Hitap Ediyor?</span>
                                                    <p className="text-slate-300 text-xs md:text-sm leading-relaxed">{geminiReview.targetAudience}</p>
                                                </div>
                                            </div>
                                        )}

                                        {/* Son Söz */}
                                        {geminiReview.finalVerdict && (
                                            <div className="bg-gradient-to-r from-cyan-950/30 to-purple-950/30 border border-cyan-500/20 rounded-xl p-4 flex items-start gap-3">
                                                <span className="text-xl shrink-0">💡</span>
                                                <p className="text-cyan-200 text-sm font-semibold leading-relaxed italic">
                                                    "{geminiReview.finalVerdict}"
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* --- FALLBACK: Gemini yoksa eski deterministik analiz --- */}
                                {!geminiLoading && !geminiReview && (
                                    <div className="space-y-4">
                                        <div className="bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 flex items-center gap-2.5 text-xs">
                                            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                                            <span className="text-amber-300">Gemini AI şu anda kullanılamıyor. Lokal analiz motoru ile üretilen yorum gösteriliyor.</span>
                                        </div>
                                        <div className="bg-[#0b0f19]/80 border border-white/10 rounded-2xl p-5 md:p-6 space-y-4">
                                            <p className="text-slate-300 text-sm leading-relaxed">{analysis.verdictReason}</p>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <span className="text-emerald-400 font-bold text-[9px] uppercase tracking-wider block">✓ İZLEME SEBEPLERİ:</span>
                                                    <ul className="space-y-1">
                                                        {analysis.whyWatch?.slice(0, 3).map((item, idx) => (
                                                            <li key={idx} className="text-slate-300 text-xs leading-relaxed flex items-start gap-1.5">
                                                                <span className="text-emerald-500 text-sm mt-[-2px]">✓</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                                <div className="space-y-1.5">
                                                    <span className="text-rose-400 font-bold text-[9px] uppercase tracking-wider block">✕ KAÇINMA SEBEPLERİ:</span>
                                                    <ul className="space-y-1">
                                                        {analysis.whySkip?.slice(0, 3).map((item, idx) => (
                                                            <li key={idx} className="text-slate-300 text-xs leading-relaxed flex items-start gap-1.5">
                                                                <span className="text-rose-500 text-sm mt-[-2px]">✕</span>
                                                                <span>{item}</span>
                                                            </li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            </div>
                                            <div className="border-t border-white/5 pt-3 flex items-start gap-2.5">
                                                <span className="text-xl text-cyan-400">💡</span>
                                                <p className="text-cyan-200 text-xs font-semibold leading-relaxed italic">"{analysis.finalWord}"</p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* 3D Glass Animated Metric Boxes Grid (Middle Row - 4 Columns) */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 relative z-10 perspective-1000">
                            
                            {/* Card 1: Ruh Hali & Ton */}
                            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between active:scale-95 tilt-card cursor-pointer transition-all duration-300">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <span className="text-sm">🌑</span> Ton & Atmosfer
                                </div>
                                <div className="space-y-1">
                                    <div className="text-white text-sm font-black">{analysis.psychProfile.mood}</div>
                                    <div className="text-slate-400 text-xs leading-normal">{analysis.psychProfile.traits[0] || "Dengeli Anlatı"}</div>
                                </div>
                            </div>

                            {/* Card 2: Doğru Zamanlama */}
                            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between active:scale-95 tilt-card-reverse cursor-pointer transition-all duration-300">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <span className="text-sm">{analysis.watchTiming.icon}</span> Zamanlama
                                </div>
                                <div className="space-y-1">
                                    <div className="text-cyan-400 text-sm font-black">{analysis.watchTiming.title}</div>
                                    <div className="text-slate-400 text-xs leading-normal">{analysis.watchTiming.desc}</div>
                                </div>
                            </div>

                            {/* Card 3: Tekrar İzleme Skoru */}
                            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-cyan-500/30 rounded-2xl p-5 flex flex-col justify-between active:scale-95 tilt-card cursor-pointer transition-all duration-300">
                                <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                    <span className="text-sm">{analysis.rewatchValue.icon}</span> Tekrar İzleme
                                </div>
                                <div className="space-y-2">
                                    <div className="text-white text-sm font-black">{analysis.rewatchValue.label}</div>
                                    <div className="flex gap-[2px]">
                                        {[...Array(10)].map((_, i) => (
                                            <div key={i} className={`w-1.5 h-2 rounded-[2px] ${i < analysis.rewatchValue.score ? 'bg-cyan-500 shadow-[0_0_4px_#22d3ee]' : 'bg-white/10'}`} />
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Card 4: Bütçe / Sezon */}
                            <div className="bg-white/[0.03] backdrop-blur-md border border-white/10 hover:border-purple-500/30 rounded-2xl p-5 flex flex-col justify-between active:scale-95 tilt-card-reverse cursor-pointer transition-all duration-300">
                                {analysis.budgetAnalysis ? (
                                    <>
                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <span className="text-sm">📊</span> Bütçe & Gişe
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-white text-sm font-black flex items-center justify-between">
                                                <span>Gişe:</span>
                                                <span className="text-emerald-400">{analysis.budgetAnalysis.revenueFormatted}</span>
                                            </div>
                                            <div className="text-slate-400 text-xs">Bütçe: {analysis.budgetAnalysis.budgetFormatted}</div>
                                        </div>
                                    </>
                                ) : analysis.seasonInfo ? (
                                    <>
                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <span className="text-sm">📺</span> Sezon Bilgisi
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-white text-sm font-black">{analysis.seasonInfo.seasons} Sezon</div>
                                            <div className="text-slate-400 text-xs">{analysis.seasonInfo.episodes} Bölüm ({analysis.seasonInfo.statusTr})</div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="text-slate-400 text-[10px] font-bold uppercase tracking-wider mb-3 flex items-center gap-1.5">
                                            <span className="text-sm">⏳</span> Yayın Durumu
                                        </div>
                                        <div className="space-y-1">
                                            <div className="text-white text-sm font-black">Yayınlandı</div>
                                            <div className="text-slate-400 text-xs">İzlenti Raporlu</div>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Content warnings if adult themes present */}
                        {analysis.psychProfile.warning && (
                            <div className="bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl flex items-center gap-3 relative z-10">
                                <div className="text-xl animate-bounce shrink-0">⚠️</div>
                                <div>
                                    <h6 className="text-rose-400 font-bold text-[10px] uppercase tracking-wider">İçerik Uyarısı</h6>
                                    <p className="text-rose-200 text-xs leading-relaxed">{analysis.psychProfile.warning}</p>
                                </div>
                            </div>
                        )}

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

            {/* TRAILER MODAL — createPortal ile body'e render edilir, scroll sorununu önler */}
            {showTrailer && trailerKey && createPortal(
                <div
                    style={{
                        position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                        zIndex: 999999,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        background: 'rgba(0,0,0,0.96)',
                        backdropFilter: 'blur(8px)'
                    }}
                    onClick={() => setShowTrailer(false)}
                >
                    <div
                        style={{ position: 'relative', width: '95vw', maxWidth: '900px' }}
                        onClick={e => e.stopPropagation()}
                    >
                        <button
                            onClick={() => setShowTrailer(false)}
                            style={{
                                position: 'absolute', top: '-44px', right: 0,
                                color: 'rgba(255,255,255,0.85)', fontWeight: 700, fontSize: '14px',
                                display: 'flex', alignItems: 'center', gap: '8px',
                                background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                                borderRadius: '999px', padding: '6px 14px', cursor: 'pointer'
                            }}
                        >
                            <span>✕</span>
                            <span>Kapat</span>
                        </button>
                        <div style={{ position: 'relative', width: '100%', paddingTop: '56.25%' }}>
                            <iframe
                                src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&rel=0`}
                                style={{
                                    position: 'absolute', top: 0, left: 0,
                                    width: '100%', height: '100%',
                                    borderRadius: '16px',
                                    boxShadow: '0 25px 60px rgba(0,0,0,0.8)'
                                }}
                                allow="autoplay; encrypted-media; fullscreen"
                                allowFullScreen
                                title="Fragman"
                            />
                        </div>
                        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.25)', fontSize: '12px', marginTop: '12px' }}>Dışarıya tıklayarak kapat</p>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};

export default DetailView;
