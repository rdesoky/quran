import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";
import {
    faBookmark,
    faChevronDown,
    faChevronLeft,
    faChevronRight,
    faChevronUp,
    faCopy,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage, FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { quranText } from "../App";
import { AppContext } from "../context/App";
import { analytics } from "../services/Analytics";
import { ayaIdInfo, TOTAL_PAGES, verseLocation } from "../services/QData";
import { copy2Clipboard } from "../services/utils";
import { selectActivePage } from "../store/layoutSlice";
import { gotoAya, gotoPage, selectStartSelection } from "../store/navSlice";
import { AudioState, selectAudioState } from "../store/playerSlice";
import { selectPopup, selectToastMessage, showToast } from "../store/uiSlice";
import { SuraHifzChart } from "./Hifz";
import { CommandButton } from "./Modal/Commands";
import SuraName from "./SuraName";

export const VerseInfo = ({
    verse,
    show,
    children,
    onClick,
    onMoveNext,
    navigate = false,
    trigger = "verse_info",
}) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const selectStart = useSelector(selectStartSelection);

    if (verse === undefined || verse === -1) {
        verse = selectStart;
    }
    if (show === false) {
        return "";
    }

    const handleClick = (e) => {
        analytics.setTrigger(trigger);

        if (typeof onClick === "function") {
            onClick(verse);
        } else {
            // app.gotoAya(verse, { sel: true });
            dispatch(gotoAya(history, verse, { sel: true }));
        }
    };

    const verseInfo = ayaIdInfo(verse);

    if (navigate) {
        onMoveNext = (offset) => {
            // analytics.setTrigger(trigger);
            analytics.logEvent(
                offset > 0 ? "nav_next_verse" : "nav_prev_verse",
                {
                    trigger,
                }
            );
            // app.gotoAya(verse + offset, { sel: true });
            dispatch(gotoAya(history, verse + offset, { sel: true }));
        };
    }

    return (
        <div className="VerseInfo">
            {onMoveNext ? (
                <button
                    onClick={(e) => {
                        analytics.setTrigger(trigger);
                        onMoveNext(-1);
                    }}
                >
                    <Icon icon={faChevronUp} />
                </button>
            ) : (
                ""
            )}
            <button onClick={handleClick}>
                <div className="VerseInfoList">
                    <div>
                        <SuraName index={verseInfo.sura} />
                    </div>
                    <div>
                        <String
                            id="verse_num"
                            values={{ num: verseInfo.aya + 1 }}
                        />
                    </div>

                    {typeof children === "function"
                        ? children(verse)
                        : children}
                </div>
            </button>
            {onMoveNext ? (
                <button
                    onClick={(e) => {
                        analytics.setTrigger(trigger);
                        onMoveNext(1);
                    }}
                >
                    <Icon icon={faChevronDown} />
                </button>
            ) : (
                ""
            )}
        </div>
    );
};

export const VerseText = ({
    verse,
    showInfo,
    navigate = true,
    bookmark = false,
    copy = false,
    trigger = "verse_text",
}) => {
    const [text, setText] = useState("");
    const app = useContext(AppContext);
    const dispatch = useDispatch();
    const selectStart = useSelector(selectStartSelection);

    const updateText = (verseIndex) => {
        setText(quranText?.[verseIndex]);
    };

    const copyVerse = (e) => {
        const verseInfo = ayaIdInfo(verse);
        copy2Clipboard(`${text} (${verseInfo.sura + 1}:${verseInfo.aya + 1})`);
        // app.showToast(app.intl.formatMessage({ id: "text_copied" }));
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
        switch (app.toggleBookmark(verse)) {
            case 1:
                dispatch(showToast("bookmark_added"));
                break;
            case -1:
                dispatch(showToast("bookmark_deleted"));
                break;
            default:
                break;
        }
    };

    return (
        <div className="VerseText">
            {showInfo ? <VerseInfo navigate={navigate} /> : ""}
            {bookmark ? (
                <button onClick={toggleBookmark}>
                    <Icon
                        icon={
                            app.isBookmarked(verse) ? faBookmark : farBookmark
                        }
                    />
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

export const ToastMessage = () => {
    // const app = useContext(AppContext);
    // const [toastMessage, setToastMessage] = useState(null);
    const [hiding, setHiding] = useState(false);
    const dispatch = useDispatch();
    const toastMessage = useSelector(selectToastMessage);

    useEffect(() => {
        if (toastMessage) {
            setTimeout(() => {
                // app.showToast(null);

                dispatch(showToast(null));
            }, 2000);
        } else if (toastMessage) {
            setHiding(true);
            setTimeout(() => {
                setHiding(false);
            }, 500);
        }
    }, [dispatch, toastMessage]);

    // const hideMessage = e => {
    //     app.showToast(null);
    // };

    return (
        <div
            className={"ToastMessage"
                .appendWord("ShowToast", toastMessage !== null)
                .appendWord("HideToast", hiding)}
            // onClick={hideMessage}
        >
            {toastMessage && <FormattedMessage id={toastMessage} />}
        </div>
    );
};

export const CircleProgress = ({
    sqSize = 25,
    strokeWidth = 2,
    progress = 1,
    target = 5,
    display = null,
    onClick = (e) => false,
    title,
}) => {
    const radius = (sqSize - strokeWidth) / 2;
    // Enclose cicle in a circumscribing square
    // const viewBox = `0 0 ${sqSize} ${sqSize}`;
    // Arc length at 100% coverage is the circle circumference
    const dashArray = radius * Math.PI * 2;
    // Scale 100% coverage overlay with the actual percent
    const percentage = progress / target;
    const dashOffset = dashArray - dashArray * percentage;

    return (
        <svg
            width={sqSize}
            height={sqSize}
            viewBox={`0 0 ${sqSize} ${sqSize}`}
            onClick={onClick}
        >
            <circle
                className="circle-background"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
            />
            <circle
                className="circle-progress"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
                // Start progress marker at 12 O'Clock
                transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                style={{
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                }}
            />
            <text
                className="circle-text"
                x="50%"
                y="50%"
                dy=".3em"
                textAnchor="middle"
            >
                {`${display || progress}`}
            </text>
            <title>{title}</title>
        </svg>
    );
};

export const VerseContextButtons = ({ verse }) => {
    const audioState = useSelector(selectAudioState);
    const popup = useSelector(selectPopup);

    return (
        <div className="IconsBar">
            {audioState === AudioState.stopped ? (
                <CommandButton trigger="verse_context" command="Play" />
            ) : (
                <CommandButton trigger="verse_context" command="Stop" />
            )}
            {popup !== "Tafseer" ? (
                <CommandButton trigger="verse_context" command="Tafseer" />
            ) : null}
            <CommandButton trigger="verse_context" command="Mask" />
            <CommandButton trigger="verse_context" command="Copy" />
            <CommandButton trigger="verse_context" command="Bookmark" />
        </div>
    );
};

export const PageContextButtons = ({ page }) => {
    const audioState = useSelector(selectAudioState);
    return (
        <PageNavigator trigger="page_context">
            <div className="IconsBar">
                {/* <CommandButton trigger="page_context" command="Mask" /> */}
                <CommandButton trigger="page_context" command="Goto" />
                {audioState === AudioState.stopped ? (
                    <CommandButton trigger="page_context" command="Play" />
                ) : (
                    <CommandButton trigger="page_context" command="Stop" />
                )}
                <CommandButton trigger="page_context" command="update_hifz" />
            </div>
        </PageNavigator>
    );
};

export const SuraContextHeader = ({ sura }) => {
    // const [suraIndex, setSura] = useState(sura || 0);
    // useEffect(() => {
    //     const ayaInfo = ayaIdInfo(selectStart);
    //     setSura(ayaInfo.sura);
    // }, [selectStart]);

    return (
        <div className="SuraContextHeader">
            <SuraHifzChart sura={sura} />
            {/* <SuraNavigator sura={suraIndex} /> */}
        </div>
    );
};

export const PageNavigator = ({ children, trigger }) => {
    // const app = useContext(AppContext);
    const pageIndex = useSelector(selectActivePage);
    const dispatch = useDispatch();
    const history = useHistory();

    const stopPropagation = (e) => e.stopPropagation();

    const gotoNextPage = (e) => {
        // analytics.setTrigger(trigger);
        // app.gotoPage(pageNumber + 1, true, true);
        dispatch(gotoPage(history, { index: pageIndex + 1 }));
        analytics.logEvent("nav_next_page", { trigger });
    };

    const gotoPrevPage = (e) => {
        // analytics.setTrigger(trigger);
        dispatch(gotoPage(history, { index: pageIndex - 1 }));
        // app.gotoPage(pageIndex - 1, true, true);
        analytics.logEvent("nav_prev_page", { trigger });
    };

    return (
        <div className="SuraNavigator" onClick={stopPropagation}>
            {pageIndex > 0 ? (
                <button className="CommandButton" onClick={gotoPrevPage}>
                    <Icon icon={faChevronRight} />
                </button>
            ) : null}
            {children}
            {pageIndex + 1 < TOTAL_PAGES ? (
                <button className="CommandButton" onClick={gotoNextPage}>
                    <Icon icon={faChevronLeft} />
                </button>
            ) : null}
        </div>
    );
};
