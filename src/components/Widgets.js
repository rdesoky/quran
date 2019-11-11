import React, { useState, useEffect, useContext } from "react";
import QData from "./../services/QData";
import { AppConsumer, AppContext } from "./../context/App";
import { FormattedMessage as String } from "react-intl";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faChevronUp, faChevronDown } from "@fortawesome/free-solid-svg-icons";

const VerseInfo = ({
    verse,
    show,
    children,
    onClick,
    onMoveNext,
    navigate = false
}) => {
    const app = useContext(AppContext);

    if (verse === undefined || verse === -1) {
        verse = app.selectStart;
    }
    if (show === false) {
        return "";
    }

    const handleClick = e => {
        if (typeof onClick === "function") {
            onClick(verse);
        } else {
            app.gotoAya(verse, { sel: true });
        }
    };

    const verseInfo = QData.ayaIdInfo(verse);

    if (navigate) {
        onMoveNext = offset => {
            app.gotoAya(verse + offset, { sel: true });
        };
    }

    return (
        <div className="VerseInfo">
            {onMoveNext ? (
                <button
                    onClick={e => {
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
                        <String id="sura_names">
                            {sura_names => (
                                <>{sura_names.split(",")[verseInfo.sura]}</>
                            )}
                        </String>
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
                    onClick={e => {
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
const VerseText = ({ verse, showInfo, navigate = true }) => {
    const [text, setText] = useState("");
    const app = useContext(AppContext);

    const updateText = verseIndex => {
        const verseList = app.verseList();
        setText(verseIndex < verseList.length ? verseList[verseIndex] : "");
    };

    useEffect(() => {
        if (verse !== undefined) {
            updateText(verse);
        }
    }, [verse]);

    useEffect(() => {
        if (verse === undefined) {
            updateText(app.selectStart);
        }
    }, [app.selectStart]);

    return (
        <div className="VerseText">
            {showInfo ? <VerseInfo navigate={navigate} /> : ""}
            {text}
        </div>
    );
};

export { VerseInfo, VerseText };
