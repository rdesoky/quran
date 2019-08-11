function GetAudioURL(reciterID, suraNum, ayaNum) {
	var url;
	if (ayaNum != undefined) {
		if (RecitersInfo[reciterID].ayaAudio == undefined) {
			reciterID = "hozefee";
		}
		url = AudioServers[RecitersInfo[reciterID].ayaAudio.server].link;
		url = url.replace("{rkey}", RecitersInfo[reciterID].ayaAudio.rkey);
		url = url.replace("{sura}", suraNum.toString());
		url = url.replace("{sura3}", NumToString(suraNum, 3));
		url = url.replace("{aya3}", NumToString(ayaNum, 3));
	} else if (RecitersInfo[reciterID].suraAudio != undefined) {
		url = AudioServers[RecitersInfo[reciterID].suraAudio.server].link;
		url = url.replace("{rkey}", RecitersInfo[reciterID].suraAudio.rkey);
		url = url.replace("{sura}", suraNum.toString());
		url = url.replace("{sura3}", NumToString(suraNum, 3));
	} else {
		url = RecitersInfo[reciterID].url;
		url = url.replace("%1%", suraNum.toString());
		url = url.replace("%2%", NumToString(suraNum, 3));
	}
	//prompt("url",url);
	return url;
}

const RecitersInfo = {
	baset: {
		on: true,
		actv: "(1114)",
		rw: 1,
		suraAudio: {
			server: "egylist",
			rkey: "abdul_basit_murattal",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Abdul_Basit_Murattal_192kbps"
		},

		suraServers: {
			quranicaudio: {
				rkey: "abdul_basit_murattal",
				actv: "(1114)"
			},
			islamway_mp3: {
				rkey: "74",
				actv: "(1114)",
				rw: 1
			}
		}
	},
	baset_tgw: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "abdulbaset_mujawwad",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Abdul_Basit_Mujawwad_128kbps"
		},
		//ayaAudio:{
		//	server: "everyayah",
		//	rkey: "AbdulSamad_64kbps_QuranExplorer.Com"
		//},
		actv: "(1114)",
		rw: 1
	},
	ibr_kd: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "ibrahim_al_akhdar",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Ibrahim_Akhdar_32kbps"
		},
		url: "http://egylist.com/quran/ibr_kd/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},

	abuzaid: {
		url: "http://egylist.com/quran/abuzaid/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	ah_sha: {
		url: "http://egylist.com/quran/ah_sha/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	agmy: {
		suraAudio: {
			server: "egylist",
			rkey: "ahmed_ibn_3ali_al-3ajamy",
			actv: "(1114)"
		},

		ayaAudio: {
			server: "everyayah",
			rkey: "Ahmed_ibn_Ali_al-Ajamy_128kbps_ketaballah.net"
		},

		url: "http://egylist.com/quran/agmy/%2%.rm",
		actv: "(1114)",
		rw: 1
	},
	noaenee: {
		on: true,
		ayaAudio: {
			server: "everyayah",
			rkey: "Ahmed_Neana_128kbps"
		},
		suraAudio: {
			server: "egylist",
			rkey: "ahmad_nauina",
			actv: "(1114)"
		},
		url: "http://egylist.com/quran/noaenee/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	aalkalbani: {
		suraAudio: {
			server: "egylist",
			rkey: "adel_kalbani",
			actv: "(1114)"
		},
		//url:"http://egylist.com/quran/aalkalbani/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	Althobeaty: {
		suraAudio: {
			server: "egylist",
			rkey: "thubaity",
			actv: "(1114)"
		},
		//url:"http://egylist.com/quran/Althobeaty/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	// abdulbarymoh:{
	// 	url:"http://egylist.com/quran/abdulbarymoh/%2%.rm",
	// 	actv:"(1114)",
	// 	rw:1
	// },
	// abdelkhaleq:{
	// 	url:"http://quran.islamway.com/quran3/77/%2%.rm",
	// 	actv:"(1114)",
	// 	rw:1
	// },
	Alkhayyat: {
		suraAudio: {
			server: "egylist",
			rkey: "khayat",
			actv: "(1114)"
		},
		//url:"http://egylist.com/quran/Alkhayyat/s%1%.rm",
		actv: "(134)000(177)",
		rw: 1
	},
	matrood: {
		suraAudio: {
			server: "egylist",
			rkey: "abdullah_matroud",
			actv: "(1114)"
		},
		url: "http://quran.islamway.com/quran3/91/%2%.rm",
		actv: "(1114)",
		rw: 1
	},
	abasfar: {
		suraAudio: {
			server: "egylist",
			rkey: "abdullaah_basfar",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Abdullah_Basfar_32kbps"
		},
		url: "http://egylist.com/quran/abasfar/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	// abasfar_tgw:{
	// 	url:"http://quran.islamway.com/quran3/208/%2%.rm",
	// 	actv:"(144)(070)",
	// 	rw:1
	// },
	alqasem: {
		suraAudio: {
			server: "egylist",
			rkey: "abdul_muhsin_alqasim",
			actv: "(1114)"
		},
		//url:"http://egylist.com/quran/alqasem/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	// mobbdee:{
	// 	url:"http://quran.islamway.com/quran3/95/%2%.rm",
	// 	actv:"(1114)",
	// 	rw:1
	// },
	// kanakree:{
	// 	url:"http://egylist.com/quran/kanakree/s%1%.rm",
	// 	actv:"(1114)",
	// 	rw:1
	// },
	abd_wad: {
		suraAudio: {
			server: "egylist",
			rkey: "abdulwadood_haneef",
			actv: "(1114)"
		},
		//url:"http://egylist.com/quran/abd_wad/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	hozefee: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "huthayfi",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Hudhaify_32kbps"
		},
		//url:"http://quran.islamway.com/quran3/99/%2%.rm",
		//url:"http://egylist.com/quran/hozefee/s%1%.ram",
		actv: "(1114)",
		rw: 1
	},
	Alsoweasy: {
		suraAudio: {
			server: "quranicaudio",
			rkey: "ali_hajjaj_alsouasi",
			actv: "(1114)"
		},
		url: "http://egylist.com/quran/Alsoweasy/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	alijaber: {
		suraAudio: {
			server: "egylist",
			rkey: "abdullaah_alee_jaabir",
			actv: "(1114)"
		},
		//url:"http://egylist.com/quran/alijaber/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	// Zak_Dag:{
	// 	url:"http://egylist.com/quran/Zak_Dag/s%1%.rm",
	// 	actv:"(1114)",
	// 	rw:1
	// },
	// tarek_ibr:{
	// 	url:"http://quran.islamway.com/quran3/68/%2%.rm",
	// 	actv:"11110(153)0100(152)",
	// 	rw:1
	// },
	m_ayoub: {
		suraAudio: {
			server: "egylist",
			rkey: "muhammad_ayyoob",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Muhammad_Ayyoub_32kbps"
		},
		//url:"http://quran.islamway.com/quran3/122/%2%.rm",
		actv: "(1114)",
		rw: 1
	},
	mjebreel: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "muhammad_jibreel",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Muhammad_Jibreel_128kbps"
		},
		//url:"http://egylist.com/quran/mjebreel/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	// mrefaat:{
	// 	url:"http://quran.islamway.com/quran3/134/%2%.rm",
	// 	actv:"(017)11(035)1(016)110111(07)1(011)(110)(08)",
	// 	rw:1
	// },
	ma_kar: {
		suraAudio: {
			server: "egylist",
			rkey: "muhammad_abdulkareem",
			actv: "(1114)"
		},
		//url:"http://egylist.com/quran/ma_kar/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	// mbuzeed:{
	// 	url:"http://egylist.com/quran/mbuzeed/s%1%.rm",
	// 	actv:"(1114)",
	// 	rw:1
	// },
	menshawee: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "muhammad_siddeeq_al-minshaawee",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Menshawi_16kbps"
		},
		//url:"http://egylist.com/quran/menshawee/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	tablawee: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "mohammad_altablawi",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Mohammad_al_Tablaway_128kbps"
		},
		url: "http://egylist.com/quran/tablawee/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	mah_ban: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "mahmood_ali_albana",
			actv: "(1114)"
		},
		url: "http://egylist.com/quran/mah_ban/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	hosaree: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "mahmood_khaleel_al-husaree",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Husary_128kbps"
		},
		url: "http://egylist.com/quran/hosaree/rm/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	// hosaree_edu:{
	// 	url:"http://quran.islamway.com/quran3/211/%2%.rm",
	// 	actv:"1000(1110)",
	// 	rw:1
	// },
	affassi: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "mishaari_raashid_al_3afaasee",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Alafasy_128kbps"
		},
		//url:"http://quran.islamway.com/quran3/147/%2%.rm",
		//url:"http://download.quran.islamway.com/quran3/147/%2%.mp3",
		//actv:"(142)0000(168)",
		actv: "(1114)",
		rw: 1
	},
	Mu_sma: {
		on: true,
		suraAudio: {
			server: "egylist",
			rkey: "mostafa_ismaeel",
			actv: "(1114)"
		},
		//ayaAudio:{
		//	server: "everyayah",
		//	rkey: "Mustafa_Ismail_48kbps"
		//},
		url: "http://egylist.com/quran/Mu_sma/s%1%.rm",
		actv: "(1114)",
		rw: 1
	},
	ghamdi: {
		suraAudio: {
			server: "egylist",
			rkey: "sa3d_al-ghaamidi",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Ghamadi_40kbps"
		},
		//url:"http://quran.islamway.com/quran3/45/%2%.rm",
		actv: "(1114)",
		rw: 1
	},
	h_refaae: {
		suraAudio: {
			server: "egylist",
			rkey: "rifai",
			actv: "(1114)"
		},
		ayaAudio: {
			server: "everyayah",
			rkey: "Hani_Rifai_192kbps"
		},
		//url:"http://quran.islamway.com/quran3/157/%2%.rm",
		actv: "(1114)",
		rw: 1
	},
	// koshee:{
	// 	url:"http://egylist.com/quran/koshee/s%1%.rm",
	// 	actv:"(1114)",
	// 	rw:2
	// },
	baset_wa: {
		suraAudio: {
			server: "egylist",
			rkey: "abdulbaset_warsh",
			actv: "(1114)"
		},
		url: "http://quran.islamway.com/quran3/179/%2%.rm",
		actv: "(1114)",
		rw: 2
	},
	// hosaree_wa:{
	// 	url:"http://egylist.com/quran/hosaree/w/s%1%.rm",
	// 	actv:"(1114)",
	// 	rw:2
	// },
	// Gharbi:{
	// 	url:"http://egylist.com/quran/Gharbi/s%1%.rm",
	// 	actv:"(1114)",
	// 	rw:2
	// },
	// dukalli:{
	// 	url:"http://egylist.com/quran/dukalli/s%1%.rm",
	// 	actv:"(1114)",
	// 	rw:3
	// },
	// sunaynaqal:{
	// 	url:"http://egylist.com/quran/sunaynaqal/%2%.rm",
	// 	actv:"(055)(159)",
	// 	rw:3
	// },
	// Abdulrashid:{
	// 	url:"http://egylist.com/quran/Abdulrashid/s%1%.rm",
	// 	actv:"(17)(0107)",
	// 	rw:4
	// },
	hosaree_doray: {
		suraAudio: {
			server: "egylist",
			rkey: "mahmood_khaleel_al-husaree_doori",
			actv: "(1114)"
		},
		actv: "(1114)",
		//url:"http://quran.islamway.com/quran3/192/%2%.rm",
		//actv:"0(17)(0106)",
		rw: 5
	}
	// ,
	// khaalid_al_qahtaanee:{

	// }
};

const ListReciters = filter=>{
	let list = [];
	for(let k in RecitersInfo){
		if(RecitersInfo.hasOwnProperty(k)){
			const info = RecitersInfo[k];
			if(info.on){

			}
		}
	}
}

const AudioServers = {
	everyayah: {
		cross_domains: true,
		mtype: 1,
		link: "http://www.everyayah.com/data/{rkey}/{sura3}{aya3}.mp3",
		provider: "everyayah.com",
		website: "http://www.everyayah.com",
		download: "http://www.everyayah.com/data/{rkey}/"
	},

	egylist: {
		cross_domains: true,
		mtype: 1, //1: mp3, 2:real
		provider: "quranicaudio.com",
		link: "http://www.egylist.com/quran/mp3/{rkey}/{sura3}.mp3",
		website: "http://quran.muslim-web.com",
		download: "http://www.egylist.com/quran/mp3/{rkey}/{sura3}.mp3"
	},

	quranicaudio: {
		cross_domains: true,
		mtype: 1, //1: mp3, 2:real
		provider: "quranicaudio.com",
		link: "http://download.quranicaudio.com/quran/{rkey}/{sura3}.mp3",
		website: "http://www.quranicaudio.com",
		download: "http://download.quranicaudio.com/quran/{rkey}/"
	},

	quranicaudio_complete: {
		cross_domains: true,
		mtype: 1, //1: mp3, 2:real
		provider: "quranicaudio.com",
		link: "http://download.quranicaudio.com/quran/{rkey}/complete/{sura3}.mp3",
		website: "http://www.quranicaudio.com",
		download: "http://download.quranicaudio.com/quran/{rkey}/complete/"
	},

	islamway_mp3: {
		cross_domains: false,
		mtype: 1,
		provider: "islamway",
		website: "http://www.islamway.com",
		link: "http://download.quran.islamway.com/quran3/{rkey}/{sura3}.mp3"
	}
};

export default { GetAudioURL, RecitersInfo, AudioServers };
export { GetAudioURL, RecitersInfo, AudioServers };
