
// --- ÇEVİRİ FONKSİYONU (MyMemory API) ---
export const translateText = async (text, sourceLang = 'en', targetLang = 'tr') => {
    if (!text || text.length < 10) return text;

    try {
        const maxChunkSize = 500;
        // Metin kısaysa tek seferde çevir
        if (text.length <= maxChunkSize) {
            const response = await fetch(
                `https://api.mymemory.translated.net/get?q=${encodeURIComponent(text)}&langpair=${sourceLang}|${targetLang}`
            );
            const data = await response.json();
            return data.responseData?.translatedText || text;
        } else {
            // Uzun metinleri parçalara böl (En fazla 3 parça - 1500 karakter limit)
            const chunks = [];
            for (let i = 0; i < text.length && i < 1500; i += maxChunkSize) {
                chunks.push(text.substring(i, Math.min(i + maxChunkSize, text.length)));
            }

            const translatedChunks = await Promise.all(chunks.map(async (chunk, index) => {
                // API rate limit'e takılmamak için her istek arasına minik gecikme koy
                await new Promise(r => setTimeout(r, index * 300));
                try {
                    const response = await fetch(
                        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(chunk)}&langpair=${sourceLang}|${targetLang}`
                    );
                    const data = await response.json();
                    return data.responseData?.translatedText || chunk;
                } catch {
                    return chunk;
                }
            }));

            // 1500 karakterden sonrasını (varsa) olduğu gibi ekle
            const remaining = text.length > 1500 ? text.substring(1500) : "";
            return translatedChunks.join(" ") + remaining;
        }
    } catch (error) {
        console.error('Translation error:', error);
        return text;
    }
};

// --- İZLEYİCİ ODAKLI AI ANALİZ MOTORU (NARRATİF SİMÜLASYONU) ---
export const generateDeepAnalysis = (details, credits, keywords, reviews, mediaType) => {
    const isTv = mediaType === 'tv';
    const term = isTv ? 'dizi' : 'film';
    const termCap = isTv ? 'Dizi' : 'Film';

    const score = details.vote_average || 0;
    const votes = details.vote_count || 0;
    const runtime = details.runtime || (details.episode_run_time?.[0]) || 0;
    const genres = details.genres?.map(g => g.name) || [];
    const year = (details.release_date || details.first_air_date || "").substring(0, 4);
    const originalTitle = details.original_title || details.original_name || '';
    const localTitle = details.title || details.name || '';
    const overview = details.overview || '';
    const popularity = details.popularity || 0;
    const budget = details.budget || 0;

    // Tarih ve Vizyon Kontrolü
    const releaseDateObj = new Date(details.release_date || details.first_air_date);
    const now = new Date();
    const isUnreleased = releaseDateObj > now;

    // Ekip ve Kadro
    const director = credits?.crew?.find(c => c.job === 'Director')?.name || '';
    const cast = credits?.cast?.slice(0, 4).map(c => c.name) || [];
    const castList = cast.length > 0 ? cast.join(", ") : "bilinmeyen bir kadro";
    const mainStar = cast[0] || '';

    // Tematik Analiz (Keywords)
    const keywordNames = keywords?.map(k => k.name.toLowerCase()) || [];
    const themes = keywordNames.slice(0, 5).join(", ");
    const isDark = keywordNames.some(k => ['dark', 'violence', 'murder', 'war', 'horror', 'death'].some(t => k.includes(t)));
    const isLight = keywordNames.some(k => ['comedy', 'love', 'family', 'friends', 'happy'].some(t => k.includes(t)));

    // Yorum ve Duygu Analizi
    const reviewList = reviews || [];
    const reviewCount = reviewList.length;

    let sentimentScore = 0;
    const positiveKw = ['amazing', 'good', 'great', 'excellent', 'love', 'perfect', 'best', 'harika', 'güzel', 'iyi'];
    const negativeKw = ['bad', 'boring', 'worst', 'poor', 'terrible', 'awful', 'kötü', 'sıkıcı', 'berbat'];

    reviewList.slice(0, 20).forEach(r => {
        const content = (r.content || '').toLowerCase();
        const rating = r.author_details?.rating;

        if (rating) {
            if (rating >= 8) sentimentScore += 2;
            else if (rating >= 6) sentimentScore += 1;
            else if (rating <= 4) sentimentScore -= 2;
            else sentimentScore -= 1;
        } else {
            if (positiveKw.some(k => content.includes(k))) sentimentScore += 1;
            if (negativeKw.some(k => content.includes(k))) sentimentScore -= 1;
        }
    });

    let verdict, verdictIcon, verdictClass, verdictReason, prosAndCons, targetAudience, finalWord;

    if (score >= 8.5) {
        verdict = isTv ? "Efsanevi Yapım" : "Başyapıt";
        verdictIcon = "👑";
        verdictClass = "from-amber-600 to-yellow-500";
        verdictReason = "Geniş kitleler tarafından tam not almış, eksik yönleri neredeyse göz ardı edilebilecek düzeyde, türünün en iyi örneklerinden biri.";
        prosAndCons = "✅ Etkileyici senaryo ve derinlik\n✅ Üst düzey prodüksiyon kalitesi\n✅ Başarılı oyunculuklar\n❌ Yok denecek kadar az zayıf yön";
        targetAudience = "Herkes Sinema/Dizi tutkunları için kaçırılmaması gereken bir deneyim.";
        finalWord = "İzleme listenizin en üst sırasına tereddüt etmeden ekleyebilirsiniz.";
    } else if (score >= 7.5) {
        verdict = "Kesinlikle İzlenmeli";
        verdictIcon = "🌟";
        verdictClass = "from-emerald-500 to-teal-400";
        verdictReason = "Sağlam bir hikaye örgüsü ve tatmin edici bir final sunan, izledikten sonra pişman etmeyecek kaliteli bir yapım.";
        prosAndCons = "✅ Sürükleyici hikaye\n✅ Tatmin edici karakter gelişimi\n❌ Zaman zaman yavaşlayan tempo";
        targetAudience = "Türün Meraklıları Kaliteli işler arayan ve bu türe ilgi duyan seyirciler.";
        finalWord = "Vakit ayırdığınıza değecek, keyifli ve sürükleyici bir seyir zevki sunuyor.";
    } else if (score >= 6.0) {
        verdict = "Şans Verilebilir";
        verdictIcon = "👍";
        verdictClass = "from-blue-500 to-cyan-400";
        verdictReason = "Bazı eksikleri ve mantık hataları barındırsa da, boş zaman değerlendirmek için tercih edilebilecek ortalama üstü bir iş.";
        prosAndCons = "✅ Eğlenceli anlar\n✅ Fena olmayan görsel kalite\n❌ Klişe ilerleyen senaryo\n❌ Yetersiz karakter derinliği";
        targetAudience = "Klişe Sevenler Çerezlik yapım arayan, fazla mantık aramayan izleyiciler.";
        finalWord = "Beklentiyi çok yükseltmeden, sakin kafayla izlendiğinde keyif verebilir.";
    } else {
        verdict = "Zaman Kaybı Olabilir";
        verdictIcon = "⚠️";
        verdictClass = "from-red-500 to-rose-400";
        verdictReason = "Senaryo boşlukları, zayıf oyunculuklar veya düşük prodüksiyon kalitesi nedeniyle izleyiciden geçer not alamamış bir yapım.";
        prosAndCons = "✅ Bazı ilginç potansiyel fikirler\n❌ Kötü işlenmiş kurgu\n❌ Tatmin etmeyen final\n❌ Sıkıcı anlatım";
        targetAudience = "Seçici Olmayanlar Arka planda ses olsun diye bir şeyler açmak isteyenler.";
        finalWord = "Sadece merakınıza yenik düşerseniz göz atın, aksi halde pas geçebilirsiniz.";
    }

    if (isUnreleased) {
        verdict = "Heyecanla Bekleniyor";
        verdictIcon = "⏳";
        verdictClass = "from-purple-500 to-fuchsia-400";
        verdictReason = "Henüz yayınlanmamış olmasına rağmen büyük bir beklenti ve merak oluşturan bir proje.";
        prosAndCons = "❓ Potansiyeli yüksek\n❓ Kapalı kutu";
        targetAudience = `Meraklı Bekleyenler ${termCap} dünyasını yakından takip edenler.`;
        finalWord = "Vizyon/Yayın tarihini not alıp beklemeye geçebilirsiniz.";
    }

    // --- 1. ANA ANALİZ METNİ (Narrative Body) ---
    let aiNarrative = "";

    const genreStr = genres.slice(0, 2).join(" ve ");
    const timeContext = year < 2005 ? "klasikleri arasında yerini alan" : "modern sinemanın örneklerinden biri olan";

    // GİRİŞ: Bağlam
    if (score >= 8.5) {
        aiNarrative += `**Genel Bakış:**\n${genreStr} türünde, ${timeContext} bu yapım, izleyici ve eleştirmenlerden tam not almayı başarmış ender işlerden. `;
    } else if (score >= 7.5) {
        aiNarrative += `**Genel Bakış:**\n${isTv ? 'Televizyon' : 'Sinema'} dünyasında sağlam bir yer edinen, özellikle ${genreStr} tutkunlarını hedefleyen bir yapım. `;
    } else if (score >= 6.0) {
        aiNarrative += `**Genel Bakış:**\nİzleyiciyi ikiye bölen, potansiyeli yüksek ancak tartışmalı yönleri de olan bir ${term} projesi. `;
    } else {
        aiNarrative += `**Genel Bakış:**\nBeklentileri tam olarak karşılayamayan, ancak belirli bir kitleye hitap etmeye çalışan bir ${term}. `;
    }

    // GELİŞME: Kadro ve Hikaye
    if (director) aiNarrative += `Yönetmen koltuğunda oturan ${director}, bu projede kendi imzasını hissettiriyor. `;
    if (cast.length > 0) aiNarrative += `${mainStar} önderliğindeki oyuncu kadrosu (${castList}), karakterlere hayat verirken hikayenin atmosferini güçlendiriyor. \n\n`;

    if (overview.length > 30) {
        aiNarrative += `**Hikaye ve Atmosfer:**\nYapım, izleyiciyi ${isDark ? 'gerilimli ve karanlık' : (isLight ? 'sıcak ve samimi' : 'sürükleyici')} bir atmosferin içine çekiyor. `;
        aiNarrative += `Senaryo örgüsü, karakterlerin derinliklerine inerek izleyiciyle duygusal bir bağ kurmayı amaçlıyor. `;
    }

    // TOPLULUK GÖRÜŞÜ
    aiNarrative += `\n\n**Topluluk Nabzı:**\n`;
    if (votes > 10000) {
        aiNarrative += `Global çapta ulaşlan ${votes.toLocaleString()} kişilik izleyici kitlesi, projenin popüler kültürdeki etkisini kanıtlar nitelikte. `;
    }

    if (sentimentScore > 5) {
        aiNarrative += `İzleyici yorumları incelendiğinde; senaryo derinliği ve oyunculuk performanslarının öne çıktığı görülüyor. Çoğu izleyici finalden ve genel kaliteden memnun.`;
    } else if (sentimentScore < -5) {
        aiNarrative += `Topluluk geri bildirimleri; bazı tempo sorunlarına ve senaryo boşluklarına işaret ediyor. İzleyicilerin bir kısmı potansiyelin tam değerlendirilemediği görüşünde.`;
    } else {
        aiNarrative += `Görüşler oldukça dengeli. Kimisi atmosferi çok beğenirken, kimisi hikayenin akışını eleştirmiş. Tamamen kişisel zevkinize bağlı bir deneyim vadediyor.`;
    }

    // --- 3. PSİKOLOJİK PROFİL (Psychological Profile) ---
    let psychProfile = {
        mood: "Nötr",
        traits: [],
        warning: null
    };

    if (isDark) {
        psychProfile.mood = "Gergin & Karanlık";
        psychProfile.traits.push("Yüksek Adrenalin", "Psikolojik Baskı");
        if (keywordNames.includes('trauma') || keywordNames.includes('murder')) psychProfile.warning = "Hassas izleyiciler için tetikleyici unsurlar içerebilir.";
    } else if (isLight) {
        psychProfile.mood = "Neşeli & Hafif";
        psychProfile.traits.push("Mod Yükseltici", "Rahatlatıcı");
    } else {
        psychProfile.mood = "Dengeli";
        psychProfile.traits.push("Sürükleyici", "Düşündürücü");
    }

    if (score > 8) psychProfile.traits.push("Zihin Açıcı");
    if (runtime > 140) psychProfile.traits.push("Sabır Gerektiren Derinlik");

    // --- 4. SİNİRSEL EŞLEŞME (Neural Match) ---
    // Popülerlik ve Puan bazlı yapay bir "eşleşme" skoru
    let matchScore = Math.min(98, Math.max(60, (score * 10) + (popularity / 500)));
    if (isUnreleased) matchScore = 50;
    const matchRate = Math.floor(matchScore);

    return {
        verdict, verdictIcon, verdictClass, verdictReason,
        prosAndCons,
        reviewAnalysis: aiNarrative,
        recentReview: reviews[0], targetAudience,
        finalWord,
        score, votes, term, termCap, originalTitle, localTitle, genres, runtime, reviewCount, isUnreleased,
        psychProfile, matchRate // New Fields
    };
};

export const slugify = (text) => {
    const trMap = {
        'ç': 'c', 'Ç': 'c',
        'ğ': 'g', 'Ğ': 'g',
        'ş': 's', 'Ş': 's',
        'ü': 'u', 'Ü': 'u',
        'ı': 'i', 'İ': 'i',
        'ö': 'o', 'Ö': 'o'
    };
    return text
        .split('')
        .map(char => trMap[char] || char)
        .join('')
        .toLowerCase()
        .replace(/&/g, 'and')
        .replace(/[^a-z0-9]+/g, '_')
        .replace(/^_+|_+$/g, '');
};

export const getExternalLinks = (details, type) => {
    const originalTitle = details.original_title || details.original_name || "";
    const titleForUrl = slugify(originalTitle);
    const mediaType = type === 'tv' ? 'tv' : 'm';

    const imdbLink = details.external_ids?.imdb_id
        ? `https://www.imdb.com/title/${details.external_ids.imdb_id}/`
        : `https://www.google.com/search?q=${encodeURIComponent(originalTitle + " imdb")}`;

    const awardLink = details.external_ids?.imdb_id
        ? `https://www.imdb.com/title/${details.external_ids.imdb_id}/awards/`
        : `https://www.google.com/search?q=${encodeURIComponent(originalTitle + " awards")}`;

    return {
        rottenTomatoes: `https://www.rottentomatoes.com/${mediaType}/${titleForUrl}`,
        eksiSozluk: `https://eksisozluk.com/?q=${encodeURIComponent(originalTitle)}`,
        imdb: imdbLink,
        awards: awardLink,
        wikipedia: `https://en.wikipedia.org/wiki/${encodeURIComponent(originalTitle.replace(/ /g, '_'))}`
    };
};
