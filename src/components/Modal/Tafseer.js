import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { ayaIdInfo } from "../../services/QData";
import { copy2Clipboard } from "../../services/utils";
import { selectAppHeight, selectIsNarrow } from "../../store/layoutSlice";
import {
    gotoAya,
    selectMaskStart,
    selectStartSelection,
} from "../../store/navSlice";
import { showToast } from "../../store/uiSlice";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { VerseInfo, VerseText } from "../Widgets";

const TafseerList = [
    { id: "muyassar", name: "الميسر", dir: "rtl", file: "ar.muyassar.txt" },
    { id: "jalalayn", name: "الجلالين", dir: "rtl", file: "ar.jalalayn.txt" },
    { id: "yusufali", name: "English", dir: "ltr", file: "en.yusufali.txt" },
    { id: "farooq", name: "हिंदू", dir: "ltr", file: "hi.farooq.txt" },
    {
        id: "indonesian",
        name: "bahasa Indonesia",
        dir: "ltr",
        file: "id.indonesian.txt",
    },
    { id: "bornez", name: "española", dir: "ltr", file: "es.bornez.txt" },
    {
        id: "hamidullah",
        name: "française",
        dir: "ltr",
        file: "fr.hamidullah.txt",
    },
    { id: "piccardo", name: "italiana", dir: "ltr", file: "it.piccardo.txt" },
    { id: "japanese", name: "日本人", dir: "ltr", file: "ja.japanese.txt" },
    { id: "muntahab", name: "русский", dir: "ltr", file: "ru.muntahab.txt" },
];

const Tafseer = () => {
    const appHeight = useSelector(selectAppHeight);
    const selectStart = useSelector(selectStartSelection);
    const [verse, setVerse] = useState(selectStart);
    const isNarrow = useSelector(selectIsNarrow);
    const dispatch = useDispatch();
    const history = useHistory();
    const maskStart = useSelector(selectMaskStart);

    const offsetSelection = (offset) => {
        // setVerse(verse + offset);
        // app.gotoAya(verse + offset, { sel: true });
        dispatch(gotoAya(history, verse + offset, { sel: true }));
    };

    useEffect(() => {
        if (maskStart !== -1) {
            setVerse(maskStart - 1);
        } else {
            setVerse(selectStart);
        }
    }, [selectStart, maskStart]);

    // useEffect(() => {
    //     if (playingAya !== -1) {
    //         setVerse(playingAya);
    //     }
    // }, [playingAya]);

    return (
        <>
            <div className="Title">
                {" "}
                <String id="tafseer" />
                {isNarrow ? <PlayerButtons trigger="tafseer_title" /> : null}
            </div>
            <div className="PopupBody">
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
    showVerseText = true,
    bookmark = false,
    copy = false,
    trigger = "tafseer_view",
}) => {
    const [tafseer, setTafseer] = useState(
        localStorage.getItem("tafseer") || "muyassar"
    );
    const [tafseerData, setTafseerData] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        let fileName = TafseerList.find((i) => i.id === tafseer).file;
        let controller = new AbortController();
        let url = `${process.env.PUBLIC_URL}/translation/${fileName}`;
        fetch(url, { signal: controller.signal })
            .then((r) => r.text())
            .then((txt) => {
                setTafseerData(txt.split("\n"));
            })
            .catch((e) => {
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
        TafseerList.find((item) => item.id === tafseer).name;

    const copyTafseer = (e) => {
        const verseInfo = ayaIdInfo(verse);
        const text = tafseerData[verse];
        copy2Clipboard(
            `${tafseerName()}:\n ${text} (${verseInfo.sura + 1}:${
                verseInfo.aya + 1
            })`
        );
        // app.showToast(app.intl.formatMessage({ id: "text_copied" }));
        dispatch(showToast({ id: "text_copied" }));
    };

    const onSelectTafseer = (e) => {
        const { target: option } = e;
        const tafseer = option.value;
        localStorage.setItem("tafseer", option.value);
        setTafseer(tafseer);
    };

    const renderSelector = () => {
        return (
            <select onChange={onSelectTafseer} value={tafseer}>
                {TafseerList.map((taf) => {
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
        return TafseerList.find((i) => i.id === tafseer).dir;
    };

    const tafTextAlign = () => {
        return TafseerList.find((i) => i.id === tafseer).dir === "ltr"
            ? "left"
            : "right";
    };

    return (
        <div className="TafseerView">
            <div>
                {showVerse && showVerseText && (
                    <VerseInfo
                        // trigger="tafseer_view"
                        // onMoveNext={onMoveNext}
                        navigate={true}
                        verse={verse}
                        trigger={trigger}
                    />
                )}
                {showVerseText && (
                    <div className="TafseerVerse">
                        <VerseText
                            verse={verse}
                            bookmark={bookmark}
                            copy={copy}
                            trigger="tafseer_viwe"
                        />
                    </div>
                )}
            </div>
            <div>
                <p
                    className="TafseerText"
                    style={{
                        direction: tafDirection(),
                        textAlign: tafTextAlign(),
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
