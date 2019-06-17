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
	}
};

export default Utils;
