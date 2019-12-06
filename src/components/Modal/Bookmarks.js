import React, { useEffect, useState, useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "../../context/App";
import { VerseInfo, VerseText } from "./../Widgets";
import { BookmarksList } from "./QIndex";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faBookmark, faQuran } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";

const Bookmarks = () => {
    const [showTafseer, setShowTafseer] = useState(false);
    const app = useContext(AppContext);
    const toggleBookmark = e => {
        if (app.isBookmarked()) {
            app.pushMessageBox({
                title: <String id="delete_bookmark" />,
                content: <String id="are_you_sure" />,
                onYes: () => {
                    app.removeBookmark();
                }
            });
        } else {
            app.addBookmark();
        }
    };

    const toggleTafseer = e => {
        setShowTafseer(!showTafseer);
    };

    return (
        <>
            <div className="Title">
                <String id="bookmarks" />
                <button className="CommandButton" onClick={toggleTafseer}>
                    <Icon icon={faQuran} />
                </button>
                {app.isNarrow ? <PlayerButtons /> : ""}
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <div className="BigToggler">
                    <button onClick={toggleBookmark}>
                        <Icon
                            icon={app.isBookmarked() ? faBookmark : farBookmark}
                        />
                    </button>
                </div>
                <VerseText showInfo={true} copy={true} />
                <hr style={{ clear: "both" }} />
                <BookmarksList showTafseer={showTafseer} />
            </div>
        </>
    );
};

export default AppConsumer(Bookmarks);
