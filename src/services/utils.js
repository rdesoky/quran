import QData from "./QData";

const Utils = {
    num2string: (num, length) => {
        let ret = num.toString();
        let zeros = length - ret.length;
        let padding = zeros > 0 ? new Array(zeros + 1).join("0") : "";
        return padding + ret;
    },

    pageFromPath: path => {
        let matchPage = path.match(/\/page\/([0-9]+)/i);
        if (matchPage) {
            return matchPage[1];
        }

        return "1";
    },
    partFromPath: path => {
        let page = Utils.pageFromPath(path);
        let part = QData.pagePart(page);
        return part;
    },
    requestFullScreen: () => {
        if (typeof document.body.requestFullscreen === "function") {
            if (document.fullscreenElement) {
                document.exitFullscreen();
            } else {
                document.body.requestFullscreen();
            }
        }
    },
    selectTopCommand: () => {
        // setTimeout(() => {
        const topRecentBtn = document.querySelector("#RecentCommands button");
        if (topRecentBtn) {
            topRecentBtn.focus();
        }
        // }, 50);
    },
    hilightSearch: (query, text, ntext) => {
        let words = text.trim().split(" "); //phrase words
        let nwords = ntext.split(" "); //normalized phrase words
        let qwords = query.split(" "); //normalized query words
        let hwords = []; //highlighted words indices

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
    },
    normalizeText: t => {
        try {
            let ret = t
                .replace(/ {2}/g, " ")
                .replace(new RegExp("\\p{M}", "gu"), "")
                .replace(/[أإآ]/g, "ا")
                .replace(/[ؤ]/g, "و")
                .replace(/[ة]/g, "ه")
                .replace(/[ئي]/g, "ى");
            return ret;
        } catch (e) {
            return t;
        }
    },
    copy2Clipboard: t => {
        navigator.clipboard.writeText(t).then(
            p => {
                console.log(`${t} is successfully copied to clipboard`);
            },
            e => {
                console.log(e.message);
            }
        );
    }
};

export default Utils;
