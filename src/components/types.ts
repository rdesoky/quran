import { AudioRangeProp } from "@/store/settingsSlice";
import { ContextPopupType } from "./Modal/PopupView";

export enum TestMode {
	reviewOnFinish = 0,
	nextOnFinish = 1,
	nextOnPartialFinish = 2,
};


export type AudioRef = {
	play: (ayaId: number, setupRange?: AudioRangeProp | false) => void;
	stop: () => void;
	pause: () => void;
	resume: () => void;
	setupReciteRange: (startAya: number, endAya: number) => void;
};

export type MessageBoxRef = {
	push: (msg: Msg) => void;
	pop: () => void;
	set: (msg: Msg) => void;
	getMessages: () => Msg[];
};

export type ContextPopupRef = {
	show: (info: ContextPopupType) => void;
	close: () => void;
	info: ContextPopupType | null;
};