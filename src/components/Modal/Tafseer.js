import React, { useState, useEffect } from "react";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
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
    const [verse, setVerse] = useState(app.selectStart);

    const offsetSelection = offset => {
        setVerse(verse + offset);
    };

    useEffect(() => {
        setVerse(app.selectStart);
    }, [app.selectStart]);

    useEffect(() => {
        if (player.playingAya !== -1) {
            setVerse(player.playingAya);
        }
    }, [player.playingAya]);

    const ayaInfo = QData.ayaIdInfo(verse);

    return (
        <>
            <div className="Title">
                <button onClick={e => offsetSelection(-1)}>
                    <Icon icon={faAngleRight} />
                </button>
                <button onClick={e => app.gotoAya(verse, { sel: true })}>
                    <String id="sura_names">
                        {sura_names =>
                            sura_names.split(",")[ayaInfo.sura] +
                            ` - ${ayaInfo.aya + 1}`
                        }
                    </String>
                </button>
                <button onClick={e => offsetSelection(1)}>
                    <Icon icon={faAngleLeft} />
                </button>
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <TafseerView verse={verse} />
            </div>
        </>
    );
};

const TafseerView = AppConsumer(({ app, verse }) => {
    const [tafseer, setTafseer] = useState(
        localStorage.getItem("tafseer") || "muyassar"
    );
    const [tafseerData, setTafseerData] = useState([]);

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

    const renderVerse = () => {
        // const aya = playingAya();
        const verseList = app.verseList();
        if (verseList.length > verse) {
            return verseList[verse];
        }
    };
    const renderTafseer = () => {
        if (tafseerData.length > verse) {
            //validate aya exists whithin tafseer array
            return tafseerData[verse];
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
    return (
        <>
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
        </>
    );
});

export default AppConsumer(PlayerConsumer(Tafseer));
export { TafseerView };
