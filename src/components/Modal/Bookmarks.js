import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "../../context/App";
import { VerseInfo, VerseText } from "./../Widgets";
import { BookmarksList } from "./QIndex";

const Bookmarks = ({ app }) => {
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
