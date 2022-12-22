import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../context/App";
import { Refs } from "../../RefsProvider";
import { selectAppHeight, selectIsNarrow } from "../../store/layoutSlice";
import { showToast } from "../../store/uiSlice";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { VerseText } from "./../Widgets";
import { BookmarksList } from "./QIndex";

const Bookmarks = () => {
    const app = useContext(AppContext);
    const appHeight = useSelector(selectAppHeight);
    const isNarrow = useSelector(selectIsNarrow);
    const dispatch = useDispatch();
    const msgBox = useContext(Refs).get("msgBox");

    const toggleBookmark = (e) => {
        if (app.isBookmarked()) {
            msgBox.push({
                title: <String id="are_you_sure" />,
                content: <String id="delete_bookmark" />,
                onYes: () => {
                    if (app.removeBookmark() === -1) {
                        dispatch(showToast("bookmark_deleted"));
                    }
                },
            });
        } else {
            if (app.addBookmark() === 1) {
                dispatch(showToast("bookmark_added"));
            }
        }
    };

    return (
        <>
            <div className="Title">
                <String id="bookmarks" />
                {isNarrow ? <PlayerButtons trigger="bookmarks_title" /> : ""}
            </div>
            <div className="PopupBody" style={{ maxHeight: appHeight - 85 }}>
                <div className="BigToggler">
                    <button onClick={toggleBookmark}>
                        <Icon
                            icon={app.isBookmarked() ? faBookmark : farBookmark}
                        />
                    </button>
                </div>
                <VerseText showInfo={true} copy={true} trigger="bookmarks_ui" />
                <hr style={{ clear: "both" }} />
                <BookmarksList />
            </div>
        </>
    );
};

export default Bookmarks;
