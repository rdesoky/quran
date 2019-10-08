import React, { useState, useEffect } from "react";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";

const QIndex = ({ app, player }) => {
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
        if (player.audioState !== AudioState.stopped) {
            player.stop();
        }
    };

    const gotoAya = ({ target }) => {
        const aya = parseInt(target.getAttribute("aya"));
        app.gotoAya(aya, { sel: true });
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
        let pageIndex = app.getCurrentPageIndex();
        let currentSura = QData.pageSura(pageIndex + 1);
        return (
            <ul
                className="SpreadSheet"
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 120) //-50px margin
                }}
                ref={ref => {
                    tableRoot = ref;
                }}
            >
                {getSuraNames().map((name, suraIndex) => {
                    return (
                        <li key={suraIndex}>
                            <button
                                sura={suraIndex}
                                onClick={gotoSura}
                                className={
                                    suraIndex == currentSura ? "active" : ""
                                }
                            >
                                <String id={"sura_names"}>
                                    {data => {
                                        return (
                                            suraIndex +
                                            1 +
                                            ". " +
                                            data.split(",")[suraIndex]
                                        );
                                    }}
                                </String>
                            </button>
                        </li>
                    );
                })}
            </ul>
        );
    };

    const renderHifzRanges = () => {
        if (!hifzRanges.length) {
            return <div>Nothing recorded</div>;
        }

        const versesText = app.verseList();

        return (
            <div
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 240) //-50px margin
                }}
            >
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
                        <String id="sura_names">
                            {sura_names => (
                                <String id="pg">
                                    {pg =>
                                        sura_names.split(",")[range.sura] +
                                        " (" +
                                        pg +
                                        " " +
                                        (range.startPage + 1) +
                                        (range.pages > 1
                                            ? "-" + (range.endPage + 1)
                                            : "") +
                                        ")"
                                    }
                                </String>
                            )}
                        </String>
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

    const renderBookmarks = () => {
        if (!bookmarks.length) {
            return <div>Nothing recorded</div>;
        }
        const versesText = app.verseList();

        return (
            <div
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 240) //-50px margin
                }}
            >
                <String id="sura_names">
                    {sura_names => (
                        <String id="verse">
                            {verse =>
                                bookmarks.map(bookmark => (
                                    <button
                                        aya={bookmark.aya}
                                        key={bookmark.aya}
                                        onClick={gotoAya}
                                        style={{
                                            width: "100%",
                                            textAlign: "inherit",
                                            padding: 10
                                        }}
                                    >
                                        {sura_names.split(",")[
                                            QData.ayaIdInfo(bookmark.aya).sura
                                        ] +
                                            " (" +
                                            verse +
                                            " " +
                                            (QData.ayaIdInfo(bookmark.aya).aya +
                                                1) +
                                            ")"}
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
                                ))
                            }
                        </String>
                    )}
                </String>
            </div>
        );
    };
    return (
        <>
            <div className="Title">
                <button
                    onClick={e => selectTab("index")}
                    className={activeTab == "index" ? "active" : ""}
                >
                    <String id="index" />
                </button>
                {" | "}
                <button
                    onClick={e => selectTab("hifz")}
                    className={activeTab == "hifz" ? "active" : ""}
                >
                    <String id="favorites" />
                </button>
                {" | "}
                <button
                    onClick={e => selectTab("bookmarks")}
                    className={activeTab == "bookmarks" ? "active" : ""}
                >
                    <String id="bookmarks" />
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

export default AppConsumer(PlayerConsumer(QIndex));
