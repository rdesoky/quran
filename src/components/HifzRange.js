import {
    faCheck,
    faLightbulb,
    faPlayCircle,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage as String, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import useSuraName from "../hooks/useSuraName";
import { AppRefs } from "../RefsProvider";
import { analytics } from "../services/Analytics";
import { getHifzRangeDisplayInfo } from "../services/utils";
import {
    addHifzRange,
    deleteHifzRange,
    setRangeRevised,
} from "../store/dbSlice";
import { selectIsCompact, selectPagesCount } from "../store/layoutSlice";
import {
    gotoAya,
    gotoPage,
    hideMask,
    selectMaskOn,
    setSelectEnd,
    showMask,
} from "../store/navSlice";
import { setRepeatRange } from "../store/playerSlice";
import { selectLang } from "../store/settingsSlice";
import { closePopup, showToast } from "../store/uiSlice";
import {
    ayaID,
    ayaIdPage,
    getPageFirstAyaId,
    getRangeVerses,
    sura_info,
    verseLocation,
} from "./../services/QData";
import { SuraHifzChart } from "./SuraHifzChart";
import { VerseText } from "./Widgets";

const dayLength = 24 * 60 * 60 * 1000;

export const HifzRange = ({
    range,
    filter,
    showActions = false,
    pages = true,
    setActiveRange,
    trigger = "hifz_range",
}) => {
    const audio = useContext(AppRefs).get("audio");
    const msgBox = useContext(AppRefs).get("msgBox");
    const suraName = useSuraName(range.sura);
    const [rangeInfo, setRangeInfo] = useState("");
    const [ageInfo, setAgeInfo] = useState("");
    const [actions, setActions] = useState(showActions);
    const pagesCount = useSelector(selectPagesCount);
    const isCompact = useSelector(selectIsCompact);
    const dispatch = useDispatch();
    const intl = useIntl();
    const history = useHistory();
    const maskOn = useSelector(selectMaskOn);

    const suraInfo = sura_info[range.sura];

    useEffect(() => {
        const { title, ageText } = getHifzRangeDisplayInfo(range, intl);
        setRangeInfo(title);
        setAgeInfo(ageText);
    }, [intl, range]);

    useEffect(() => {
        setActions(showActions);
    }, [showActions]);

    const rangeStartAya = (sura, page) => {
        const suraStartPage = suraInfo.sp - 1;
        if (suraStartPage === page) {
            return ayaID(sura, 0);
        } else {
            return getPageFirstAyaId(page);
        }
    };

    const playRange = (e) => {
        // audio.stop();
        const [start, end] = getRangeVerses(
            range.sura,
            range.startPage,
            range.endPage
        );
        if (maskOn) {
            dispatch(hideMask());
        }
        dispatch(setRepeatRange({ start, end }));
        audio.play(start, false);
        dispatch(gotoPage(history, ayaIdPage(start)));
        checkClosePopup();
        analytics.logEvent("play_audio", {
            trigger,
            ...verseLocation(start),
        });
    };

    const reviewRange = (e) => {
        const { startVerse } = selectRange();
        setTimeout(() => {
            dispatch(showMask());
            checkClosePopup();
        });
        analytics.logEvent("show_mask", {
            trigger,
            ...verseLocation(startVerse),
        });
    };

    const selectRange = () => {
        const [startVerse, endVerse] = getRangeVerses(
            range.sura,
            range.startPage,
            range.endPage
        );
        dispatch(gotoAya(history, startVerse, { sel: true }));
        dispatch(setSelectEnd(endVerse)); //extend selection
        return { startVerse, endVerse };
    };

    const readRange = (e) => {
        const [rangeStartVerse] = getRangeVerses(
            range.sura,
            range.startPage,
            range.endPage
        );
        dispatch(gotoAya(history, rangeStartVerse, { sel: true }));

        checkClosePopup();
    };

    const checkClosePopup = () => {
        if (!isCompact && pagesCount === 1) {
            dispatch(closePopup());
        }
        msgBox.set(null);
    };

    const onSetRangeRevised = (e) => {
        msgBox.push({
            title: <String id="are_you_sure" />,
            onYes: () => {
                analytics.logEvent("revised_today", {
                    trigger,
                    chapter: range.sura,
                    startPage: range.startPage,
                    pagesCount: range.pages,
                });
                dispatch(setRangeRevised(range));
                dispatch(showToast({ id: "ack_range_revised" }));
            },
            content: <String id="revise_confirmation" />,
        });
    };

    const confirmAddHifz = (startPage, chapter, pagesCount, range) => {
        if (dispatch(addHifzRange(startPage, chapter, pagesCount))) {
            analytics.logEvent("add_hifz", {
                trigger,
                range,
                chapter,
                startPage,
                pagesCount,
            });
        } else {
            msgBox.push({
                title: <String id="are_you_sure" />,
                onYes: () => {
                    analytics.logEvent("add_hifz", {
                        trigger,
                        range,
                        chapter,
                        startPage,
                        pagesCount,
                    });
                    dispatch(
                        addHifzRange(
                            startPage,
                            chapter,
                            pagesCount,
                            true /*overwrite*/
                        )
                    );
                },
                content: <String id="overwrite_existing_hifz" />,
            });
        }
    };

    const addCurrentPage = (e) => {
        confirmAddHifz(range.startPage, range.sura, 1, "page");
    };

    const addSura = (e) => {
        const pagesCount = suraInfo.ep - suraInfo.sp + 1;
        confirmAddHifz(suraInfo.sp - 1, range.sura, pagesCount, "full_sura");
    };

    const addFromSuraStart = (e) => {
        const pagesCount = range.startPage - suraInfo.sp + 2;
        confirmAddHifz(
            suraInfo.sp - 1,
            range.sura,
            pagesCount,
            "from_sura_start"
        );
    };

    const addToSuraEnd = (e) => {
        const pagesCount = suraInfo.ep - range.startPage;
        confirmAddHifz(
            range.startPage,
            range.sura,
            pagesCount,
            "from_sura_start"
        );
    };

    const onDeleteHifzRange = (e) => {
        msgBox.push({
            title: <String id="are_you_sure" />,
            onYes: () => {
                analytics.logEvent("remove_hifz", {
                    chapter: range.sura,
                    startPage: range.startPage,
                    pagesCount: range.pages,
                    trigger,
                });
                dispatch(deleteHifzRange(range));
            },
            content: <String id="remove_hifz" />,
        });
    };

    if (filter && suraName.match(new RegExp(filter, "i")) === null) {
        return "";
    }

    const toggleActions = (e) => {
        if (showActions) {
            readRange(e);
            return;
        }
        setActiveRange && setActiveRange(range.id);
    };

    return (
        <li className={"HifzRangeRow"}>
            <SuraHifzChart
                sura={range.sura}
                pages={pages}
                range={range}
                trigger="update_hifz_popup"
            />
            <div
                className="HifzRangeBody"
                tabIndex="0"
                onClick={toggleActions}
                style={{
                    textAlign: "inherit",
                }}
            >
                <div className="RangeInfo">
                    {suraName}
                    {": "}
                    {rangeInfo}
                </div>
                <div className="AgeInfo">{ageInfo}</div>
                <div
                    className="RangeText"
                    style={{
                        whiteSpace: "nowrap",
                        pointerEvents: "none",
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
            </div>
            {range.date ? (
                actions ? (
                    <div className="ActionsBar">
                        <button
                            onClick={playRange}
                            title={intl.formatMessage({ id: "play" })}
                        >
                            <Icon icon={faPlayCircle} />
                        </button>
                        <button
                            onClick={reviewRange}
                            title={intl.formatMessage({ id: "revise" })}
                        >
                            <Icon icon={faLightbulb} />
                        </button>
                        <button onClick={onSetRangeRevised}>
                            <Icon icon={faCheck} /> <String id="revised" />
                        </button>
                        {/* <button onClick={readRange}>
													<Icon icon={faBookOpen} />
											</button> */}
                        <button
                            onClick={onDeleteHifzRange}
                            title={intl.formatMessage({ id: "remove_hifz" })}
                        >
                            <Icon icon={faTimes} />
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
