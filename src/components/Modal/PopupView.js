import React from "react";
import { AppConsumer } from "../../context/App";
import GotoPage from "./GotoPage";
import QIndex from "./QIndex";
import Commands from "./Commands";
import Search from "./Search";
import Play from "./Play";
import Hifz from "./Hifz";
import Help from "./Help";
import Settings from "./Settings";
import Tafseer from "./Tafseer";
import Bookmarks from "./Bookmarks";
import AudioPlayer from "./../../components/AudioPlayer/AudioPlayer";
import Modal from "./Modal";

function PopupView({ app }) {
    const componentMap = {
        Commands,
        Goto: GotoPage,
        Index: QIndex,
        Search,
        Play,
        Hifz,
        Help,
        Settings,
        Tafseer,
        AudioPlayer,
        Favorites: Bookmarks
    };

    const onClose = () => {
        app.closePopup();
    };

    const { popup, showPopup } = app;
    const Component = componentMap[popup];

    if (Component !== undefined) {
        return (
            <Modal onClose={onClose} show={showPopup} name={popup}>
                <Component />
            </Modal>
        );
    }

    return null;
}

export default AppConsumer(PopupView);
