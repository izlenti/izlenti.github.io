import React, { useState } from 'react';
import { Film, Tv, Sparkles, Brain } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { MOVIE_CATEGORIES, TV_CATEGORIES, MIXED_CATEGORIES } from '../lib/constants.jsx';
import HeroSlider from '../components/HeroSlider';

const Home = () => {
    const navigate = useNavigate();
    const [activeMediaType, setActiveMediaType] = useState('movie');

    let categories = [];
    if (activeMediaType === 'movie') categories = MOVIE_CATEGORIES;
    else if (activeMediaType === 'tv') categories = TV_CATEGORIES;
    else categories = MOVIE_CATEGORIES; // Default

    // Override Gündemdekiler to be Mixed if user wants "hem dizi hem film olsun" in top section
    // We can just modify the first item of specialCategories during render if needed,
    // or better, update constants to make the default trending mixed.
    // However, user said "sayfanın en üstünde", which might be HeroSlider.
    // But they also said "gündemdeki kısım eklediğin mobilde dokunmatikle kaydırılsın".

    const specialCategories = categories.filter(c => c.section === 'special');
    const genreCategories = categories.filter(c => c.section === 'genre');

    const handleCategoryClick = (category) => {
        // Pass the effective type (category.type or activeMediaType)
        const type = category.type || activeMediaType;
        navigate(`/category/${category.id}?type=${type}`);
    };

    return (
        <div className="animate-in fade-in duration-700">
            {/* Hero Section */}
            <HeroSlider />

            <div className="text-center mb-12 mt-4">
                <div className="inline-flex items-center gap-2 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full mb-4">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    <span className="text-xs text-slate-300 font-medium tracking-wide">YAPAY ZEKA DESTEKLİ SİNEMA REHBERİ</span>
                </div>
                <h2 className="text-4xl md:text-5xl text-white font-bold tracking-tight mb-4 drop-shadow-2xl">
                    Ne İzleyeceğine Karar Veremedin mi?
                </h2>
                <p className="text-slate-400 max-w-xl mx-auto text-lg font-light leading-relaxed">
                    İzlenti, global veri tabanlarını tarar, puanları analiz eder ve sana en doğru sonucu sunar.
                </p>
            </div>

            <div className="flex justify-center mb-12">
                <div className="bg-white/5 p-1 rounded-xl flex gap-1 border border-white/10">
                    <button
                        onClick={() => setActiveMediaType('movie')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeMediaType === 'movie' ? 'bg-cyan-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Film className="w-4 h-4" /> Filmler
                    </button>
                    <button
                        onClick={() => setActiveMediaType('tv')}
                        className={`px-6 py-2.5 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${activeMediaType === 'tv' ? 'bg-purple-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-white/5'}`}
                    >
                        <Tv className="w-4 h-4" /> Diziler
                    </button>
                </div>
            </div>

            {/* Category Sections */}
            <div className="space-y-12">
                {/* Special Categories */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Sparkles className="w-5 h-5 text-cyan-400" />
                        <h3 className="text-xl font-bold text-white">Özel Kategoriler</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-cyan-500/50 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {specialCategories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className="bg-[#0f172a] hover:bg-[#1e293b] border border-white/5 hover:border-cyan-500/40 p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-cyan-900/10"
                            >
                                <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 transition duration-300 shadow-inner">
                                    {cat.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-200 group-hover:text-cyan-400 transition text-sm">{cat.name}</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 group-hover:text-slate-400 font-medium uppercase tracking-wider">Listeyı İncele &rarr;</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Genre Categories */}
                <div>
                    <div className="flex items-center gap-3 mb-6">
                        <Film className="w-5 h-5 text-purple-400" />
                        <h3 className="text-xl font-bold text-white">Türlerine Göre {activeMediaType === 'movie' ? 'Filmler' : 'Diziler'}</h3>
                        <div className="flex-1 h-px bg-gradient-to-r from-purple-500/50 to-transparent"></div>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                        {genreCategories.map((cat) => (
                            <div
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat)}
                                className="bg-[#0f172a] hover:bg-[#1e293b] border border-white/5 hover:border-purple-500/40 p-4 rounded-2xl cursor-pointer transition-all duration-300 group flex items-center gap-4 hover:-translate-y-1 hover:shadow-xl hover:shadow-purple-900/10"
                            >
                                <div className="bg-white/5 p-3 rounded-xl group-hover:scale-110 transition duration-300 shadow-inner">
                                    {cat.icon}
                                </div>
                                <div className="flex-1">
                                    <h3 className="font-bold text-slate-200 group-hover:text-purple-400 transition text-sm">{cat.name}</h3>
                                    <p className="text-[10px] text-slate-500 mt-1 group-hover:text-slate-400 font-medium uppercase tracking-wider">Keşfet &rarr;</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* AI Info Box */}
            <div className="mt-16 bg-gradient-to-r from-cyan-900/20 to-blue-900/20 border border-cyan-500/20 rounded-2xl p-6">
                <div className="flex items-start gap-4">
                    <div className="bg-cyan-500/20 p-3 rounded-xl">
                        <Brain className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="font-bold text-cyan-300 mb-2">İzlenti Nasıl Çalışır?</h3>
                        <p className="text-slate-400 text-sm leading-relaxed">
                            İzlenti, TMDB (The Movie Database) verilerini gerçek zamanlı olarak analiz eder.
                            Puanlama, oy sayısı, bütçe-hasılat dengesi ve izleyici trendlerini değerlendirerek
                            size akıllı öneriler sunar. Veriler sürekli güncellenir!
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Home;
