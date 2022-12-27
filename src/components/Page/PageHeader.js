import {
    faAngleDown,
    faAngleUp,
    faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppRefs } from "../../RefsProvider";
import { analytics } from "../../services/Analytics";
import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPagePartNumber,
    getPageSuraIndex,
    TOTAL_PAGES,
    verseLocation,
} from "../../services/QData";
import { selectPagesCount, selectShownPages } from "../../store/layoutSlice";
import { gotoAya, gotoPage, selectStartSelection } from "../../store/navSlice";
import { selectPlayingAya } from "../../store/playerSlice";
import { AudioRepeat } from "../../store/settingsSlice";
import { CommandIcon } from "../CommandIcon";
import PartsPie from "../PartsPie";
import { SuraList } from "../SuraList";
import SuraName from "../SuraName";
import {
    CircleProgress,
    PageContextButtons,
    SuraContextHeader,
    VerseContextButtons,
} from "../Widgets";

const PageHeader = ({ index: pageIndex, order, onArrowKey }) => {
    const intl = useIntl();
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const selectedAyaInfo = ayaIdInfo(selectStart);
    const shownPages = useSelector(selectShownPages);
    const dispatch = useDispatch();
    const contextPopup = useContext(AppRefs).get("contextPopup");
    const audio = useContext(AppRefs).get("audio");
    const playingAya = useSelector(selectPlayingAya);

    const trigger = "page_header";
    const partIndex = getPagePartNumber(pageIndex + 1) - 1;
    let suraIndex = getPageSuraIndex(pageIndex + 1);
    const selectedAyaPage = ayaIdPage(
        ayaID(selectedAyaInfo.sura, selectedAyaInfo.aya)
    );
    suraIndex =
        selectedAyaPage === pageIndex ? selectedAyaInfo.sura : suraIndex;
    const pagesCount = useSelector(selectPagesCount);

    const showPartContextPopup = ({ currentTarget: target }) => {
        analytics.logEvent("show_part_context", { trigger });
        contextPopup.show({
            target,
            content: <PartsPie />, //<PartsList part={partIndex} />,
        });
    };

    const showPageContextPopup = ({ target }) => {
        analytics.logEvent("show_page_context", { trigger });
        contextPopup.show({
            target,
            // header: <div>Page Header</div>,
            content: <PageContextButtons page={pageIndex} />,
        });
    };

    const showVerseContextPopup = ({ target }) => {
        analytics.logEvent("show_verse_context", { trigger });
        contextPopup.show({
            target,
            content: <VerseContextButtons verse={selectStart} />,
        });
    };

    const onClickNext = (e) => {
        onArrowKey?.(e, "down");
        analytics.logEvent("nav_next_verse", { trigger });
        e.stopPropagation();
    };

    const onClickPrevious = (e) => {
        onArrowKey?.(e, "up");
        analytics.logEvent("nav_prev_verse", { trigger });
        e.stopPropagation();
    };

    const showSuraContextPopup = ({ target }) => {
        analytics.logEvent("show_chapter_context", {
            trigger,
        });
        contextPopup.show({
            target,
            header: <SuraContextHeader sura={suraIndex} />,
            content: (
                <SuraList trigger="header_chapter_context" simple={true} />
            ),
        });
    };

    const gotoNextPage = (e) => {
        dispatch(gotoPage(history, pageIndex + shownPages.length));
        analytics.logEvent("nav_prev_page", { trigger });
    };
    const gotoPrevPage = (e) => {
        dispatch(gotoPage(history, pageIndex - shownPages.length));
        analytics.logEvent("nav_prev_page", { trigger });
    };

    const onTogglePlay = (e) => {
        const aya = ayaID(suraIndex, 0);
        if (playingAya === -1) {
            audio.play(aya, AudioRepeat.sura);
            dispatch(gotoAya(history, aya));
            analytics.logEvent("play_audio", {
                trigger,
                ...verseLocation(aya),
            });
        } else {
            audio.stop();
        }
    };

    return (
        <div className="PageHeader">
            <div className="PageHeaderContent">
                <div className="PageHeaderSection">
                    <button
                        className="NavButton NavBackward"
                        onClick={gotoPrevPage}
                    >
                        <Icon icon={faAngleUp} />
                    </button>
                    <button
                        onClick={showPageContextPopup}
                        className="IconButton"
                        title={intl.formatMessage(
                            { id: "page_num" },
                            { num: pageIndex + 1 }
                        )}
                        style={{ minWidth: 30, padding: 0 }}
                    >
                        <Icon icon={faBookOpen} color="black" />
                        {pageIndex + 1}
                    </button>
                    <button
                        onClick={gotoNextPage}
                        className="NavButton NavForward"
                    >
                        <Icon icon={faAngleDown} />
                    </button>
                </div>
                <CircleProgress
                    target={TOTAL_PAGES}
                    progress={pageIndex + 1}
                    display={partIndex + 1}
                    onClick={showPartContextPopup}
                    strokeWidth={3}
                    title={intl.formatMessage(
                        { id: "part_num" },
                        { num: partIndex + 1 }
                    )}
                    style={{ marginRight: 7 }}
                />
                <div
                    className="PageHeaderSection"
                    style={{
                        display: pagesCount === 1 || order ? "" : "none",
                    }}
                >
                    <button
                        className="NavButton NavBackward"
                        onClick={onClickPrevious}
                    >
                        <Icon icon={faAngleUp} />
                    </button>
                    <button
                        onClick={(e) => {
                            dispatch(gotoAya(history, selectStart));
                            showVerseContextPopup(e);
                        }}
                        className="SelectionButton"
                        title={intl.formatMessage({ id: "goto_selection" })}
                        style={{ minWidth: 50, padding: 0 }}
                    >
                        {selectedAyaInfo.sura +
                            1 +
                            ":" +
                            (selectedAyaInfo.aya + 1)}
                    </button>
                    <button
                        onClick={onClickNext}
                        className="NavButton NavForward"
                    >
                        <Icon icon={faAngleDown} />
                    </button>
                </div>
                <div className="PageHeaderSection">
                    <button
                        sura={suraIndex}
                        onClick={onTogglePlay}
                        title={intl.formatMessage({
                            id: playingAya === -1 ? "play" : "stop",
                        })}
                    >
                        <CommandIcon
                            command={playingAya === -1 ? "Play" : "Stop"}
                        />
                    </button>
                    <button
                        onClick={showSuraContextPopup}
                        title={intl.formatMessage(
                            { id: "sura_num" },
                            { num: suraIndex + 1 }
                        )}
                    >
                        <SuraName index={suraIndex} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
