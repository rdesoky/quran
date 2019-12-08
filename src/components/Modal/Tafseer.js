import React, { useState, useEffect, useContext } from "react";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "../../context/App";
import { PlayerConsumer, PlayerContext } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faAngleLeft,
    faAngleRight,
    faCopy,
    faQuran
} from "@fortawesome/free-solid-svg-icons";
import { VerseInfo, VerseText } from "../Widgets";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import Utils from "../../services/utils";
import { CommandButton } from "./Commands";

const TafseerList = [
    { id: "muyassar", name: "الميسر", dir: "rtl", file: "ar.muyassar.txt" },
    { id: "jalalayn", name: "الجلالين", dir: "rtl", file: "ar.jalalayn.txt" },
    { id: "yusufali", name: "English", dir: "ltr", file: "en.yusufali.txt" },
    { id: "farooq", name: "हिंदू", dir: "ltr", file: "hi.farooq.txt" },
    {
        id: "indonesian",
        name: "bahasa Indonesia",
        dir: "ltr",
        file: "id.indonesian.txt"
    },
    { id: "bornez", name: "española", dir: "ltr", file: "es.bornez.txt" },
    {
        id: "hamidullah",
        name: "française",
        dir: "ltr",
        file: "fr.hamidullah.txt"
    },
    { id: "piccardo", name: "italiana", dir: "ltr", file: "it.piccardo.txt" },
    { id: "japanese", name: "日本人", dir: "ltr", file: "ja.japanese.txt" },
    { id: "muntahab", name: "русский", dir: "ltr", file: "ru.muntahab.txt" }
];

const Tafseer = () => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const [verse, setVerse] = useState(app.selectStart);

    const offsetSelection = offset => {
        // setVerse(verse + offset);
        app.gotoAya(verse + offset, { sel: true });
    };

    useEffect(() => {
        if (app.maskStart !== -1) {
            setVerse(app.maskStart - 1);
        } else {
            setVerse(app.selectStart);
        }
    }, [app.selectStart, app.maskStart]);

    useEffect(() => {
        if (player.playingAya !== -1) {
            setVerse(player.playingAya);
        }
    }, [player.playingAya]);

    return (
        <>
            <div className="Title">
                <String id="tafseer" />
                {app.isNarrow ? (
                    <>
                        <PlayerButtons trigger="tafseer_title" />
                        <CommandButton command="Exercise" />
                    </>
                ) : (
                    ""
                )}
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <TafseerView
                    verse={verse}
                    onMoveNext={offsetSelection}
                    bookmark={true}
                    copy={true}
                />
            </div>
        </>
    );
};

export const TafseerView = ({
    verse,
    onMoveNext,
    showVerse = true,
    bookmark = false,
    copy = false
}) => {
    const [tafseer, setTafseer] = useState(
        localStorage.getItem("tafseer") || "muyassar"
    );
    const [tafseerData, setTafseerData] = useState([]);

    const app = useContext(AppContext);

    useEffect(() => {
        let fileName = TafseerList.find(i => i.id === tafseer).file;
        let controller = new AbortController();
        let url = `${process.env.PUBLIC_URL}/${fileName}`;
        fetch(url, { signal: controller.signal })
            .then(r => r.text())
            .then(txt => {
                setTafseerData(txt.split("\n"));
            })
            .catch(e => {
                const { name, message } = e;
                console.info(`${name}: ${message}\n${url}`);
            });

        return () => {
            controller.abort();
        };
    }, [tafseer]);

    const renderTafseer = () => {
        if (tafseerData.length > verse) {
            //validate aya exists whithin tafseer array
            return tafseerData[verse];
        }
        return "Loading...";
    };

    const tafseerName = () =>
        TafseerList.find(item => item.id === tafseer).name;

    const copyTafseer = e => {
        const verseInfo = QData.ayaIdInfo(verse);
        const text = tafseerData[verse];
        Utils.copy2Clipboard(
            `${tafseerName()}:\n ${text} (${verseInfo.sura +
                1}:${verseInfo.aya + 1})`
        );
        app.showToast(app.intl.formatMessage({ id: "text_copied" }));
    };

    const onSelectTafseer = e => {
        const { target: option } = e;
        const tafseer = option.value;
        localStorage.setItem("tafseer", option.value);
        setTafseer(tafseer);
    };

    const renderSelector = () => {
        return (
            <select onChange={onSelectTafseer} value={tafseer}>
                {TafseerList.map(taf => {
                    return (
                        <option key={taf.id} value={taf.id}>
                            {taf.name}
                        </option>
                    );
                })}
            </select>
        );
    };

    const tafDirection = () => {
        return TafseerList.find(i => i.id === tafseer).dir;
    };

    const tafTextAlign = () => {
        return TafseerList.find(i => i.id === tafseer).dir === "ltr"
            ? "left"
            : "right";
    };

    return (
        <div className="TafseerView">
            <div>
                {showVerse ? (
                    <VerseInfo
                        trigger="tafseer_view"
                        onMoveNext={onMoveNext}
                        verse={verse}
                    />
                ) : (
                    ""
                )}
                <div className="TafseerVerse">
                    <VerseText verse={verse} bookmark={bookmark} copy={copy} />
                </div>
            </div>
            <div>
                <p
                    className="TafseerText"
                    style={{
                        direction: tafDirection(),
                        textAlign: tafTextAlign()
                    }}
                >
                    {renderSelector()}
                    {" - "}
                    {renderTafseer()}
                    {copy ? (
                        <button onClick={copyTafseer}>
                            <Icon icon={faCopy} />
                        </button>
                    ) : null}
                </p>
            </div>
        </div>
    );
};
export default Tafseer;
