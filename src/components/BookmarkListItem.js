import {
    faBookmark,
    faTimes as faDelete,
    faEllipsisH,
    faFileDownload,
    faPlayCircle,
    faQuran,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { useEffect, useState } from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { quranText } from "../App";
import useSuraName from "../hooks/useSuraName";
import { useAudio, useMessageBox } from "../RefsProvider";
import { analytics } from "../services/analytics";
import { ayaIdInfo, ayaIdPage, verseLocation } from "../services/QData";
import { deleteBookmark } from "../store/dbSlice";
import { gotoAya, gotoPage, hideMask, selectMaskOn } from "../store/navSlice";
import { selectAudioSource } from "../store/playerSlice";
import { closePopupIfBlocking } from "../store/uiSlice";
import { TafseerView } from "./Modal/Tafseer";

export const BookmarkListItem = ({
    verse,
    filter,
    selectedVerse,
    selectVerse,
    showTafseer = false,
    trigger = "bookmarks",
}) => {
    const [verseText, setVerseText] = useState("");
    const [bookmarkDesc, setBookmarkDesc] = useState("");
    const suraName = useSuraName(ayaIdInfo(verse).sura);
    const [showTafseerView, setShowTafseer] = useState(showTafseer);
    const dispatch = useDispatch();
    const intl = useIntl();
    const history = useHistory();
    const audio = useAudio();
    const msgBox = useMessageBox();
    const audioSource = useSelector(selectAudioSource(verse));
    const maskOn = useSelector(selectMaskOn);

    useEffect(() => {
        setVerseText(quranText[verse]);

        const bookmarkDesc = intl.formatMessage(
            { id: "bookmark_desc" },
            {
                sura: suraName,
                verse: ayaIdInfo(verse).aya + 1,
            }
        );

        setBookmarkDesc(bookmarkDesc);
    }, [intl, suraName, verse]);

    const onClickAya = (e) => {
        if (selectedVerse !== verse) {
            selectVerse(verse);
            return;
        }
        dispatch(gotoAya(history, verse, { sel: true }));
        dispatch(closePopupIfBlocking());
        analytics.logEvent("goto_verse", {
            ...verseLocation(verse),
            trigger,
        });
    };

    const onRemoveBookmark = (e) => {
        msgBox.push({
            title: <Message id="are_you_sure" />,
            content: <Message id="delete_bookmark" />,
            onYes: () => {
                dispatch(deleteBookmark(verse));
                analytics.logEvent("remove_bookmark", {
                    ...verseLocation(verse),
                    trigger,
                });
            },
        });
    };

    const playVerse = (e) => {
        // audio.stop();
        if (maskOn) {
            dispatch(hideMask());
        }
        dispatch(gotoPage(history, ayaIdPage(verse)));
        audio.play(verse);
        dispatch(closePopupIfBlocking());

        analytics.logEvent("play_audio", {
            ...verseLocation(verse),
            trigger,
        });
    };

    useEffect(() => {
        setShowTafseer(showTafseer);
    }, [showTafseer]);

    if (filter && suraName.match(new RegExp(filter, "i")) === null) {
        return "";
    }

    const download = (e) => {
        msgBox.set({
            title: <Message id="download_verse_audio" />,
            content: <Message id="download_guide" />,
        });
        e.preventDefault();
    };

    const toggleTafseer = (e) => {
        analytics.logEvent(showTafseerView ? "hide_tafseer" : "show_tafseer", {
            ...verseLocation(verse),
            trigger,
        });
        setShowTafseer(!showTafseerView);
    };

    return (
        <li className="BookmarkRow">
            <div className="actions">
                {
                    // eslint-disable-next-line eqeqeq
                    selectedVerse == verse ? (
                        <>
                            <button
                                onClick={playVerse}
                                title={intl.formatMessage({ id: "play" })}
                            >
                                <Icon icon={faPlayCircle} />
                            </button>
                            <button
                                onClick={toggleTafseer}
                                title={intl.formatMessage({ id: "tafseer" })}
                            >
                                <Icon icon={faQuran} />
                            </button>
                            <div
                                className="LinkButton"
                                title={intl.formatMessage({
                                    id: "download_verse_audio",
                                })}
                            >
                                <a href={audioSource} onClick={download}>
                                    <Icon icon={faFileDownload} />
                                </a>
                            </div>
                            <button
                                onClick={onRemoveBookmark}
                                title={intl.formatMessage({ id: "unbookmark" })}
                            >
                                <Icon icon={faDelete} />
                            </button>
                        </>
                    ) : (
                        <Icon icon={faEllipsisH} />
                    )
                }
            </div>
            <button onClick={onClickAya}>
                <Icon icon={faBookmark} />
                &nbsp;
                {bookmarkDesc}
                {showTafseerView ? null : (
                    <div
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            pointerEvents: "none",
                        }}
                    >
                        {verseText}
                    </div>
                )}
            </button>
            {showTafseerView ? (
                <TafseerView verse={verse} showVerse={false} copy={true} />
            ) : null}
        </li>
    );
};
