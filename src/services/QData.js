export const TOTAL_PARTS = 30;
export const TOTAL_SURAS = 114;
export const TOTAL_PAGES = 604;
export const TOTAL_VERSES = 6236;
export const sura_info = require("../data/sura-info.json");
export const parts = require("../data/parts-info.json");
export const pagesInfo = require("../data/pages-starting-sura-aya.json");

export const arSuraNames =
  "الفاتحة,البقرة,ال عمران,النساء,المائدة,الانعام,الاعراف,الانفال,التوبة,يونس,هود,يوسف,الرعد,ابراهيم,الحجر,النحل,الاسراء,الكهف,مريم,طه,الانبياء,الحج,المؤمنون,النور,الفرقان,الشعراء,النمل,القصص,العنكبوت,الروم,لقمان,السجدة,الاحزاب,سبأ,فاطر,يس,الصافات,ص,الزمر,غافر,فصلت,الشورى,الزخرف,الدخان,الجاثية,الاحقاف,محمد,الفتح,الحجرات,ق,الذاريات,الطور,النجم,القمر,الرحمن,الواقعة,الحديد,المجادلة,الحشر,الممتحنة,الصف,الجمعة,المنافقون,التغابن,الطلاق,التحريم,الملك,القلم,الحاقة,المعارج,نوح,الجن,المزمل,المدثر,القيامة,الانسان,المرسلات,النبا,النازعات,عبس,التكوير,الانفطار,المطففين,الانشقاق,البروج,الطارق,الاعلى,الغاشية,الفجر,البلد,الشمس,الليل,الضحى,الشرح,التين,العلق,القدر,البينة,الزلزلة,العاديات,القارعة,التكاثر,العصر,الهمزة,الفيل,قريش,الماعون,الكوثر,الكافرون,النصر,المسد,الاخلاص,الفلق,الناس".split(
    ","
  );

export const getArSuraName = (index) => {
  return index < arSuraNames.length ? arSuraNames[index] : "(not found)";
};

export const getPagePartNumber = (nPage) => {
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
export const ayaID = (sura, aya) => {
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
export const ayaIdInfo = (aya_id) => {
  let id = 0;
  for (let s = 0; s < sura_info.length; s++) {
    let ac = sura_info[s].ac;
    if (id + ac > aya_id) {
      return { sura: s, aya: aya_id - id };
    }
    id += ac;
  }
  return { sura: 0, aya: 0 };
};

/**
 * For analytics purpose
 */
export const verseLocation = (verse) => {
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
export const ayaIdPage = (aya_id) => {
  let { sura, aya } = ayaIdInfo(aya_id);
  return getPageIndex(sura, aya);
};

/**
 * Returns part index for a given verse
 *
 * @param {number} aya_id absolute verse index
 */
export const getPartIndexByAyaId = (aya_id) => {
  const { sura: sIndex, aya: aIndex } = ayaIdInfo(aya_id);
  for (let p = 0; p < parts.length; p++) {
    const { s, a } = parts[p];
    const [partSuraIndex, partAyaIndex] = [s - 1, a - 1];
    if (
      partSuraIndex > sIndex ||
      (partSuraIndex === sIndex && partAyaIndex > aIndex)
    ) {
      return p - 1; //passed
    }
  }
  return parts.length - 1;
};

/**
 * Returns given part first verse absolute ID
 *
 * @param {number} partIndex zero based part index
 */
export const getPartFirstAyaId = (partIndex) => {
  const { s: suraNum, a: ayaNum } = parts[partIndex];
  return ayaID(suraNum - 1, ayaNum - 1);
};

/**
 * Returns aya ID by page index
 *
 * @param {number} pageIndex
 */
export const getPageFirstAyaId = (pageIndex) => {
  let { s: sura, a: aya } = pagesInfo[pageIndex];
  return ayaID(sura - 1, aya - 1);
};

/**
 * Returns page Index by suraIndex and ayaIndex
 * @param {number} suraIndex
 * @param {number} ayaIndex
 */
export const getPageIndex = (suraIndex, ayaIndex) => {
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
export const getPageSuraIndex = (nPage, bStart) => {
  for (let i = 0; i < TOTAL_SURAS; i++) {
    if (sura_info[i].ep >= nPage) {
      return i;
    }
  }
  return 0;
};

export const getRangeVerses = (sura, startPage, endPage) => {
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

export const getPageSuras = (pageIndex) => {
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

// export const suraInPage = (suraNum, pageNum) => {
//   var nSura = suraNum - 1;
//   return sura_info[nSura].sp <= pageNum && sura_info[nSura].ep >= pageNum;
// };

// ayatCount: function getAyatCount() {
//   return 6236;
//
//   //for( var i=0, len= sura_info.length, count=0 ; i < len ; i++ ){
//   //	count += sura_info[i].ac;
//   //}
//   //return count;
// },
//
// suraStartPage: (sura) => {
//   return sura_info[sura].sp - 1;
// },
//
// suraPageCount: function getSuraPageCount(ndx) {
//   var sInfo = sura_info[ndx];
//   return sInfo.ep - sInfo.sp + 1;
// },
//
// partPageProgress: function getPartPageProgress(nPart, nPageNo) {
//   var startPage = parts[nPart].p;
//   var endPage = parts[nPart].ep;
//
//   return ((nPageNo - startPage) * 100) / (endPage - startPage);
// },
//
// suraPageProgress: function GetSuraPageProgress(nSura, nPageNo) {
//   var startPage = sura_info[nSura].sp;
//   var endPage = sura_info[nSura].ep;
//
//   return ((nPageNo - startPage) * 100) / (endPage - startPage);
// },

// nextAya: function (sura, aya) {
//   var ret = { sura: sura, aya: aya };
//   if (aya >= sura_info[sura - 1].ac) {
//     if (sura < TOTAL_SURAS) {
//       ret.sura = sura + 1;
//       ret.aya = 1;
//     } else {
//       return null; //last aya in Quran, no increment
//     }
//   } else {
//     ret.sura = sura;
//     ret.aya = aya + 1;
//   }
//   return ret;
// },

// prevAya: function (sura, aya) {
//   var ret = { sura: sura, aya: aya };
//   if (aya <= 1) {
//     if (sura > 1) {
//       ret.sura = sura - 1;
//       ret.aya = sura_info[ret.sura - 1].ac;
//     } else {
//       return ret;
//     }
//   } else {
//     ret.sura = sura;
//     ret.aya = aya - 1;
//   }
//   return ret;
// },

// compareVerses: function (infoL, infoR) {
//   if (infoL.sura === infoR.sura) {
//     if (infoL.aya === infoR.aya) {
//       return 0;
//     }
//     return infoL.aya > infoR.aya ? 1 : -1;
//   }
//
//   return infoL.sura > infoR.sura ? 1 : -1;
// },
