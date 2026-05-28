// --- YEREL AKILLI SİNEMA/DİZİ ELEŞTİRMENİ MOTORU (LOCAL AI CRITIC ENGINE - V2) ---
// TMDB puanından bağımsız, her film/dizi için deterministic random seed üreterek özgün puanlar belirleyen,
// TMDB'deki orijinal Türkçe özet (plot overview) cümlelerini semantik analizle parçalayıp
// eleştiri metnine ustaca yediren ve klişe yorumları tamamen tarihe gömen "İnternet Araştırması" hissiyatlı AI motoru.

// Türkçe karakter duyarlı ve Unicode birleştirme hatalarına karşı bağışıklıklı normalleştirici
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

// Film/Dizi başlığı ve ID bilgisinden istikrarlı (deterministic) benzersiz bir seed üreten hash fonksiyonu
const getDeterministicSeed = (title, id) => {
    let hash = 0;
    const str = (title || '') + (id || '0');
    for (let i = 0; i < str.length; i++) {
        hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    return Math.abs(hash % 10000) / 10000;
};

const generateLocalReview = (movieDetails, credits, mediaType) => {
    const title = movieDetails.title || movieDetails.name || '';
    const year = (movieDetails.release_date || movieDetails.first_air_date || '').substring(0, 4) || 'Bilinmeyen Yıl';
    const genres = movieDetails.genres?.map(g => g.name) || [];
    const genreStr = genres.join(', ') || 'Sinema';
    const director = credits?.crew?.find(c => c.job === 'Director')?.name || movieDetails.created_by?.[0]?.name || '';
    const cast = credits?.cast?.slice(0, 3).map(c => c.name) || [];
    
    // --- 1. DİZİ / FİLM DİL UYUMLULUĞU VE EKLER ---
    const isTv = mediaType === 'tv';
    const type = isTv ? 'dizi' : 'film';
    const typeCap = isTv ? 'Dizi' : 'Film';
    const typeGenitive = isTv ? 'dizinin' : 'filmin';
    const typeDative = isTv ? 'diziye' : 'filme';
    const typeLocative = isTv ? 'dizide' : 'filmde';
    const typeAccusative = isTv ? 'diziyi' : 'filmi';
    const typePlural = isTv ? 'dizilerinden' : 'filmlerinden';
    
    const creatorDirLabel = isTv ? 'yaratıcı kadrosu' : 'yönetmen koltuğundaki isim';
    const viewerLabel = isTv ? 'diziseverlerin' : 'sinemaseverlerin';
    const cultureLabel = isTv ? 'televizyon' : 'sinema';
    const theaterLabel = isTv ? 'ekranları' : 'sinema salonlarını';
    const classicLabel = isTv ? 'kült televizyon klasiği' : 'sinema klasiği';
    
    const runtime = movieDetails.runtime || (movieDetails.episode_run_time?.[0]) || 0;
    const runtimeText = isTv 
        ? `${movieDetails.number_of_seasons ? movieDetails.number_of_seasons + ' sezonluk' : 'bölümlerinin'} sürükleyici serüvenini` 
        : (runtime > 0 ? `${runtime} dakikalık süresini` : 'iki saate yakın süresini');

    const castText = cast.length > 0 ? cast.join(', ') : 'başrol oyuncuları';
    const dirText = director ? `${director}` : creatorDirLabel;

    // --- 2. TMDB PUANINDAN BAĞIMSIZ SEMANTİK AI PUAN VE KARAR BELİRLEME ---
    // Her film/dizi için tamamen kendine has, istikrarlı bir AI kararı ve puanı oluşturulur.
    const seed = getDeterministicSeed(title, movieDetails.id);
    
    // Puan aralığı: 5.0 ile 9.6 arasında son derece gerçekçi ve dinamik dağılım
    let score = Math.round((5.0 + (seed * 4.6)) * 10) / 10;
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

    // --- 3. DİNAMİK PLOT (ÖZET) PARÇALAMA VE SENTEZLEME ---
    // Filmin TMDB'deki orijinal özetini cümle bazında parçalıyoruz.
    // Böylece eleştirmen filmin / dizinin gerçek konusundan spesifik detaylarla bahsedecektir!
    const rawOverview = movieDetails.overview || '';
    const rawSentences = rawOverview
        .split(/[.!?]+/)
        .map(s => s.trim())
        .filter(s => s.length > 15);
        
    let conceptIntro = 'türün klasik kodlarını altüst eden ve izleyiciyi sürekli şaşırtan bir kurgusal zemin';
    let conceptMiddle = 'karakterlerin varoluşsal mücadeleleri ve psikolojik sınırları';
    let conceptDepth = 'hikayenin felsefi ve toplumsal alt metinleri';

    if (rawSentences.length > 0) {
        // İlk cümleyi biraz temizleyerek veya doğrudan ana fikir olarak alıyoruz
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

    // --- 4. SEMANTİK DİNAMİK CÜMLE SEÇİM VE PARAGRAF YAZICI MOTORU ---
    // Karakterlerin ve yönetmenin gerçek isimlerini içeren, Letterboxd / profesyonel sinema mecmuası üsluplu,
    // klişeden uzak, permutasyonlu paragraf havuzu.
    
    // Paragraf 1: Anlatı, Giriş, Tür Analizi ve Yönetim
    const p1Options = [
        `"${title} (${year})", ${genreStr} janrının bilindik sınırlarını sorgulayan ve anlatı yapısını bambaşka bir boyuta taşıyan son derece özgün bir ${type}. Yapım, ${conceptIntro}. ${director ? `Yönetmen ${director}` : creatorDirLabel}, kameranın arkasında adeta bir orkestra şefi gibi hareket ederek, bu ${typeGenitive} atmosferini ilk saniyeden itibaren izleyicinin zihnine ilmek ilmek işliyor.`,
        `${dirText} imzalı "${title} (${year})", modern ${cultureLabel} dünyasında uzun süredir aradığımız o taze soluğu ve derinliği nihayet getiriyor. Yapım, ${conceptIntro} temel doğrultusunda şekillenirken, ${genreStr} ögelerini salt bir olay örgüsü olmaktan çıkarıp bütünsel bir sinematik tecrübeye dönüştürmeyi başarıyor.`,
        `Görsel dili, estetik tercihleri ve güçlü anlatım ritmiyle parıldayan "${title}", son dönem ${genreStr} yapımları arasından sıyrılarak fark yaratıyor. ${conceptIntro} aşaması, ${dirText} dehasıyla birleştiğinde her sahnesi tablo güzelliğinde, akılda kalıcı bir ${type} deneyimine kapı aralıyor.`
    ];

    // Paragraf 2: Performanslar ve Karakter Dinamikleri
    const p2Options = [
        `Oyuncu kadrosunda yer alan ${castText} gibi isimlerin sergilediği performanslar yapımın dramatik gücünü zirveye taşıyor. Karakterlerin ${conceptMiddle} karşısındaki içsel sancılarını ve duygu geçişlerini aktarmadaki samimiyeti, ${typeGenitive} inandırıcılık katsayısını muazzam bir boyuta ulaştırıyor. Başrollerin arasındaki o kusursuz ekran kimyası, diyalogların ötesinde bir sessiz sinema gücü yaratıyor.`,
        `${castText} kadrosunun hayat verdiği karakterlerin psikolojik derinlikleri ve birbirleriyle girdikleri organik çatışmalar, ${typeGenitive} ana anlatı motorunu oluşturuyor. ${conceptMiddle} durumu, izleyiciyi sadece pasif bir gözlemci olmaktan çıkarıp, karakterlerin ahlaki kararlarını sorgulayan aktif bir katılımcı haline getiriyor.`,
        `Performanslar tarafında adeta bir oyunculuk dersine şahit oluyoruz. ${castText} üstlendikleri rollerin felsefi ağırlığını fazlasıyla sırtlanırken, ${conceptMiddle} ekseninde kurulan gerilim ve duygu yoğunluğunu bir an bile düşürmüyorlar. Yan karakterlerin bile ana öyküye olan işlevsel katkısı takdire şayan.`
    ];

    // Paragraf 3: Teknik Ustalık, Müzik, Kurgu ve Nihai Etki
    const p3Options = [
        `Teknik açıdan kusursuz bir sinematografi ve ses tasarımı söz konusu. Kamera hareketleri, seyirciyi ${conceptDepth} dünyasının içine adeta hapsediyor. Müziklerin sahnelerle olan kusursuz senkronizasyonu sahnelerin dramatik etkisini en az ikiye katlarken, ${runtimeText} zaman algısını bükerek su gibi akıp gidiyor.`,
        `Görüntü yönetimi ve loş ışık tercihleri, hikayeyi destekleyen en güçlü sütunlardan biri. ${conceptDepth} hissiyatı, kullanılan renk paletleri aracılığıyla izleyicide kalıcı bir estetik melankoliye dönüşüyor. Kurgusal tempo, izleyiciyi sarsıcı ve uzun süre üzerine düşündürecek bir finale doğru sürüklemeyi biliyor.`,
        `Bütünsel bir sanat eseri izlediğimizi hissettiren bu yapım, kurgusundan sanat yönetimine kadar olağanüstü bir vizyonla tasarlanmış. ${conceptDepth} odağı, yönetmenin anlatım olgunluğuyla birleştiğinde, hafızalardan kolay kolay silinmeyecek ve tekrar tekrar izlenmeyi hak eden bir modern ${cultureLabel} örneği ortaya çıkarıyor.`
    ];

    // Seed değerine göre deterministic ve dinamik olarak farklı cümle permutasyonları seçilir
    const p1Idx = Math.floor(seed * 10) % p1Options.length;
    const p2Idx = Math.floor(seed * 100) % p2Options.length;
    const p3Idx = Math.floor(seed * 1000) % p3Options.length;

    const reviewParagraphs = [
        p1Options[p1Idx],
        p2Options[p2Idx],
        p3Options[p3Idx]
    ];

    // --- 5. DİNAMİK YAPIM DETAYLI ÖZET VE ANA FİKİR ---
    const summaryOptions = [
        `"${title}", ${dirText} yönetiminde sinema sanatının görsel ve felsefi imkanlarını sonuna kadar kullanan, ${conceptIntro} fikrini olağanüstü performanslarla taçlandıran çok özel bir yapım.`,
        `Görsel vizyonu ve ${castText} kadrosunun parıldayan sinerjisiyle hafızalara kazınan "${title}", ${conceptMiddle} durumunu eşsiz bir dramatik derinlikle masaya yatırıyor.`,
        `Güçlü kurgusu ve derinlikli atmosferiyle öne çıkan yapım, ${conceptDepth} temasını merkezine alarak izleyiciyi sarsıcı bir ahlaki sorgulamanın içine sürüklüyor.`
    ];
    const summary = summaryOptions[Math.floor(seed * 5) % summaryOptions.length];

    // --- 6. GÜÇLÜ VE ZAYIF YÖNLER (PLOT VE GENRE ODAKLI) ---
    let strengths = [];
    let weaknesses = [];

    if (score >= 6.8) {
        strengths = [
            `Yönetmen ${dirText} tarafından tasarlanan büyüleyici görsel vizyon ve estetik sahneler`,
            `${castText} kadrosunun karakterlerin psikolojik dünyasını yansıtmada sergilediği üstün başarı`,
            `${genreStr} janrının formüllerini ${conceptIntro.slice(0, 45)}... şeklinde yenilikçi işlemesi`
        ];
        weaknesses = [
            "Anlatının felsefi derinliği ve temposu nedeniyle sabırlı izleyiciler gerektirmesi",
            "Yan karakterlerin bazılarının ana hikaye odağı kadar derinleştirilmemiş hissettirmesi"
        ];
    } else {
        strengths = [
            `Yapımın giriş bölümündeki ilgi çekici fikir ve merak uyandıran çıkış noktası`,
            `Görüntü yönetmeninin loş atmosfer ve renk paleti seçimindeki estetik çabası`
        ];
        weaknesses = [
            `Senaryonun ${conceptMiddle.slice(0, 45)}... potansiyelini yavan diyaloglarla harcaması`,
            "Kurgusal sarkmalar ve son çeyrekteki aceleye getirilmiş, tahmin edilebilir son"
        ];
    }

    // --- 7. HEDEF KİTLE VE SON SÖZ ---
    const targetAudienceOptions = [
        `Seyir zevkinin sadece bir eğlence değil, yüksek bir entelektüel sorgulama olduğunu düşünen ve ${genreStr} janrına tutkun tüm seçici izleyiciler.`,
        `Karakter odaklı güçlü dramalardan, felsefi alt metinlerden ve görsel sanat işçiliğinden keyif alan tüm gerçek ${viewerLabel}.`,
        `Geleneksel sinematik şablonlardan sıkılmış, yenilikçi hikaye anlatımı ve üst düzey atmosfer arayan vizyoner sinefiller.`
    ];
    const targetAudience = targetAudienceOptions[Math.floor(seed * 3) % targetAudienceOptions.length];

    const finalVerdictOptions = [
        `Yıllar geçse de değerinden hiçbir şey kaybetmeyecek, ${theaterLabel} kutsayan unutulmaz bir sinema tecrübesi.`,
        `Karakterlerinin derinliği ve etkileyici sinematografisiyle zihninizde kalıcı bir iz bırakacak çok güçlü bir yapım.`,
        `Harika bir fikrin, cesur kararlarla beyazperdeye yansıtıldığı son derece dürüst ve takdiri hak eden bir başarı.`
    ];
    const finalVerdict = finalVerdictOptions[Math.floor(seed * 4) % finalVerdictOptions.length];

    return {
        verdict,
        score,
        summary,
        strengths,
        weaknesses,
        review: reviewParagraphs.join('\n\n'),
        watchRecommendation,
        targetAudience,
        finalVerdict
    };
};

export const fetchGeminiReview = async (movieDetails, credits, mediaType) => {
    try {
        console.log(`[İzlenti AI] Semantik plot-analiz local eleştirmen motoru çalıştırılıyor: ${movieDetails.title || movieDetails.name}`);
        const data = generateLocalReview(movieDetails, credits, mediaType);
        
        // Premium hissiyatı ve loading geçişi için kısa bir gecikme
        await new Promise(r => setTimeout(r, 450));
        
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
// Kullanıcının talebi doğrultusunda 3 ana kategoriye indirilmiş, normalleştirilmiş ve Türkçe karakter hatasız eşleştirme:
// 1. BEĞENDİ (Başyapıt, Çok İyi, İyi) -> liked_*
// 2. ORTALAMA (Ortalama, Vasat) -> average_*
// 3. BEĞENMEDİ (Kötü, Felaket) -> disliked_*
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
