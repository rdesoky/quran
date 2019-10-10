import React, { useState, useEffect } from "react";
import QData from "../../services/QData";
import { FormattedMessage as String, injectIntl } from "react-intl";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faTimes as faDelete,
    faBookmark,
    faPlayCircle,
    faHeart,
    faList
} from "@fortawesome/free-solid-svg-icons";

const QIndex = ({ app, player, intl }) => {
    const { formatMessage } = intl;
    const [activeTab, setActiveTab] = useState(
        localStorage.getItem("activeTab") || "index"
    );
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

    const gotoSura = ({ target }) => {
        app.hideMask();
        let index = parseInt(target.getAttribute("sura"));
        app.gotoSura(index);
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
        // if (player.audioState !== AudioState.stopped) {
        //     player.stop();
        // }
    };

    const gotoAya = ({ target }) => {
        const aya = parseInt(target.getAttribute("aya"));
        app.gotoAya(aya, { sel: true });
    };

    const removeBookmark = ({ target }) => {
        const verse = parseInt(target.getAttribute("verse"));
        app.removeBookmark(verse);
    };

    const playVerse = ({ target }) => {
        const attr = target.getAttribute("verse") || app.selectStart;
        const verse = parseInt(attr);
        player.stop();
        app.gotoAya(verse, { sel: true });
        setTimeout(() => {
            player.play();
        }, 500);
    };

    const gotoSuraPage = ({ target }) => {
        const sura = parseInt(target.getAttribute("sura"));
        const startPage = parseInt(target.getAttribute("startpage"));
        const endPage = parseInt(target.getAttribute("endpage"));
        const suraStartPage = QData.sura_info[sura].sp - 1;
        const suraEndPage = QData.sura_info[sura].ep - 1;
        const suraStartAya = QData.ayaID(sura, 0);
        app.gotoPage(startPage + 1);
        if (suraStartPage === startPage) {
            app.setSelectStart(suraStartAya);
        } else {
            app.setSelectStart(QData.pageAyaId(startPage));
        }
        if (suraEndPage === endPage) {
            app.setSelectEnd(suraStartAya + QData.sura_info[sura].ac - 1);
        } else {
            app.setSelectEnd(QData.pageAyaId(endPage + 1) - 1);
        }
    };

    const rangeStartAya = (sura, page) => {
        const suraStartPage = QData.sura_info[sura].sp - 1;
        if (suraStartPage === page) {
            return QData.ayaID(sura, 0);
        } else {
            return QData.pageAyaId(page);
        }
    };

    let tableRoot;

    useEffect(() => {
        // let pageIndex = app.getCurrentPageIndex();
        // let sura = QData.pageSura(pageIndex + 1);
        // const currSuraBtn = tableRoot.querySelector(`button[sura='${sura}']`);
        // if (currSuraBtn) {
        //     currSuraBtn.focus();
        // }
    }, []);

    const renderIndex = () => {
        const { selectStart } = app;
        // const pageIndex = app.getCurrentPageIndex();
        const currentSura = QData.ayaIdInfo(selectStart).sura;
        return (
            <ul
                className="SpreadSheet"
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 180) //-50px margin
                }}
                ref={ref => {
                    tableRoot = ref;
                }}
            >
                {getSuraNames().map((name, suraIndex) => {
                    return (
                        <li key={suraIndex}>
                            {suraIndex == currentSura ? (
                                <div className="actions">
                                    <button onClick={playVerse}>
                                        <Icon icon={faPlayCircle} />
                                    </button>
                                    <button>
                                        <Icon icon={faHeart} />
                                    </button>
                                </div>
                            ) : (
                                ""
                            )}
                            <button
                                sura={suraIndex}
                                onClick={gotoSura}
                                className={
                                    suraIndex == currentSura ? "active" : ""
                                }
                            >
                                {suraIndex + 1 + ". " + sura_names[suraIndex]}
                            </button>
                        </li>
                    );
                })}
            </ul>
        );
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
            <div>
                {hifzRanges.map(range => (
                    <button
                        key={"" + range.sura + range.startPage}
                        sura={range.sura}
                        startpage={range.startPage}
                        endpage={range.endPage}
                        onClick={gotoSuraPage}
                        style={{
                            width: "100%",
                            textAlign: "inherit",
                            padding: 10
                        }}
                    >
                        <String
                            id="range_desc"
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
                                    rangeStartAya(range.sura, range.startPage)
                                ]
                            }
                        </div>
                    </button>
                ))}
            </div>
        );
    };

    const versesText = app.verseList();
    const sura_names = formatMessage({ id: "sura_names" }).split(",");

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
                    className={activeTab == "index" ? "active" : ""}
                >
                    <Icon icon={faList} />
                </button>
                <button
                    onClick={e => selectTab("hifz")}
                    className={activeTab == "hifz" ? "active" : ""}
                >
                    <Icon icon={faHeart} />
                </button>
                <button
                    onClick={e => selectTab("bookmarks")}
                    className={activeTab == "bookmarks" ? "active" : ""}
                >
                    <Icon icon={faBookmark} />
                </button>
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                {activeTab == "index"
                    ? renderIndex()
                    : activeTab == "hifz"
                    ? renderHifzRanges()
                    : renderBookmarks()}
            </div>
        </>
    );
};

export default AppConsumer(PlayerConsumer(injectIntl(QIndex)));
