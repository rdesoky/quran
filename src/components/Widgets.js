import React, { useState, useEffect, useContext } from "react";
import QData from "./../services/QData";
import { AppConsumer, AppContext } from "./../context/App";
import { FormattedMessage as String } from "react-intl";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faChevronUp,
    faChevronDown,
    faTimes,
    faCopy,
    faBookmark,
    faForward,
    faBackward,
    faChevronRight,
    faChevronLeft
} from "@fortawesome/free-solid-svg-icons";
import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";
import { CommandButton } from "./Modal/Commands";
import { PlayerContext, AudioState } from "../context/Player";
import Utils from "../services/utils";
import { SuraHifzChart } from "./Hifz";
import { analytics } from "../services/Analytics";

export const VerseInfo = ({
    verse,
    show,
    children,
    onClick,
    onMoveNext,
    navigate = false,
    trigger = "verse_info"
}) => {
    const app = useContext(AppContext);

    if (verse === undefined || verse === -1) {
        verse = app.selectStart;
    }
    if (show === false) {
        return "";
    }

    const handleClick = e => {
        analytics.setTrigger(trigger);

        if (typeof onClick === "function") {
            onClick(verse);
        } else {
            app.gotoAya(verse, { sel: true });
        }
    };

    const verseInfo = QData.ayaIdInfo(verse);

    if (navigate) {
        onMoveNext = offset => {
            // analytics.setTrigger(trigger);
            analytics.logEvent(
                offset > 0 ? "nav_next_verse" : "nav_prev_verse",
                { trigger }
            );
            app.gotoAya(verse + offset, { sel: true });
        };
    }

    return (
        <div className="VerseInfo">
            {onMoveNext ? (
                <button
                    onClick={e => {
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
                    <div>{app.suraName(verseInfo.sura)}</div>
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
                    onClick={e => {
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
    copy = false
}) => {
    const [text, setText] = useState("");
    const app = useContext(AppContext);

    const updateText = verseIndex => {
        setText(app.verseText(verseIndex));
    };

    const copyVerse = e => {
        const verseInfo = QData.ayaIdInfo(verse);
        Utils.copy2Clipboard(
            `${text} (${verseInfo.sura + 1}:${verseInfo.aya + 1})`
        );
        app.showToast(app.intl.formatMessage({ id: "text_copied" }));
    };

    useEffect(() => {
        if (verse !== undefined) {
            updateText(verse);
        }
    }, [verse]);

    useEffect(() => {
        if (verse === undefined) {
            updateText(app.selectStart);
        }
    }, [app.selectStart]);

    const toggleBookmark = e => {
        app.toggleBookmark(verse);
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
    const app = useContext(AppContext);
    const [toastMessage, setToastMessage] = useState(null);
    const [hiding, setHiding] = useState(false);

    useEffect(() => {
        if (app.toastMessage) {
            setToastMessage(app.toastMessage);
            setTimeout(() => {
                app.showToast(null);
            }, 2000);
        } else if (toastMessage) {
            setHiding(true);
            setTimeout(() => {
                setToastMessage(null);
                setHiding(false);
            }, 500);
        }
    }, [app.toastMessage]);

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
            {toastMessage}
        </div>
    );
};

export const CircleProgress = ({
    sqSize = 25,
    strokeWidth = 2,
    progress = 1,
    target = 5,
    display = null,
    onClick = e => false
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
                    strokeDashoffset: dashOffset
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
        </svg>
    );
};

export const MessageBox = () => {
    const app = useContext(AppContext);

    const msgBoxInfo = app.getMessageBox();

    const onClose = e => {
        app.pushMessageBox(null);
    };

    const onYes = e => {
        if (msgBoxInfo.onYes) {
            setTimeout(() => {
                msgBoxInfo.onYes();
            });
        }
        onClose(e);
    };

    const onNo = e => {
        if (msgBoxInfo.onNo) {
            setTimeout(() => {
                msgBoxInfo.onNo();
            });
        }
        onClose(e);
    };

    if (msgBoxInfo !== null) {
        return (
            <div className="MessageBox">
                <div className="MessageBoxTitle">{msgBoxInfo.title}</div>
                <button className="CloseButton" onClick={onClose}>
                    <Icon icon={faTimes} />
                </button>
                <div className="MessageBoxContent">{msgBoxInfo.content}</div>
                {msgBoxInfo.onYes ? (
                    <div className="ButtonsBar">
                        <button onClick={onYes}>
                            <String id="yes" />
                        </button>
                        <button onClick={onNo}>
                            <String id="no" />
                        </button>
                    </div>
                ) : null}
            </div>
        );
    }
    return null;
};

export const ContextPopup = ({}) => {
    const app = useContext(AppContext);
    const closePopup = e => {
        app.setContextPopup(null);
    };
    let popup;

    useEffect(() => {
        app.setContextPopup(null);
    }, [app.appWidth]);

    useEffect(() => {
        if (popup) {
            const popupRect = popup.getBoundingClientRect();
            if (popupRect.left < 0) {
                popup.style.left = popupRect.width / 2 + "px";
            } else if (popupRect.right > app.appWidth) {
                let shift = popupRect.right - app.appWidth;
                if (shift > popupRect.left) {
                    shift = popupRect.left;
                }
                popup.style.left =
                    (popupRect.width / 2 + popupRect.left - shift).toString() +
                    "px";
            }
        }
    }, [app.contextPopup]);

    // const stopPropagation = e => {
    //     e.stopPropagation();
    // };
    if (app.contextPopup) {
        const { target, content, header } = app.getContextPopup();
        const targetRect = target.getBoundingClientRect();
        if (!targetRect.width) {
            return null;
        }
        const left = targetRect.left + targetRect.width / 2;
        const isBelow = app.appHeight - targetRect.bottom > targetRect.top;
        return (
            <div className="ContextPopupBlocker" onClick={closePopup}>
                <div
                    className={"ContextPopup".appendWord(
                        "DownPointer",
                        !isBelow
                    )}
                    ref={ref => {
                        popup = ref;
                    }}
                    style={{
                        top: isBelow ? targetRect.bottom + 15 : undefined,
                        bottom: !isBelow
                            ? app.appHeight - targetRect.top + 15
                            : undefined,
                        left: left,
                        maxHeight:
                            (isBelow
                                ? app.appHeight - targetRect.bottom
                                : targetRect.top) - 40
                    }}
                >
                    <div className="ContextHeader">{header}</div>
                    <div className="ContextBody">{content}</div>
                </div>
                <div
                    className={"PopupPointer".appendWord(
                        "DownPointer",
                        !isBelow
                    )}
                    style={{
                        top: isBelow ? targetRect.bottom : undefined,
                        bottom: !isBelow
                            ? app.appHeight - targetRect.top
                            : undefined,
                        left: left
                    }}
                ></div>
            </div>
        );
    }
    return null;
};

export const VerseContextButtons = ({ verse }) => {
    const player = useContext(PlayerContext);
    const app = useContext(AppContext);
    return (
        <div className="IconsBar">
            {player.audioState === AudioState.stopped ? (
                <CommandButton trigger="verse_context" command="Play" />
            ) : (
                <CommandButton trigger="verse_context" command="Stop" />
            )}
            {app.popup !== "Tafseer" ? (
                <CommandButton trigger="verse_context" command="Tafseer" />
            ) : null}
            <CommandButton trigger="verse_context" command="Mask" />
            <CommandButton trigger="verse_context" command="Copy" />
            <CommandButton trigger="verse_context" command="Bookmark" />
        </div>
    );
};

export const PageContextButtons = ({ page }) => {
    const player = useContext(PlayerContext);
    return (
        <PageNavigator trigger="page_context">
            <div className="IconsBar">
                {/* <CommandButton trigger="page_context" command="Mask" /> */}
                <CommandButton trigger="page_context" command="Goto" />
                {player.audioState === AudioState.stopped ? (
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
    // const app = useContext(AppContext);
    // const [suraIndex, setSura] = useState(sura || 0);
    // useEffect(() => {
    //     const ayaInfo = QData.ayaIdInfo(app.selectStart);
    //     setSura(ayaInfo.sura);
    // }, [app.selectStart]);

    return (
        <div className="SuraContextHeader">
            <SuraHifzChart sura={sura} />
            {/* <SuraNavigator sura={suraIndex} /> */}
        </div>
    );
};

export const PageNavigator = ({ children, trigger }) => {
    const app = useContext(AppContext);
    const pageNumber = app.getCurrentPageIndex() + 1;

    const stopPropagation = e => e.stopPropagation();

    const gotoNextPage = e => {
        // analytics.setTrigger(trigger);
        app.gotoPage(pageNumber + 1, true, true);
        analytics.logEvent("nav_next_page", { trigger });
    };

    const gotoPrevPage = e => {
        // analytics.setTrigger(trigger);
        app.gotoPage(pageNumber - 1, true, true);
        analytics.logEvent("nav_prev_page", { trigger });
    };

    return (
        <div className="SuraNavigator" onClick={stopPropagation}>
            {pageNumber > 1 ? (
                <button className="CommandButton" onClick={gotoPrevPage}>
                    <Icon icon={faChevronRight} />
                </button>
            ) : null}
            {children}
            {pageNumber < QData.pages_count ? (
                <button className="CommandButton" onClick={gotoNextPage}>
                    <Icon icon={faChevronLeft} />
                </button>
            ) : null}
        </div>
    );
};
