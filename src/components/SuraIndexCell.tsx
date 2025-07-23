import {
    faEllipsisH,
    faHeart,
    faPlayCircle,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect } from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import useSuraName from "@/hooks/useSuraName";
import { useAudio, useMessageBox } from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import {
    ayaID,
    getArSuraName,
    sura_info,
    verseLocation,
} from "@/services/qData";
import { addHifzRange, selectSuraRanges } from "@/store/dbSlice";
import { gotoSura, hideMask, selectStartSelection } from "@/store/navSlice";
import { AudioRange } from "@/store/settingsSlice";
import { closePopupIfBlocking, showToast } from "@/store/uiSlice";
import { AddHifz } from "@/components/AddHifz";
import { SuraHifzChart } from "@/components/SuraHifzChart";
import Icon from "@/components/Icon";

type SuraIndexCellProps = {
    sura: number;
    filter?: string;
    selectedSura: number;
    selectSura?: (sura: number) => void;
    simple?: boolean;
    trigger?: string; // e.g., "chapters_index", "hifz", etc.
};

export const SuraIndexCell = ({
    sura: suraIndex,
    filter,
    selectedSura,
    selectSura,
    simple,
    trigger = "chapters_index",
}: SuraIndexCellProps) => {
    const suraName = useSuraName(suraIndex);
    const dispatch = useDispatch();
    const intl = useIntl();
    const history = useHistory();
    const audio = useAudio();
    const msgBox = useMessageBox();
    const selectStart = useSelector(selectStartSelection);
    const suraRanges = useSelector(selectSuraRanges(suraIndex));

    const onClickSura = () => {
        // eslint-disable-next-line eqeqeq
        if (selectedSura == suraIndex) {
            analytics.logEvent("goto_chapter", {
                chapter_num: suraIndex + 1,
                chapter: getArSuraName(suraIndex),
                trigger,
            });
            dispatch(hideMask());
            dispatch(closePopupIfBlocking());
            return dispatch(gotoSura(history, suraIndex));
        } else {
            selectSura?.(suraIndex);
        }
    };
    const addUpdateHifz = () => {
        //TODO: check if sura has old ranges, then confirmation is required
        const suraInfo = sura_info[suraIndex];
        const trigger = "chapters_index";

        if (suraRanges.length) {
            dispatch(closePopupIfBlocking());
            dispatch(gotoSura(history, suraIndex));
            msgBox.set({
                title: <Message id="update_hifz" />,
                content: <AddHifz />,
            });
            analytics.logEvent("show_update_hifz", {
                ...verseLocation(selectStart),
                trigger,
            });
        } else {
            const startPage = suraInfo.sp - 1;
            const pagesCount = suraInfo.ep - suraInfo.sp + 1;
            dispatch(
                addHifzRange(
                    startPage,
                    suraIndex,
                    suraInfo.ep - suraInfo.sp + 1
                )
            );
            analytics.logEvent("add_hifz", {
                trigger,
                range: "full_sura",
                chapter: suraIndex,
                startPage,
                pagesCount,
            });
            dispatch(showToast({ id: "sura_memorized" }));
        }
    };

    const onClickPlay = () => {
        // audio.stop();
        onClickSura();
        audio.play(ayaID(suraIndex, 0), AudioRange.sura);
        analytics.logEvent("play_audio", {
            trigger,
            ...verseLocation(ayaID(suraIndex, 0)),
        });
    };

    // const reviewSura = e => {
    //     const verse = gotoSura(e);
    //     setTimeout(() => {
    //         app.setMaskStart(verse, { sel: true });
    //         //app.closePopup();
    //         checkClosePopup();
    //     });
    //     app.pushRecentCommand("Mask");
    // };

    // useEffect(() => {
    //   setSura_name(app.suraName(sura));
    // }, [app, sura]);

    let btn: HTMLButtonElement | null = null;

    useEffect(() => {
        // eslint-disable-next-line eqeqeq
        if (btn && suraIndex == selectedSura) {
            btn.focus();
        }
    }, [btn, selectedSura, suraIndex]);

    if (filter && suraName.match(new RegExp(filter, "i")) === null) {
        return "";
    }

    return (
        <li className="SuraIndexCell">
            {simple ? "" : <SuraHifzChart pages={false} sura={suraIndex} />}
            <button
                onClick={onClickSura}
                // eslint-disable-next-line eqeqeq
                className={suraIndex == selectedSura ? "active" : ""}
                ref={(ref) => {
                    btn = ref;
                }}
            >
                {suraIndex + 1 + ". " + suraName}
            </button>
            <div className="actions">
                {
                    // eslint-disable-next-line eqeqeq
                    selectedSura == suraIndex ? (
                        <>
                            <button
                                // sura={suraIndex}
                                onClick={onClickPlay}
                                title={intl.formatMessage({ id: "play" })}
                            >
                                <Icon icon={faPlayCircle} />
                            </button>
                            <button
                                // sura={suraIndex}
                                onClick={addUpdateHifz}
                                title={intl.formatMessage({
                                    id: "update_hifz",
                                })}
                            >
                                <Icon icon={faHeart} />
                            </button>
                            {/* <button sura={sura} onClick={reviewSura}>
															<Icon icon={faEyeSlash} />
													</button> */}
                        </>
                    ) : (
                        <Icon icon={faEllipsisH} />
                    )
                }
            </div>
        </li>
    );
};
