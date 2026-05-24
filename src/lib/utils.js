
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

export const getAIBadge = (score, votes = 1000) => {
    if (!score || score === 0) return { text: "Veri Yetersiz", color: "text-slate-500", badgeColor: "bg-slate-500/10 border-slate-500/20", icon: "📊" };
    
    let sysScore = score;
    if (votes < 100) sysScore -= 1.5;
    else if (votes < 500) sysScore -= 0.8;
    
    if (sysScore >= 8.0) return { text: "Sinematik Başarı", color: "text-amber-400 font-bold", badgeColor: "bg-amber-500/10 border-amber-500/20", icon: "💎" };
    if (sysScore >= 6.8) return { text: "Nitelikli Yapım", color: "text-emerald-400 font-bold", badgeColor: "bg-emerald-500/10 border-emerald-500/20", icon: "🎯" };
    if (sysScore >= 5.5) return { text: "Ortalama/Tartışmalı", color: "text-blue-400", badgeColor: "bg-blue-500/10 border-blue-500/20", icon: "⚖️" };
    return { text: "Analitik Risk", color: "text-rose-400", badgeColor: "bg-rose-500/10 border-rose-500/20", icon: "⚠️" };
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

    let reliability = "Yüksek";
    let scoreAdjustment = 0;
    
    if (votes < 50) {
        reliability = "Çok Düşük";
        scoreAdjustment = -1.5;
    } else if (votes < 300) {
        reliability = "Düşük";
        scoreAdjustment = -0.8;
    } else if (votes < 1000) {
        reliability = "Orta";
        scoreAdjustment = -0.3;
    }
    
    const effectiveScore = score + scoreAdjustment;

    if (effectiveScore >= 8.0) {
        verdict = isTv ? "Üst Düzey Dizi" : "Sinematik Başarı";
        verdictIcon = "💎";
        verdictClass = "from-amber-600 to-yellow-500";
        verdictReason = "Teknik işçiliği, senaryo bütünlüğü ve oyunculuk performanslarıyla kendi türünde standartları belirleyen, objektif olarak başarılı bir yapım.";
        prosAndCons = "✅ Tutarlı ve derinlikli karakter gelişimi\n✅ Güçlü sinematografi ve kurgu\n✅ Tatmin edici hikaye anlatımı\n❌ Öznel beklentiler dışında majör bir teknik hata yok";
        targetAudience = { title: "Kalite Arayanlar", desc: "Sinematik anlamda yüksek standartları önemseyen seçici izleyiciler." };
        finalWord = "Teknik ve anlatısal olarak rüştünü ispatlamış objektif bir başarı.";
    } else if (effectiveScore >= 6.8) {
        verdict = "Nitelikli Yapım";
        verdictIcon = "🎯";
        verdictClass = "from-emerald-500 to-teal-400";
        verdictReason = "Belirli senaryo formüllerine dayansa da, prodüksiyon kalitesi ve izleyiciyi tutma becerisiyle genel geçer izleyici testini geçmeyi başaran sağlam bir iş.";
        prosAndCons = "✅ Türünün gereksinimlerini başarıyla karşılıyor\n✅ Akıcı ilerleyen kurgu\n❌ Orijinallik açısından çığır açmıyor\n❌ Bazı yan karakterler zayıf kalabiliyor";
        targetAudience = { title: "Türün Sevenleri", desc: "Bu konsepte özel ilgisi olan ve risk almadan vakit geçirmek isteyenler." };
        finalWord = "Büyük beklentilere girmeden izlendiğinde, sunduğu teknik yeterlilikle vaktinizin karşılığını veren bir tercih.";
    } else if (effectiveScore >= 5.5) {
        verdict = "Ortalama / Tartışmalı";
        verdictIcon = "⚖️";
        verdictClass = "from-blue-500 to-cyan-400";
        verdictReason = "Teknik veya senaryo anlamında bariz kusurlar barındıran; ancak içerdiği bazı sekanslar veya spesifik performanslarla izleyiciyi ikiye bölen bir yapım.";
        prosAndCons = "✅ Kısmi anlarda parlayan fikirler\n✅ Belirli sahnelerde iyi atmosfer\n❌ Hikayede ritim ve mantık problemleri\n❌ Derinlikten yoksun olay örgüsü";
        targetAudience = { title: "Boş Vakit İzleyicisi", desc: "Arka planda akıp gitsin diyen veya spesifik bir oyuncu için katlananlar." };
        finalWord = "Objektif olarak pek çok eksiği mevcut. Ancak türün ciddi bir hayranıysanız şans verilebilir.";
    } else {
        verdict = "Analitik Risk";
        verdictIcon = "⚠️";
        verdictClass = "from-red-500 to-rose-400";
        verdictReason = "İzleyici verileri ve teknik analizler ışığında; zayıf kurgu, kopuk senaryo ve yetersiz prodüksiyon gibi majör temel problemleri olan riskli bir proje.";
        prosAndCons = "✅ Kağıt üzerinde fena durmayan başlangıç fikri\n❌ Zayıf yönetim ve kötü işlenmiş metin\n❌ İzleyiciyi içine çekemeyen tempo\n❌ Tatmin hissi yaratmayan sığ final";
        targetAudience = { title: "Pas Geçenler", desc: "Kısıtlı vaktini kanıtlanmış, kaliteli yapımlara ayırmak isteyen seçici izleyiciler." };
        finalWord = "Projeye özel bir bağınız yoksa, algoritmanın verileri doğrultusunda alternatiflere yönelmeniz rasyonel olacaktır.";
    }

    if (reliability === "Çok Düşük" || reliability === "Düşük") {
        verdictReason += ` (Not: Veri sayısının azlığı sebebiyle bu istatistiksel analiz yanıltıcı olabilir. Güvenilirlik: ${reliability})`;
    }

    if (isUnreleased) {
        verdict = "Heyecanla Bekleniyor";
        verdictIcon = "⏳";
        verdictClass = "from-purple-500 to-fuchsia-400";
        verdictReason = "Henüz yayınlanmamış olmasına rağmen büyük bir beklenti ve merak oluşturan bir proje.";
        prosAndCons = "❓ Potansiyeli yüksek\n❓ Kapalı kutu";
        targetAudience = { title: "Meraklı Bekleyenler", desc: `${termCap} dünyasını yakından takip edenler.` };
        finalWord = "Vizyon/Yayın tarihini not alıp beklemeye geçebilirsiniz.";
    }

    // --- 0. EPIC SYNOPSIS (Yapay Zeka Dokunuşlu Özet) ---
    let epicSynopsis = { text: overview || "Bu yapım hakkında detaylı bir konu özeti bulunmuyor.", aiTouch: "" };
    if (overview.length > 20) {
        const moodWord = isDark ? "karanlık ve gerilimli" : (isLight ? "sıcak ve keyifli" : "sürükleyici ve katmanlı");
        let touch = `${genres.slice(0, 2).join(" ve ")} türünün sınırlarını ${moodWord} bir atmosferle yeniden çizen bu yapım, `;
        touch += director ? `${director}'ın özgün vizyonu eşliğinde ` : "";
        touch += `izleyiciyi ekrana bağlayan güçlü bir anlatı kurguluyor. `;
        if (keywords.length > 0) {
            touch += `Yüzeysel bir hikayenin ötesinde; ${keywords.slice(0, 4).map(k => k.name).join(", ")} gibi derin temalar işlenerek çok katmanlı bir deneyim sunuluyor. `;
        }
        if (cast.length > 0) {
            touch += `${mainStar}'ın başrolde verdiği performans, karakterin iç dünyasını perde önüne taşıyan kritik bir unsur.`;
        }
        epicSynopsis.aiTouch = touch;
    } else {
        epicSynopsis.aiTouch = `Mevcut veriler sınırlı olsa da YZ motorumuz ${genres.slice(0, 2).join(" ve ")} odaklı yapısını ve ${isDark ? 'yoğun, gerilimli atmosferini' : (isLight ? 'hafif ve eğlenceli ruhunu' : 'dengeli ve düşündürücü tonunu')} tespit etti. Bu türe ilgi duyuyorsanız radarınızda tutmaya değer.`;
    }

    // --- 1. ANA ANALİZ METNİ (Narrative Body) ---
    let aiNarrative = "";

    const genreStr = genres.slice(0, 2).join(" ve ");
    const timeContext = year < 2005 ? "klasikler arasında taht kurmuş" : (year < 2015 ? "2000'lerin sinema anlayışını temsil eden" : "modern dönemin dikkat çeken yapımlarından");

    // GİRİŞ — Skor bazlı güçlü açılış
    if (score >= 8.5) {
        aiNarrative += `**🎬 Sinematik Değerlendirme:**\n`;
        aiNarrative += `${genreStr} türünde ${timeContext} bu yapım, hem eleştirmenler hem de milyonlarca izleyici tarafından istisna olarak kabul edilen ender eserlerden. `;
        aiNarrative += `Yalnızca bir film/dizi izlemekle kalmıyorsunuz — bilincinizde iz bırakan, gece yatmadan önce bile aklınızı çelen türden bir deneyimden bahsediyoruz. `;
    } else if (score >= 7.5) {
        aiNarrative += `**🎬 Sinematik Değerlendirme:**\n`;
        aiNarrative += `${isTv ? 'Dizi' : 'Sinema'} dünyasının kaliteli üretimlerinden biri olan bu yapım, özellikle ${genreStr} dinamiklerine hakim izleyicilerin beğenisini kazanmayı başarmış. `;
        aiNarrative += `Belirgin güçlü yanlarıyla dengeli ve tatmin edici bir izleme deneyimi vaat ediyor. `;
    } else if (score >= 6.0) {
        aiNarrative += `**🎬 Sinematik Değerlendirme:**\n`;
        aiNarrative += `${genreStr} formülüne sadık kalarak hazırlanan bu yapım, potansiyelini her zaman tam anlamıyla kullanamamış olsa da belirli anlarda parlayan sahneleriyle dikkat çekiyor. `;
        aiNarrative += `İzleyici kitlesini ikiye bölen bir proje; sizi büyüleyebilir ya da hayal kırıklığı yaratabilir. `;
    } else {
        aiNarrative += `**🎬 Sinematik Değerlendirme:**\n`;
        aiNarrative += `Objektif veriler bu yapımın beklentileri karşılamakta ciddi güçlük çektiğine işaret ediyor. `;
        aiNarrative += `Senaryo tutarsızlıkları ve ritim sorunlarıyla örülü bu deneyim, dikkatli bir izleyicinin sabrını zorlayabilir. `;
    }

    // YÖNETMENİN İMZASI
    if (director) {
        aiNarrative += `\n\n**🎭 Yönetmenin İmzası:**\n`;
        aiNarrative += `${director}, bu projeyle sinema diline kendi sözdizimini katıyor. `;
        if (score >= 7.5) {
            aiNarrative += `Kamera hareketleri ve anlatı temposu üzerindeki sıkı kontrolü, her karenin kasıtlı ve bilinçli bir vizyon ürünü olduğunu ortaya koyuyor. `;
        } else {
            aiNarrative += `Yönetim anlayışı zaman zaman güçlü anlar yaratsa da tutarlılık açısından bazı belirsizlikler göze çarpıyor. `;
        }
    }

    // OYUNCU ANALİZİ
    if (cast.length > 0) {
        aiNarrative += `\n\n**🌟 Kadro Analizi:**\n`;
        aiNarrative += `${mainStar} başrolünde, ${castList} ise destekleyici pozisyonlarda yer alıyor. `;
        if (score >= 7.5) {
            aiNarrative += `Kadronun kimyası, karakterler arasındaki diyalogları inandırıcı kılan temel etken. Özellikle ${mainStar}'ın sahneye getirdiği derinlik, yapımın duygusal ağırlık merkezini oluşturuyor. `;
        } else {
            aiNarrative += `Oyunculuk performansları senaryo sınırlılıklarını zaman zaman aşıyor; ancak kağıt üzerinde yeterince geliştirilmemiş karakterler, kadronun kapasitesini tam olarak ortaya koymaktan alıkoyuyor. `;
        }
    }

    // HİKAYE VE ATMOSFER
    if (overview.length > 30) {
        aiNarrative += `\n\n**🌑 Atmosfer ve Ton:**\n`;
        if (isDark) {
            aiNarrative += `Yapım boyunca hissedilen kasvetli ağırlık, izleyiciyi yalnızca ekrana bakmakla bırakmıyor — sizi hikayenin içine hapsediyor. `;
            aiNarrative += `Bu tür bir karanlık yalnızca estetik tercih değil; karakter psikolojisinin doğrudan bir yansıması. `;
        } else if (isLight) {
            aiNarrative += `Hafifliği asla yüzeyselliğe dönüşmeyen bu yapım, izleyiciyi günlük yüklerden arındıran temiz bir kaçış vadediyor. `;
            aiNarrative += `Sahici gülümsemeler ve samimi anlar, yapımın en güçlü silahı. `;
        } else {
            aiNarrative += `Ne tam anlamıyla karanlık ne de saf bir gülümseme fabrikası olan bu yapım, duygusal dengeyi ustaca koruyor. `;
            aiNarrative += `Hem düşündürücü hem de eğlendirici olmayı başaran bu denge, her türlü izleyiciyle iletişim kurmasına olanak tanıyor. `;
        }
        if (runtime > 0) {
            if (runtime > 150) aiNarrative += `${runtime} dakikalık süre uzun görünse de usta kurgucular eşliğinde geçip gidiyor — finalde kendinizi "bitti mi?" diye sorarken bulabilirsiniz. `;
            else if (runtime < 90) aiNarrative += `${runtime} dakikalık kompakt yapı, gereksiz sahnelere yer bırakmadan doğrudan öze iniyor. `;
            else aiNarrative += `${runtime} dakikalık süre, anlatının ihtiyaç duyduğu nefes alanını tam olarak karşılıyor. `;
        }
    }

    // TOPLULUK NABZI
    aiNarrative += `\n\n**📊 Küresel İzleyici Reaksiyonu:**\n`;
    if (votes > 50000) {
        aiNarrative += `${votes.toLocaleString('tr-TR')} oy — bu rakam bir filmin kültürel dönüşüm yarattığının somut kanıtı. `;
    } else if (votes > 10000) {
        aiNarrative += `${votes.toLocaleString('tr-TR')} kişinin deneyimlediği bu yapım, küresel ölçekte ciddi bir izleyici kitlesi oluşturmuş. `;
    } else if (votes > 1000) {
        aiNarrative += `Henüz nispeten sınırlı bir izleyici kitlesine ulaşmış olsa da yükselen bir ilgi eğrisi söz konusu. `;
    } else {
        aiNarrative += `Veri tabanındaki sınırlı oy sayısı, geniş kitleye henüz ulaşmadığını gösteriyor — keşfedilmeyi bekleyen bir elmas olabilir. `;
    }

    if (sentimentScore > 5) {
        aiNarrative += `İzleyicilerin büyük çoğunluğu yapımı övgüyle karşılamış; senaryo derinliği, oyunculuk güçlüğü ve duygusal etki en çok vurgulanan unsurlar arasında. Finali tartışılan yapımlarda bile genel kanı olumlu.`;
    } else if (sentimentScore < -5) {
        aiNarrative += `Topluluk verileri bazı alarm işaretleri taşıyor: tempo problemleri, senaryo tutarsızlıkları ve hayal kırıklığı yaratan son, eleştirilerde sıklıkla dile getiriliyor.`;
    } else {
        aiNarrative += `İzleyici yorumları karmaşık bir tablo çiziyor — atmosferi ve görselliği sevenler ile senaryo akışını eleştirenler arasında keskin bir denge var. Tercihiniz tamamen kişisel beklentinize bağlı.`;
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

    // --- BÜTÇE-HASILAT ANALİZİ ---
    let budgetAnalysis = null;
    if (!isTv && budget > 0) {
        const revenue = details.revenue || 0;
        const roi = revenue > 0 ? ((revenue - budget) / budget * 100).toFixed(0) : null;
        let budgetVerdict = '';
        if (revenue === 0) budgetVerdict = 'Hasılat verisi henüz mevcut değil.';
        else if (roi > 200) budgetVerdict = `Gişe canavarı! Bütçesinin ${(revenue / budget).toFixed(1)}x katını kazandı. Prodüksiyon şirketinin rüyası.`;
        else if (roi > 50) budgetVerdict = `Ticari olarak başarılı. Yatırımın karşılığını fazlasıyla aldı.`;
        else if (roi > 0) budgetVerdict = `Maliyetini zar zor çıkardı. Pazarlama masrafları dahil edilince kâr marjı tartışmalı.`;
        else budgetVerdict = `Gişede hayal kırıklığı. Bütçesini bile karşılayamadı.`;
        budgetAnalysis = {
            budget, revenue, roi: roi ? `%${roi}` : null, verdict: budgetVerdict,
            budgetFormatted: `$${(budget / 1_000_000).toFixed(0)}M`,
            revenueFormatted: revenue > 0 ? `$${(revenue / 1_000_000).toFixed(0)}M` : 'Bilinmiyor'
        };
    }

    // --- SEZON BİLGİSİ (DİZİLER) ---
    let seasonInfo = null;
    if (isTv) {
        seasonInfo = {
            seasons: details.number_of_seasons || 0,
            episodes: details.number_of_episodes || 0,
            status: details.status,
            statusTr: details.status === 'Returning Series' ? '📺 Devam Ediyor' :
                       details.status === 'Ended' ? '🏁 Final Yaptı' :
                       details.status === 'Canceled' ? '❌ İptal Edildi' :
                       details.status === 'In Production' ? '🎬 Yapım Aşamasında' : (details.status || 'Bilinmiyor'),
            inProduction: details.in_production || false
        };
    }

    // --- KADRO ANALİZİ ---
    const topCast = credits?.cast?.slice(0, 6).map(c => ({ name: c.name, character: c.character, profile: c.profile_path })) || [];
    let castAnalysis = '';
    if (director && mainStar) castAnalysis = `${director} yönetmenliğinde, ${mainStar}'ın başrolde yer aldığı kadro, projenin omurgasını oluşturuyor.`;
    else if (mainStar) castAnalysis = `${mainStar} önderliğindeki kadro hikayeyi taşıyor.`;

    // --- NE ZAMAN İZLENMELİ ---
    let watchTiming = { icon: '🌙', title: 'Akşam Keyfi', desc: 'Günün yorgunluğunu atmak için ideal.' };
    if (isDark) watchTiming = { icon: '🌑', title: 'Gece Geç Saatler', desc: 'Karanlık atmosfer için geceyi bekleyin. Kulaklık tavsiye edilir.' };
    else if (isLight && genres.some(g => ['Komedi', 'Aile'].includes(g))) watchTiming = { icon: '👨‍👩‍👧‍👦', title: 'Aile/Arkadaş Buluşması', desc: 'Birlikte keyifle izlenebilecek hafif bir yapım.' };
    else if (runtime > 150) watchTiming = { icon: '☕', title: 'Boş Bir Pazar Günü', desc: 'Uzun bir yapım — rahatça oturup izleyebileceğiniz geniş bir zaman dilimi ayırın.' };
    else if (score >= 8) watchTiming = { icon: '🎬', title: 'Sinema Gecesi', desc: 'Kaliteli bir deneyim için ışıkları kapatın, sesi açın.' };

    // --- TEKRAR İZLEME DEĞERİ ---
    let rewatchValue = { score: 5, label: 'Orta', icon: '🔄' };
    if (score >= 8.5 && votes > 5000) rewatchValue = { score: 9, label: 'Çok Yüksek', icon: '💎' };
    else if (score >= 7.5) rewatchValue = { score: 7, label: 'Yüksek', icon: '👍' };
    else if (score < 5.5) rewatchValue = { score: 2, label: 'Düşük', icon: '👎' };

    // --- TÜR-ÖZEL TEMATİK YORUM ---
    let thematicInsight = '';
    const genreSet = new Set(genres);
    if (genreSet.has('Bilim Kurgu') && genreSet.has('Dram')) thematicInsight = 'İnsanlık durumunu bilim kurgu prizmasından sorgulayan felsefi bir yapım.';
    else if (genreSet.has('Korku') && genreSet.has('Gerilim')) thematicInsight = 'Hem psikolojik gerilim hem de korku unsurlarıyla dolu, kalp atışınızı hızlandıracak bir deneyim.';
    else if (genreSet.has('Komedi') && genreSet.has('Romantik')) thematicInsight = 'Gülümseten romantizm ve eğlenceli diyaloglarla dolu, keyifli bir izleme deneyimi.';
    else if (genreSet.has('Aksiyon') && genreSet.has('Macera')) thematicInsight = 'Nefes kesen aksiyon sekansları ve epik macera sahneleriyle dolu bir adrenalin bombardımanı.';
    else if (genreSet.has('Belgesel')) thematicInsight = 'Gerçek dünyadan hikayeler anlatan, bakış açınızı genişletecek bilgi dolu bir yapım.';

    return {
        verdict, verdictIcon, verdictClass, verdictReason,
        prosAndCons,
        reviewAnalysis: aiNarrative,
        recentReview: reviews[0], targetAudience,
        finalWord,
        score, votes, term, termCap, originalTitle, localTitle, genres, runtime, reviewCount, isUnreleased,
        psychProfile, matchRate, epicSynopsis,
        budgetAnalysis, seasonInfo, topCast, castAnalysis,
        watchTiming, rewatchValue, thematicInsight
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

// --- TÜRKÇE TARİH FORMATLAMA ---
const TR_MONTHS = ['Ocak','Şubat','Mart','Nisan','Mayıs','Haziran','Temmuz','Ağustos','Eylül','Ekim','Kasım','Aralık'];

export const formatTurkishDate = (dateStr) => {
    if (!dateStr) return 'Bilinmiyor';
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return `${d.getDate()} ${TR_MONTHS[d.getMonth()]} ${d.getFullYear()}`;
};

// --- YAYIN DURUMU ---
export const getReleaseStatus = (details, type) => {
    const isTv = type === 'tv';
    const releaseDate = details.release_date || details.first_air_date;
    const now = new Date();
    const relDate = releaseDate ? new Date(releaseDate) : null;

    if (isTv) {
        const status = details.status;
        if (status === 'Returning Series') return { label: 'Devam Ediyor', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: '📺' };
        if (status === 'Ended') return { label: 'Final Yaptı', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: '🏁' };
        if (status === 'Canceled') return { label: 'İptal Edildi', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', icon: '❌' };
        if (status === 'In Production') return { label: 'Yapım Aşamasında', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', icon: '🎬' };
        if (status === 'Planned') return { label: 'Planlanıyor', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: '📋' };
        return { label: status || 'Bilinmiyor', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: '❓' };
    }

    if (!relDate) return { label: 'Tarih Bilinmiyor', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', icon: '❓' };
    if (relDate > now) {
        return { label: `Vizyon: ${formatTurkishDate(releaseDate)}`, color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/20', icon: '⏳' };
    }
    const diffDays = Math.floor((now - relDate) / (1000 * 60 * 60 * 24));
    if (diffDays < 60) return { label: 'Yeni Vizyonda', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', icon: '🎬' };
    return { label: 'Yayınlandı', color: 'text-green-400', bg: 'bg-green-500/10 border-green-500/20', icon: '✅' };
};
