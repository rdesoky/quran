import React from "react";
import { FormattedMessage as String } from "react-intl";
import QData from "./../services/QData";
import { AppConsumer } from "./../context/App";
import { PlayerConsumer } from "./../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faPlayCircle, faCheck } from "@fortawesome/free-solid-svg-icons";

const dayLength = 24 * 60 * 60 * 1000;

export const HifzRange = AppConsumer(
    PlayerConsumer(({ app, player, range }) => {
        const age = Math.floor((Date.now() - range.date) / dayLength);
        const suraInfo = QData.sura_info[range.sura];
        const suraPagesCount = suraInfo.ep - suraInfo.sp + 1;
        const rangePagesCount = range.endPage - range.startPage + 1;

        const rangeStartAya = (sura, page) => {
            const suraStartPage = suraInfo.sp - 1;
            if (suraStartPage === page) {
                return QData.ayaID(sura, 0);
            } else {
                return QData.pageAyaId(page);
            }
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

        const checkClosePopup = () => {
            if (!app.isCompact && app.pagesCount === 1) {
                app.closePopup();
            }
        };

        const markRevisedRange = () => {
            app.markRevisedRange(range);
        };

        let ageClass = "GoodHifz";
        if (age > 7) {
            ageClass = "FairHifz";
        }
        if (age > 14) {
            ageClass = "WeakHifz";
        }

        return (
            <li className={"HifzRangeRow".appendWord(ageClass)}>
                <button
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
                    <div className="RangeInfo">
                        <String
                            id={
                                rangePagesCount === suraPagesCount
                                    ? "sura_hifz_desc"
                                    : "range_desc"
                            }
                            values={{
                                sura: app.suraName(range.sura),
                                start_page:
                                    range.startPage - (suraInfo.sp - 1) + 1,
                                end_page:
                                    range.pages > 1
                                        ? "-" + (range.endPage + 1)
                                        : "",
                                pages: rangePagesCount
                            }}
                        />
                    </div>
                    <div
                        className="RangeText"
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            pointerEvents: "none"
                        }}
                    >
                        {app.verseText(
                            rangeStartAya(range.sura, range.startPage)
                        )}
                    </div>
                    <div className="AgeInfo">
                        <String
                            id={
                                age === 0
                                    ? "last_review_today"
                                    : "last_review_since"
                            }
                            values={{
                                days: age
                            }}
                        />
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
                    <button onClick={markRevisedRange}>
                        <Icon icon={faCheck} />
                    </button>
                </div>
            </li>
        );
    })
);

export const HifzRanges = AppConsumer(({ app, filter }) => {
    const { hifzRanges } = app;

    if (!hifzRanges.length) {
        return (
            <div>
                <String id="no_hifz" />
            </div>
        );
    }

    return (
        <ul id="HifzRanges" className="FlowingList">
            {hifzRanges.map((range, index) => {
                const suraName = app.suraName(range.sura);
                if (filter && -1 === suraName.indexOf(filter)) {
                    return "";
                }
                return <HifzRange range={range} key={index} />;
            })}
        </ul>
    );
});
