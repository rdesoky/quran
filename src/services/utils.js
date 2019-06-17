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
		return Math.floor(page / 20) + 1;
	}
};

export default Utils;
