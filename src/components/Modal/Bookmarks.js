import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import firebase from "firebase";
import { AppConsumer } from "../../context/App";
import { VerseInfo } from "./Exercise";
import QData from "../../services/QData";

const Bookmarks = ({ app }) => {
    const { user, bookmarks } = app;

    const gotoAya = ({ target }) => {
        const aya = parseInt(target.getAttribute("aya"));
        app.gotoAya(aya, { sel: true });
    };

    const renderVerse = () => {
        const { selectStart, selectEnd } = app;
        const verseList = app.verseList();
        if (verseList.length > selectStart) {
            return verseList[selectStart];
        }
    };

    const toggleBookmark = e => {
        app.addBookmark();
        app.setPopup("Index");
        localStorage.setItem("activeTab", "bookmarks");
    };

    return (
        <>
            <div className="Title">
                <String id="bookmarks" />
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <div>
                    <VerseInfo verse={app.selectStart} />
                </div>
                <h3>{renderVerse()}</h3>
                <div className="ButtonsBar">
                    <button onClick={toggleBookmark}>
                        <String id="bookmark" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default AppConsumer(Bookmarks);
