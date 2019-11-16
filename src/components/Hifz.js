import {
    AreaChart,
    Area,
    CartesianGrid,
    XAxis,
    YAxis,
    Tooltip
} from "recharts";
import React, { useContext, useState, useEffect, memo } from "react";
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
    const [ageClass, setAgeClass] = useState("NoHifz");
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
            page: range.startPage - (suraInfo.sp - 1) + 1,
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
            //app.closePopup();
            checkClosePopup();
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
        //app.closePopup();
        checkClosePopup();
    };

    const checkClosePopup = () => {
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
    };

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
        if (showActions) {
            readRange(e);
            return;
        }
        setActiveRange && setActiveRange(range.id);
    };

    return (
        <li className={"HifzRangeRow".appendWord(ageClass)}>
            <SuraHifzChart range={range} />
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

const SuraHifzChart = memo(({ sura, range }) => {
    const app = useContext(AppContext);
    const [suraRanges, setSuraRanges] = useState([]);

    const suraIndex = sura !== undefined ? sura : range.sura;
    const suraInfo = QData.sura_info[suraIndex];
    const suraPages = suraInfo.ep - suraInfo.sp + 1;
    const pageList = Array(suraPages).fill(0);
    const pageWidth = `${100 / suraPages}%`;

    useEffect(() => {
        if (sura !== undefined) {
            const suraRanges = app.hifzRanges
                .filter(r => r.sura === sura)
                .sort((r1, r2) => (r1.startPage > r2.startPage ? 1 : -1));
            setSuraRanges(suraRanges);
        }
        if (range) {
            setSuraRanges([range]);
        }
    }, [app.hifzRanges, range]);

    const activePage = app.getCurrentPageIndex();

    return (
        <div className="SuraHifzChart">
            {pageList.map((z, i) => {
                const activeClass =
                    activePage == i + suraInfo.sp - 1 ? "ActivePage" : "";
                return (
                    <div
                        key={i}
                        className={"PageThumb".appendWord(activeClass)}
                        style={{
                            right: `${(100 * i) / suraPages}%`,
                            width: pageWidth
                        }}
                    />
                );
            })}
            {suraRanges.map((r, i) => {
                const rangeStart = r.startPage - suraInfo.sp + 1;
                const start = (100 * rangeStart) / suraPages;
                const width = (100 * r.pages) / suraPages;
                let age,
                    ageClass = "NoHifz";
                if (r.date !== undefined) {
                    age = Math.floor((Date.now() - r.date) / dayLength);
                    ageClass =
                        age <= 7
                            ? "GoodHifz"
                            : age <= 14
                            ? "FairHifz"
                            : "WeakHifz";
                }
                return (
                    <div
                        key={`${r.startPage}-${r.sura}`}
                        className={"SuraRange".appendWord(ageClass)}
                        style={{ right: `${start}%`, width: `${width}%` }}
                    />
                );
            })}
        </div>
    );
});

const ActivityTooltip = ({ active, payload, label }) => {
    if (active) {
        const pages =
            Array.isArray(payload) && payload.length ? payload[0].value : 0;
        return (
            <div className="custom-tooltip">
                <p className="label">
                    {new Date(label).toDateString()}
                    <br />
                    <String id="revised_pages" values={{ pages }} />
                </p>
            </div>
        );
    }

    return null;
};

const ActivityChart = () => {
    const [dailyPages, setDailyPages] = useState([]);
    const app = useContext(AppContext);

    useEffect(() => {
        setDailyPages(
            app.dailyPages ? app.dailyPages.slice(0, 14).reverse() : []
        );
    }, [app.dailyPages]);

    if (!dailyPages.length) {
        return null;
    }

    const chartWidth = app.popupWidth() - 60;
    return (
        <AreaChart
            width={chartWidth}
            height={300}
            data={dailyPages}
            margin={{
                top: 10,
                right: 0,
                left: 0,
                bottom: 0
            }}
        >
            <Area
                type="monotone"
                dataKey="pages"
                stroke="green"
                fill="rgba(0, 128, 0, 0.3)"
            />
            <CartesianGrid stroke="#444" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip content={<ActivityTooltip />} />
        </AreaChart>
    );
};

export { SuraHifzChart, HifzRange, HifzRanges, ActivityChart };
