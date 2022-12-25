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
import {
    ayaIdInfo,
    getPagePartNumber,
    getPageSuraIndex,
    TOTAL_PAGES,
} from "../../services/QData";
import { selectPagesCount, selectShownPages } from "../../store/layoutSlice";
import { gotoAya, gotoPage, selectStartSelection } from "../../store/navSlice";
import { PartsList } from "../PartsList";
import { SuraList } from "../SuraList";
import SuraName from "../SuraName";
import {
    CircleProgress,
    PageContextButtons,
    SuraContextHeader,
    VerseContextButtons,
} from "../Widgets";
import { analytics } from "./../../services/Analytics";

const PageHeader = ({ index: pageIndex, order, onArrowKey }) => {
    const partIndex = getPagePartNumber(pageIndex + 1) - 1;
    const suraIndex = getPageSuraIndex(pageIndex + 1);
    const pagesCount = useSelector(selectPagesCount);
    const intl = useIntl();
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const selectedAyaInfo = ayaIdInfo(selectStart);
    const shownPages = useSelector(selectShownPages);
    const dispatch = useDispatch();
    const contextPopup = useContext(AppRefs).get("contextPopup");
    const trigger = "page_header";

    const showPartContextPopup = ({ currentTarget: target }) => {
        analytics.logEvent("show_part_context", { trigger });
        contextPopup.show({
            target,
            content: <PartsList part={partIndex} />,
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
        dispatch(gotoPage(history, { index: pageIndex + shownPages.length }));
        analytics.logEvent("nav_prev_page", { trigger });
    };
    const gotoPrevPage = (e) => {
        dispatch(gotoPage(history, { index: pageIndex - shownPages.length }));
        analytics.logEvent("nav_prev_page", { trigger });
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
                        style={{ minWidth: 50 }}
                    >
                        <Icon icon={faBookOpen} />
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
                        style={{ minWidth: 60 }}
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
    );
};

export default PageHeader;
