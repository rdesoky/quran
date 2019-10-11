import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import QData from "./../../services/QData";
import Login from "../Login";

const Favorites = ({ app }) => {
    const { user, hifzRanges } = app;
    const [showLogin, setShowLogin] = useState(false);

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

    const renderLogin = () => {
        return (
            <div>
                {showLogin ? (
                    <Login
                        onClose={() => {
                            setShowLogin(false);
                        }}
                    />
                ) : (
                    <button onClick={e => setShowLogin(true)}>
                        Please Login
                    </button>
                )}
            </div>
        );
    };

    return (
        <>
            <div className="Title">
                <String id="favorites" />
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <div className="buttonsBar">
                    <button>
                        <String id="add_hifz" />
                    </button>
                </div>
            </div>
        </>
    );
};

export default AppConsumer(Favorites);
