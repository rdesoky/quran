import { faChevronDown, faChevronUp } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { analytics } from "../services/Analytics";
import { ayaIdInfo } from "../services/QData";
import { selectPagesCount } from "../store/layoutSlice";
import { gotoAya, selectStartSelection } from "../store/navSlice";
import { closePopup, selectPopup } from "../store/uiSlice";
import SuraName from "./SuraName";

export const VerseInfo = ({
    verse,
    show,
    children,
    onClick,
    onMoveNext,
    navigate = false,
    trigger = "verse_info",
}) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const selectStart = useSelector(selectStartSelection);
    const pagesCount = useSelector(selectPagesCount);
    const popup = useSelector(selectPopup);

    if (verse === undefined || verse === -1) {
        verse = selectStart;
    }
    if (show === false) {
        return "";
    }

    const handleClick = (e) => {
        analytics.setTrigger(trigger);

        if (typeof onClick === "function") {
            onClick(verse);
        } else {
            dispatch(gotoAya(history, verse, { sel: true }));
            if (pagesCount === 1 && popup) {
                dispatch(closePopup());
            }
        }
    };

    const verseInfo = ayaIdInfo(verse);

    if (navigate) {
        onMoveNext = (offset) => {
            // analytics.setTrigger(trigger);
            analytics.logEvent(
                offset > 0 ? "nav_next_verse" : "nav_prev_verse",
                {
                    trigger,
                }
            );
            dispatch(gotoAya(history, verse + offset, { sel: true }));
        };
    }

    return (
        <div className="VerseInfo">
            {onMoveNext ? (
                <button
                    onClick={(e) => {
                        analytics.setTrigger(trigger);
                        onMoveNext(-1);
                    }}
                >
                    <Icon icon={faChevronUp} />
                </button>
            ) : (
                ""
            )}
            <button onClick={handleClick}>
                <div className="VerseInfoList">
                    <div>
                        <SuraName index={verseInfo.sura} />
                    </div>
                    <div>
                        <String
                            id="verse_num"
                            values={{ num: verseInfo.aya + 1 }}
                        />
                    </div>

                    {typeof children === "function"
                        ? children(verse)
                        : children}
                </div>
            </button>
            {onMoveNext ? (
                <button
                    onClick={(e) => {
                        analytics.setTrigger(trigger);
                        onMoveNext(1);
                    }}
                >
                    <Icon icon={faChevronDown} />
                </button>
            ) : (
                ""
            )}
        </div>
    );
};
