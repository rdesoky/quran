import React, { useState, useEffect, useContext } from "react";
import QData from "./../services/QData";
import { AppConsumer, AppContext } from "./../context/App";
import { FormattedMessage as String } from "react-intl";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faChevronUp,
    faChevronDown,
    faTimes,
    faPlayCircle,
    faCopy
} from "@fortawesome/free-solid-svg-icons";
import { CommandButton } from "./Modal/Commands";
import { PlayerContext, AudioState } from "../context/Player";

export const VerseInfo = ({
    verse,
    show,
    children,
    onClick,
    onMoveNext,
    navigate = false
}) => {
    const app = useContext(AppContext);

    if (verse === undefined || verse === -1) {
        verse = app.selectStart;
    }
    if (show === false) {
        return "";
    }

    const handleClick = e => {
        if (typeof onClick === "function") {
            onClick(verse);
        } else {
            app.gotoAya(verse, { sel: true });
        }
    };

    const verseInfo = QData.ayaIdInfo(verse);

    if (navigate) {
        onMoveNext = offset => {
            app.gotoAya(verse + offset, { sel: true });
        };
    }

    return (
        <div className="VerseInfo">
            {onMoveNext ? (
                <button
                    onClick={e => {
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
                        <String id="sura_names">
                            {sura_names => (
                                <>{sura_names.split(",")[verseInfo.sura]}</>
                            )}
                        </String>
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
                    onClick={e => {
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

export const VerseText = ({ verse, showInfo, navigate = true }) => {
    const [text, setText] = useState("");
    const app = useContext(AppContext);

    const updateText = verseIndex => {
        const verseList = app.verseList();
        setText(verseIndex < verseList.length ? verseList[verseIndex] : "");
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

    return (
        <div className="VerseText">
            {showInfo ? <VerseInfo navigate={navigate} /> : ""}
            {text}
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
            }, 3000);
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
        app.setMessageBox(null);
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
                <button class="CloseButton" onClick={onClose}>
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
    useEffect(() => {
        app.setContextPopup(null);
    }, [app.appWidth]);
    // const stopPropagation = e => {
    //     e.stopPropagation();
    // };
    if (app.contextPopup) {
        const { target, content } = app.getContextPopup();
        const rect = target.getBoundingClientRect();
        const left = rect.left + rect.width / 2;
        const isSouth = app.appHeight - rect.bottom > rect.top;
        return (
            <div className="ContextPopupBlocker" onClick={closePopup}>
                <div
                    className="ContextPopup"
                    style={{
                        top: isSouth ? rect.bottom + 15 : undefined,
                        bottom: !isSouth
                            ? app.appHeight - rect.top + 15
                            : undefined,
                        left: left,
                        maxHeight: app.appHeight - rect.bottom - 40
                    }}
                >
                    {content}
                </div>
                <div
                    className={"PopupPointer".appendWord(
                        "DownPointer",
                        !isSouth
                    )}
                    style={{
                        top: isSouth ? rect.bottom : undefined,
                        bottom: !isSouth ? app.appHeight - rect.top : undefined,
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
    return (
        <div className="IconsBar">
            <CommandButton command="Mask" />
            <CommandButton command="Bookmark" />
            {player.audioState === AudioState.stopped ? (
                <CommandButton command="Play" />
            ) : null}
            <CommandButton command="Copy" />
        </div>
    );
};
