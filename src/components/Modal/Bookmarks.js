import React, { useEffect, useState, useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "../../context/App";
import { VerseInfo, VerseText } from "./../Widgets";
import { BookmarksList } from "./QIndex";

const Bookmarks = () => {
    const app = useContext(AppContext);
    const toggleBookmark = e => {
        app.toggleBookmark();
    };

    return (
        <>
            <div className="Title">
                <String id="bookmarks" />
                <div className="ButtonsBar">
                    <button onClick={toggleBookmark}>
                        <String
                            id={app.isBookmarked() ? "unbookmark" : "bookmark"}
                        />
                    </button>
                </div>
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <VerseText showInfo={true} />
                <hr style={{ clear: "both" }} />
                <BookmarksList />
            </div>
        </>
    );
};

export default AppConsumer(Bookmarks);
