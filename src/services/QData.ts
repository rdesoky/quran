export const TOTAL_PARTS = 30;
export const TOTAL_SURAS = 114;
export const TOTAL_PAGES = 604;
export const TOTAL_VERSES = 6236;

export const sura_info = require("../data/sura-info.json") as SuraInfo[];
export const parts = require("../data/parts-info.json") as PartInfo[];
export const pagesInfo =
    require("../data/pages-starting-sura-aya.json") as PageInfo[];

//Used for searching purpose
export const arSuraNames =
    "الفاتحة,البقرة,ال عمران,النساء,المائدة,الانعام,الاعراف,الانفال,التوبة,يونس,هود,يوسف,الرعد,ابراهيم,الحجر,النحل,الاسراء,الكهف,مريم,طه,الانبياء,الحج,المؤمنون,النور,الفرقان,الشعراء,النمل,القصص,العنكبوت,الروم,لقمان,السجدة,الاحزاب,سبأ,فاطر,يس,الصافات,ص,الزمر,غافر,فصلت,الشورى,الزخرف,الدخان,الجاثية,الاحقاف,محمد,الفتح,الحجرات,ق,الذاريات,الطور,النجم,القمر,الرحمن,الواقعة,الحديد,المجادلة,الحشر,الممتحنة,الصف,الجمعة,المنافقون,التغابن,الطلاق,التحريم,الملك,القلم,الحاقة,المعارج,نوح,الجن,المزمل,المدثر,القيامة,الانسان,المرسلات,النبا,النازعات,عبس,التكوير,الانفطار,المطففين,الانشقاق,البروج,الطارق,الاعلى,الغاشية,الفجر,البلد,الشمس,الليل,الضحى,الشرح,التين,العلق,القدر,البينة,الزلزلة,العاديات,القارعة,التكاثر,العصر,الهمزة,الفيل,قريش,الماعون,الكوثر,الكافرون,النصر,المسد,الاخلاص,الفلق,الناس".split(
        ","
    );

export const getArSuraName = (index: number) => {
    return index < arSuraNames.length ? arSuraNames[index] : "(not found)";
};

export const getPagePartNumber = (nPage: number) => {
    for (let i = 0, len = parts.length; i < len; i++) {
        const part = parts[i];
        if (nPage >= part.p && nPage <= part.ep) {
            return i + 1;
        }
    }
    return TOTAL_PARTS;
};

/**
 * Zero based with numeric params
 * If string params, it is one based
 *
 * @param {number} sura
 * @param {number} aya
 * @returns {number} absolute aya index
 */
export const ayaID = (sura: number | string, aya: number | string) => {
    if (typeof sura === "string") {
        sura = parseInt(sura) - 1;
    }
    if (typeof aya === "string") {
        aya = parseInt(aya) - 1;
    }
    let id = 0;

    //Add up verses count of previous suras
    for (let s = 0; s < sura; s++) {
        id += sura_info[s].ac;
    }

    //Add current sura aya index
    id += aya;
    return id;
};

/**
 * Returns sura and aya indices given AyaId
 */
export const ayaIdInfo = (aya_id: number) => {
    let id = 0;
    for (let s = 0; s < sura_info.length; s++) {
        let ac = sura_info[s].ac;
        if (id + ac > aya_id) {
            return { sura: s, aya: aya_id - id, ac };
        }
        id += ac;
    }
    return { sura: 0, aya: 0, ac: 5 };
};

/**
 * For analytics purpose
 */
export const verseLocation = (verse: number) => {
    const info = ayaIdInfo(verse);
    return {
        verse: `${info.sura + 1}:${info.aya + 1}`,
        chapter: getArSuraName(info.sura),
        chapter_num: info.sura + 1,
    };
};

/**
 * Returns page index by aya ID
 */
export const ayaIdPage = (aya_id: number) => {
    if (aya_id >= TOTAL_VERSES) {
        return TOTAL_PAGES; //beyond last page
    }
    let { sura, aya } = ayaIdInfo(aya_id);
    return getPageIndex(sura, aya);
};

/**
 * Returns part index for a given verse
 *
 * @param {number} aya_id absolute verse index
 */
export const getPartIndexByAyaId = (aya_id: number) => {
    return getAyaPartIndex(aya_id);
};

export const getAyaPartIndex = (aya_id: number) => {
    for (let i = parts.length - 1; i >= 0; i--) {
        const partInfo = parts[i];
        const partFirstAya =
            partInfo?.h?.[0] ?? ayaID(partInfo.s - 1, partInfo.a - 1);
        if (aya_id >= partFirstAya) {
            return i;
        }
    }
    return 0;
};

/**
 * Returns given part first verse absolute ID
 *
 * @param {number} partIndex zero based part index
 */
export const getPartFirstAyaId = (partIndex: number) => {
    const { s: suraNum, a: ayaNum } = parts[partIndex];
    return ayaID(suraNum - 1, ayaNum - 1);
};

/**
 * Returns aya ID by page index
 *
 * @param {number} pageIndex
 */
export const getPageFirstAyaId = (pageIndex: number) => {
    if (pageIndex >= TOTAL_PAGES) {
        return TOTAL_VERSES; //beyond last page
    }
    let { s: sura, a: aya } = pagesInfo[pageIndex];
    return ayaID(sura - 1, aya - 1);
};

export const getPageLastAyaId = (pageIndex: number) => {
    if (pageIndex === -1) {
        return -1;
    }
    if (pageIndex === TOTAL_PAGES - 1) {
        return TOTAL_VERSES - 1;
    }
    let { s: sura, a: aya } = pagesInfo[pageIndex + 1];
    return ayaID(sura - 1, aya - 1) - 1;
};

/**
 * Returns page Index by suraIndex and ayaIndex
 * @param {number} suraIndex
 * @param {number} ayaIndex
 */
export const getPageIndex = (suraIndex: number, ayaIndex: number) => {
    let page = sura_info[suraIndex].sp - 1;
    while (page < pagesInfo.length - 1) {
        if (
            pagesInfo[page + 1].s !== suraIndex + 1 ||
            pagesInfo[page + 1].a > ayaIndex + 1
        ) {
            return page;
        }
        page++;
    }
    return page;
};

/**
 * Returns sura index for a specific page number
 */
export const getPageSuraIndex = (nPage: number) => {
    for (let i = 0; i < TOTAL_SURAS; i++) {
        if (sura_info[i].ep >= nPage) {
            return i;
        }
    }
    return 0;
};

export const getHezbByAya = (aya: number) => {
    const partIndex = getAyaPartIndex(aya);
    const partInfo = parts[partIndex];
    const partHezbIndex = partInfo.h.findLastIndex((h) => aya >= h);
    const absIndex = partHezbIndex + partIndex * 8;
    const index = Math.floor(absIndex / 4);
    const quarter = Math.floor(absIndex % 4);
    return { index, quarter, absIndex };
};

export const rangeStartAya = (range: HifzRange) => {
    const suraInfo = sura_info[range.sura];
    const page = range.startPage;
    const suraStartPage = suraInfo.sp - 1;
    if (suraStartPage === page) {
        return ayaID(range.sura, 0);
    } else {
        return getPageFirstAyaId(page);
    }
};

export const getRangeVerses = (
    sura: number,
    startPage: number,
    endPage: number
) => {
    let [rangeStartVerse, rangeEndVerse] = [0, 0];
    const suraStartPage = sura_info[sura].sp - 1;
    const suraEndPage = sura_info[sura].ep - 1;
    const suraStartAya = ayaID(sura, 0);
    if (suraStartPage === startPage) {
        rangeStartVerse = suraStartAya;
    } else {
        rangeStartVerse = getPageFirstAyaId(startPage);
    }
    if (suraEndPage === endPage) {
        rangeEndVerse = suraStartAya + sura_info[sura].ac - 1;
    } else {
        rangeEndVerse = getPageFirstAyaId(endPage + 1) - 1;
    }

    return [rangeStartVerse, rangeEndVerse];
};

export const getPageSuras = (pageIndex: number) => {
    if (pageIndex + 1 === pagesInfo.length) {
        return [111, 112, 113]; //last page special case
    }
    let firstSura = pagesInfo[pageIndex].s - 1;
    let suraList = [firstSura];
    let nextPageInfo = pagesInfo[pageIndex + 1];
    let lastSura = nextPageInfo.s - (nextPageInfo.a === 1 ? 2 : 1);
    for (let s = firstSura + 1; s <= lastSura; s++) {
        suraList.push(s);
    }
    return suraList;
};

export const hezbInfo = (partIndex: number, hezbIndex: number) => {
    const index = partIndex * 2 + Math.floor(hezbIndex / 4);
    const quarter = hezbIndex % 4;
    const aya =
        parts[partIndex]?.h?.[hezbIndex] ?? getPartFirstAyaId(partIndex);
    const quarterText = ["", " (1/4)", " (1/2)", " (3/4)"][quarter];
    const text = `${index + 1}${quarterText}`;
    return { aya, index, quarter, text, quarterText };
};
