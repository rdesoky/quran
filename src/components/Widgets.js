import React from "react";
import QData from "./../services/QData";
import { AppConsumer } from "./../context/App";
import { FormattedMessage as String } from "react-intl";

const VerseInfo = AppConsumer(({ app, verse, show, children, onClick }) => {
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
            app.gotoAya(verse);
        }
    };

    const verseInfo = QData.ayaIdInfo(verse);

    return (
        <button className="VerseInfo" onClick={handleClick}>
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
                {typeof children === "function" ? children(verse) : children}
            </div>
        </button>
    );
});

const VerseText = AppConsumer(({ verse, app }) => {
    if (verse === undefined) {
        verse = app.selectStart;
    }
    const verseList = app.verseList();
    return <div>{verse < verseList.length ? verseList[verse] : ""}</div>;
});

export { VerseInfo, VerseText };
