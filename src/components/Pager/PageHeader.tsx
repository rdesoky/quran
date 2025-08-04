import useCommands from "@/hooks/useCommands";
import { useHistory } from "@/hooks/useHistory";
import { useContextPopup } from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import {
    ayaIdInfo,
    getPagePartNumber,
    getPageSuraIndex,
    TOTAL_PAGES,
} from "@/services/qData";
import { AppDispatch } from "@/store/config";
import {
    PAGE_HEADER_HEIGHT,
    selectActivePage,
    selectIsNarrow,
    selectShownPages,
} from "@/store/layoutSlice";
import { gotoPage, gotoSura, selectStartSelection } from "@/store/navSlice";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { CircleProgress } from "../CircleProgress";
import Icon from "../Icon";
import PartsPie from "../PartsPie";
import { SuraContextHeader } from "../SuraContextHeader";
import { SuraList } from "../SuraList";
import SuraName from "../SuraName";

type PageHeaderProps = {
    order: 0 | 1; // 0 for right page, 1 for left page
};

const trigger = "page_header";

export function PageHeader({ order }: PageHeaderProps) {
    const shownPages = useSelector(selectShownPages);
    const activePage = useSelector(selectActivePage);
    const pageIndex = shownPages[order];
    // const audioState = useSelector(selectAudioState);
    const contextPopup = useContextPopup();
    const dispatch = useDispatch() as AppDispatch;
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const selectedAyaInfo = useMemo(
        () => ayaIdInfo(selectStart),
        [selectStart]
    );
    const { runCommand } = useCommands();
    const isNarrow = useSelector(selectIsNarrow);

    const suraIndex = useMemo(
        () => getPageSuraIndex(pageIndex + 1),
        [pageIndex]
    );
    const partIndex = useMemo(
        () => getPagePartNumber(pageIndex + 1) - 1,
        [pageIndex]
    );
    const intl = useIntl();

    // const audioCommand = audioState !== AudioState.playing ? "play" : "stop";
    const onClickHeader = () => {
        if (activePage !== pageIndex) {
            dispatch(gotoPage(history, pageIndex));
        }
        runCommand("Indices", "page_header");
    };

    const showSuraContextPopup = (e: React.MouseEvent) => {
        const { currentTarget: target } = e;
        e.stopPropagation();
        analytics.logEvent("show_chapter_context", {
            trigger,
        });
        contextPopup.show({
            target,
            header: <SuraContextHeader sura={suraIndex} />,
            content: (
                <SuraList
                    trigger="header_chapter_context"
                    simple={true}
                    listWidth={400}
                    cellWidth={120}
                />
            ),
        });
    };

    const showPartContextPopup = (e: React.MouseEvent) => {
        const { currentTarget: target } = e;
        e.stopPropagation();
        analytics.logEvent("show_part_context", { trigger });
        contextPopup.show({
            target,
            content: <PartsPie size={280} />, //<PartsList part={partIndex} />,
        });
    };

    const gotoPrevSura = (e: React.MouseEvent) => {
        // analytics.setTrigger(trigger);
        e.stopPropagation();
        dispatch(gotoSura(history, selectedAyaInfo.sura - 1));
    };

    const gotoNextSura = (e: React.MouseEvent) => {
        // analytics.setTrigger(trigger);
        e.stopPropagation();
        dispatch(gotoSura(history, selectedAyaInfo.sura + 1));
    };

    return (
        <div
            className={"PageHeader".appendWord(
                "active",
                pageIndex === activePage
            )}
            style={{
                // height: PAGE_HEADER_HEIGHT,
                boxSizing: "border-box",
            }}
            onClick={onClickHeader}
        >
            <button
                onClick={showPartContextPopup}
                className="HeaderFooterSection"
            >
                {isNarrow ? null : <FormattedMessage id={"part"} />}
                <CircleProgress
                    target={TOTAL_PAGES}
                    progress={pageIndex + 1}
                    display={partIndex + 1}
                    strokeWidth={3}
                    title={intl.formatMessage(
                        { id: "part_num" },
                        { num: partIndex + 1 }
                    )}
                    style={{ margin: 1 }}
                />
            </button>
            <div className="HeaderFooterSection">
                <button
                    className="NavButton NavBackward"
                    onClick={gotoPrevSura}
                >
                    <Icon icon={faAngleRight} />
                </button>
                <button
                    style={{ minWidth: 80 }}
                    onClick={showSuraContextPopup}
                    title={intl.formatMessage(
                        { id: "sura_num" },
                        { num: suraIndex + 1 }
                    )}
                >
                    {suraIndex + 1}. <SuraName index={suraIndex} />
                </button>
                <button onClick={gotoNextSura} className="NavButton NavForward">
                    <Icon icon={faAngleLeft} />
                </button>
            </div>
        </div>
    );
}
