import {
    faAdjust,
    faAngleDoubleDown,
    faAngleDoubleUp,
    faBars,
    faBookmark,
    faBookOpen,
    faCog,
    faCopy,
    faExpand,
    faEyeSlash,
    faFileDownload,
    faHeart,
    faListAlt,
    faPauseCircle,
    faPlayCircle,
    faQuestion,
    faQuran,
    faSearch,
    faShareSquare,
    faStopCircle,
    faUserCircle,
} from "@fortawesome/free-solid-svg-icons";
import Icon from "@/components/Icon";
import React from "react";

import {
    faBookmark as farBookmark,
    faEyeSlash as farEyeSlash,
    faKeyboard,
} from "@fortawesome/free-regular-svg-icons";

import { useSelector } from "react-redux";
import { selectIsBookmarked } from "../store/dbSlice";
import { selectMaskStart, selectStartSelection } from "../store/navSlice";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { selectReciter } from "../store/settingsSlice";
import { selectMenuExpanded } from "../store/uiSlice";
import { UserImage } from "./UserImage";

export const CommandIcons = {
    Commands: faBars,
    Index: faListAlt,
    Indices: faListAlt,
    Goto: faBookOpen,
    Search: faSearch,
    Play: faPlayCircle,
    AudioPlayer: faPlayCircle,
    Settings: faCog,
    Profile: faUserCircle,
    Theme: faAdjust,
    Favorites: faHeart,
    update_hifz: faHeart,
    Help: faQuestion,
    Mask: faEyeSlash,
    MaskOn: farEyeSlash,
    Copy: faCopy,
    Share: faShareSquare,
    Tafseer: faQuran,
    // Exercise: faPenNib,
    Exercise: faKeyboard,
    Fullscreen: faExpand,
    Bookmark: faBookmark,
    Bookmarks: faBookmark,
    ToggleButton: faAngleDoubleDown,
    Downloading: faFileDownload,
    Pause: faPauseCircle,
    Resume: faPauseCircle,
    Stop: faStopCircle,
};
export type CommandType = keyof typeof CommandIcons;

const getIcon = (
    commandId: CommandType,
    isBookmarked: boolean,
    showMenu: boolean,
    maskStart: number
) => {
    switch (commandId) {
        case "Mask":
            return CommandIcons[maskStart === -1 ? "Mask" : "MaskOn"];
        case "ToggleButton":
            return showMenu ? faAngleDoubleUp : faAngleDoubleDown;
        case "Bookmarks":
        case "Bookmark":
            return isBookmarked ? faBookmark : farBookmark;
        default:
            return CommandIcons[commandId];
    }
};

type CommandIconProps = {
    command: CommandType;
};

export const CommandIcon: React.FC<CommandIconProps> = ({ command }) => {
    const showMenu = useSelector(selectMenuExpanded);
    const maskStart = useSelector(selectMaskStart);
    const reciter = useSelector(selectReciter);
    const audioState = useSelector(selectAudioState);
    const selectStart = useSelector(selectStartSelection);
    const isBookmarked = useSelector(selectIsBookmarked(selectStart));

    switch (command) {
        case "Profile":
            return <UserImage />;
        case "AudioPlayer":
            return (
                <img
                    src={`${import.meta.env.BASE_URL}images/${reciter}.jpg`}
                    className={"ReciterIcon".appendWord(
                        "blinking",
                        audioState === AudioState.playing
                    )}
                    alt="recite"
                />
            );

        default:
            return (
                <span>
                    <Icon
                        icon={getIcon(
                            command,
                            isBookmarked,
                            showMenu,
                            maskStart
                        )}
                    />
                </span>
            );
    }
};
