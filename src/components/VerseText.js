import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { quranText } from "../App";
import { analytics } from "../services/Analytics";
import { ayaIdInfo, verseLocation } from "../services/QData";
import { copy2Clipboard } from "../services/utils";
import {
    addBookmark,
    deleteBookmark,
    selectIsBookmarked,
} from "../store/dbSlice";
import { selectStartSelection } from "../store/navSlice";
import { showToast } from "../store/uiSlice";
import { VerseInfo } from "./VerseInfo";
export const VerseText = ({
    verse,
    showInfo,
    navigate = true,
    bookmark = false,
    copy = false,
    trigger = "verse_text",
}) => {
    const [text, setText] = useState("");
    const dispatch = useDispatch();
    const selectStart = useSelector(selectStartSelection);
    const isBookmarked = useSelector(selectIsBookmarked(verse));

    const updateText = (verseIndex) => {
        setText(quranText?.[verseIndex]);
    };

    const copyVerse = (e) => {
        const verseInfo = ayaIdInfo(verse);
        copy2Clipboard(`${text} (${verseInfo.sura + 1}:${verseInfo.aya + 1})`);
        dispatch(showToast("text_copied"));

        analytics.logEvent("copy_text", {
            ...verseLocation(verse),
            verses_count: 1,
            trigger,
        });
    };

    useEffect(() => {
        if (verse !== undefined) {
            updateText(verse);
        }
    }, [verse]);

    useEffect(() => {
        if (verse === undefined) {
            updateText(selectStart);
        }
    }, [selectStart, verse]);

    const toggleBookmark = (e) => {
        if (isBookmarked) {
            dispatch(addBookmark(verse));
        } else {
            dispatch(deleteBookmark(verse));
        }
    };

    return (
        <div className="VerseText">
            {showInfo ? <VerseInfo navigate={navigate} /> : ""}
            {bookmark ? (
                <button onClick={toggleBookmark}>
                    <Icon icon={isBookmarked ? faBookmark : farBookmark} />
                </button>
            ) : null}
            {text}
            {copy ? (
                <button onClick={copyVerse}>
                    <Icon icon={faCopy} />
                </button>
            ) : null}
        </div>
    );
};
