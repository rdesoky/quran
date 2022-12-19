/* eslint-disable no-extend-native */
import { getPagePartNumber } from "./QData";

const Utils = {
  num2string: (num, length = 3) => {
    let ret = num.toString();
    let zeros = length - ret.length;
    let padding = zeros > 0 ? new Array(zeros + 1).join("0") : "";
    return padding + ret;
  },

  dateKey: (dt) => {
    return `${dt.getFullYear()}-${Utils.num2string(
      dt.getMonth() + 1,
      2
    )}-${Utils.num2string(dt.getDate(), 2)}`;
  },

  downloadImage: (url) => {
    return new Promise((resolve, reject) => {
      let img = document.createElement("img");
      img.onload = (e) => {
        resolve(url);
      };
      img.onerror = reject;
      img.src = url;
    });
  },

  downloadPageImage: (pageIndex) => {
    const imageUrl =
      process.env.PUBLIC_URL +
      "/qpages_1260/page" +
      Utils.num2string(pageIndex + 1, 3) +
      ".png";
    return Utils.downloadImage(imageUrl);
  },

  pageFromPath: (path) => {
    let matchPage = path.match(/\/page\/([0-9]+)/i);
    if (matchPage) {
      return matchPage[1];
    }

    return "1";
  },
  partFromPath: (path) => {
    let page = Utils.pageFromPath(path);
    let part = getPagePartNumber(page);
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
    const sideMenuExpander = document.querySelector("#SideMenuExpander");
    if (sideMenuExpander) {
      sideMenuExpander.focus();
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
  normalizeText: (t) => {
    let ret;
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
  },
  copy2Clipboard: (t) => {
    navigator.clipboard.writeText(t).then(
      (p) => {
        console.log(`${t} is successfully copied to clipboard`);
      },
      (e) => {
        console.log(e.message);
      }
    );
  },
};

export default Utils;

String.prototype.appendWord = function (word, condition) {
  if (typeof word === "string" && word.length && condition !== false) {
    return this + " " + word;
  }
  return this;
};

Number.prototype.between = function (a, b) {
  const min = Math.min.apply(Math, [a, b]),
    max = Math.max.apply(Math, [a, b]);
  return this >= min && this <= max;
};

export const getCurrentPageNumber = (location) => {
  let match = location.pathname.match(/page\/(.+)/);
  let pageNumber = match ? match[1] : undefined;
  return parseInt(pageNumber);
};
