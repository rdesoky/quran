import { RecitersInfo } from "@/data/reciters";
import { num2string } from "@/services/utils";

const NumToString = num2string;

/**
 *
 * @param {ReciterID} reciterID
 * @param {number} suraNum
 * @param {number} ayaNum
 */
export function GetAudioURL(
	reciterID: ReciterID,
	suraNum: number,
	ayaNum: number
) {
	let url;
	const suraAudio = RecitersInfo[reciterID].suraAudio;
	if (ayaNum !== undefined) {
		if (!RecitersInfo[reciterID].ayaAudio) {
			reciterID = "hozefee";
		}
		url = AudioServers[RecitersInfo[reciterID].ayaAudio.server].link;
		url = url.replace("{rkey}", RecitersInfo[reciterID].ayaAudio.rkey);
		url = url.replace("{sura}", suraNum.toString());
		url = url.replace("{sura3}", NumToString(suraNum, 3));
		url = url.replace("{aya3}", NumToString(ayaNum, 3));
	} else if (suraAudio !== undefined) {
		//redundant check to satisfy typescript
		url = AudioServers[suraAudio.server].link;
		url = url.replace("{rkey}", suraAudio.rkey);
		url = url.replace("{sura}", suraNum.toString());
		url = url.replace("{sura3}", NumToString(suraNum, 3));
	} else {
		url = RecitersInfo[reciterID].url;
		url = url?.replace("%1%", suraNum.toString());
		url = url?.replace("%2%", NumToString(suraNum, 3));
	}
	return url;
}

export function shuffleArray(array: unknown[]) {
	for (let i = array.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[array[i], array[j]] = [array[j], array[i]];
	}
}

export const ListReciters = (
	feature: "ayaAudio" | "suraAudio" = "ayaAudio"
) => {
	const saved_list: ReciterID[] = JSON.parse(
		localStorage.getItem("reciters_" + feature) || "[]"
	);
	const availableReciters: ReciterID[] = [];
	let k: ReciterID;
	for (k in RecitersInfo) {
		// if (RecitersInfo.hasOwnProperty(k)) {
		const info = RecitersInfo[k];
		if (info[feature] !== undefined) {
			availableReciters.push(k);
		}
		// }
	}
	//If saved_list does not match the available reciters
	if (availableReciters.length !== saved_list.length) {
		shuffleArray(availableReciters);
		localStorage.setItem(
			"reciters_" + feature,
			JSON.stringify(availableReciters)
		);
		return availableReciters;
	}
	return saved_list;
};

export type AudioServerInfo = {
	cross_domains?: boolean;
	mtype?: number; //1: mp3, 2:real
	link: string;
	provider: string;
	website: string;
	download?: string;
	[key: string]: unknown; // Allow additional properties
};

export const AudioServers = {
	everyayah: {
		cross_domains: true,
		mtype: 1,
		link: "https://www.everyayah.com/data/{rkey}/{sura3}{aya3}.mp3",
		provider: "everyayah.com",
		website: "https://www.everyayah.com",
		download: "https://www.everyayah.com/data/{rkey}/",
	},

	egylist_vaudio: {
		cross_domains: true,
		link: "http://www.egylist.com/quran/vaudio/{rkey}/{sura3}{aya3}.mp3",
		provider: "everyayah.com",
		website: "http://www.everyayah.com",
		download: "http://www.everyayah.com/data/{rkey}/",
	},

	egylist: {
		cross_domains: true,
		mtype: 1, //1: mp3, 2:real
		provider: "quranicaudio.com",
		link: "http://www.egylist.com/quran/mp3/{rkey}/{sura3}.mp3",
		website: "http://quran.muslim-web.com",
		download: "http://www.egylist.com/quran/mp3/{rkey}/{sura3}.mp3",
	},

	quranicaudio: {
		cross_domains: true,
		mtype: 1, //1: mp3, 2:real
		provider: "quranicaudio.com",
		link: "http://download.quranicaudio.com/quran/{rkey}/{sura3}.mp3",
		website: "http://www.quranicaudio.com",
		download: "http://download.quranicaudio.com/quran/{rkey}/",
	},

	quranicaudio_complete: {
		cross_domains: true,
		mtype: 1, //1: mp3, 2:real
		provider: "quranicaudio.com",
		link: "http://download.quranicaudio.com/quran/{rkey}/complete/{sura3}.mp3",
		website: "http://www.quranicaudio.com",
		download: "http://download.quranicaudio.com/quran/{rkey}/complete/",
	},

	islamway_mp3: {
		cross_domains: false,
		mtype: 1,
		provider: "islamway",
		website: "http://www.islamway.com",
		link: "http://download.quran.islamway.com/quran3/{rkey}/{sura3}.mp3",
	},
} as Record<AudioServerId, AudioServerInfo>;

// export default { GetAudioURL, RecitersInfo, AudioServers, ListReciters };
// export { GetAudioURL, RecitersInfo, AudioServers, ListReciters };
