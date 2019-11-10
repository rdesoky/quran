import React, { useContext, useState, useEffect } from "react";
import { FormattedMessage as String } from "react-intl";
import QData from "./../services/QData";
import { AppConsumer, AppContext } from "./../context/App";
import { PlayerConsumer, PlayerContext } from "./../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faPlayCircle,
    faCheck,
    faEyeSlash
} from "@fortawesome/free-solid-svg-icons";

const dayLength = 24 * 60 * 60 * 1000;

const HifzRange = ({ range, filter }) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const [suraName, setSuraName] = useState("");
    const [rangeInfo, setRangeInfo] = useState("");
    const [ageClass, setAgeClass] = useState("");
    const [ageInfo, setAgeInfo] = useState("");

    const suraInfo = QData.sura_info[range.sura];

    useEffect(() => {
        const suraName = app.suraName(range.sura);
        setSuraName(suraName);

        const suraPagesCount = suraInfo.ep - suraInfo.sp + 1;
        const rangePagesCount = range.endPage - range.startPage + 1;
        const id =
            rangePagesCount === suraPagesCount
                ? "sura_hifz_desc"
                : "range_desc";

        const values = {
            sura: suraName,
            start_page: range.startPage - (suraInfo.sp - 1) + 1,
            end_page: range.pages > 1 ? "-" + (range.endPage + 1) : "",
            pages: rangePagesCount
        };
        setRangeInfo(app.formatMessage({ id }, values));
    }, [range.sura]);

    useEffect(() => {
        const age = Math.floor((Date.now() - range.date) / dayLength);
        const id = age === 0 ? "last_review_today" : "last_review_since";
        const values = { days: age };

        const ageInfo = app.formatMessage({ id }, values);

        let ageClass = "GoodHifz";
        if (age > 7) {
            ageClass = "FairHifz";
        }
        if (age > 14) {
            ageClass = "WeakHifz";
        }

        setAgeClass(ageClass);
        setAgeInfo(ageInfo);
    }, [range.date]);

    const rangeStartAya = (sura, page) => {
        const suraStartPage = suraInfo.sp - 1;
        if (suraStartPage === page) {
            return QData.ayaID(sura, 0);
        } else {
            return QData.pageAyaId(page);
        }
    };

    const playRange = e => {
        player.stop(true);
        selectRange(e);
        setTimeout(() => {
            player.play();
        }, 500);
    };

    const reviewRange = e => {
        selectRange(e);
        setTimeout(() => {
            app.setMaskStart();
            app.closePopup();
        });
    };

    const selectRange = ({ target }) => {
        const sura = range.sura;
        const startPage = range.startPage;
        const endPage = range.endPage;
        const [rangeStartVerse, rangeEndVerse] = QData.rangeVerses(
            sura,
            startPage,
            endPage
        );
        app.gotoAya(rangeStartVerse, { sel: true });
        // app.gotoPage(startPage + 1);
        // app.setSelectStart(rangeStartVerse);
        //app.setSelectEnd(rangeEndVerse);
        checkClosePopup();
    };

    const checkClosePopup = () => {
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
    };

    const setRangeRevised = () => {
        app.setRangeRevised(range);
    };

    if (filter && suraName.indexOf(filter) === -1) {
        return "";
    }

    return (
        <li className={"HifzRangeRow".appendWord(ageClass)}>
            <button
                onClick={selectRange}
                style={{
                    width: "100%",
                    textAlign: "inherit",
                    padding: 10
                }}
            >
                <div className="RangeInfo">{rangeInfo}</div>
                <div
                    className="RangeText"
                    style={{
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        pointerEvents: "none"
                    }}
                >
                    {app.verseText(rangeStartAya(range.sura, range.startPage))}
                </div>
                <div className="AgeInfo">{ageInfo}</div>
            </button>
            <div className="actions">
                <button onClick={reviewRange}>
                    <Icon icon={faEyeSlash} />
                </button>
                <button onClick={playRange}>
                    <Icon icon={faPlayCircle} />
                </button>
                <button onClick={setRangeRevised}>
                    <Icon icon={faCheck} />
                </button>
            </div>
        </li>
    );
};

// export const HifzRanges = AppConsumer(({ app, filter }) => {

const HifzRanges = ({ filter }) => {
    const app = useContext(AppContext);
    // const suraNames = app.suraNames();

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
                // const suraName =
                //     suraNames.length > range.sura ? suraNames[range.sura] : "";
                // if (filter && -1 === suraName.indexOf(filter)) {
                //     return "";
                // }
                return (
                    <HifzRange range={range} key={range.id} filter={filter} />
                );
            })}
        </ul>
    );
};
//});

export { HifzRange, HifzRanges };
