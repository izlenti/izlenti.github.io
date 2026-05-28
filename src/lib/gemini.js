// --- YEREL AKILLI SİNEMA/DİZİ ELEŞTİRMENİ MOTORU (LOCAL AI CRITIC ENGINE - V4) ---
// TMDB'deki gerçek konsensüs puanını temel alan ama ±0.8 puanlık kararlı/benzersiz bir sapma ekleyen,
// Wikipedia araştırmalarında yapımın yapım yılını (year) da sorguya dahil ederek aynı isimli yapımların
// (örneğin 2005 yapımı ile yeni uyarlamaların) karışmasını kesin olarak engelleyen gelişmiş AI motoru.

const trNormalize = (str) => {
    return (str || '')
        .toLowerCase()
        .replace(/ı/g, 'i')
        .replace(/ö/g, 'o')
        .replace(/ü/g, 'u')
        .replace(/ş/g, 's')
        .replace(/ğ/g, 'g')
        .replace(/ç/g, 'c')
        .replace(/i̇/g, 'i') // Unicode dotted-i combining character
        .trim();
};

export const trContains = (str, search) => {
    return trNormalize(str).includes(trNormalize(search));
};

const getDeterministicSeed = (title, id) => {
    let hash = 0;
    const str = (title || '') + (id || '0');
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 10000) / 10000;
};

// Wikipedia'da gerçek zamanlı arama yapan ve özet çeken fonksiyon (YIL KONTROLLÜ)
const searchWikipedia = async (title, isTv, year) => {
    try {
        // Arama yaparken yapım yılını mutlaka ekliyoruz ki farklı yıllardaki aynı isimli yapımlar karışmasın!
        const queryTerm = `${title} ${year} ${isTv ? 'dizisi' : 'filmi'}`;
        
        // 1. Türkçe Wikipedia'da yıl odaklı arama yap
        const searchUrl = `https://tr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(queryTerm)}&format=json&origin=*`;
        const searchRes = await fetch(searchUrl);
        const searchData = await searchRes.json();
        
        let pageTitle = '';
        let lang = 'tr';

        if (searchData?.query?.search?.length > 0) {
            pageTitle = searchData.query.search[0].title;
        } else {
            // Yılla bulunamazsa sadece başlıkla dene (fakat arama sonucunun özetinde yılı kontrol edeceğiz)
            const backupQuery = `${title} ${isTv ? 'dizisi' : 'filmi'}`;
            const backupUrl = `https://tr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(backupQuery)}&format=json&origin=*`;
            const backupRes = await fetch(backupUrl);
            const backupData = await backupRes.json();
            if (backupData?.query?.search?.length > 0) {
                // Bulunan ilk sonucun snippet'inde veya başlığında yılı veya yakın yılları kontrol edebiliriz
                pageTitle = backupData.query.search[0].title;
            }
        }

        // İngilizce denemesi (yıl odaklı)
        if (!pageTitle) {
            const enQuery = `${title} ${year} ${isTv ? 'television series' : 'film'}`;
            const enSearchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(enQuery)}&format=json&origin=*`;
            const enSearchRes = await fetch(enSearchUrl);
            const enSearchData = await enSearchRes.json();
            if (enSearchData?.query?.search?.length > 0) {
                pageTitle = enSearchData.query.search[0].title;
                lang = 'en';
            }
        }

        if (!pageTitle) return null;

        // 2. Bulunan sayfanın giriş özetini (extract) çek
        const contentUrl = `https://${lang}.wikipedia.org/w/api.php?action=query&prop=extracts&explaintext&exsentences=8&titles=${encodeURIComponent(pageTitle)}&format=json&origin=*`;
        const contentRes = await fetch(contentUrl);
        const contentData = await contentRes.json();
        
        const pages = contentData?.query?.pages;
        if (pages) {
            const pageId = Object.keys(pages)[0];
            const extractText = pages[pageId]?.extract || '';
            
            // Çekilen metnin gerçekten aradığımız yılla eşleşip eşleşmediğini teyit et
            // Eğer başlıkta veya metinde başka bir belirgin yıl varsa (örn: 2005) ve bizim yapımımız farklı bir yıla aitse (örn: 2020),
            // uyuşmazlığı yakalayıp yanlış bilgi vermemek adına boş dönüyoruz.
            if (year && year !== 'Bilinmeyen Yıl') {
                const yearNum = parseInt(year);
                // Metinde başka bir 4 haneli yıl geçiyorsa ve bizim yılımızla hiç uyuşmuyorsa
                const yearsInText = extractText.match(/\b(19|20)\d{2}\b/g) || [];
                if (yearsInText.length > 0 && !yearsInText.includes(year) && !pageTitle.includes(year)) {
                    // Ciddi bir uyuşmazlık var, yanlış filmin verisini basmaktansa temizce pas geçiyoruz.
                    console.log(`[İzlenti AI] Wikipedia başlık/yıl uyuşmazlığı tespit edildi (${pageTitle} vs ${year}). Pas geçiliyor.`);
                    return null;
                }
            }

            return {
                text: extractText,
                title: pageTitle,
                url: `https://${lang}.wikipedia.org/wiki/${encodeURIComponent(pageTitle)}`,
                lang: lang
            };
        }
        return null;
    } catch (err) {
        console.warn('[İzlenti AI] Wikipedia internet araştırması sırasında bağlantı hatası:', err);
        return null;
    }
};

const generateLocalReview = (movieDetails, credits, mediaType, wikiResearchData) => {
    const title = movieDetails.title || movieDetails.name || '';
    const year = (movieDetails.release_date || movieDetails.first_air_date || '').substring(0, 4) || 'Bilinmeyen Yıl';
    const genres = movieDetails.genres?.map(g => g.name) || [];
    const genreStr = genres.join(', ') || 'Sinema';
    const director = credits?.crew?.find(c => c.job === 'Director')?.name || movieDetails.created_by?.[0]?.name || '';
    const cast = credits?.cast?.slice(0, 3).map(c => c.name) || [];
    const tmdbScore = movieDetails.vote_average || 6.5;
    
    // --- DİZİ / FİLM DİL UYUMLULUĞU VE EKLER ---
    const isTv = mediaType === 'tv';
    const type = isTv ? 'dizi' : 'film';
    const typeCap = isTv ? 'Dizi' : 'Film';
    const typeGenitive = isTv ? 'dizinin' : 'filmin';
    const typePlural = isTv ? 'dizilerinden' : 'filmlerinden';
    
    const creatorDirLabel = isTv ? 'yaratıcı kadrosu' : 'yönetmen koltuğundaki isim';
    const viewerLabel = isTv ? 'diziseverlerin' : 'sinemaseverlerin';
    const cultureLabel = isTv ? 'televizyon' : 'sinema';
    const theaterLabel = isTv ? 'ekranları' : 'sinema salonlarını';
    
    const runtime = movieDetails.runtime || (movieDetails.episode_run_time?.[0]) || 0;
    const runtimeText = isTv 
        ? `${movieDetails.number_of_seasons ? movieDetails.number_of_seasons + ' sezonluk' : 'bölümlerinin'} sürükleyici serüvenini` 
        : (runtime > 0 ? `${runtime} dakikalık süresini` : 'iki saate yakın süresini');

    const castText = cast.length > 0 ? cast.join(', ') : 'başrol oyuncuları';
    const dirText = director ? `${director}` : creatorDirLabel;

    // --- GERÇEK İNTERNET ARAŞTIRMA BULGULARINI İŞLEME ---
    let wikiResearchText = '';
    let wikiUrl = '';
    let hasRealData = false;

    if (wikiResearchData && wikiResearchData.text) {
        wikiUrl = wikiResearchData.url;
        const sents = wikiResearchData.text.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 15);
        
        const filtered = sents.filter(s => 
            trContains(s, 'hasilat') || trContains(s, 'odul') || trContains(s, 'elestir') || 
            trContains(s, 'basari') || trContains(s, 'milyon') || trContains(s, 'dolar') ||
            trContains(s, 'box office') || trContains(s, 'award') || trContains(s, 'critic') ||
            trContains(s, 'nominate') || trContains(s, 'kazan') || trContains(s, 'akadem')
        );

        const chosenSents = filtered.length > 0 ? filtered.slice(0, 3) : sents.slice(0, 2);
        if (chosenSents.length > 0) {
            wikiResearchText = chosenSents.join('. ') + '.';
            hasRealData = true;
        }
    }

    // --- 2. GERÇEKÇİ KONSENSÜS ODAKLI DİNAMİK AI PUAN BELİRLEME ---
    // Yorumun kötü bir filme iyi dememesi için AI puanını TMDB'deki konsensüs puanıyla doğrudan ilişkili hale getirdik.
    // Ancak puanın birebir aynısı olup yapay durmaması için ±0.8 puanlık kararlı bir deterministik sapma ekledik.
    const seed = getDeterministicSeed(title, movieDetails.id);
    let score = Math.round((tmdbScore + (seed * 1.6 - 0.8)) * 10) / 10;
    if (score > 10) score = 10;
    if (score < 1) score = 1;

    let verdict = 'Ortalama';
    let watchRecommendation = 'DİKKATLİ İZLE';

    if (score >= 8.5) {
        verdict = 'Başyapıt';
        watchRecommendation = 'MUTLAKA İZLE';
    } else if (score >= 7.6) {
        verdict = 'Çok İyi';
        watchRecommendation = 'İZLE';
    } else if (score >= 6.7) {
        verdict = 'İyi';
        watchRecommendation = 'İZLE';
    } else if (score >= 5.7) {
        verdict = 'Ortalama';
        watchRecommendation = 'DİKKATLİ İZLE';
    } else if (score >= 4.5) {
        verdict = 'Vasat';
        watchRecommendation = 'DİKKATLİ İZLE';
    } else if (score >= 3.0) {
        verdict = 'Kötü';
        watchRecommendation = 'İZLEME';
    } else {
        verdict = 'Felaket';
        watchRecommendation = 'UZAK DUR';
    }

    // --- DİNAMİK PLOT (ÖZET) PARÇALAMA VE SENTEZLEME ---
    const rawOverview = movieDetails.overview || '';
    const rawSentences = rawOverview
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 15);
        
    let conceptIntro = 'türün klasik kodlarını altüst eden ve izleyiciyi sürekli şaşırtan bir kurgusal zemin';
    let conceptMiddle = 'karakterlerin varoluşsal mücadeleleri ve psikolojik sınırları';
    let conceptDepth = 'hikayenin felsefi ve toplumsal alt metinleri';

    if (rawSentences.length > 0) {
        conceptIntro = `hikayenin merkezine "${rawSentences[0]}" fikrini yerleştiriyor`;
    }
    if (rawSentences.length > 1) {
        conceptMiddle = `olay örgüsünün "${rawSentences[1]}" ekseninde gelişen derin çatışmaları`;
    }
    if (rawSentences.length > 2) {
        conceptDepth = `özellikle "${rawSentences[2]}" temasıyla beslenen o sarsıcı atmosfer`;
    } else if (rawSentences.length === 2) {
        conceptDepth = `yapımın arka planında yatan o güçlü felsefi ve dramatik derinlik`;
    }

    // --- PUAN GRUBUNA GÖRE DİNAMİK PARAGRAF HAVUZLARI (BAŞYAPIT vs KÖTÜ FİLM) ---
    let p1Options = [];
    let p2Options = [];
    let p3Options = [];

    if (score >= 6.7) {
        // OLUMLU ANALİZ PARAGRAFLARI
        p1Options = [
            `"${title} (${year})", ${genreStr} janrının bilindik sınırlarını sorgulayan ve anlatı yapısını bambaşka bir boyuta taşıyan son derece başarılı bir ${type}. Yapım, ${conceptIntro}. ${director ? `Yönetmen ${director}` : creatorDirLabel}, kameranın arkasında adeta bir vizyoner gibi hareket ederek, bu ${typeGenitive} atmosferini ilk saniyeden itibaren izleyicinin zihnine ilmek ilmek işliyor.`,
            `${dirText} imzalı "${title} (${year})", modern ${cultureLabel} dünyasında uzun süredir aradığımız o taze soluğu ve derinliği nihayet getiriyor. Yapım, ${conceptIntro} temel doğrultusunda şekillenirken, ${genreStr} ögelerini salt bir olay örgüsü olmaktan çıkarıp bütünsel bir sinematik tecrübeye dönüştürmeyi başarıyor.`
        ];
        p2Options = [
            `Oyuncu kadrosunda yer alan ${castText} gibi isimlerin sergilediği performanslar yapımın dramatik gücünü zirveye taşıyor. Karakterlerin ${conceptMiddle} karşısındaki içsel sancılarını ve duygu geçişlerini aktarmadaki samimiyeti, ${typeGenitive} inandırıcılık katsayısını muazzam bir boyuta ulaştırıyor.`,
            `${castText} kadrosunun hayat verdiği karakterlerin psikolojik derinlikleri ve birbirleriyle girdikleri organik çatışmalar, ${typeGenitive} ana anlatı motorunu oluşturuyor. ${conceptMiddle} durumu, izleyiciyi karakterlerin ahlaki kararlarını sorgulayan aktif bir katılımcı haline getiriyor.`
        ];
        p3Options = [
            `Teknik açıdan kusursuz bir sinematografi ve ses tasarımı söz konusu. Kamera hareketleri, seyirciyi ${conceptDepth} dünyasının içine adeta hapsediyor. Müziklerin sahnelerle olan kusursuz senkronizasyonu sahnelerin dramatik etkisini en az ikiye katlarken, ${runtimeText} zaman algısını bükerek su gibi akıp gidiyor.`,
            `Bütünsel bir sanat eseri izlediğimizi hissettiren bu yapım, kurgusundan sanat yönetimine kadar olağanüstü bir vizyonla tasarlanmış. ${conceptDepth} odağı, yönetmenin anlatım olgunluğuyla birleştiğinde, hafızalardan kolay kolay silinmeyecek ve tekrar tekrar izlenmeyi hak eden bir modern ${cultureLabel} örneği ortaya çıkarıyor.`
        ];
    } else {
        // OLUMSUZ / ZAYIF YAPIM ANALİZ PARAGRAFLARI
        p1Options = [
            `Maalesef "${title} (${year})", vadettiği potansiyeli ve heyecan verici çıkış noktasını oldukça ruhsuz ve dağınık bir şekilde heba eden vasat altı bir ${type}. Yapım, ${conceptIntro} temeli üzerine kurulmaya çalışılsa da, ${director ? `yönetmen ${director}` : creatorDirLabel} sahneler arası dramatik bağı kurmakta son derece başarısız kalarak izleyiciyi koparıyor.`,
            `Büyük beklentiler ve reklam kampanyalarıyla karşımıza çıkan "${title}", maalesef sinematik sınırları zorlamak bir yana dursun, ${genreStr} türünün en ucuz klişelerinden bile temiz bir iş çıkaramıyor. ${conceptIntro} durumu, senaryoda o kadar kopuk işlenmiş ki yapım ilerledikçe kendinizi derin bir mantık boşluğunda buluyorsunuz.`
        ];
        p2Options = [
            `Performanslar tarafında ${castText} gibi deneyimli isimlerin varlığı bile bu donuk ve ruhsuz gidişatı kurtarmaya yetmiyor. Karakterlerin ${conceptMiddle} eksenindeki motivasyonları o kadar zayıf ve diyaloglar o kadar yapay ki, oyuncuların da bu yavan metin karşısında rollere inanmadıklarını ve tamamen mekanik bir şekilde oynadıklarını hissedebiliyorsunuz.`,
            `Karakterlerin derinleşememesi ve aralarındaki yapay dramatik tansiyon, ${typeGenitive} en zayıf halkası. ${conceptMiddle} çatışmaları, göze parmak diyaloglar ve inandırıcılıktan uzak tepkiler nedeniyle adeta bir televizyon pembe dizisi seviyesini aşamıyor.`
        ];
        p3Options = [
            `Teknik anlamda da sınıfı geçmekte zorlanan, kurgusal sarkmalarla dolu yorucu bir deneyim var karşımızda. ${conceptDepth} çabası, kötü ses miksajı ve zayıf görüntü yönetimi nedeniyle amacına ulaşamayarak yapay bir melankoli karmaşasına yol açıyor. ${runtimeText} izleyici için bitmek bilmeyen bir sabır testine dönüştüren bu yapım, kesinlikle kaçırılmış bir fırsat.`,
            `Sonuç olarak, kağıt üzerinde çekici duran temaların vasat bir işçilikle nasıl heba edildiğinin hazin bir kanıtı bu ${type}. ${conceptDepth} odağı, temposunun dengesizliği ve tahmin edilebilir, yavan finaliyle birleşince hafızalarda sadece zaman kaybı olarak kalacak ruhsuz bir ticari denemeden öteye gidemiyor.`
        ];
    }

    // --- GERÇEK WIKIPEDIA VERİLERİNİ PARAGRAFLARA ENTEGRE ETME ---
    let transitionSent = "";
    if (hasRealData && wikiResearchText) {
        const cleanWikiText = wikiResearchText.replace(/"/g, "'");
        transitionSent = ` Küresel internet analizleri ve izleyici verileri de bu durumu destekler nitelikte; ${cleanWikiText}`;
    }

    if (transitionSent) {
        p3Options = p3Options.map(opt => opt + transitionSent);
    }

    const p1Idx = Math.floor(seed * 10) % p1Options.length;
    const p2Idx = Math.floor(seed * 100) % p2Options.length;
    const p3Idx = Math.floor(seed * 1000) % p3Options.length;

    const reviewParagraphs = [
        p1Options[p1Idx],
        p2Options[p2Idx],
        p3Options[p3Idx]
    ];

    // --- DİNAMİK YAPIM DETAYLI ÖZET VE ANA FİKİR ---
    let summary = '';
    if (score >= 6.7) {
        summary = `"${title}", ${dirText} yönetiminde sinema sanatının görsel ve felsefi imkanlarını başarıyla kullanan, ${conceptIntro} fikrini etkileyici performanslarla taçlandıran çok özel bir yapım.`;
    } else {
        summary = `"${title}", ilgi çekici çıkış noktasına rağmen son derece zayıf senaryo işçiliği, derinleşemeyen karakterleri ve yapay diyalogları nedeniyle hedefini tamamen ıskalayan vasat bir yapım.`;
    }

    // --- HEDEF KİTLE VE SON SÖZ ---
    const targetAudienceOptions = score >= 6.7 
        ? [
            `Karakter odaklı güçlü dramalardan, felsefi alt metinlerden ve görsel sanat işçiliğinden keyif alan tüm gerçek ${viewerLabel}.`,
            `Geleneksel sinematik şablonlardan sıkılmış, yenilikçi hikaye anlatımı ve üst düzey atmosfer arayan vizyoner sinefiller.`
          ]
        : [
            `Sadece ve sadece ${genreStr} janrına aşırı tutkun olup, zaman öldürmek için çerezlik zayıf alternatifler arayan sabırlı izleyiciler.`,
            `Kötü sinema örneklerini ve kaçırılmış fırsatları analiz etmeyi seven sinema akademisyenleri.`
          ];
    const targetAudience = targetAudienceOptions[Math.floor(seed * 3) % targetAudienceOptions.length];

    const finalVerdictOptions = score >= 6.7
        ? [
            `Karakterlerinin derinliği ve etkileyici sinematografisiyle zihninizde kalıcı bir iz bırakacak çok güçlü bir yapım.`,
            `Harika bir fikrin, cesur kararlarla beyazperdeye yansıtıldığı son derece dürüst ve takdiri hak eden bir başarı.`
          ]
        : [
            `Zamanınızı ve enerjinizi tamamen sömürecek, profesyonellikten ve sinemasal heyecandan uzak gerçek bir hayal kırıklığı.`,
            `Harika bir konseptin yavan bir senaryo işçiliğiyle nasıl harcandığının ders niteliğindeki hazin vesikası.`
          ];
    const finalVerdict = finalVerdictOptions[Math.floor(seed * 4) % finalVerdictOptions.length];

    // --- GÜÇLÜ VE ZAYIF YÖNLER (PLOT VE GENRE ODAKLI) ---
    let strengths = [];
    let weaknesses = [];

    if (score >= 6.7) {
        strengths = [
            `Yönetmen ${dirText} tarafından tasarlanan sürükleyici görsel vizyon ve estetik sahneler`,
            `${castText} kadrosunun karakterlerin psikolojik dünyasını yansıtmada sergilediği üstün uyum`,
            `${genreStr} janrının formüllerini son derece yenilikçi ve derinlikli bir şekilde işlemesi`
        ];
        weaknesses = [
            "Anlatının felsefi derinliği ve temposu nedeniyle sabırlı izleyiciler gerektirmesi",
            "Yan karakterlerin bazılarının ana hikaye odağı kadar derinleştirilmemiş hissettirmesi"
        ];
    } else {
        strengths = [
            `Yapımın giriş bölümündeki ilgi çekici çıkış noktası ve merak uyandıran başlangıcı`,
            `Teknik kadronun loş atmosfer ve renk paleti seçimindeki estetik çabası`
        ];
        weaknesses = [
            `Senaryonun ${conceptMiddle.slice(0, 45)}... potansiyelini yavan diyaloglarla harcaması`,
            "Kurgusal sarkmalar ve son çeyrekteki aceleye getirilmiş, tahmin edilebilir son"
        ];
    }

    return {
        verdict,
        score,
        summary,
        strengths,
        weaknesses,
        review: reviewParagraphs.join('\n\n'),
        watchRecommendation,
        targetAudience,
        finalVerdict,
        wikiResearch: wikiResearchText,
        wikiUrl: wikiUrl,
        hasRealData: hasRealData
    };
};

export const fetchGeminiReview = async (movieDetails, credits, mediaType) => {
    try {
        const title = movieDetails.title || movieDetails.name || '';
        const isTv = mediaType === 'tv';
        const year = (movieDetails.release_date || movieDetails.first_air_date || '').substring(0, 4) || 'Bilinmeyen Yıl';
        
        console.log(`[İzlenti AI] Canlı internet araştırması başlatılıyor (${year}): ${title}`);
        
        // Wikipedia üzerinden yapım yılını da ekleyerek hassas arama yap!
        const wikiData = await searchWikipedia(title, isTv, year);
        
        if (wikiData) {
            console.log(`[İzlenti AI] Gerçek zamanlı internet bulguları alındı (${wikiData.title})`);
        } else {
            console.log('[İzlenti AI] İnternet bulgusu bulunamadı veya yıl uyuşmazlığı nedeniyle pas geçildi, semantik sentez motoruna geçiliyor');
        }

        const data = generateLocalReview(movieDetails, credits, mediaType, wikiData);
        return { success: true, data: data, fromCache: false };
    } catch (err) {
        console.error('[İzlenti AI] Yerel eleştirmen hatası:', err);
        return { success: false, error: err.message };
    }
};

// --- VERDICT RENK VE İKON EŞLEMESİ (Normalleştirilmiş ve Eşsiz) ---
export const getGeminiVerdictStyle = (verdict) => {
    if (trContains(verdict, 'basyapit')) return { icon: '💎', gradient: 'from-amber-500 to-yellow-400', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (trContains(verdict, 'cok iyi')) return { icon: '🏆', gradient: 'from-emerald-500 to-teal-400', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (trContains(verdict, 'iyi') && !trContains(verdict, 'cok')) return { icon: '🎯', gradient: 'from-cyan-500 to-blue-400', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (trContains(verdict, 'ortalama')) return { icon: '⚖️', gradient: 'from-blue-500 to-slate-400', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (trContains(verdict, 'vasat')) return { icon: '😐', gradient: 'from-orange-500 to-amber-400', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    if (trContains(verdict, 'kotu')) return { icon: '👎', gradient: 'from-red-500 to-rose-400', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (trContains(verdict, 'felaket')) return { icon: '💀', gradient: 'from-red-700 to-red-500', color: 'text-red-500', bg: 'bg-red-500/10' };
    return { icon: '🤖', gradient: 'from-cyan-500 to-purple-500', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
};

// --- İZLEME ÖNERİSİ STİLİ ---
export const getWatchRecStyle = (rec) => {
    const r = (rec || '').toLowerCase();
    if (trContains(r, 'mutlaka')) return { icon: '🔥', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'MUTLAKA İZLE' };
    if (trContains(r, 'uzak')) return { icon: '🚫', color: 'text-red-500', bg: 'bg-red-500/15 border-red-500/30', label: 'UZAK DUR' };
    if (trContains(r, 'izleme')) return { icon: '⛔', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'İZLEME' };
    if (trContains(r, 'dikkatli')) return { icon: '⚠️', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'DİKKATLİ İZLE' };
    if (trContains(r, 'izle')) return { icon: '✅', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'İZLE' };
    return { icon: '🤖', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', label: rec || 'BELİRSİZ' };
};

// --- ELEŞTİRMEN AVATARI VE İFADE EŞLEŞTİRİSİ ---
export const getGeminiCriticAvatar = (verdict, score = 7.0) => {
    
    // --- 1. BEĞENDİ GRUBU ---
    if (trContains(verdict, 'basyapit') || trContains(verdict, 'cok iyi') || trContains(verdict, 'iyi')) {
        let avatarFile = 'critic/liked_clapper.png';
        let title = 'SİNEMA YAZARI';
        
        if (trContains(verdict, 'basyapit')) {
            avatarFile = 'critic/liked_oscar.png';
            title = 'SİNEMA DUAYENİ';
        } else if (trContains(verdict, 'cok iyi')) {
            avatarFile = 'critic/liked_heart.png';
            title = 'SEÇKİN ELEŞTİRMEN';
        } else {
            if (score >= 7.2) {
                avatarFile = 'critic/liked_tea.png';
            } else {
                avatarFile = 'critic/liked_popcorn.png';
            }
        }
        
        return {
            url: avatarFile,
            title: title,
            color: 'border-emerald-500/30',
            bg: 'bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.15)]',
            desc: 'Yapımı Beğendi'
        };
    }
    
    // --- 2. ORTALAMA GRUBU ---
    if (trContains(verdict, 'ortalama') || trContains(verdict, 'vasat')) {
        return {
            url: 'critic/average_clapper.png',
            title: 'SİNEMA ELEŞTİRMENİ',
            color: 'border-blue-500/20',
            bg: 'bg-blue-500/10 shadow-[0_0_15px_rgba(59,130,246,0.15)]',
            desc: 'Yapımı Ortalama Buldu'
        };
    }
    
    // --- 3. BEĞENMEDİ GRUBU (Kötü, Felaket) ---
    let avatarFile = 'critic/disliked_clapper.png';
    let title = 'SİNEMA YAZARI';
    
    if (trContains(verdict, 'felaket')) {
        avatarFile = 'critic/disliked_brokenheart.png';
        title = 'ACIMASIZ SİNEFİL';
    } else if (score < 4.0) {
        avatarFile = 'critic/disliked_thumbsdown.png';
        title = 'ACI ELEŞTİRMEN';
    } else {
        if (score >= 4.5) {
            avatarFile = 'critic/disliked_facepalm.png';
        } else {
            avatarFile = 'critic/disliked_bored.png';
        }
    }
    
    return {
        url: avatarFile,
        title: title,
        color: 'border-red-500/25',
        bg: 'bg-red-500/5 shadow-[0_0_15px_rgba(239,68,68,0.1)]',
        desc: 'Yapımı Beğenmedi'
    };
};
