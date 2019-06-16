const Utils = {
	pageFromPath: path => {
		let matchPage = path.match(/\/page\/([0-9]+)/i);
		if (matchPage) {
			return matchPage[1];
		}

		return "1";
	}
};

export default Utils;
