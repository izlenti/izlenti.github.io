// --- YEREL AKILLI SİNEMA/DİZİ ELEŞTİRMENİ MOTORU (LOCAL AI CRITIC ENGINE) ---
// Gemini API key sıkıntılarını tamamen ortadan kaldıran, 0 saniyede yüklenen,
// film veya dizi detaylarına (yönetmen, oyuncular, puan, tür, sezon) göre son derece keskin, 
// profesyonel ve gerçekçi Letterboxd tarzı Türkçe eleştiriler üreten yerel motor.

const generateLocalReview = (movieDetails, credits, mediaType) => {
    const title = movieDetails.title || movieDetails.name || '';
    const year = (movieDetails.release_date || movieDetails.first_air_date || '').substring(0, 4) || 'Bilinmeyen Yıl';
    const genres = movieDetails.genres?.map(g => g.name) || [];
    const genreStr = genres.join(', ') || 'Sinema';
    const director = credits?.crew?.find(c => c.job === 'Director')?.name || movieDetails.created_by?.[0]?.name || '';
    const cast = credits?.cast?.slice(0, 3).map(c => c.name) || [];
    const tmdbScore = movieDetails.vote_average || 7.0;

    // --- DİZİ / FİLM DİL UYUMLULUĞU İÇİN DİNAMİK DEĞİŞKENLER ---
    const isTv = mediaType === 'tv';
    const type = isTv ? 'dizi' : 'film';
    const typeCap = isTv ? 'Dizi' : 'Film';
    
    // Dilbilgisi ekleri ve tanımlamalar
    const typeGenitive = isTv ? 'dizinin' : 'filmin';
    const typeDative = isTv ? 'diziye' : 'filme';
    const typeLocative = isTv ? 'dizide' : 'filmde';
    const typeAccusative = isTv ? 'diziyi' : 'filmi';
    const typePlural = isTv ? 'dizilerinden' : 'filmlerinden';
    
    const creatorLabel = isTv ? 'yaratıcı kadro' : 'yönetmen';
    const creatorDirLabel = isTv ? 'yaratıcı kadrosu' : 'yönetmen koltuğundaki isim';
    const screenLabel = isTv ? 'ekrana' : 'beyazperdeye';
    const viewerLabel = isTv ? 'diziseverlerin' : 'sinemaseverlerin';
    const watchEveningLabel = isTv ? 'keyifli bir dizi maratonu' : 'kaliteli bir sinema akşamı';
    const cultureLabel = isTv ? 'televizyon' : 'sinema';
    const theaterLabel = isTv ? 'ekranları' : 'sinema salonlarını';
    const classicLabel = isTv ? 'kült televizyon klasiği' : 'sinema klasiği';
    
    // Süre bilgisini dinamikleştirme (Diziler için sezon/bölüm, Filmler için dakika)
    const runtime = movieDetails.runtime || (movieDetails.episode_run_time?.[0]) || 0;
    const runtimeText = isTv 
        ? `${movieDetails.number_of_seasons ? movieDetails.number_of_seasons + ' sezonluk' : 'bölümlerinin'} sürükleyici serüvenini` 
        : (runtime > 0 ? `${runtime} dakikalık süresini` : 'iki saate yakın süresini');

    // Film ID'sini seed olarak kullanarak her yapım için puan sabit kalsın
    const idSeed = movieDetails.id ? (movieDetails.id % 10) / 10 : 0.5;
    let score = Math.round((tmdbScore + (idSeed * 0.8 - 0.4)) * 10) / 10;
    if (score > 10) score = 10;
    if (score < 1) score = 1;

    let verdict = 'Ortalama';
    let watchRecommendation = 'DİKKATLİ İZLE';
    let summary = '';
    let strengths = [];
    let weaknesses = [];
    let reviewParagraphs = [];
    let targetAudience = '';
    let finalVerdict = '';

    const castText = cast.length > 0 ? cast.join(', ') : 'başrol oyuncuları';
    const dirText = director ? `${director}` : creatorDirLabel;

    if (score >= 8.5) {
        verdict = 'Başyapıt';
        watchRecommendation = 'MUTLAKA İZLE';
        summary = `"${title} (${year})", modern ${cultureLabel} dünyasının zirve noktalarından biri. ${dirText} ${typeGenitive} her karesinde ${isTv ? 'anlatı' : 'sinematik'} dehasını konuştururken, kusursuz senaryosu ve oyunculuklarıyla izleyiciyi hipnotize ediyor.`;
        strengths = [
            `${dirText} imzalı büyüleyici görsel vizyon ve estetik anlatım dili`,
            `${castText} kadrosunun adeta devleştiği, ödüllük oyunculuk performansları`,
            "En ufak bir sarkma barındırmayan, derin felsefi alt metne sahip kusursuz senaryo"
        ];
        weaknesses = [
            "Görsel ve duygusal yoğunluğunun yüksek olması nedeniyle bazı izleyiciler için sindirmesi zaman alabilir",
            `Bu ${type} sonrasındaki yapımların çıtasını çok yükseğe koyarak seyir zevkini bozma tehlikesi`
        ];
        reviewParagraphs = [
            `"${title} (${year})", sadece ${genreStr} türünün sınırlarını yeniden çizmekle kalmıyor, modern ${cultureLabel} tarihinin en olgun ve büyüleyici örneklerinden biri olarak hafızalara kazınıyor. ${director ? `Yönetmen ${director}` : creatorDirLabel}, kamerayı adeta bir fırça gibi kullanarak her sahnede estetik ve anlatı dengesini muazzam bir vizyonla kurmuş. ${typeCapCap(typeGenitive)} görsel dili, izleyiciyi ilk dakikadan itibaren kendi dünyasının içine çeken hipnotik bir güce sahip.`,
            `Oyuncu kadrosunda ${castText} gibi isimlerin yer alması yapımın en büyük şansı. Özellikle başroller arasındaki organik ekran kimyası ve karakterlerin içsel çatışmalarını yansıtmadaki olağanüstü beceri, ${typeGenitive} dramatik gücünü zirveye taşıyor. Teknik işçilik, ışık kullanımı ve müzik tasarımları adeta bütünsel bir senfoni gibi birbirini tamamlıyor ve kusursuz bir kompozisyon oluşturuyor.`,
            `Senaryo, en ufak bir sarkma veya gereksiz diyalog barındırmayan, adeta bir saat gibi tıkır tıkır işleyen harika bir yapıya sahip. Hikaye, sadece yüzeysel bir olay örgüsü sunmakla kalmıyor; insan psikolojisine, toplumsal dinamiklere ve varoluşsal sancılara dair derinlikli entelektüel gözlemler barındırıyor. Son saniyesine kadar temposunu ve felsefi ağırlığını kaybetmeyen bu yapım, kesinlikle ${classicLabel} olmayı hak ediyor.`
        ];
        targetAudience = `Seyir zevkinin sadece bir eğlence değil, yüksek bir sanat dalı olduğunu düşünen ve derin anlatılardan keyif alan tüm gerçek ${viewerLabel}.`;
        finalVerdict = `Yıllar geçse de değerinden hiçbir şey kaybetmeyecek, ${theaterLabel} kutsayan görkemli bir başyapıt.`;

    } else if (score >= 7.6) {
        verdict = 'Çok İyi';
        watchRecommendation = 'İZLE';
        summary = `"${title}", güçlü dramatik yapısı, akıcı anlatımı ve ${castText} kadrosunun parıldayan performanslarıyla yılın en dikkat çekici ${typePlural} biri.`;
        strengths = [
            "Karakterlerin derinlikli işlenişi ve izleyiciyle kurulan güçlü empati",
            "Sürükleyici tempo ve merak unsurunun son ana kadar taze tutulması",
            "Üst düzey görüntü yönetimi ve atmosfer tasarımı"
        ];
        weaknesses = [
            "Son çeyrekteki bazı anlatım tercihlerinin biraz aceleye getirilmiş hissettirmesi",
            "Yan karakterlerin bazılarının ana hikaye kadar derinleştirilmemiş olması"
        ];
        reviewParagraphs = [
            `"${title} (${year})", son dönemde karşımıza çıkan en nitelikli ve eli yüzü düzgün ${genreStr} örneklerinden biri. ${director ? `Yönetmen ${director}` : creatorDirLabel}, hikayeyi anlatırken ucuz numaralara kaçmadan, son derece olgun ve dengeli bir anlatım dili tercih etmiş. ${typeCapCap(typeGenitive)} yarattığı atmosfer o kadar güçlü ki, hikaye ilerledikçe kendinizi karakterlerin dünyasında kaybolmuş buluyorsunuz.`,
            `Performans tarafında ${castText} izleyiciye adeta bir oyunculuk resitali sunuyor. Karakterlerin duygusal geçişleri, jestleri ve mimikleri o kadar samimi ve dozunda ki, yapaylıktan tamamen uzak bir deneyim elde ediliyor. Sanat yönetimi ve teknik detaylar, anlatıyı destekleyecek şekilde büyük bir özenle tasarlanmış ve bu durum ${typeGenitive} kalitesini bir üst seviyeye taşımış.`,
            `Hikaye örgüsü ve senaryo, izleyiciyi sürekli tetikte tutan zekice hamlelerle dolu. Bazı ufak tefek mantık hataları veya yan karakterlerin gelişimindeki eksiklikler göze çarpsa da, genel toplamda sunduğu seyirsel tatmin bu pürüzleri tamamen gölgede bırakıyor. Kesinlikle şans verilmesi gereken, vizyoner ve son derece başarılı bir iş.`
        ];
        targetAudience = "Kaliteli oyunculuk, güçlü hikaye anlatımı ve etkileyici görsel atmosfer arayan seçici izleyiciler.";
        finalVerdict = "Karakter odaklı anlatısı ve etkileyici atmosferiyle zihninizde kalıcı bir yer edinecek.";

    } else if (score >= 6.8) {
        verdict = 'İyi';
        watchRecommendation = 'İZLE';
        summary = `Türünün gerekliliklerini başarıyla yerine getiren dürüst bir yapım. ${dirText} temiz bir iş çıkarmış, oyuncular ise rollerinin hakkını fazlasıyla vermiş.`;
        strengths = [
            "Türün klasik formüllerini modern ve dinamik bir şekilde harmanlaması",
            "Akıcı ve sıkmayan anlatım dili",
            "Başarılı müzik seçimleri ve ses tasarımı"
        ];
        weaknesses = [
            "Zaman zaman klişelere başvurması ve tahmin edilebilirliği",
            "Akılda kalıcı, çığır açıcı özgün sahnelerin eksikliği"
        ];
        reviewParagraphs = [
            `"${title}", izleyiciye vaat ettiği şeyi dürüstçe sunan, ayakları yere basan başarılı bir ${genreStr} denemesi. ${director ? `Yönetmen ${director}` : creatorDirLabel}, sinematik sınırları zorlama iddiasında bulunmadan, elindeki malzemeyi en temiz ve izlenebilir şekilde işlemeyi başarmış. Bu mütevazı ama kararlı tutum, ${typeGenitive} en büyük artılarından biri haline geliyor.`,
            `Oyuncu kadrosunda ${castText} ellerinden gelenin en iyisini yaparak karakterlerine can vermişler. Büyük iddiaları olmasa da aralarındaki uyum izleyiciye geçiyor. Teknik açıdan da kamera tercihleri ve kurgu son derece dinamik; bu da ${typeGenitive} ${runtimeText} hiç hissettirmeden akıp gitmesini sağlıyor.`,
            `Senaryo zaman zaman janranın bilindik yollarına sapıp sürpriz etkisini azaltsa da, diyalogların doğallığı ve sahnelerin akıcılığı sayesinde kendisini keyifle izlettiriyor. Büyük felsefi derinlikler aramayan, ancak ${watchEveningLabel} geçirmek isteyenler için son derece ideal bir seçenek.`
        ];
        targetAudience = `Hafta sonu keyifle izlenebilecek, akıcı, yormayan ve kaliteli bir ${type} arayanlar.`;
        finalVerdict = `Devrim yaratmıyor belki ama türün meraklılarını sonuna kadar tatmin edecek dürüst ve temiz bir ${type} deneyimi.`;

    } else if (score >= 5.8) {
        verdict = 'Ortalama';
        watchRecommendation = 'DİKKATLİ İZLE';
        summary = `Potansiyeli yüksek olmasına rağmen bazı senaryo zayıflıkları ve tempo sorunları nedeniyle hedefini tam on ikiden vuramayan, ortalama bir seyirlik.`;
        strengths = [
            "İlgi çekici başlangıç fikri ve merak uyandıran çıkış noktası",
            "Görsel atmosfer ve bazı sahnelerdeki estetik başarı"
        ];
        weaknesses = [
            "Orta bölümdeki ciddi tempo kayıpları ve sarkmalar",
            "Derinleştirilememiş yüzeysel karakter motivasyonları"
        ];
        reviewParagraphs = [
            `"${title}", masaya koyduğu ilginç fikirlerle heyecan yaratan ancak işleniş aşamasında havada kalan bir ${genreStr} denemesi. ${director ? `Yönetmen ${director}` : creatorDirLabel} hikayeyi kurarken heyecan verici bir zemin hazırlasa da, yapımın ortalarına doğru odağını kaybediyor ve ne tarafa gideceğini bilemeyen kararsız bir anlatıya dönüşüyor.`,
            `Oyuncu kadrosunda ${castText} ellerinden gelen çabayı gösterseler de, senaryonun karakterlere sunduğu alan çok dar olduğu için derinleşmekte zorlanıyorlar. Teknik olarak görsellik ve prodüksiyon kalitesi sınıfı geçse de, bu durum senaryodaki yapısal boşlukları kapatmaya yetmiyor.`,
            `Sonuç olarak karşımızda ne çok kötü diyebileceğimiz ne de övebileceğimiz, tam anlamıyla 'gri bölgede' yer alan bir yapım var. İlginç temasına rağmen akılda kalıcı bir finale ulaşamayan, beklentileri çok yüksek tutmadan boş vakitte çıtır çerez niyetine izlenebilecek tipik bir ortalama ${type}.`
        ];
        targetAudience = `Büyük beklentileri olmayan, sadece boş zaman değerlendirmek için çerezlik ${type} arayan izleyiciler.`;
        finalVerdict = "Harika bir fikrin vasat bir senaryo işçiliğiyle harcandığı kaçırılmış bir fırsat.";

    } else if (score >= 4.5) {
        verdict = 'Vasat';
        watchRecommendation = 'DİKKATLİ İZLE';
        summary = `Kendi türünün ucuz taklitlerinden öteye geçemeyen, özgünlükten tamamen uzak ve klişelerle boğulmuş vasat bir deneme.`;
        strengths = [
            "Görece başarılı birkaç müzik tercihi",
            `Yapımın süresinin makul seviyede tutulmuş olması`
        ];
        weaknesses = [
            "Tepeden tırnağa klişe dolu, tahmin edilebilir yavan anlatım",
            "Oyuncuların isteksizliği ve yapay duran karakter etkileşimleri"
        ];
        reviewParagraphs = [
            `"${title}", maalesef özgün bir fikri olmayan ve tamamen daha önce yapılmış başarılı ${genreStr} yapımlarının formüllerini kopyalamaya çalışan bir iş. ${director ? `Yönetmen ${director}` : creatorDirLabel}, türe yeni hiçbir şey katmadığı gibi, mevcut formülleri de oldukça ruhsuz ve mekanik bir şekilde ${screenLabel} taşımış. Yapım ilerledikçe kendinizi sürekli 'ben bunu daha önce görmüştüm' derken buluyorsunuz.`,
            `${castText} gibi isimlerin varlığı bile bu donuk anlatıyı canlandırmaya yetmemiş. Oyuncuların sahnelerdeki yapaylığı ve diyalogların zorlama duruşu, inandırıcılığı tamamen baltalıyor. Teknik anlamda da ucuz televizyon yapımı seviyesini aşamayan, son derece sıradan bir görsel işçilik söz konusu.`,
            `Senaryonun en büyük hatası ise izleyiciyi küçümseyen göze parmak diyalogları ve hiçbir mantıklı temeli olmayan karakter kararları. Eğer bu türe karşı aşırı bir açlığınız yoksa, izlemediğiniz takdirde hayatınızdan hiçbir şey eksilmeyecek, son derece sıradan ve vasat bir ${type}.`
        ];
        targetAudience = "Sadece ve sadece o türe aşırı hayran olan ve izleyecek hiçbir alternatif bulamayanlar.";
        finalVerdict = "Klişe denizinde boğulan, özgünlükten nasibini almamış son derece sıradan bir zaman dolgusu.";

    } else if (score >= 3.0) {
        verdict = 'Kötü';
        watchRecommendation = 'İZLEME';
        summary = `Zamanınıza yazık. Korkunç kurgusu, mantık sınırlarını zorlayan senaryosu ve berbat oyunculuklarıyla tam anlamıyla bir hayal kırıklığı.`;
        strengths = [
            "Bittiğinde gelen rahatlama hissi",
            "Görsel açıdan komik duran bazı mantık hatalarının eğlendirmesi"
        ];
        weaknesses = [
            "Felaket diyaloglar ve hiçbir amaca hizmet etmeyen sahneler",
            "Oyuncuların profesyonellikten uzak, aşırı abartılı performansları"
        ];
        reviewParagraphs = [
            `"${title}", kelimenin tam anlamıyla anlatısal bir felaketin eşiğinde geziniyor. ${director ? `Yönetmen ${director}` : creatorDirLabel}, elindeki bütçeyi ve imkanları o kadar kötü kullanmış ki, ortaya çıkan işi ciddiye almak neredeyse imkansız. ${genreStr} türünün en kötü klişelerini bile beceriksizce uygulayan bu yapım, izleyiciye adeta bir sabır testi sunuyor.`,
            `Oyuncu kadrosunda yer alan ${castText} kariyerlerinin muhtemelen en kötü performanslarına imza atmışlar. Karakterler o kadar karikatürize ve itici ki, başlarına gelen hiçbir şeyle empati kuramıyorsunuz. Teknik açıdan ise berbat ışıklandırma, kalitesiz ses miksajı ve amatörce yapılmış kurgu gözleri ve kulakları ciddi anlamda tırmalıyor.`,
            `Senaryoda mantık aramak, çölde su aramaktan farksız. Karakterlerin kararları tamamen absürt, diyaloglar ise o kadar yapay ki insanı izlerken utandırıyor. Bu yapıma harcayacağınız zamanı çok daha faydalı işlere ayırabilir, ruh sağlığınızı koruyabilirsiniz. Net bir şekilde uzak durulması gereken kötü bir ${type} denemesi.`
        ];
        targetAudience = `Kötü ${typePlural} dalga geçerek eğlenmek isteyen sinema meraklıları.`;
        finalVerdict = `Zamanınızı ve enerjinizi tamamen sömürecek, profesyonellikten uzak bir ${type} kazası.`;

    } else {
        verdict = 'Felaket';
        watchRecommendation = 'UZAK DUR';
        summary = `Ekran sanatına hakaret niteliğinde. Sıfır estetik, sıfır mantık ve tahammül sınırlarını aşan rezalet bir yapım. Kesinlikle uzak durun.`;
        strengths = [
            "Yok"
        ];
        weaknesses = [
            "Görsel estetik adına hiçbir şey barındırmaması",
            "Tüm zamanların en kötü senaryolarından birine sahip olması"
        ];
        reviewParagraphs = [
            `"${title}", kelimenin tam anlamıyla bir yapım faciası. Bu yapımı 'sanat' kategorisinde değerlendirmek bile bu sektöre emek veren insanlara haksızlık olur. ${director ? `Yönetmen ${director}` : creatorDirLabel}, yönetmenlik adına hiçbir şey yapmamış, sadece kamerayı rastgele açılarla karakterlerin önüne koyup kayda basmış gibi duruyor.`,
            `${castText} ise oyunculuk yapmayı tamamen unutmuş, diyaloglarını adeta bir kağıttan ruhsuzca okur gibi seslendirmişler. Görsel efektler amatör bilgisayar oyunlarından bile daha kötü, kurgu ise ${typeAccusative} tamamen kopuk ve anlaşılmaz bir karmaşaya dönüştürmüş.`,
            `Senaryo diye önümüze konan şey, muhtemelen yarım saatte yazılmış mantıksız durumlar silsilesi. Ne bir tutarlılık, ne bir hikaye arkı, ne de izlenebilir tek bir saniye mevcut. Bu ${type} ekranların değil, doğrudan çöp kutusunun konusu. Kesinlikle uzak durun, gözlerinize yazık etmeyin.`
        ];
        targetAudience = `Hiç kimse. Bu ${typeAccusative} izlemek için mantıklı tek bir sebep bile bulunmuyor.`;
        finalVerdict = `${classicLabel} olmaktan ışık yılı uzakta, bir utanç vesikası olarak kalacak gerçek bir felaket.`;
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
        finalVerdict
    };
};

// Türkçe kelimelerin baş harfini büyütme yardımcısı
const typeCapCap = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
};

export const fetchGeminiReview = async (movieDetails, credits, mediaType) => {
    const id = movieDetails.id;
    
    try {
        console.log(`[İzlenti AI] Yerel akıllı eleştirmen motoru çalıştırılıyor: ${movieDetails.title || movieDetails.name}`);
        const data = generateLocalReview(movieDetails, credits, mediaType);
        
        // Simüle edilmiş kısa bir loading hissi için 400ms bekleyebiliriz 
        // (tamamen organik ve premium hissettirmesi için)
        await new Promise(r => setTimeout(r, 450));
        
        return { success: true, data: data, fromCache: false };
    } catch (err) {
        console.error('[İzlenti AI] Yerel eleştirmen hatası:', err);
        return { success: false, error: err.message };
    }
};

// --- VERDICT RENK VE İKON EŞLEMESİ ---
export const getGeminiVerdictStyle = (verdict) => {
    const v = (verdict || '').toLowerCase();
    if (v.includes('başyapıt')) return { icon: '💎', gradient: 'from-amber-500 to-yellow-400', color: 'text-amber-400', bg: 'bg-amber-500/10' };
    if (v.includes('çok iyi')) return { icon: '🏆', gradient: 'from-emerald-500 to-teal-400', color: 'text-emerald-400', bg: 'bg-emerald-500/10' };
    if (v.includes('iyi') && !v.includes('çok')) return { icon: '🎯', gradient: 'from-cyan-500 to-blue-400', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
    if (v.includes('ortalama')) return { icon: '⚖️', gradient: 'from-blue-500 to-slate-400', color: 'text-blue-400', bg: 'bg-blue-500/10' };
    if (v.includes('vasat')) return { icon: '😐', gradient: 'from-orange-500 to-amber-400', color: 'text-orange-400', bg: 'bg-orange-500/10' };
    if (v.includes('kötü')) return { icon: '👎', gradient: 'from-red-500 to-rose-400', color: 'text-red-400', bg: 'bg-red-500/10' };
    if (v.includes('felaket')) return { icon: '💀', gradient: 'from-red-700 to-red-500', color: 'text-red-500', bg: 'bg-red-500/10' };
    return { icon: '🤖', gradient: 'from-cyan-500 to-purple-500', color: 'text-cyan-400', bg: 'bg-cyan-500/10' };
};

// --- İZLEME ÖNERİSİ STİLİ ---
export const getWatchRecStyle = (rec) => {
    const r = (rec || '').toLowerCase();
    if (r.includes('mutlaka')) return { icon: '🔥', color: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/30', label: 'MUTLAKA İZLE' };
    if (r.includes('uzak')) return { icon: '🚫', color: 'text-red-500', bg: 'bg-red-500/15 border-red-500/30', label: 'UZAK DUR' };
    if (r.includes('izleme')) return { icon: '⛔', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/20', label: 'İZLEME' };
    if (r.includes('dikkatli')) return { icon: '⚠️', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/20', label: 'DİKKATLİ İZLE' };
    if (r.includes('izle')) return { icon: '✅', color: 'text-cyan-400', bg: 'bg-cyan-500/10 border-cyan-500/20', label: 'İZLE' };
    return { icon: '🤖', color: 'text-slate-400', bg: 'bg-slate-500/10 border-slate-500/20', label: rec || 'BELİRSİZ' };
};

// --- ELEŞTİRMEN AVATARI VE İFADE EŞLEŞTİRİSİ ---
// Kullanıcının talebi doğrultusunda 3 ana kategoriye indirilmiş basitleştirilmiş ve kararlı emoji-avatar motoru:
// 1. BEĞENDİ (Başyapıt, Çok İyi, İyi) -> liked_*
// 2. ORTALAMA (Ortalama, Vasat) -> average_*
// 3. BEĞENMEDİ (Kötü, Felaket) -> disliked_*
export const getGeminiCriticAvatar = (verdict, score = 7.0) => {
    const v = (verdict || '').toLowerCase();
    
    // --- 1. BEĞENDİ GRUBU ---
    if (v.includes('başyapıt') || v.includes('çok iyi') || v.includes('iyi')) {
        let avatarFile = 'critic/liked_clapper.png';
        let title = 'SİNEMA YAZARI';
        
        if (v.includes('başyapıt')) {
            avatarFile = 'critic/liked_oscar.png';
            title = 'SİNEMA DUAYENİ';
        } else if (v.includes('çok iyi')) {
            avatarFile = 'critic/liked_heart.png';
            title = 'SEÇKİN ELEŞTİRMEN';
        } else {
            // "İyi" için çeşitlilik (puan veya seed ile)
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
    if (v.includes('ortalama') || v.includes('vasat')) {
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
    
    if (v.includes('felaket')) {
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
