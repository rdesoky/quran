import React, { useState, useEffect } from "react";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer } from "../../context/Player";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";

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

const Tafseer = ({ app, player }) => {
    const [tafseer, setTafseer] = useState(
        localStorage.getItem("tafseer") || "muyassar"
    );
    const [tafseerData, setTafseerData] = useState([]);

    const handleKeyDown = e => {
        switch (e.code) {
            case "ArrowDown":
            case "ArrowLeft":
                offsetSelection(1);
                break;
            case "ArrowUp":
            case "ArrowRight":
                offsetSelection(-1);
                break;
            default:
                return;
        }
    };

    const offsetSelection = offset => {
        const ayaId = app.offsetSelection(offset);
        app.gotoAya(ayaId);
    };

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

        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
            controller.abort();
        };
    }, [tafseer]);

    const playingAya = () => {
        const { selectStart, selectEnd } = app;
        const { playingAya } = player;
        let aya = selectStart;
        if (selectEnd != selectStart && playingAya !== -1) {
            aya = playingAya;
        }
        return aya;
    };

    const renderVerse = () => {
        const aya = playingAya();
        const verseList = app.verseList();
        if (verseList.length > aya) {
            return verseList[aya];
        }
    };
    const renderTafseer = () => {
        const aya = playingAya();
        if (tafseerData.length > aya) {
            //validate aya exists whithin tafseer array
            return tafseerData[aya];
        }
        return "Loading...";
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

    const ayaInfo = QData.ayaIdInfo(app.selectStart);

    return (
        <>
            <div className="Title">
                <button onClick={e => offsetSelection(-1)}>
                    <FontAwesomeIcon icon={faAngleRight} />
                </button>
                <FormattedMessage id="sura_names">
                    {sura_names => (
                        <span className="FlexTitle">
                            {sura_names.split(",")[ayaInfo.sura] +
                                ` - ${ayaInfo.aya + 1}`}
                        </span>
                    )}
                </FormattedMessage>
                <button onClick={e => offsetSelection(1)}>
                    <FontAwesomeIcon icon={faAngleLeft} />
                </button>
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <div>
                    <p className="TafseerVerse">{renderVerse()}</p>
                </div>
                <div>
                    <p
                        className="TafseerText"
                        style={{ direction: tafDirection() }}
                    >
                        {renderSelector()}
                        {" - "}
                        {renderTafseer()}
                    </p>
                </div>
            </div>
        </>
    );
};

export default AppConsumer(PlayerConsumer(Tafseer));
