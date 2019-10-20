import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import Utils from "./../../services/utils";
import AKeyboard from "../AKeyboard/AKeyboard";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";

const Search = ({ app }) => {
    const input = useRef(null);
    const [searchTerm, setSearchTerm] = useState(
        localStorage.getItem("LastSearch") || ""
    );
    const [searchHistory, setSearchHistory] = useState(
        JSON.parse(localStorage.getItem("SearchHistory") || "[]")
    );
    const [results, setResults] = useState([]);
    const [pages, setPages] = useState(1);
    const [keyboard, setkeyboard] = useState(false);

    let resultsDiv;

    const showKeyboard = e => {
        setkeyboard(true);
    };
    const hideKeyboard = e => {
        setkeyboard(false);
    };

    useEffect(() => {
        let textInput = input.current;
        setTimeout(function() {
            textInput.focus();
            // textInput.select();
        }, 100);
        doSearch(searchTerm);
        // textInput.addEventListener("blur", hideKeyboard);
        textInput.addEventListener("focus", showKeyboard);
        return () => {
            // textInput.removeEventListener("blur", hideKeyboard);
            textInput.removeEventListener("focus", showKeyboard);
        };
    }, []);

    const addToSearchHistory = () => {
        let history = [
            searchTerm,
            ...searchHistory.filter(s => s !== searchTerm)
        ];
        history = history.slice(0, 10); //keep last 10 items
        localStorage.setItem("SearchHistory", JSON.stringify(history));
        setSearchHistory(history);
    };

    //TODO: duplicate code with QIndex
    const gotoSura = ({ target }) => {
        app.hideMask();
        setkeyboard(false);
        let index = parseInt(target.getAttribute("sura"));
        app.gotoSura(index);
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
    };

    const gotoAya = e => {
        const aya = e.target.getAttribute("aya");
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
        setkeyboard(false);
        app.gotoAya(parseInt(aya), { sel: true });
        addToSearchHistory();
        e.preventDefault();
    };

    const renderMore = () => {
        if (results.length > pages * 20) {
            return (
                <button
                    className="MoreResults"
                    onClick={e => setPages(pages + 1)}
                >
                    <String id="more" />
                    ...
                </button>
            );
        }
    };

    // const onResultKeyDown = e => {
    // 	if (e.key === "Enter") {
    // 		gotoAya(e);
    // 	}
    // };

    const nSearchTerm = Utils.normalizeText(searchTerm);
    const renderSuras = () => {
        if (nSearchTerm.length < 1) {
            return null;
        }
        return (
            <ul
                id="MatchedSuraNames"
                className="SpreadSheet"
                style={{
                    columnCount: Math.floor((app.popupWidth() - 50) / 120) //-50px margin
                }}
            >
                <String id="sura_names">
                    {sura_names => {
                        const nSuraNames = Utils.normalizeText(
                            sura_names
                        ).split(",");
                        return sura_names
                            .split(",")
                            .map((suraName, index) => {
                                return { name: suraName, index: index };
                            })
                            .filter(
                                suraInfo =>
                                    nSuraNames[suraInfo.index].indexOf(
                                        nSearchTerm
                                    ) !== -1
                            )
                            .map(suraInfo => {
                                return (
                                    <li key={suraInfo.index}>
                                        <button
                                            onClick={gotoSura}
                                            sura={suraInfo.index}
                                        >
                                            {suraInfo.index +
                                                1 +
                                                ". " +
                                                suraInfo.name}
                                        </button>
                                    </li>
                                );
                            });
                    }}
                </String>
            </ul>
        );
    };

    const renderResults = () => {
        // if (!results.length) {
        // 	return;
        // }
        let page = results.slice(0, pages * 20);
        return (
            <ol
                className="ResultsList"
                onMouseDown={hideKeyboard}
                style={
                    {
                        // maxHeight:
                        // app.pageHeight() - 175 - (app.playerVisible ? 60 : 0)
                    }
                }
                ref={ref => {
                    resultsDiv = ref;
                }}
            >
                {page.map(
                    ({ aya, text: ayaText, ntext: normalizedAyaText }, i) => {
                        const ayaInfo = QData.ayaIdInfo(aya);
                        return (
                            <String id="sura_names" key={i}>
                                {sura_names => (
                                    <li className="ResultItem">
                                        <button onClick={gotoAya} aya={aya}>
                                            <span className="ResultInfo">
                                                {sura_names.split(",")[
                                                    ayaInfo.sura
                                                ] + ` (${ayaInfo.aya + 1})`}
                                            </span>
                                            <span
                                                className="ResultText link"
                                                dangerouslySetInnerHTML={Utils.hilightSearch(
                                                    nSearchTerm,
                                                    ayaText,
                                                    normalizedAyaText
                                                )}
                                            />
                                        </button>
                                        {/* <div>{text}</div>
									<div>{ntext}</div> */}
                                    </li>
                                )}
                            </String>
                        );
                    }
                )}
                {renderMore()}
            </ol>
        );
    };

    useEffect(() => {
        doSearch(searchTerm);
    }, [searchTerm]);

    const onHistoryButtonClick = e => {
        const searchTerm = e.target.textContent;
        setkeyboard(false);
        setSearchTerm(searchTerm);
        doSearch(searchTerm);
    };

    const doSearch = searchTerm => {
        let sResults = [];
        let normSearchTerm = Utils.normalizeText(searchTerm);

        if (normSearchTerm.length > 0) {
            localStorage.setItem("LastSearch", searchTerm);
        }

        const verseList = app.verseList();
        if (verseList.length > 0 && normSearchTerm.length > 2) {
            sResults = app.normVerseList().reduce((results, ntext, aya) => {
                if (ntext.includes(normSearchTerm)) {
                    results.push({ aya, text: verseList[aya], ntext: ntext });
                }
                return results;
            }, []);
        }
        setResults(sResults);
    };

    const onSubmitSearch = txt => {
        let firstResult = resultsDiv.querySelector("button");
        if (firstResult) {
            firstResult.focus();
            addToSearchHistory();
        }
        setkeyboard(false);
        // e.preventDefault();
    };

    const renderKeyboard = () => {
        if (keyboard) {
            return (
                <div
                    className="KeyboardFrame"
                    onTouchStart={e => {
                        e.stopPropagation();
                    }}
                    onMouseDown={e => {
                        e.stopPropagation();
                    }}
                >
                    <AKeyboard
                        initText={searchTerm}
                        onUpdateText={setSearchTerm}
                        onEnter={hideKeyboard}
                        onCancel={hideKeyboard}
                        onEnter={onSubmitSearch}
                    />
                </div>
            );
        }
    };

    const formHeight = 130,
        resultsInfoHeight = 20;

    return (
        <>
            <div className="Title">
                {/* <div>
                    <form id="SearchForm" onSubmit={onSubmitSearch}>
                        <input
                            placeholder="Search suras' name or content"
                            className="SearchInput"
                            inputMode="search"
                            ref={input}
                            type="text"
                            value={searchTerm}
                            onChange={onChangeSearchInput}
                        />
                        <button type="submit">
                            <String id="search" />
                        </button>
                    </form>
                </div> */}
                <div
                    ref={input}
                    className={
                        "TypingConsole" + (!searchTerm.length ? " empty" : "")
                    }
                    tabIndex="0"
                    onClick={showKeyboard}
                >
                    {searchTerm.length
                        ? searchTerm
                        : "Search suras' name or content"}
                </div>
                <div className="ButtonsBar">
                    <button onClick={onSubmitSearch}>
                        <FontAwesomeIcon icon={faSearch} />
                    </button>
                </div>
            </div>
            <div id="SearchHistory">
                {searchHistory.map((s, i) => {
                    return (
                        <button key={i} onClick={onHistoryButtonClick}>
                            {s}
                        </button>
                    );
                })}
            </div>
            <div className="ResultsInfo" style={{ height: resultsInfoHeight }}>
                <String className="SuraTitle" id="results_for">
                    {resultsFor => {
                        if (searchTerm.length) {
                            return (
                                <>
                                    {results.length +
                                        " " +
                                        resultsFor +
                                        " " +
                                        searchTerm}
                                </>
                            );
                        }
                        return null;
                    }}
                </String>
            </div>
            <div
                className="PopupBody"
                onTouchStart={hideKeyboard}
                onMouseDown={hideKeyboard}
                style={{
                    height: app.appHeight - formHeight - 26 // footer + padding + formMargins
                }}
            >
                {renderSuras()}
                {renderResults()}
                {renderKeyboard()}
            </div>
        </>
    );
};

export default AppConsumer(Search);
