import { CommandIcon } from "@/components/CommandIcon";
import PartsPie from "@/components/PartsPie";
import PlayPrompt from "@/components/PlayPrompt";
import { SuraList } from "@/components/SuraList";
import SuraName from "@/components/SuraName";
import {
    CircleProgress,
    PageContextButtons,
    SuraContextHeader,
    VerseContextButtons,
} from "@/components/Widgets";
import { useHistory } from "@/hooks/useHistory";
import { useContextPopup, useMessageBox } from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPagePartNumber,
    getPageSuraIndex,
    TOTAL_PAGES,
} from "@/services/qData";
import { commandKey, keyValues } from "@/services/utils";
import {
    selectActivePage,
    selectIsNarrow,
    selectPagerWidth,
} from "@/store/layoutSlice";
import { gotoAya, gotoPage, selectStartSelection } from "@/store/navSlice";
import { AudioState, selectAudioState } from "@/store/playerSlice";
import {
    faAngleDown,
    faAngleUp,
    faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Icon from "@/components/Icon";

type PageHeaderProps = {
    index: number;
    order: number;
    onArrowKey?: (shiftKey: boolean, direction: "up" | "down") => void;
    onPageDown?: () => void;
    onPageUp?: () => void;
};

const PageHeader = ({
    index: pageIndex,
    order,
    onArrowKey,
    onPageDown,
    onPageUp,
}: PageHeaderProps) => {
    const intl = useIntl();
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const selectedAyaInfo = ayaIdInfo(selectStart);
    // const shownPages = useSelector(selectShownPages);
    const dispatch = useDispatch();
    const contextPopup = useContextPopup();
    const activePage = useSelector(selectActivePage);
    const pagerWidth = useSelector(selectPagerWidth);
    const audioState = useSelector(selectAudioState);
    const isNarrow = useSelector(selectIsNarrow);
    const msgBox = useMessageBox();

    const trigger = "page_header";
    const partIndex = getPagePartNumber(pageIndex + 1) - 1;
    let suraIndex = getPageSuraIndex(pageIndex + 1);
    const selectedAyaPage = ayaIdPage(
        ayaID(selectedAyaInfo.sura, selectedAyaInfo.aya)
    );
    suraIndex =
        selectedAyaPage === pageIndex ? selectedAyaInfo.sura : suraIndex;

    const showPartContextPopup = ({
        currentTarget: target,
    }: React.MouseEvent) => {
        analytics.logEvent("show_part_context", { trigger });
        contextPopup.show({
            target,
            content: <PartsPie size={280} />, //<PartsList part={partIndex} />,
        });
    };

    const showPageContextPopup = ({ target }: React.MouseEvent) => {
        analytics.logEvent("show_page_context", { trigger });
        contextPopup.show({
            target,
            // header: <div>Page Header</div>,
            content: <PageContextButtons page={pageIndex} />,
        });
    };

    const showVerseContextPopup = ({ target }: React.MouseEvent) => {
        analytics.logEvent("show_verse_context", { trigger });
        contextPopup.show({
            target,
            content: <VerseContextButtons />,
        });
    };

    const onClickNext = (e: React.MouseEvent) => {
        onArrowKey?.(e.shiftKey, "down");
        analytics.logEvent("nav_next_verse", { trigger });
        e.stopPropagation();
    };

    const onClickPrevious = (e: React.MouseEvent) => {
        onArrowKey?.(e.shiftKey, "up");
        analytics.logEvent("nav_prev_verse", { trigger });
        e.stopPropagation();
    };

    const showSuraContextPopup = ({ target }: React.MouseEvent) => {
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

    const gotoNextPage = (e: React.MouseEvent) => {
        // dispatch(gotoPage(history, pageIndex + shownPages.length));
        // analytics.logEvent("nav_prev_page", { trigger });
        analytics.setTrigger(trigger);
        onPageDown?.();
    };
    const gotoPrevPage = () => {
        // dispatch(gotoPage(history, pageIndex - shownPages.length));
        // analytics.logEvent("nav_prev_page", { trigger });
        analytics.setTrigger(trigger);
        onPageUp?.();
    };

    const onTogglePlay = () => {
        msgBox.set({
            title: <FormattedMessage id="play" values={keyValues("r")} />,
            content: <PlayPrompt trigger={trigger} />,
        });
        // } else {
        //   audio.stop();
        // }
    };

    const onClick = () => {
        if (activePage !== pageIndex) {
            dispatch(gotoPage(history, pageIndex));
        }
    };
    const audioCommand = audioState !== AudioState.playing ? "play" : "stop";

    return (
        <div
            className={"PageHeader".appendWord(
                "active",
                pageIndex === activePage
            )}
            onClick={onClick}
        >
            <div
                className="PageHeaderContent"
                style={{ maxWidth: pagerWidth - (isNarrow ? 50 : 0) }}
            >
                {pageIndex >= 0 && (
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
                        style={{ margin: "0 3px" }}
                    />
                )}
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
                        style={{ minWidth: 25, padding: 0 }}
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
                {order === 0 && (
                    <div className="PageHeaderSection">
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
                            style={{ minWidth: 40, padding: 0 }}
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
                )}
                <div className="PageHeaderSection">
                    <button
                        // sura={suraIndex}
                        onClick={onTogglePlay}
                        title={intl.formatMessage(
                            {
                                id: audioCommand,
                            },
                            keyValues(commandKey(audioCommand))
                        )}
                    >
                        <CommandIcon
                            command={
                                audioState === AudioState.stopped
                                    ? "Play"
                                    : "AudioPlayer"
                            }
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
