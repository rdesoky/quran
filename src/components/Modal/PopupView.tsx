//Managing the active side modeless popup ( Index, Tafseer, Settings, etc )
import GotoPage from "@/components/Modal/GotoPage";
import QIndex from "@/components/Modal/QIndex";
import Commands from "@/components/Modal/Commands";
import Search from "@/components/Modal/Search";
import Play from "@/components/Modal/Play";
import Hifz from "@/components/Modal/Hifz";
import Help from "@/components/Modal/Help";
import Settings from "@/components/Modal/Settings";
import Tafseer from "@/components/Modal/Tafseer";
import Favorites from "@/components/Modal/Favorites";
import Bookmarks from "@/components/Modal/Bookmarks";
import Modal from "@/components/Modal/Modal";
import User from "@/components/Modal/User";
import Exercise from "@/components/Modal/Exercise";
import { useDispatch, useSelector } from "react-redux";
import {
	closePopup,
	selectPopup,
	selectPopupParams,
	selectShowPopup,
} from "../../store/uiSlice";
import { ReactNode } from "react";
import { HorizontalAlignmentType } from "recharts/types/component/DefaultLegendContent";

export const PopupsMap = {
	Commands,
	Goto: GotoPage,
	Index: QIndex,
	Indices: QIndex,
	Search,
	Play,
	Hifz,
	Help,
	Settings,
	Tafseer,
	AudioPlayer: Settings,
	Favorites,
	Profile: User,
	Bookmarks,
	Exercise,
};

export type PopupName = keyof typeof PopupsMap;

function PopupView() {
	const dispatch = useDispatch();

	const onClose = () => {
		dispatch(closePopup());
	};

	// const { popup, showPopup, popupParams } = app;
	const popup = useSelector(selectPopup);
	const showPopup = useSelector(selectShowPopup);
	const popupParams = useSelector(selectPopupParams);

	const Component = popup ? PopupsMap[popup] : undefined;

	if (popup && Component !== undefined) {
		return (
			<Modal onClose={onClose} show={showPopup} name={popup}>
				<Component {...popupParams} />
			</Modal>
		);
	}
}

export default PopupView;

export type ContextPopupType = {
	target: HTMLElement;
	content: ReactNode;
	header?: ReactNode;
	footer?: ReactNode;
};
