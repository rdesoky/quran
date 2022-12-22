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
import { AppContext } from "../../context/App";
import { AppRefs } from "../../RefsProvider";
import {
    ayaIdInfo,
    getPagePartNumber,
    getPageSuraIndex,
    TOTAL_PAGES,
} from "../../services/QData";
import { selectPagesCount } from "../../store/layoutSlice";
import { gotoAya, selectStartSelection } from "../../store/navSlice";
import { PartsList, SuraList } from "../Modal/QIndex";
import SuraName from "../SuraName";
import {
    CircleProgress,
    PageContextButtons,
    SuraContextHeader,
    VerseContextButtons,
} from "../Widgets";
import { analytics } from "./../../services/Analytics";

const PageHeader = ({
    index: pageIndex,
    order,
    onPageUp,
    onPageDown,
    onIncrement,
    onDecrement,
}) => {
    const app = useContext(AppContext);
    const partIndex = getPagePartNumber(pageIndex + 1) - 1;
    const suraIndex = getPageSuraIndex(pageIndex + 1);
    const pagesCount = useSelector(selectPagesCount);
    const intl = useIntl();
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const selectedAyaInfo = ayaIdInfo(selectStart);
    const dispatch = useDispatch();
    const contextPopup = useContext(AppRefs).get("contextPopup");

    const showPartContextPopup = ({ currentTarget: target }) => {
        analytics.logEvent("show_part_context", { trigger: "page_header" });
        contextPopup.show({
            target,
            content: <PartsList part={partIndex} />,
        });
    };

    const showPageContextPopup = ({ target }) => {
        analytics.logEvent("show_page_context", { trigger: "page_header" });
        contextPopup.show({
            target,
            // header: <div>Page Header</div>,
            content: <PageContextButtons page={pageIndex} />,
        });
    };

    const showVerseContextPopup = ({ target }) => {
        analytics.logEvent("show_verse_context", { trigger: "page_header" });
        contextPopup.show({
            target,
            content: <VerseContextButtons verse={selectStart} />,
        });
    };

    const onClickNext = (e) => {
        onIncrement && onIncrement(e);
        analytics.logEvent("nav_next_verse", { trigger: "page_header" });
    };

    const onClickPrevious = (e) => {
        onDecrement && onDecrement(e);
        analytics.logEvent("nav_prev_verse", { trigger: "page_header" });
    };

    const showSuraContextPopup = ({ target }) => {
        analytics.logEvent("show_chapter_context", {
            trigger: "page_header",
        });
        contextPopup.show({
            target,
            header: <SuraContextHeader sura={suraIndex} />,
            content: (
                <SuraList trigger="header_chapter_context" simple={true} />
            ),
        });
    };

    return (
        <div className="PageHeader">
            <div className="PageHeaderContent">
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
                <button
                    onClick={showSuraContextPopup}
                    title={intl.formatMessage(
                        { id: "sura_num" },
                        { num: suraIndex + 1 }
                    )}
                >
                    <SuraName index={suraIndex} />
                </button>
                <button
                    onClick={showPageContextPopup}
                    className="IconButton"
                    title={intl.formatMessage(
                        { id: "page_num" },
                        { num: pageIndex + 1 }
                    )}
                >
                    <Icon icon={faBookOpen} />
                    {pageIndex + 1}
                </button>
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
            </div>
        </div>
    );
};

export default PageHeader;
