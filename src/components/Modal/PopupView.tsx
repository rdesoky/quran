//Managing the active side modeless popup ( Index, Tafseer, Settings, etc )
import GotoPage from "./GotoPage";
import QIndex from "./QIndex";
import Commands from "./Commands";
import Search from "./Search";
import Play from "./Play";
import Hifz from "./Hifz";
import Help from "./Help";
import Settings from "./Settings";
import Tafseer from "./Tafseer";
import Favorites from "./Favorites";
import Bookmarks from "./Bookmarks";
import Modal from "./Modal";
import User from "./User";
import Exercise from "./Exercise";
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
    header: ReactNode;
};
