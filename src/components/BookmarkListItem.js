import {
    faBookmark,
    faEllipsisH,
    faFileDownload,
    faPlayCircle,
    faQuran,
    faTimes as faDelete,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext, useEffect, useState } from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { quranText } from "../App";
import useSuraName from "../hooks/useSuraName";
import { AppRefs } from "../RefsProvider";
import { analytics } from "../services/Analytics";
import { ayaIdInfo, verseLocation } from "../services/QData";
import { selectIsCompact, selectPagesCount } from "../store/layoutSlice";
import { gotoAya } from "../store/navSlice";
import { selectAudioSource } from "../store/playerSlice";
import { closePopup } from "../store/uiSlice";
import { TafseerView } from "./Modal/Tafseer";
export const BookmarkListItem = ({
    verse,
    filter,
    selectedVerse,
    selectVerse,
    showTafseer = false,
    trigger = "bookmarks",
}) => {
    const pagesCount = useSelector(selectPagesCount);
    const [verseText, setVerseText] = useState("");
    const [bookmarkDesc, setBookmarkDesc] = useState("");
    const suraName = useSuraName(ayaIdInfo(verse).sura);
    const [showTafseerView, setShowTafseer] = useState(showTafseer);
    const isCompact = useSelector(selectIsCompact);
    const dispatch = useDispatch();
    const intl = useIntl();
    const history = useHistory();
    const audio = useContext(AppRefs).get("audio");
    const msgBox = useContext(AppRefs).get("msgBox");
    const audioSource = useSelector(selectAudioSource(verse));

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

    const checkClosePopup = () => {
        if (!isCompact && pagesCount === 1) {
            dispatch(closePopup());
        }
    };

    const onClickAya = (e) => {
        if (selectedVerse !== verse) {
            selectVerse(verse);
            return;
        }
        dispatch(gotoAya(history, verse, { sel: true }));
        checkClosePopup();
        analytics.logEvent("goto_verse", {
            ...verseLocation(verse),
            trigger,
        });
    };

    const removeBookmark = (e) => {
        msgBox.push({
            title: <Message id="are_you_sure" />,
            content: <Message id="delete_bookmark" />,
            onYes: () => {
                dispatch(removeBookmark(verse));
                analytics.logEvent("remove_bookmark", {
                    ...verseLocation(verse),
                    trigger,
                });
            },
        });
    };

    const playVerse = (e) => {
        // player.stop(true);
        audio.stop();
        dispatch(gotoAya(history, verse, { sel: true }));
        audio.play(verse);
        analytics.logEvent("play_audio", {
            ...verseLocation(verse),
            trigger,
        });
    };

    // const reviewVerse = e => {
    //     app.gotoAya(verse, { sel: true });
    //     setTimeout(() => {
    //         app.setMaskStart();
    //         //app.closePopup();
    //         checkClosePopup();
    //     });
    //     app.pushRecentCommand("Mask");
    // };

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
                                onClick={removeBookmark}
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
