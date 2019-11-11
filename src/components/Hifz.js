import React, { useContext, useState, useEffect } from "react";
import { FormattedMessage as String } from "react-intl";
import QData from "./../services/QData";
import { AppConsumer, AppContext } from "./../context/App";
import { PlayerConsumer, PlayerContext } from "./../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faPlayCircle,
    faCheck,
    faEyeSlash,
    faBookOpen,
    faTimes
} from "@fortawesome/free-solid-svg-icons";
import { VerseText } from "./Widgets";

const dayLength = 24 * 60 * 60 * 1000;

const HifzRange = ({ range, filter, showActions = false, setActiveRange }) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const [suraName, setSuraName] = useState("");
    const [rangeInfo, setRangeInfo] = useState("");
    const [ageClass, setAgeClass] = useState("");
    const [ageInfo, setAgeInfo] = useState("");
    const [actions, setActions] = useState(showActions);

    const suraInfo = QData.sura_info[range.sura];

    useEffect(() => {
        const suraName = app.suraName(range.sura);
        setSuraName(suraName);

        const suraPagesCount = suraInfo.ep - suraInfo.sp + 1;
        const rangePagesCount = range.endPage - range.startPage + 1;
        let id = range.date
            ? rangePagesCount === suraPagesCount
                ? "sura_hifz_desc"
                : "range_desc"
            : "the_page_num";

        let values = {
            // sura: suraName,
            page: range.startPage,
            start_page: range.startPage - (suraInfo.sp - 1) + 1,
            end_page: range.pages > 1 ? "-" + (range.endPage + 1) : "",
            pages: rangePagesCount
        };
        setRangeInfo(app.formatMessage({ id }, values));

        if (!range.date) {
            return;
        }
        const age = Math.floor((Date.now() - range.date) / dayLength);
        id =
            range.revs > 0
                ? age === 0
                    ? "last_revised_today"
                    : "last_revised_since"
                : "not_revised";
        values = { days: age };

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

    useEffect(() => {
        setActions(showActions);
    }, [showActions]);

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

    const selectRange = e => {
        const [rangeStartVerse, rangeEndVerse] = QData.rangeVerses(
            range.sura,
            range.startPage,
            range.endPage
        );
        app.gotoAya(rangeStartVerse, { sel: true });
        // app.setSelectStart(rangeStartVerse);
        app.setSelectEnd(rangeEndVerse);
    };

    const readRange = e => {
        const [rangeStartVerse, rangeEndVerse] = QData.rangeVerses(
            range.sura,
            range.startPage,
            range.endPage
        );
        app.gotoAya(rangeStartVerse, { sel: true });
        app.closePopup();
    };

    // const checkClosePopup = () => {
    //     if (!app.isCompact && app.pagesCount === 1) {
    //         app.closePopup();
    //     }
    // };

    const setRangeRevised = () => {
        if (window.confirm("Are you sure?")) {
            app.setRangeRevised(range);
        }
    };

    const addCurrentPage = e => {
        app.addHifzRange(range.startPage, range.sura, 1);
    };
    const addSura = e => {
        app.addHifzRange(
            suraInfo.sp - 1,
            range.sura,
            suraInfo.ep - suraInfo.sp + 1
        );
    };
    const addFromSuraStart = e => {
        app.addHifzRange(
            suraInfo.sp - 1,
            range.sura,
            range.startPage - suraInfo.sp + 2
        );
    };
    const addToSuraEnd = e => {
        app.addHifzRange(
            range.startPage,
            range.sura,
            suraInfo.ep - range.startPage
        );
    };

    const deleteHifzRange = e => {
        if (window.confirm("Are you sure?")) {
            app.deleteHifzRange(range);
        }
    };

    if (filter && suraName.indexOf(filter) === -1) {
        return "";
    }

    const toggleActions = e => {
        // selectRange(e);
        // setActions(!actions);
        setTimeout(() => {
            setActiveRange && setActiveRange(range.id);
        }, 100);
    };

    return (
        <li className={"HifzRangeRow".appendWord(ageClass)}>
            <button
                onClick={toggleActions}
                style={{
                    width: "100%",
                    textAlign: "inherit",
                    padding: 10
                }}
            >
                <div className="AgeInfo">{ageInfo}</div>
                <div className="RangeInfo">
                    {suraName}
                    {": "}
                    {rangeInfo}
                </div>
                <div
                    className="RangeText"
                    style={{
                        whiteSpace: "nowrap",
                        pointerEvents: "none"
                    }}
                >
                    {!actions ? (
                        <VerseText
                            verse={rangeStartAya(range.sura, range.startPage)}
                        />
                    ) : (
                        ""
                    )}
                </div>
            </button>
            {range.date ? (
                actions ? (
                    <div className="ActionsBar">
                        <button onClick={reviewRange}>
                            <Icon icon={faEyeSlash} /> <String id="revise" />
                        </button>
                        <button onClick={setRangeRevised}>
                            <Icon icon={faCheck} /> <String id="revised" />
                        </button>
                        <button onClick={readRange}>
                            <Icon icon={faBookOpen} />
                        </button>
                        <button onClick={playRange}>
                            <Icon icon={faPlayCircle} />
                        </button>
                        <button onClick={deleteHifzRange}>
                            <Icon icon={faTimes} /> <String id="remove" />
                        </button>
                    </div>
                ) : (
                    ""
                )
            ) : (
                <div className="ActionsBar">
                    <String id="add" />
                    <button onClick={addCurrentPage}>
                        <String id="the_page" />
                    </button>
                    <button onClick={addSura}>
                        <String id="the_sura" />
                    </button>
                    <button onClick={addFromSuraStart}>
                        <String id="from_start" />
                    </button>
                    <button onClick={addToSuraEnd}>
                        <String id="to_end" />
                    </button>
                </div>
            )}
        </li>
    );
};

// export const HifzRanges = AppConsumer(({ app, filter }) => {

const HifzRanges = ({ filter }) => {
    const [activeRange, setActiveRange] = useState(null);
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
                return (
                    <HifzRange
                        range={range}
                        key={range.id}
                        filter={filter}
                        showActions={activeRange === range.id}
                        setActiveRange={setActiveRange}
                    />
                );
            })}
        </ul>
    );
};
//});

export { HifzRange, HifzRanges };
