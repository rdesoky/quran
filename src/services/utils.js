import QData from "./QData";

const Utils = {
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
		setTimeout(() => {
			const topRecentBtn = document.querySelector("#RecentCommands button");
			if (topRecentBtn) {
				topRecentBtn.focus();
			}
		}, 50);
	},
	hilightSearch: (query, text, ntext) => {
		let words = text.trim().split(" ");
		let nwords = ntext.split(" ");
		let qwords = query.split(" ");
		let hwords = [];

		nwords.forEach((word, index, arr) => {
			for (let i = 0; i < qwords.length; i++) {
				if (!arr[index + i].match(qwords[i])) {
					return; //no match
				}
			}
			//both words matched
			//TODO: skip multiple words
			for (let i = 0; i < qwords.length; i++) {
				if (!hwords.includes(index + i)) {
					hwords.push(index + i);
				}
			}
		});

		let ret = words.reduce((result, word, index) => {
			if (hwords.includes(index)) {
				return `${result} <span class="hiword">${word}</span>`;
			}
			return result + " " + word;
		}, "");
		return { __html: ret };
	},
	normalizeText: function(t) {
		let ret = t
			.replace(/ {2}/g, " ")
			.replace(new RegExp("\\p{M}", "gu"), "")
			.replace(/[أإآ]/g, "ا")
			.replace(/[ؤ]/g, "و")
			.replace(/[ة]/g, "ه")
			.replace(/[ئي]/g, "ى");

		return ret;
	}
};

export default Utils;
