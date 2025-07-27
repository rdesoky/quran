export const quranText: string[] = [];

const quranTextUrl = `${location.origin}${import.meta.env.BASE_URL
	}db/quran.txt`;

fetch(quranTextUrl)
	.then((results) => results.text())
	.then((text: string) => {
		quranText.push(...text.split("\n"));
	})
	.catch((e) => { });

export const quranNormalizedText: string[] = [];

const quranNormalizedTextUrl = `${location.origin}${import.meta.env.BASE_URL
	}db/normalized_quran.txt`;
fetch(quranNormalizedTextUrl)
	.then((results) => results.text())
	.then((text) => {
		quranNormalizedText.push(...text.split("\n"));
	})
	.catch((e) => { });
