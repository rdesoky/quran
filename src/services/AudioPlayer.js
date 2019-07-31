export default {
	obj: null, //<audio> element reference
	playCount: 1, //default repeat count
	lastState: "IDLE",
	statusIcons: {
		PLAYING:
			"<img style='height:16px;width:16px;' src='images/equalizer4.gif'/>",
		BUFFERING: "<img style='height:18px;width:18px' src='images/wait.gif'/>"
	},
	init: function() {
		//create html controls
		InstallSpin(_E("Repeat"), 1, 999);
		CreateVolumeBar("VolumeCtrl", {
			onClickMute: function(bMute) {
				//AudioPlayer.obj.sendEvent("mute", bMute?"true":"false");
				AudioPlayer.obj.muted = bMute;
			},
			onChangeVolume: function(newVol) {
				AudioPlayer.obj.volume = newVol / 100;
				//AudioPlayer.obj.sendEvent("volume", newVol);
			}
		});

		this.obj = _E("AudioPlayerElement");

		_E("VolumeCtrl").setVolume(Math.floor(this.obj.volume * 100));
		_E("VolumeCtrl").setMute(this.obj.muted);

		DU.show("AudioControls");

		this.obj.addEventListener("ended", function() {
			AudioPlayer.onTrackFinish();
			_E("PlayerStatus").innerHTML = "";
		});
		this.obj.addEventListener("volumechange", function(event) {
			_E("VolumeCtrl").setVolume(AudioPlayer.obj.volume * 100);
			_E("VolumeCtrl").setMute(AudioPlayer.obj.muted);
		});
		this.obj.addEventListener("playing", function(event) {
			AudioPlayer.setState("PLAYING");
			_E("PlayerStatus").innerHTML = AudioPlayer.statusIcons.PLAYING;
		});
		this.obj.addEventListener("waiting", function(event) {
			AudioPlayer.setState("BUFFERING");
			_E("PlayerStatus").innerHTML = AudioPlayer.statusIcons.BUFFERING;
		});
		this.obj.addEventListener("pause", function(event) {
			AudioPlayer.setState("PAUSED");
			_E("PlayerStatus").innerHTML = "";
		});
	},

	playQuranPart: function(partNum) {
		var pInfo = QData.parts[partNum - 1];
		this.playRange(
			1,
			{ sura: pInfo.s, aya: pInfo.a },
			{ sura: pInfo.es, aya: pInfo.ea }
		);
	},

	playRange: function(play_res, startInfo, endInfo) {
		DU.show("SyncOption");
		if (this.obj) {
			this.loadRange(play_res, startInfo, endInfo);
			this.play(true);
			return true;
		}
		return false;
	},

	loadRange: function(play_res, startInfo, endInfo) {
		PlayList.setRange(play_res, startInfo, endInfo);
		this.loadTrack(PlayList.getFirstTrack());
	},

	loadTrack: function(url) {
		//this.obj.sendEvent( "load", url );
		_E("AudioPlayerElement").src = url;
		this.obj.load();
		_E("PlayerSura").innerHTML = gStrings.sura_names[PlayList.current.sura - 1];
	},

	pause: function() {
		//this.obj.sendEvent("play","false");
		this.obj.pause();
		this.setState("PAUSED");
	},
	resume: function() {
		this.obj.play();
		//this.obj.sendEvent("play","true");
		this.setState("PLAYING");
	},
	play: function(uiCall) {
		if (!this.obj) {
			return false;
		}
		if (uiCall) {
			IReciters.select(PlayList.getActiveReciter());
			this.setPlayCount(1);
		}
		this.syncAudio();

		//this.obj.sendEvent("play","true");
		this.obj.play();
		this.showPlayCount();
		this.setState("PLAYING");
		return true;
	},

	syncAudio: function(togg) {
		if (togg) {
			_SA("SyncCheck", "checked", _EA("SyncCheck", "checked") ? undefined : 1);
		}
		if (_EA("SyncCheck", "checked") && PlayList.list_res) {
			QViewer.gotoAya(PlayList.current.aya - 1, PlayList.current.sura - 1, 1);
		}
	},

	setPlayCount: function(count) {
		this.playCount = count;
		this.showPlayCount();
	},
	showPlayCount: function() {
		_E("RepeatCounter").innerHTML = this.playCount.toString();
	},
	onTrackFinish: function() {
		var repeat = parseInt(_E("Repeat").value, 10);
		if (!PlayList.list_res) {
			// sura mode
			if (
				_EA("RepeatCheck", "checked") &&
				(_EA("EndlessLoop", "checked") || repeat > this.playCount)
			) {
				// repeat current sura if repeat is active
				this.setPlayCount(this.playCount + 1);
				this.play();
				return;
			} else {
				this.setPlayCount(1); //reset counter
			}
		}
		var nextTrack = PlayList.getNextTrack();
		if (nextTrack != null) {
			this.loadTrack(nextTrack);
			this.play();
		} else {
			// end of list
			this.loadTrack(PlayList.getFirstTrack());
			if (
				_EA("RepeatCheck", "checked") &&
				(_EA("EndlessLoop", "checked") || repeat > this.playCount)
			) {
				this.setPlayCount(this.playCount + 1);
				this.play();
			} else {
				this.setState("IDLE");
				this.setPlayCount(1);
			}
		}
	},

	setState: function(state) {
		switch (state) {
			case "IDLE":
				_E("AudioControls").className = "idle";
				_E("BtnPlay").onclick = function() {
					AudioPlayer.loadTrack(PlayList.getFirstTrack());
					AudioPlayer.play(true);
				};
				//_E("BtnPlay").value = ">";
				_E("BtnPlay").disabled = false;
				_E("BtnStop").disabled = true;
				break;
			case "PLAYING":
			case "BUFFERING":
				_E("AudioControls").className = "playing";
				//			_E("BtnPlay").value = "||";
				_E("BtnPlay").onclick = function() {
					AudioPlayer.pause();
				};
				_E("BtnPlay").disabled = false;
				_E("BtnStop").disabled = false;
				break;
			case "PAUSED":
				_E("AudioControls").className = "paused";
				//_E("BtnPlay").value = "|>";
				_E("BtnPlay").onclick = function() {
					AudioPlayer.resume();
				};
				_E("BtnPlay").disabled = false;
				_E("BtnStop").disabled = false;
				break;
		}
		this.lastState = state;
		_E("PlayerStatus").innerHTML = AudioPlayer.statusIcons[state] || "";
	},

	stop: function() {
		//this.setPlayCount(1);
		if (this.obj && this.lastState != "IDLE") {
			//this.obj.sendEvent("stop");
			this.obj.pause();
			this.loadTrack(PlayList.getFirstTrack());
		}
		this.setState("IDLE");
	}
};

var PlayList = {
	list_res: 0, //0: sura, 1: aya, 2:page
	aya_reciter: "hozefee",

	start: {
		sura: 1,
		aya: 1,
		page: 1
	},
	end: {
		sura: 114,
		aya: 6,
		page: 604
	},
	current: {
		sura: 1,
		aya: 1
	},

	setRange: function(list_res, startInfo, endInfo) {
		this.list_res = list_res; //0 sura, 1: aya, 2: page

		if (list_res) {
			DU.show("SyncOption");
			DU.hide("ReciteTillEnd");
		} else {
			DU.hide("SyncOption");
			DU.show("ReciteTillEnd");
		}

		DU.show("SyncOption");

		U.copyObject(this.start, startInfo);
		U.copyObject(this.current, startInfo);

		if (endInfo != undefined) {
			this.setEnd(endInfo);
		} else {
			U.copyObject(this.end, this.start);
		}
	},

	setEnd: function(info) {
		U.copyObject(this.end, info);
	},

	getFirstTrack: function() {
		U.copyObject(this.current, this.start);
		return this.getCurrTrackURL();
	},

	getNextTrack: function() {
		while (true) {
			if (this.list_res) {
				// versebyverse
				var nextAya = QData.nextAya(this.current.sura, this.current.aya);
				if (nextAya && QData.compareVerses(nextAya, this.end) <= 0) {
					U.copyObject(this.current, nextAya);
				} else {
					return null;
				}
			} else {
				if (_EA("ReciteTillEndCheck", "checked")) {
					if (this.current.sura < 114) {
						this.current.sura++;
					} else {
						this.current.sura = 1;
					}
				} else {
					return null;
				}
			}
			var trackURL = this.getCurrTrackURL();
			if (trackURL) {
				return trackURL;
			}
		}
		return null;
	},

	getCurrTrackURL: function() {
		//TODO: check if file is missing return null
		var suraNum = this.current.sura;
		var reciterID = this.getActiveReciter();
		var url;
		if (this.list_res) {
			url = GetAudioURL(reciterID, suraNum, this.current.aya);
		} else {
			url = GetAudioURL(reciterID, suraNum);
		}

		return url;
	},

	getActiveReciter: function() {
		var reciterID = IReciters.activeReciter;
		if (this.list_res) {
			if (RecitersInfo[reciterID].ayaAudio == undefined) {
				reciterID = this.lastAyaReciter || "hozefee";
			} else {
				this.lastAyaReciter = reciterID; //save last good reciter
			}
		} else {
			if (
				RecitersInfo[reciterID].suraAudio != undefined &&
				AudioServers[RecitersInfo[reciterID].suraAudio.server].cross_domains ==
					true
			) {
				this.lastSuraReciter = reciterID;
			} else {
				reciterID = this.lastSuraReciter;
			}
		}
		return reciterID;
	}
};
