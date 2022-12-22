import {
    faBookmark,
    faEllipsisH,
    faFileDownload,
    faHeart,
    faListAlt,
    faPlayCircle,
    faQuran,
    faTimes as faDelete,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { memo, useContext, useEffect, useState } from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { quranText } from "../../App";
import { AppContext } from "../../context/App";
import useSuraName from "../../hooks/useSuraName";
import { analytics } from "../../services/Analytics";
import {
    ayaID,
    ayaIdInfo,
    getArSuraName,
    sura_info,
    verseLocation,
} from "../../services/QData";
import {
    selectAppHeight,
    selectIsCompact,
    selectPagesCount,
    selectPopupWidth,
} from "../../store/layoutSlice";
import {
    gotoAya,
    gotoPart,
    gotoSura,
    selectStartSelection,
    setMask,
} from "../../store/navSlice";
import { selectAudioSource } from "../../store/playerSlice";
import { selectLang } from "../../store/settingsSlice";
import { closePopup, showToast } from "../../store/uiSlice";
import AKeyboard from "../AKeyboard/AKeyboard";
import { HifzRanges, SuraHifzChart } from "../Hifz";
import { pushMessageBox, setMessageBox } from "../MessageBox";
import SuraName from "../SuraName";
import { AddHifz } from "./Favorites";
import { TafseerView } from "./Tafseer";

const QIndex = ({ simple }) => {
    const lang = useSelector(selectLang);
    const [keyboard, setKeyboard] = useState(false);
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("activeTab") || "index"
    );
    const [filter, setFilter] = useState("");
    const appHeight = useSelector(selectAppHeight);

    const selectTab = (tabId) => {
        localStorage.setItem("activeTab", tabId);
        setActiveTab(tabId);
    };

    let typingConsole;

    const hideKeyboard = (e) => {
        setKeyboard(false);
    };

    useEffect(() => {
        if (typingConsole) {
            typingConsole.focus();
        }
    }, [typingConsole]);

    const showKeyboard = (e) => {
        setKeyboard(true);
    };

    const updateFilter = (filter) => {
        setFilter(filter);
    };

    const clearFilter = (e) => {
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
                        height: appHeight - 80,
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
                        onClick={(e) => selectTab("index")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "index"
                        )}
                    >
                        <Icon icon={faListAlt} />
                        <span>
                            <Message id="index" />
                        </span>
                    </button>
                    <button
                        onClick={(e) => selectTab("hifz")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "hifz"
                        )}
                    >
                        <Icon icon={faHeart} />
                        <span>
                            <Message id="favorites" />
                        </span>
                    </button>
                    <button
                        onClick={(e) => selectTab("bookmarks")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "bookmarks"
                        )}
                    >
                        <Icon icon={faBookmark} />
                        <span>
                            <Message id="bookmarks" />
                        </span>
                    </button>
                </div>
            </div>
            <div
                className={"TypingConsole" + (!filter.length ? " empty" : "")}
                ref={(ref) => {
                    typingConsole = ref;
                }}
                tabIndex="0"
                onClick={showKeyboard}
            >
                {filter || <Message id="find_sura" />}
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
                lang={lang}
            />

            <div
                className="PopupBody"
                style={{
                    height: appHeight - 135,
                }}
                onTouchStart={hideKeyboard}
                onMouseDown={hideKeyboard}
            >
                {activeTab === "index" ? (
                    <SuraList filter={filter} trigger="indices_chapters" />
                ) : activeTab === "hifz" ? (
                    <HifzRanges filter={filter} trigger="indices_hifz" />
                ) : (
                    <BookmarksList
                        filter={filter}
                        trigger="indices_bookmarks"
                    />
                )}
            </div>
        </>
    );
};

export const PartCell = ({ part: partIndex, selected }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    let btn;
    const onClickPart = (e) => {
        analytics.logEvent("goto_part", { part: partIndex });
        // app.gotoPart(part);
        dispatch(gotoPart(history, partIndex));
    };
    useEffect(() => {
        if (selected === partIndex && btn) {
            btn.focus();
        }
    }, [btn, partIndex, selected]);
    return (
        <li className="PartIndexCell">
            <button
                onClick={onClickPart}
                ref={(ref) => {
                    btn = ref;
                }}
                className={partIndex === selected ? "active" : null}
            >
                <Message id="part_num" values={{ num: partIndex + 1 }} />
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
        analytics.setTrigger("header_parts_context");
    }, [list]);
    return (
        <ul
            className="SpreadSheet"
            ref={(ref) => {
                list = ref;
            }}
            style={{
                columnCount: Math.floor(listWidth / 80),
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

export const SuraList = memo(
    ({ filter, simple, trigger = "chapters_index" }) => {
        const app = useContext(AppContext);
        const popupWidth = useSelector(selectPopupWidth);
        const [actionsIndex, setActionsIndex] = useState(0);

        useEffect(() => {
            analytics.setTrigger(trigger);
        }, [trigger]);

        useEffect(() => {
            const { selectStart } = app;
            const currentSura = ayaIdInfo(selectStart).sura;
            setActionsIndex(currentSura);
        }, [app]);

        const CellComponent = simple ? SimpleSuraIndexCell : SuraIndexCell;

        return (
            <ul
                className="SpreadSheet"
                style={{
                    columnCount: Math.floor((popupWidth - 50) / 180), //-50px margin
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
                                trigger={trigger}
                            />
                        );
                    })}
            </ul>
        );
    }
);

export const SimpleSuraIndexCell = memo(({ sura: suraIndex, selectedSura }) => {
    // const app = useContext(AppContext);
    const history = useHistory();
    const dispatch = useDispatch();
    let btn;
    const onClickSura = (e) => {
        analytics.logEvent("goto_chapter", {
            chapter_num: suraIndex + 1,
            chapter: getArSuraName(suraIndex),
        });

        return dispatch(gotoSura(history, suraIndex));
    };

    useEffect(() => {
        if (btn && suraIndex === selectedSura) {
            btn.focus();
        }
    }, [btn, selectedSura, suraIndex]);

    return (
        <li className="SuraIndexCell">
            <button
                ref={(ref) => {
                    btn = ref;
                }}
                onClick={onClickSura}
                className={suraIndex === selectedSura ? "active" : ""}
            >
                {suraIndex + 1 + ". "} <SuraName index={suraIndex} />
            </button>
        </li>
    );
});

export const SuraIndexCell = memo(
    ({
        sura: suraIndex,
        filter,
        selectedSura,
        selectSura,
        simple,
        trigger = "chapters_index",
    }) => {
        const pagesCount = useSelector(selectPagesCount);
        const app = useContext(AppContext);
        // const player = useContext(PlayerContext);
        const suraName = useSuraName(suraIndex);
        const isCompact = useSelector(selectIsCompact);
        const dispatch = useDispatch();
        const intl = useIntl();
        const history = useHistory();
        const audio = useContext(AudioContext);
        const selectStart = useSelector(selectStartSelection);

        const checkClosePopup = () => {
            if (!isCompact && pagesCount === 1) {
                dispatch(closePopup());
            }
        };

        const onClickSura = (e) => {
            // eslint-disable-next-line eqeqeq
            if (selectedSura == suraIndex) {
                analytics.logEvent("goto_chapter", {
                    chapter_num: suraIndex + 1,
                    chapter: getArSuraName(suraIndex),
                    trigger,
                });
                // app.hideMask();
                dispatch(setMask(-1));
                checkClosePopup();
                return dispatch(gotoSura(history, suraIndex));
            } else {
                selectSura?.(suraIndex);
            }
        };
        const addUpdateHifz = (e) => {
            //TODO: check if sura has old ranges, then confirmation is required
            const suraInfo = sura_info[suraIndex];
            const suraRanges = app.suraRanges(suraIndex);
            const trigger = "chapters_index";

            if (suraRanges.length) {
                checkClosePopup();
                // app.gotoSura(suraIndex);
                dispatch(gotoSura(history, suraIndex));
                setMessageBox({
                    title: <Message id="update_hifz" />,
                    content: <AddHifz />,
                });
                analytics.logEvent("show_update_hifz", {
                    ...verseLocation(selectStart),
                    trigger,
                });
            } else {
                const startPage = suraInfo.sp - 1;
                const pagesCount = suraInfo.ep - suraInfo.sp + 1;
                app.addHifzRange(
                    startPage,
                    suraIndex,
                    suraInfo.ep - suraInfo.sp + 1
                );
                analytics.logEvent("add_hifz", {
                    trigger,
                    range: "full_sura",
                    chapter: suraIndex,
                    startPage,
                    pagesCount,
                });
                dispatch(showToast("sura_memorized"));
                // app.showToast(<String id="sura_memorized" />);
            }
        };

        const onClickPlay = (e) => {
            audio.stop(true);
            onClickSura(e);
            setTimeout(() => {
                audio.play();
            }, 500);
            analytics.logEvent("play_audio", {
                trigger,
                ...verseLocation(ayaID(suraIndex, 0)),
            });
        };

        // const reviewSura = e => {
        //     const verse = gotoSura(e);
        //     setTimeout(() => {
        //         app.setMaskStart(verse, { sel: true });
        //         //app.closePopup();
        //         checkClosePopup();
        //     });
        //     app.pushRecentCommand("Mask");
        // };

        // useEffect(() => {
        //   setSura_name(app.suraName(sura));
        // }, [app, sura]);

        let btn;

        useEffect(() => {
            // eslint-disable-next-line eqeqeq
            if (btn && suraIndex == selectedSura) {
                btn.focus();
            }
        }, [btn, selectedSura, suraIndex]);

        if (filter && suraName.match(new RegExp(filter, "i")) === null) {
            return "";
        }

        return (
            <li className="SuraIndexCell">
                {simple ? "" : <SuraHifzChart pages={false} sura={suraIndex} />}
                <button
                    onClick={onClickSura}
                    // eslint-disable-next-line eqeqeq
                    className={suraIndex == selectedSura ? "active" : ""}
                    ref={(ref) => {
                        btn = ref;
                    }}
                >
                    {suraIndex + 1 + ". " + suraName}
                </button>
                <div className="actions">
                    {
                        // eslint-disable-next-line eqeqeq
                        selectedSura == suraIndex ? (
                            <>
                                <button
                                    sura={suraIndex}
                                    onClick={onClickPlay}
                                    title={intl.formatMessage({ id: "play" })}
                                >
                                    <Icon icon={faPlayCircle} />
                                </button>
                                <button
                                    sura={suraIndex}
                                    onClick={addUpdateHifz}
                                    title={intl.formatMessage({
                                        id: "update_hifz",
                                    })}
                                >
                                    <Icon icon={faHeart} />
                                </button>
                                {/* <button sura={sura} onClick={reviewSura}>
                                <Icon icon={faEyeSlash} />
                            </button> */}
                            </>
                        ) : (
                            <Icon icon={faEllipsisH} />
                        )
                    }
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
    showTafseer = false,
    trigger = "bookmarks",
}) => {
    const app = useContext(AppContext);
    const pagesCount = useSelector(selectPagesCount);
    // const player = useContext(PlayerContext);
    const [verseText, setVerseText] = useState("");
    const [bookmarkDesc, setBookmarkDesc] = useState("");
    const suraName = useSuraName(ayaIdInfo(verse).sura);
    const [showTafseerView, setShowTafseer] = useState(showTafseer);
    const isCompact = useSelector(selectIsCompact);
    const dispatch = useDispatch();
    const intl = useIntl();
    const history = useHistory();
    const audio = useContext(AudioContext);
    const audioSource = useSelector(selectAudioSource(verse));

    useEffect(() => {
        setVerseText(quranText[verse]);

        const bookmarkDesc = intl.formatMessage(
            { id: "bookmark_desc" },
            {
                sura: suraName,
                verse: ayaIdInfo(verse).aya + 1,
            }
        );

        setBookmarkDesc(bookmarkDesc);
    }, [intl, suraName, verse]);

    const checkClosePopup = () => {
        if (!isCompact && pagesCount === 1) {
            dispatch(closePopup());
        }
    };

    const onClickAya = (e) => {
        if (selectedVerse !== verse) {
            selectVerse(verse);
            return;
        }
        // app.gotoAya(verse, { sel: true });
        dispatch(gotoAya(history, verse, { sel: true }));
        checkClosePopup();
        analytics.logEvent("goto_verse", {
            ...verseLocation(verse),
            trigger,
        });
    };

    const removeBookmark = (e) => {
        pushMessageBox({
            title: <Message id="are_you_sure" />,
            content: <Message id="delete_bookmark" />,
            onYes: () => {
                if (-1 === app.removeBookmark(verse)) {
                    dispatch(showToast("bookmark_deleted"));
                    // app.showToast(<String id="bookmark_not_found" />);
                    analytics.logEvent("remove_bookmark", {
                        ...verseLocation(verse),
                        trigger,
                    });
                }
            },
        });
    };

    const playVerse = (e) => {
        // player.stop(true);
        audio.stop(true);
        // app.gotoAya(verse, { sel: true });
        dispatch(gotoAya(verse, { sel: true }));
        setTimeout(() => {
            audio.play();
        }, 500);
        analytics.logEvent("play_audio", {
            ...verseLocation(verse),
            trigger,
        });
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

    if (filter && suraName.match(new RegExp(filter, "i")) === null) {
        return "";
    }

    const download = (e) => {
        setMessageBox({
            title: <Message id="download_verse_audio" />,
            content: <Message id="download_guide" />,
        });
        e.preventDefault();
    };

    const toggleTafseer = (e) => {
        analytics.logEvent(showTafseerView ? "hide_tafseer" : "show_tafseer", {
            ...verseLocation(verse),
            trigger,
        });
        setShowTafseer(!showTafseerView);
    };

    return (
        <li className="BookmarkRow">
            <div className="actions">
                {
                    // eslint-disable-next-line eqeqeq
                    selectedVerse == verse ? (
                        <>
                            <button
                                onClick={playVerse}
                                title={intl.formatMessage({ id: "play" })}
                            >
                                <Icon icon={faPlayCircle} />
                            </button>
                            <button
                                onClick={toggleTafseer}
                                title={intl.formatMessage({ id: "tafseer" })}
                            >
                                <Icon icon={faQuran} />
                            </button>
                            <div
                                className="LinkButton"
                                title={intl.formatMessage({
                                    id: "download_verse_audio",
                                })}
                            >
                                <a href={audioSource} onClick={download}>
                                    <Icon icon={faFileDownload} />
                                </a>
                            </div>
                            <button
                                onClick={removeBookmark}
                                title={intl.formatMessage({ id: "unbookmark" })}
                            >
                                <Icon icon={faDelete} />
                            </button>
                        </>
                    ) : (
                        <Icon icon={faEllipsisH} />
                    )
                }
            </div>
            <button onClick={onClickAya}>
                <Icon icon={faBookmark} />
                &nbsp;
                {bookmarkDesc}
                {showTafseerView ? null : (
                    <div
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            pointerEvents: "none",
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

export const BookmarksList = ({ filter, trigger = "bookmarks_index" }) => {
    const app = useContext(AppContext);
    const [actionsIndex, setActionsIndex] = useState(-1);
    const [showTafseer, setShowTafseer] = useState(false);

    const { bookmarks } = app;

    const handleShowTafseerChange = ({ currentTarget }) => {
        const showTafseer = currentTarget.checked;
        setShowTafseer(showTafseer);
    };

    useEffect(() => {
        analytics.setTrigger(trigger);
    }, [trigger]);

    if (!bookmarks.length) {
        return (
            <div>
                <Message id="no_bookmarks" />
            </div>
        );
    }
    return (
        <>
            <div className="InputRow">
                <input
                    type="checkbox"
                    onChange={handleShowTafseerChange}
                    value={showTafseer}
                    id="toggleTafseer"
                />
                <label htmlFor="toggleTafseer">
                    <Message id="tafseer" />
                </label>
            </div>
            <ul className="FlowingList">
                {bookmarks.map((bookmark) => {
                    const verse = parseInt(bookmark.aya);
                    return (
                        <BookmarkListItem
                            key={verse}
                            verse={verse}
                            filter={filter}
                            selectedVerse={actionsIndex}
                            selectVerse={setActionsIndex}
                            showTafseer={showTafseer}
                            trigger={trigger}
                        />
                    );
                })}
            </ul>
        </>
    );
};

export default QIndex;
