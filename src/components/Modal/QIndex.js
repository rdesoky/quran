import React, { useState, useEffect, useContext } from "react";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "../../context/App";
import { PlayerConsumer, PlayerContext } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faTimes as faDelete,
    faBookmark,
    faPlayCircle,
    faHeart,
    faListAlt,
    faEllipsisH,
    faTimes,
    faEyeSlash
} from "@fortawesome/free-solid-svg-icons";
import AKeyboard from "../AKeyboard/AKeyboard";
import { HifzRanges, SuraHifzChart } from "../Hifz";

const QIndex = ({}) => {
    const app = useContext(AppContext);
    const [keyboard, setKeyboard] = useState(false);
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("activeTab") || "index"
    );
    const [filter, setFilter] = useState("");

    const selectTab = tabId => {
        localStorage.setItem("activeTab", tabId);
        setActiveTab(tabId);
    };

    let typingConsole;

    const hideKeyboard = e => {
        setKeyboard(false);
    };

    useEffect(() => {
        typingConsole.focus();
    }, [activeTab]);

    const showKeyboard = e => {
        setKeyboard(true);
    };

    const updateFilter = filter => {
        setFilter(filter);
    };

    const clearFilter = e => {
        setFilter("");
        e.stopPropagation();
    };

    return (
        <>
            <div className="Title">
                <div className="ButtonsBar">
                    <button
                        onClick={e => selectTab("index")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab == "index"
                        )}
                    >
                        <Icon icon={faListAlt} />
                        <String id="index" />
                    </button>
                    <button
                        onClick={e => selectTab("hifz")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab == "hifz"
                        )}
                    >
                        <Icon icon={faHeart} />
                        <String id="favorites" />
                    </button>
                    <button
                        onClick={e => selectTab("bookmarks")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab == "bookmarks"
                        )}
                    >
                        <Icon icon={faBookmark} />
                        <String id="bookmarks" />
                    </button>
                </div>
            </div>
            <div
                className={"TypingConsole" + (!filter.length ? " empty" : "")}
                ref={ref => {
                    typingConsole = ref;
                }}
                tabIndex="0"
                onClick={showKeyboard}
            >
                {filter || <String id="find_sura" />}
                {filter ? (
                    <div className="ClearButton" onClick={clearFilter}>
                        <Icon icon={faTimes} />
                    </div>
                ) : (
                    ""
                )}
            </div>

            <AKeyboard
                style={{ display: keyboard ? "block" : "none" }}
                initText={filter}
                onUpdateText={updateFilter}
                onEnter={hideKeyboard}
                onCancel={hideKeyboard}
                onEnter={hideKeyboard}
            />

            <div
                className="PopupBody"
                style={{
                    height: app.appHeight - 135
                }}
                onTouchStart={hideKeyboard}
                onMouseDown={hideKeyboard}
            >
                {activeTab == "index" ? (
                    <SuraList filter={filter} />
                ) : activeTab == "hifz" ? (
                    <HifzRanges filter={filter} />
                ) : (
                    <BookmarksList filter={filter} />
                )}
            </div>
        </>
    );
};

export const SuraList = AppConsumer(
    PlayerConsumer(({ app, player, filter }) => {
        const [actionsIndex, setActionsIndex] = useState(0);

        useEffect(() => {
            const { selectStart } = app;
            const currentSura = QData.ayaIdInfo(selectStart).sura;
            setActionsIndex(currentSura);
        }, []);

        const { selectStart } = app;
        const sura_names = app.suraNames();
        const currentSura = QData.ayaIdInfo(selectStart).sura;

        const checkClosePopup = () => {
            if (!app.isCompact && app.pagesCount === 1) {
                app.closePopup();
            }
        };

        const gotoSura = ({ target }) => {
            const index = parseInt(target.getAttribute("sura"));
            if (actionsIndex === index) {
                app.hideMask();
                checkClosePopup();
                return app.gotoSura(index);
            } else {
                setActionsIndex(index);
            }
        };
        const addSuraToHifz = ({ target }) => {
            //TODO: check if sura has old ranges, then confirmation is required
            if (!window.confirm("Are you sure?")) {
                return;
            }
            const sura = parseInt(target.getAttribute("sura"));
            const suraInfo = QData.sura_info[sura];
            app.addHifzRange(
                suraInfo.sp - 1,
                sura,
                suraInfo.ep - suraInfo.sp + 1
            );
        };

        const playSura = e => {
            player.stop(true);
            gotoSura(e);
            setTimeout(() => {
                player.play();
            }, 500);
        };

        const reviewSura = e => {
            const verse = gotoSura(e);
            setTimeout(() => {
                app.setMaskStart(verse, { sel: true });
                //app.closePopup();
                checkClosePopup();
            });
            app.pushRecentCommand("Mask");
        };

        return (
            <ul
                className="SpreadSheet"
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 180) //-50px margin
                }}
            >
                {new Array(114).fill(0).map((zero, suraIndex) => {
                    const suraName = sura_names[suraIndex];
                    if (filter && -1 === suraName.indexOf(filter)) {
                        return "";
                    }

                    return (
                        <li key={suraIndex}>
                            <SuraHifzChart sura={suraIndex} />
                            <button
                                sura={suraIndex}
                                onClick={gotoSura}
                                className={
                                    suraIndex == currentSura ? "active" : ""
                                }
                            >
                                {suraIndex + 1 + ". " + suraName}
                            </button>
                            <div className="actions">
                                {actionsIndex === suraIndex ? (
                                    <>
                                        <button
                                            sura={suraIndex}
                                            onClick={addSuraToHifz}
                                        >
                                            <Icon icon={faHeart} />
                                        </button>
                                        <button
                                            sura={suraIndex}
                                            onClick={playSura}
                                        >
                                            <Icon icon={faPlayCircle} />
                                        </button>
                                        <button
                                            sura={suraIndex}
                                            onClick={reviewSura}
                                        >
                                            <Icon icon={faEyeSlash} />
                                        </button>
                                    </>
                                ) : (
                                    <Icon icon={faEllipsisH} />
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    })
);

export const BookmarksList = ({ filter }) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const [actionsIndex, setActionsIndex] = useState(-1);

    const { bookmarks } = app;

    if (!bookmarks.length) {
        return (
            <div>
                <String id="no_bookmarks" />
            </div>
        );
    }

    const sura_names = app.suraNames();

    const checkClosePopup = () => {
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
    };

    const gotoAya = ({ target }) => {
        const aya = parseInt(target.getAttribute("aya"));
        if (actionsIndex !== aya) {
            setActionsIndex(aya);
            return;
        }
        app.gotoAya(aya, { sel: true });
        checkClosePopup();
    };

    const removeBookmark = ({ target }) => {
        const verse = parseInt(target.getAttribute("verse"));
        app.removeBookmark(verse);
    };

    const playVerse = ({ target }) => {
        const attr = target.getAttribute("verse") || app.selectStart;
        const verse = parseInt(attr);
        player.stop(true);
        app.gotoAya(verse, { sel: true });
        setTimeout(() => {
            player.play();
        }, 500);
    };

    const reviewVerse = ({ target }) => {
        const attr = target.getAttribute("verse") || app.selectStart;
        const verse = parseInt(attr);
        app.gotoAya(verse, { sel: true });
        setTimeout(() => {
            app.setMaskStart();
            //app.closePopup();
            checkClosePopup();
        });
        app.pushRecentCommand("Mask");
    };

    return (
        <ul className="FlowingList">
            {bookmarks.map(bookmark => {
                const suraName = sura_names[QData.ayaIdInfo(bookmark.aya).sura];

                if (filter && -1 === suraName.indexOf(filter)) {
                    return "";
                }

                return (
                    <li className="BookmarkRow" key={bookmark.aya}>
                        <div className="actions">
                            {actionsIndex == bookmark.aya ? (
                                <>
                                    <button
                                        verse={bookmark.aya}
                                        onClick={playVerse}
                                    >
                                        <Icon icon={faPlayCircle} />
                                    </button>
                                    <button
                                        verse={bookmark.aya}
                                        onClick={reviewVerse}
                                    >
                                        <Icon icon={faEyeSlash} />
                                    </button>
                                    <button
                                        verse={bookmark.aya}
                                        onClick={removeBookmark}
                                    >
                                        <Icon icon={faDelete} />
                                    </button>
                                </>
                            ) : (
                                <Icon icon={faEllipsisH} />
                            )}
                        </div>
                        <button aya={bookmark.aya} onClick={gotoAya}>
                            <Icon icon={faBookmark} />
                            &nbsp;
                            <String
                                id="bookmark_desc"
                                values={{
                                    sura: suraName,
                                    verse: QData.ayaIdInfo(bookmark.aya).aya + 1
                                }}
                            />
                            <div
                                style={{
                                    whiteSpace: "nowrap",
                                    overflow: "hidden",
                                    textOverflow: "ellipsis",
                                    pointerEvents: "none"
                                }}
                            >
                                {app.verseList()[bookmark.aya]}
                            </div>
                        </button>
                    </li>
                );
            })}
        </ul>
    );
};

export default QIndex;
