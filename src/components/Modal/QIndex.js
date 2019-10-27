import React, { useState, useEffect } from "react";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faTimes as faDelete,
    faBookmark,
    faPlayCircle,
    faHeart,
    faList,
    faEllipsisH,
    faSearch
} from "@fortawesome/free-solid-svg-icons";

const QIndex = ({ app, player }) => {
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("activeTab") || "index"
    );
    const [filter, setFilter] = useState("");
    const { bookmarks, hifzRanges } = app;

    const getSuraNames = () => {
        let suraNames = [];
        for (let i = 1; i <= 114; i++) {
            suraNames.push("Sura " + i);
        }
        return suraNames;
    };

    const selectTab = tabId => {
        localStorage.setItem("activeTab", tabId);
        setActiveTab(tabId);
    };

    const checkClosePopup = () => {
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
    };

    const gotoSura = ({ target }) => {
        app.hideMask();
        let index = parseInt(target.getAttribute("sura"));
        app.gotoSura(index);
        checkClosePopup();
    };

    const gotoAya = ({ target }) => {
        const aya = parseInt(target.getAttribute("aya"));
        app.gotoAya(aya, { sel: true });
        checkClosePopup();
    };

    const removeBookmark = ({ target }) => {
        const verse = parseInt(target.getAttribute("verse"));
        app.removeBookmark(verse);
    };

    const playSura = e => {
        player.stop(true);
        gotoSura(e);
        setTimeout(() => {
            player.play();
        }, 500);
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

    const playRange = ({ target }) => {
        player.stop(true);
        selectRange({ target });
        setTimeout(() => {
            player.play();
        }, 500);
    };

    const selectRange = ({ target }) => {
        const sura = parseInt(target.getAttribute("sura"));
        const startPage = parseInt(target.getAttribute("startpage"));
        const endPage = parseInt(target.getAttribute("endpage"));
        const [rangeStartVerse, rangeEndVerse] = QData.rangeVerses(
            sura,
            startPage,
            endPage
        );
        app.gotoPage(startPage + 1);
        app.setSelectStart(rangeStartVerse);
        app.setSelectEnd(rangeEndVerse);
        checkClosePopup();
    };

    const rangeStartAya = (sura, page) => {
        const suraStartPage = QData.sura_info[sura].sp - 1;
        if (suraStartPage === page) {
            return QData.ayaID(sura, 0);
        } else {
            return QData.pageAyaId(page);
        }
    };

    const renderHifzRanges = () => {
        if (!hifzRanges.length) {
            return (
                <div>
                    <String id="no_hifz" />
                </div>
            );
        }

        const versesText = app.verseList();

        return (
            <ul id="HifzRanges" className="FlowingList">
                {hifzRanges.map((range, index) => (
                    <li className="HifzRangeRow" key={index}>
                        <button
                            key={"" + range.sura + range.startPage}
                            sura={range.sura}
                            startpage={range.startPage}
                            endpage={range.endPage}
                            onClick={selectRange}
                            style={{
                                width: "100%",
                                textAlign: "inherit",
                                padding: 10
                            }}
                        >
                            <String
                                id={"range_desc"}
                                values={{
                                    sura: sura_names[range.sura],
                                    start_page: range.startPage + 1,
                                    end_page:
                                        range.pages > 1
                                            ? "-" + (range.endPage + 1)
                                            : ""
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
                                {
                                    versesText[
                                        rangeStartAya(
                                            range.sura,
                                            range.startPage
                                        )
                                    ]
                                }
                            </div>
                        </button>
                        <div className="actions">
                            <button
                                sura={range.sura}
                                startpage={range.startPage}
                                endpage={range.endPage}
                                onClick={playRange}
                            >
                                <Icon icon={faPlayCircle} />
                            </button>
                        </div>
                    </li>
                ))}
            </ul>
        );
    };

    const versesText = app.verseList();
    // const sura_names = formatMessage({ id: "sura_names" }).split(",");
    const sura_names = app.suraNames();

    const renderBookmarks = () => {
        if (!bookmarks.length) {
            return (
                <div>
                    <String id="no_bookmarks" />
                </div>
            );
        }
        return (
            <ul className="FlowingList">
                {bookmarks.map(bookmark => (
                    <li className="BookmarkRow" key={bookmark.aya}>
                        <div className="actions">
                            <button
                                verse={bookmark.aya}
                                onClick={removeBookmark}
                            >
                                <Icon icon={faDelete} />
                            </button>
                            <button verse={bookmark.aya} onClick={playVerse}>
                                <Icon icon={faPlayCircle} />
                            </button>
                        </div>
                        <button aya={bookmark.aya} onClick={gotoAya}>
                            <Icon icon={faBookmark} />
                            &nbsp;
                            <String
                                id="bookmark_desc"
                                values={{
                                    sura:
                                        sura_names[
                                            QData.ayaIdInfo(bookmark.aya).sura
                                        ],
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
                                {versesText[bookmark.aya]}
                            </div>
                        </button>
                    </li>
                ))}
            </ul>
        );
    };
    return (
        <>
            <div className="Title">
                <button
                    onClick={e => selectTab("index")}
                    className={"CommandButton".appendWord(
                        "active",
                        activeTab == "index"
                    )}
                >
                    <Icon icon={faList} />
                </button>
                {activeTab == "index" ? <String id="index" /> : ""}
                <button
                    onClick={e => selectTab("hifz")}
                    className={"CommandButton".appendWord(
                        "active",
                        activeTab == "hifz"
                    )}
                >
                    <Icon icon={faHeart} />
                </button>
                {activeTab == "hifz" ? <String id="favorites" /> : ""}
                <button
                    onClick={e => selectTab("bookmarks")}
                    className={"CommandButton".appendWord(
                        "active",
                        activeTab == "bookmarks"
                    )}
                >
                    <Icon icon={faBookmark} />
                </button>
                {activeTab == "bookmarks" ? <String id="bookmarks" /> : ""}
            </div>
            <div className={"TypingConsole" + (!filter.length ? " empty" : "")}>
                {filter || <String id="search_prompt" />}
            </div>

            <div
                className="PopupBody"
                style={{
                    maxHeight: app.appHeight - 135
                }}
            >
                {activeTab == "index" ? (
                    <SuraList />
                ) : activeTab == "hifz" ? (
                    renderHifzRanges()
                ) : (
                    renderBookmarks()
                )}
            </div>
        </>
    );
};

export const SuraList = AppConsumer(
    PlayerConsumer(({ app, player, filter }) => {
        const [indexActions, setIndexActions] = useState(0);

        useEffect(() => {
            const { selectStart } = app;
            const currentSura = QData.ayaIdInfo(selectStart).sura;
            setIndexActions(currentSura);
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
            app.hideMask();
            let index = parseInt(target.getAttribute("sura"));
            app.gotoSura(index);
            checkClosePopup();
        };
        const playSura = e => {
            player.stop(true);
            gotoSura(e);
            setTimeout(() => {
                player.play();
            }, 500);
        };

        return (
            <ul
                className="SpreadSheet"
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 180) //-50px margin
                }}
            >
                {new Array(114).fill(0).map((zero, suraIndex) => {
                    return (
                        <li key={suraIndex}>
                            <button
                                sura={suraIndex}
                                onClick={gotoSura}
                                className={
                                    suraIndex == currentSura ? "active" : ""
                                }
                            >
                                {suraIndex + 1 + ". " + sura_names[suraIndex]}
                            </button>
                            <div className="actions">
                                {indexActions === suraIndex ? (
                                    <>
                                        <button>
                                            <Icon icon={faHeart} />
                                        </button>
                                        <button
                                            sura={suraIndex}
                                            onClick={playSura}
                                        >
                                            <Icon icon={faPlayCircle} />
                                        </button>
                                    </>
                                ) : (
                                    <button
                                        onClick={e =>
                                            setIndexActions(suraIndex)
                                        }
                                    >
                                        <Icon icon={faEllipsisH} />
                                    </button>
                                )}
                            </div>
                        </li>
                    );
                })}
            </ul>
        );
    })
);

export default AppConsumer(PlayerConsumer(QIndex));
