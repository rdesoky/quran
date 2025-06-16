/* eslint-disable no-extend-native */
import { IntlShape } from "react-intl";
import { getPagePartNumber, sura_info } from "@/services/qData";

export const num2string = (num: number, length = 3) => {
    let ret = num.toString();
    let zeros = length - ret.length;
    let padding = zeros > 0 ? new Array(zeros + 1).join("0") : "";
    return padding + ret;
};

export const dateKey = (dt: Date) => {
    return `${dt.getFullYear()}-${num2string(
        dt.getMonth() + 1,
        2
    )}-${num2string(dt.getDate(), 2)}`;
};

export const downloadImage = (url: string) => {
    return new Promise((resolve, reject) => {
        let img = document.createElement("img");
        img.onload = (e) => {
            resolve(url);
        };
        img.onerror = reject;
        img.src = url;
    });
};

export const delay = (ms: number) =>
    new Promise((resolve) => setTimeout(resolve, ms));

export const downloadPageImage = (pageIndex: number) => {
    const imageUrl =
        location.origin +
        "/qpages_1260/page" +
        num2string(pageIndex + 1, 3) +
        ".png";
    return delay(0).then(() => downloadImage(imageUrl));
};

export const pageFromPath = (path: string) => {
    let matchPage = path.match(/\/page\/([0-9]+)/i);
    if (matchPage) {
        return matchPage[1];
    }

    return "1";
};

export const partFromPath = (path: string) => {
    let page = pageFromPath(path);
    let part = getPagePartNumber(Number(page));
    return part;
};

export const requestFullScreen = () => {
    if (typeof document.body.requestFullscreen === "function") {
        if (document.fullscreenElement) {
            document.exitFullscreen();
        } else {
            document.body.requestFullscreen();
        }
    }
};
export const selectTopCommand = () => {
    // setTimeout(() => {
    const sideMenuExpander = document.querySelector("#SideMenuExpander");
    if (sideMenuExpander) {
        (sideMenuExpander as HTMLElement).focus();
    }
    // }, 50);
};
export const highlightSearch = (query: string, text: string, ntext: string) => {
    let words = text.trim().split(" "); //phrase words
    let nwords = ntext.split(" "); //normalized phrase words
    let qwords = query.split(" "); //normalized query words
    let hwords: number[] = []; //highlighted words indices

    for (let n = 0; n <= nwords.length - qwords.length; n++) {
        let found = true;

        for (let q = 0; q < qwords.length; q++) {
            if (nwords[n + q].match(qwords[q])) {
                continue;
            }
            found = false;
        }

        if (!found) {
            continue;
        }

        //all qwords matched
        for (let i = 0; i < qwords.length; i++) {
            if (!hwords.includes(n + i)) {
                hwords.push(n + i);
            }
        }
        //skip multiple words
        n += qwords.length - 1;
    }

    let ret = words.reduce((result, word, index) => {
        if (hwords.includes(index)) {
            return `${result} <span class="hiword">${word}</span>`;
        }
        return result + " " + word;
    }, "");
    return { __html: ret };
};

export const normalizeText = (t: string) => {
    let ret = t;
    try {
        ret = t
            .replace(/ {2}/g, " ")
            .replace(/[أإآ]/g, "ا")
            .replace(/[ؤ]/g, "و")
            .replace(/[ة]/g, "ه")
            .replace(/[ئي]/g, "ى");

        ret = ret.replace(new RegExp("\\p{M}", "gu"), ""); //Not supported by some browsers
    } catch (e) {}
    return ret;
};

export const copy2Clipboard = (t: string) => {
    navigator.clipboard.writeText(t).then(
        (p) => {
            console.log(`${t} is successfully copied to clipboard`);
        },
        (e) => {
            console.log(e.message);
        }
    );
};

String.prototype.appendWord = function (word: string, condition: boolean) {
    if (typeof word === "string" && word.length && condition !== false) {
        return this + " " + word;
    }
    return this.toString();
};

Number.prototype.between = function (a, b) {
    const min = Math.min.apply(Math, [a, b]),
        max = Math.max.apply(Math, [a, b]);
    const thisNum = this.valueOf();
    return thisNum >= min && thisNum <= max;
};

Array.prototype.findLastIndex = function (cb) {
    let i = this.length;
    while (i--) {
        if (cb(this[i], i, this)) {
            return i;
        }
    }
    return -1;
};

export const getCurrentPageNumber = (location: Location | undefined) => {
    const { pathname } = location || window.location;
    let match = pathname.match(/page\/(.+)/);
    let pageNumber = match ? match[1] : undefined;
    return Number(pageNumber);
};

export const greaterOf = (...numbers: number[]) => {
    return numbers.reduce((a, b) => {
        return a > b ? a : b;
    }, numbers[0]);
};

export const lesserOf = (...numbers: number[]) => {
    return numbers.reduce((a, b) => {
        return a < b ? a : b;
    }, numbers[0]);
};

export const getSuraName = (intl: IntlShape, index: number) => {
    const suraNames = intl.formatMessage({ id: "sura_names" }).split(",");
    return suraNames?.[index];
};

export const checkActiveInput = () => {
    const { tagName, type } =
        (document.activeElement as HTMLInputElement) || {};
    const isInput = ["INPUT", "BUTTON", "TEXTAREA", "SELECT"].includes(tagName);
    const isTextInput =
        isInput &&
        [
            "text",
            "number",
            "textarea",
            "select-one",
            "select-multiple",
        ].includes(type);

    return { isInput, isTextInput };
};

export const getStorageItem = (key: string, defaultValue: any = false) => {
    const val = localStorage.getItem(key);
    if (val !== null) {
        switch (typeof defaultValue) {
            case "string":
                return val;
            default:
                try {
                    return JSON.parse(val);
                } catch (e) {
                    console.error("invalid json", val);
                }
        }
    }
    return defaultValue;
};

export const dayLength = 24 * 60 * 60 * 1000;

export const getHifzRangeDisplayInfo = (range: HifzRange, intl: IntlShape) => {
    const suraInfo = sura_info[range.sura];
    const suraPagesCount = suraInfo.ep - suraInfo.sp + 1;
    const rangePagesCount = range.endPage - range.startPage + 1;
    let id = range.date
        ? rangePagesCount === suraPagesCount
            ? "sura_hifz_desc"
            : "range_desc"
        : "the_page_num";

    let values: any = {
        // sura: suraName,
        page: range.startPage - (suraInfo.sp - 1) + 1,
        start_page: range.startPage - (suraInfo.sp - 1) + 1,
        end_page: range.pages > 1 ? "-" + (range.endPage + 1) : "",
        pages: rangePagesCount,
    };

    const title = intl.formatMessage({ id }, values);
    let ageText = "";

    if (range.date) {
        const age = Math.floor((Date.now() - range.date) / dayLength);
        id =
            range.revs > 0
                ? age === 0
                    ? "last_revised_today"
                    : "last_revised_since"
                : "not_revised";
        values = { days: age };

        ageText = intl.formatMessage({ id }, values);
    }
    return { title, ageText };
};

export const keyValues = (keyName: string) => ({
    key: keyName ? ` (${keyName})` : "",
});

export const commandKey = (command: string) => {
    return {
        play: "r",
        pause: "p",
        stop: "s",
        resume: "p",
        indices: "i",
    }[command.toLowerCase()];
};
