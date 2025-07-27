let fs = require("fs");

let normalizeText = t => {
	let ret = t
		.replace(/ {2}/g, " ")
		.replace(new RegExp("\\p{M}", "gu"), "")
		.replace(/[أإآ]/g, "ا")
		.replace(/[ؤ]/g, "و")
		.replace(/[ة]/g, "ه")
		.replace(/[ئي]/g, "ى");

	return ret;
};

let quran = fs
	.readFileSync("../public/quran.txt")
	.toString()
	.split("\n");
let nquran = quran.map(a => {
	return normalizeText(a);
});
fs.writeFileSync("../public/normalized_quran.txt", nquran.join("\n"));
