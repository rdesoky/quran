import React, { useState, useEffect, useContext, memo } from "react";
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
    faEyeSlash,
    faFileDownload,
    faQuran
} from "@fortawesome/free-solid-svg-icons";
import AKeyboard from "../AKeyboard/AKeyboard";
import { HifzRanges, SuraHifzChart } from "../Hifz";
import { TafseerView } from "./Tafseer";

const QIndex = ({ simple }) => {
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
        if (typingConsole) {
            typingConsole.focus();
        }
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

    if (simple) {
        return (
            <>
                <div className="Title"></div>
                <div
                    className="PopupBody"
                    style={{
                        height: app.appHeight - 80
                    }}
                >
                    <SuraList simple={simple} />
                </div>
            </>
        );
    }

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

export const PartCell = ({ part, selected }) => {
    const app = useContext(AppContext);
    let btn;
    const gotoPart = e => {
        app.gotoPart(part);
    };
    useEffect(() => {
        if (selected === part && btn) {
            btn.focus();
        }
    }, [selected]);
    return (
        <li>
            <button
                onClick={gotoPart}
                ref={ref => {
                    btn = ref;
                }}
            >
                <String id="part_num" values={{ num: part + 1 }} />
            </button>
        </li>
    );
};

export const PartsList = ({ part }) => {
    const [listWidth, setListWidth] = useState(0);
    let list;
    useEffect(() => {
        if (list) {
            setListWidth(list.clientWidth);
        }
    }, []);
    return (
        <ul
            className="SpreadSheet"
            ref={ref => {
                list = ref;
            }}
            style={{
                columnCount: Math.floor(listWidth / 80)
            }}
        >
            {Array(30)
                .fill(0)
                .map((zero, index) => (
                    <PartCell part={index} selected={part} key={index} />
                ))}
        </ul>
    );
};

export const SuraList = memo(({ filter, simple }) => {
    const app = useContext(AppContext);
    const [actionsIndex, setActionsIndex] = useState(0);

    useEffect(() => {
        const { selectStart } = app;
        const currentSura = QData.ayaIdInfo(selectStart).sura;
        setActionsIndex(currentSura);
    }, []);

    const CellComponent = simple ? SimpleSuraIndexCell : SuraIndexCell;

    return (
        <ul
            className="SpreadSheet"
            style={{
                columnCount: Math.floor((app.popupWidth() - 50) / 180) //-50px margin
            }}
        >
            {Array(114)
                .fill(0)
                .map((zero, suraIndex) => {
                    return (
                        <CellComponent
                            key={suraIndex}
                            sura={suraIndex}
                            filter={filter}
                            selectSura={setActionsIndex}
                            selectedSura={actionsIndex}
                            simple={simple}
                        />
                    );
                })}
        </ul>
    );
});

export const SimpleSuraIndexCell = ({ sura, selectedSura }) => {
    const app = useContext(AppContext);
    let btn;
    const gotoSura = e => {
        return app.gotoSura(sura);
    };

    useEffect(() => {
        if (btn && sura === selectedSura) {
            btn.focus();
        }
    }, [selectedSura]);

    return (
        <li className="SuraIndexCell">
            <button
                ref={ref => {
                    btn = ref;
                }}
                onClick={gotoSura}
                className={sura == selectedSura ? "active" : ""}
            >
                {sura + 1 + ". " + app.suraName(sura)}
            </button>
        </li>
    );
};

export const SuraIndexCell = memo(
    ({ sura, filter, selectedSura, selectSura, simple }) => {
        const app = useContext(AppContext);
        const player = useContext(PlayerContext);
        const [suraName, setSuraName] = useState("");

        const checkClosePopup = () => {
            if (!app.isCompact && app.pagesCount === 1) {
                app.closePopup();
            }
        };

        const gotoSura = e => {
            if (selectedSura === sura) {
                app.hideMask();
                checkClosePopup();
                return app.gotoSura(sura);
            } else {
                selectSura && selectSura(sura);
            }
        };
        const addSuraToHifz = e => {
            //TODO: check if sura has old ranges, then confirmation is required
            app.setMessageBox({
                title: <String id="add_hifz" />,
                content: <String id="are_you_sure" />,
                onYes: () => {
                    const suraInfo = QData.sura_info[sura];
                    app.addHifzRange(
                        suraInfo.sp - 1,
                        sura,
                        suraInfo.ep - suraInfo.sp + 1
                    );
                }
            });
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

        useEffect(() => {
            setSuraName(app.suraNames()[sura]);
        }, [sura]);

        let btn;

        useEffect(() => {
            if (btn && sura === selectedSura) {
                btn.focus();
            }
        }, [selectedSura]);

        if (filter && -1 === suraName.indexOf(filter)) {
            return "";
        }

        return (
            <li className="SuraIndexCell">
                {simple ? "" : <SuraHifzChart sura={sura} />}
                <button
                    onClick={gotoSura}
                    className={sura == selectedSura ? "active" : ""}
                    ref={ref => {
                        btn = ref;
                    }}
                >
                    {sura + 1 + ". " + suraName}
                </button>
                <div className="actions">
                    {selectedSura === sura ? (
                        <>
                            <button sura={sura} onClick={playSura}>
                                <Icon icon={faPlayCircle} />
                            </button>
                            <button sura={sura} onClick={addSuraToHifz}>
                                <Icon icon={faHeart} />
                            </button>
                            {/* <button sura={sura} onClick={reviewSura}>
                                <Icon icon={faEyeSlash} />
                            </button> */}
                        </>
                    ) : (
                        <Icon icon={faEllipsisH} />
                    )}
                </div>
            </li>
        );
    }
);

export const BookmarkListItem = ({
    verse,
    filter,
    selectedVerse,
    selectVerse,
    showTafseer = false
}) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const [verseText, setVerseText] = useState("");
    const [bookmarkDesc, setBookmarkDesc] = useState("");
    const [suraName, setSuraName] = useState("");
    const [showTafseerView, setShowTafseer] = useState(showTafseer);

    useEffect(() => {
        const sura = QData.ayaIdInfo(verse).sura;
        const suraName = app.suraNames()[sura];

        setSuraName(suraName);

        setVerseText(app.verseList()[verse]);

        const bookmarkDesc = app.formatMessage(
            { id: "bookmark_desc" },
            {
                sura: suraName,
                verse: QData.ayaIdInfo(verse).aya + 1
            }
        );

        setBookmarkDesc(bookmarkDesc);
    }, [verse]);

    const checkClosePopup = () => {
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
    };

    const gotoVerse = e => {
        if (selectedVerse !== verse) {
            selectVerse(verse);
            return;
        }
        app.gotoAya(verse, { sel: true });
        checkClosePopup();
    };

    const removeBookmark = e => {
        app.setMessageBox({
            title: <String id="delete_bookmark" />,
            content: <String id="are_you_sure" />,
            onYes: () => {
                app.removeBookmark(verse);
            }
        });
    };

    const playVerse = e => {
        player.stop(true);
        app.gotoAya(verse, { sel: true });
        setTimeout(() => {
            player.play();
        }, 500);
    };

    // const reviewVerse = e => {
    //     app.gotoAya(verse, { sel: true });
    //     setTimeout(() => {
    //         app.setMaskStart();
    //         //app.closePopup();
    //         checkClosePopup();
    //     });
    //     app.pushRecentCommand("Mask");
    // };

    useEffect(() => {
        setShowTafseer(showTafseer);
    }, [showTafseer]);

    if (filter && -1 === suraName.indexOf(filter)) {
        return "";
    }

    const download = e => {
        app.setMessageBox({
            title: <String id="download_verse_audio" />,
            content: <String id="download_guide" />
        });
        e.preventDefault();
    };

    const toggleTafseer = e => {
        setShowTafseer(!showTafseerView);
    };

    return (
        <li className="BookmarkRow">
            <div className="actions">
                {selectedVerse == verse ? (
                    <>
                        <button onClick={playVerse}>
                            <Icon icon={faPlayCircle} />
                        </button>
                        <button onClick={toggleTafseer}>
                            <Icon icon={faQuran} />
                        </button>
                        <div className="LinkButton">
                            <a
                                href={player.audioSource(verse)}
                                onClick={download}
                            >
                                <Icon icon={faFileDownload} />
                            </a>
                        </div>
                        <button onClick={removeBookmark}>
                            <Icon icon={faDelete} />
                        </button>
                    </>
                ) : (
                    <Icon icon={faEllipsisH} />
                )}
            </div>
            <button onClick={gotoVerse}>
                <Icon icon={faBookmark} />
                &nbsp;
                {bookmarkDesc}
                {showTafseerView ? null : (
                    <div
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            pointerEvents: "none"
                        }}
                    >
                        {verseText}
                    </div>
                )}
            </button>
            {showTafseerView ? (
                <TafseerView verse={verse} showVerse={false} copy={true} />
            ) : null}
        </li>
    );
};

export const BookmarksList = ({ filter, showTafseer = false }) => {
    const app = useContext(AppContext);
    const [actionsIndex, setActionsIndex] = useState(-1);

    const { bookmarks } = app;

    if (!bookmarks.length) {
        return (
            <div>
                <String id="no_bookmarks" />
            </div>
        );
    }
    return (
        <ul className="FlowingList">
            {bookmarks.map(bookmark => {
                const verse = parseInt(bookmark.aya);
                return (
                    <BookmarkListItem
                        key={verse}
                        verse={verse}
                        filter={filter}
                        selectedVerse={actionsIndex}
                        selectVerse={setActionsIndex}
                        showTafseer={showTafseer}
                    />
                );
            })}
        </ul>
    );
};

export default QIndex;
