import { quranText } from "@/App";
import { VerseInfo } from "@/components/VerseInfo";
import { analytics } from "@/services/analytics";
import { ayaIdInfo, verseLocation } from "@/services/qData";
import { copy2Clipboard } from "@/services/utils";
import {
    addBookmark,
    deleteBookmark,
    selectIsBookmarked,
} from "@/store/dbSlice";
import { selectStartSelection } from "@/store/navSlice";
import { showToast } from "@/store/uiSlice";
import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark, faCopy } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import Icon from "./Icon";

type VerseTextProps = {
    verse?: number;
    showInfo?: boolean;
    bookmark?: boolean;
    copy?: boolean;
    trigger?: string;
    navigate?: boolean;
};

export const VerseText = ({
    verse,
    showInfo,
    navigate = true,
    bookmark = false,
    copy = false,
    trigger = "verse_text",
}: VerseTextProps) => {
    const [text, setText] = useState("");
    const dispatch = useDispatch();
    const selectStart = useSelector(selectStartSelection);
    const aya_id = verse ?? selectStart;
    const isBookmarked = useSelector(selectIsBookmarked(aya_id));

    const updateText = (verseIndex: number) => {
        setText(quranText?.[verseIndex]);
    };

    const copyVerse = () => {
        const verseInfo = ayaIdInfo(aya_id);
        copy2Clipboard(`${text} (${verseInfo.sura + 1}:${verseInfo.aya + 1})`);
        dispatch(showToast({ id: "text_copied" }));

        analytics.logEvent("copy_text", {
            ...verseLocation(aya_id),
            verses_count: 1,
            trigger,
        });
    };

    useEffect(() => {
        if (aya_id !== undefined) {
            updateText(aya_id);
        }
    }, [aya_id]);

    // useEffect(() => {
    //     if (verse === undefined) {
    //         updateText(selectStart);
    //     }
    // }, [selectStart, verse]);

    const toggleBookmark = () => {
        if (isBookmarked) {
            dispatch(deleteBookmark(aya_id));
        } else {
            dispatch(addBookmark(aya_id));
        }
    };

    return (
        <div className="VerseText">
            {showInfo ? <VerseInfo navigate={navigate} verse={aya_id} /> : ""}
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
