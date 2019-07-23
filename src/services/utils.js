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
		}, 500);
	}
};

export default Utils;
