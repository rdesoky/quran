import {
    faCopy,
    faIndent,
    faSearch,
    faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { analytics } from "@/services/analytics";
import { arSuraNames, ayaIdInfo, verseLocation } from "@/services/qData";
import {
    copy2Clipboard,
    highlightSearch,
    normalizeText,
} from "@/services/utils";
import { selectAppHeight, selectPopupWidth } from "@/store/layoutSlice";
import { gotoAya, gotoSura, hideMask } from "@/store/navSlice";
import { selectLang } from "@/store/settingsSlice";
import { closePopupIfBlocking, showToast } from "@/store/uiSlice";
import AKeyboard from "../AKeyboard/AKeyboard";
import SuraName from "../SuraName";
import { quranNormalizedText, quranText } from "@/App";
import useSnapHeightToBottomOf from "@/hooks/useSnapHeightToBottomOff";

export default function Search() {
    const popupWidth = useSelector(selectPopupWidth);
    const input = useRef(null);
    const [searchTerm, setSearchTerm] = useState(
        localStorage.getItem("LastSearch") || ""
    );
    const [searchHistory, setSearchHistory] = useState(
        JSON.parse(localStorage.getItem("SearchHistory") || "[]")
    );
    const [results, setResults] = useState([]);
    const [pages, setPages] = useState(1);
    const [keyboard, setKeyboard] = useState(false);
    const [expandedGroup, setExpandedGroup] = useState(0);
    const [treeView, setTreeView] = useState(
        localStorage.getItem("searchTreeView") === "1"
    );
    const appHeight = useSelector(selectAppHeight);
    const dispatch = useDispatch();
    const history = useHistory();
    const lang = useSelector(selectLang);
    const resultsRef = useSnapHeightToBottomOf(appHeight - 8, searchTerm); // substract 8px for the bottom padding

    const resultsDiv = resultsRef.current;

    const toggleTreeView = (e) => {
        analytics.logEvent("search_toggle_view", {
            view_mode: treeView ? "list" : "tree",
        });
        localStorage.setItem("searchTreeView", !treeView ? "1" : "0");
        setTreeView(!treeView);
    };

    const showKeyboard = (e) => {
        setKeyboard(true);
    };
    const hideKeyboard = (e) => {
        setKeyboard(false);
    };

    const doSearch = useCallback((searchTerm) => {
        let sResults = [];
        let normSearchTerm = normalizeText(searchTerm);

        if (normSearchTerm.length > 0) {
            localStorage.setItem("LastSearch", searchTerm);
        }

        const verseList = quranText;
        if (verseList.length > 0 && normSearchTerm.length > 2) {
            sResults = quranNormalizedText.reduce((results, ntext, aya) => {
                if (ntext.includes(normSearchTerm)) {
                    results.push({
                        aya,
                        text: verseList[aya],
                        ntext: ntext,
                    });
                }
                return results;
            }, []);
        }
        setResults(sResults);
    }, []);

    useEffect(() => {
        analytics.setTrigger("search_ui");
        let textInput = input.current;
        setTimeout(function () {
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
    }, [doSearch, searchTerm]);

    const addToSearchHistory = () => {
        const filteredHistory = searchHistory.filter((s) => s !== searchTerm);
        if (filteredHistory.length === searchHistory.length) {
            // a new search has been added
            analytics.logEvent("search_text", {
                search_term: searchTerm,
                search_type: "new",
            });
        }

        //push the search to the top of the history
        let history = [searchTerm, ...filteredHistory];
        history = history.slice(0, 10); //keep last 10 items
        localStorage.setItem("SearchHistory", JSON.stringify(history));
        setSearchHistory(history);
    };

    //TODO: duplicate code with QIndex
    const onClickSura = ({ target }) => {
        dispatch(hideMask());
        setKeyboard(false);
        let index = parseInt(target.getAttribute("sura"));
        // app.gotoSura(index);
        dispatch(gotoSura(history, index));
        dispatch(closePopupIfBlocking());
    };

    const onClickAya = (e) => {
        const aya = e.target.getAttribute("aya");

        analytics.logEvent("click_search_result", {
            ...verseLocation(aya),
        });

        dispatch(closePopupIfBlocking());
        setKeyboard(false);
        dispatch(gotoAya(history, parseInt(aya), { sel: true }));
        addToSearchHistory();
        e.preventDefault();
    };

    const renderMore = () => {
        if (results.length > pages * 20) {
            return (
                <button
                    className="MoreResults"
                    onClick={(e) => setPages(pages + 1)}
                >
                    <String id="more" />
                    ...
                </button>
            );
        }
    };

    const toggleGroup = ({ currentTarget }) => {
        const groupId = parseInt(currentTarget.getAttribute("group-index"));
        if (groupId !== undefined) {
            setExpandedGroup(groupId === expandedGroup ? -1 : groupId);
            setTimeout(() => {
                currentTarget?.scrollIntoView?.({
                    behavior: "smooth",
                    block: "start",
                    inline: "nearest",
                });
            }, [300]);
        }
    };

    // const onResultKeyDown = e => {
    // 	if (e.key === "Enter") {
    // 		gotoAya(e);
    // 	}
    // };

    const nSearchTerm = normalizeText(searchTerm);

    const renderSuras = () => {
        if (nSearchTerm.length < 1) {
            return null;
        }

        const nSuraNames = normalizeText(arSuraNames.join(",")).split(",");

        return (
            <ul
                id="MatchedSuraNames"
                className="SpreadSheet"
                style={{
                    columnCount: Math.floor((popupWidth - 50) / 120), //-50px margin
                }}
            >
                {arSuraNames
                    .map((suraName, index) => {
                        return { name: suraName, index: index };
                    })
                    .filter(
                        (suraInfo) =>
                            nSuraNames[suraInfo.index].match(
                                new RegExp(nSearchTerm, "i")
                            ) !== null
                        // nSuraNames[suraInfo.index].indexOf(
                        //     nSearchTerm
                        // ) !== -1
                    )
                    .map((suraInfo) => {
                        return (
                            <li key={suraInfo.index}>
                                <button
                                    className="VerseLink"
                                    onClick={onClickSura}
                                    sura={suraInfo.index}
                                >
                                    {suraInfo.index + 1 + ". " + suraInfo.name}
                                </button>
                            </li>
                        );
                    })}
            </ul>
        );
    };

    const copyVerse = (e) => {
        const { currentTarget } = e;
        const verse = currentTarget.getAttribute("verse");
        const verseInfo = ayaIdInfo(verse);
        const text = quranText?.[verse];
        copy2Clipboard(`${text} (${verseInfo.sura + 1}:${verseInfo.aya + 1})`);
        dispatch(showToast({ id: "text_copied" }));
        e.stopPropagation();

        analytics.logEvent("copy_text", {
            ...verseLocation(verse),
            verses_count: 1,
            trigger: "search_results",
        });
    };

    const renderResultsTree = () => {
        const groups = results.reduce((groups, ayaInfo, index) => {
            const { sura, aya } = ayaIdInfo(ayaInfo.aya);
            let group = groups.find((g) => g.sura === sura);
            const ayaInfoEx = { ...ayaInfo, ayaNum: aya + 1 };
            if (group) {
                group.verses.push(ayaInfoEx);
            } else {
                groups.push({ sura, verses: [ayaInfoEx] });
            }
            return groups;
        }, []);

        return (
            <div
                className="ResultsList"
                onMouseDown={hideKeyboard}
                ref={resultsRef}
            >
                {groups.map(({ sura, verses }, i) => {
                    const expanded = expandedGroup === i;

                    return (
                        <div
                            key={i}
                            className={"ResultsGroup".appendWord(
                                "Expanded",
                                expanded
                            )}
                        >
                            <button
                                className="ResultsGroupHeader"
                                group-index={i}
                                onClick={toggleGroup}
                                tabIndex="0"
                            >
                                <span className="ParaId Chapter">
                                    {verses.length}
                                </span>
                                {sura + 1}.<SuraName index={sura} />
                            </button>
                            {!expanded ? null : (
                                <div className="ResultsGroupList">
                                    {verses.map(
                                        ({
                                            aya,
                                            ayaNum,
                                            text: ayaText,
                                            ntext: normalizedAyaText,
                                        }) => (
                                            <button
                                                key={aya}
                                                className="ResultItem"
                                                onClick={onClickAya}
                                                tabIndex="0"
                                                aya={aya}
                                            >
                                                <span className="ParaId Verse">
                                                    {ayaNum}
                                                </span>
                                                <span
                                                    className="ResultText link"
                                                    dangerouslySetInnerHTML={highlightSearch(
                                                        nSearchTerm,
                                                        ayaText,
                                                        normalizedAyaText
                                                    )}
                                                />
                                                <Icon
                                                    onClick={copyVerse}
                                                    icon={faCopy}
                                                    verse={aya}
                                                />
                                            </button>
                                        )
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        );
    };

    const renderResults = () => {
        // if (!results.length) {
        // 	return;
        // }
        let page = results.slice(0, pages * 20);
        return (
            <div
                className="ResultsList"
                onMouseDown={hideKeyboard}
                ref={resultsRef}
            >
                {page.map(
                    ({ aya, text: ayaText, ntext: normalizedAyaText }, i) => {
                        const ayaInfo = ayaIdInfo(aya);
                        return (
                            <button
                                key={aya}
                                onClick={onClickAya}
                                aya={aya}
                                className="ResultItem"
                                tabIndex="0"
                            >
                                <span className="ResultInfo">
                                    {ayaInfo.sura + 1}.
                                    <SuraName index={ayaInfo.sura} /> (
                                    {ayaInfo.aya + 1})
                                </span>
                                <span
                                    className="ResultText link"
                                    dangerouslySetInnerHTML={highlightSearch(
                                        nSearchTerm,
                                        ayaText,
                                        normalizedAyaText
                                    )}
                                />
                                <Icon
                                    onClick={copyVerse}
                                    icon={faCopy}
                                    verse={aya}
                                />
                            </button>
                        );
                    }
                )}
                {renderMore()}
            </div>
        );
    };

    const onHistoryButtonClick = (e) => {
        const searchTerm = e.target.textContent;
        setKeyboard(false);
        setSearchTerm(searchTerm);
        doSearch(searchTerm);
        analytics.logEvent("search_text", {
            search_term: searchTerm,
            search_type: "history",
        });
    };

    useEffect(() => {
        doSearch(searchTerm);
        setExpandedGroup(0); //to select first group on new search
    }, [doSearch, searchTerm]);

    const onSubmitSearch = (txt) => {
        let firstResult = resultsDiv.querySelector(".ResultItem");
        if (firstResult) {
            //Make sure there is at least one result
            firstResult.focus();
            addToSearchHistory();
        }
        setKeyboard(false);
    };

    const renderKeyboard = () => {
        if (keyboard) {
            return (
                <div
                    className="KeyboardFrame"
                    onTouchStart={(e) => {
                        e.stopPropagation();
                    }}
                    onMouseDown={(e) => {
                        e.stopPropagation();
                    }}
                >
                    <AKeyboard
                        initText={searchTerm}
                        onUpdateText={setSearchTerm}
                        onCancel={hideKeyboard}
                        onEnter={onSubmitSearch}
                    />
                </div>
            );
        }
    };

    const renderCursor = () => {
        return <span className="TypingCursor"></span>;
    };

    const clearSearch = (e) => {
        setSearchTerm("");
        e.stopPropagation();
    };

    const renderTypedText = () => {
        if (!searchTerm) {
            return <String id="search_prompt" />;
        }
        return (
            <>
                {searchTerm}
                {renderCursor()}
                <div className="ClearButton" onClick={clearSearch}>
                    <Icon icon={faTimes} />
                </div>
            </>
        );
    };

    return (
        <>
            <div className="Title">
                <div
                    ref={input}
                    className={
                        "TypingConsole" + (!searchTerm.length ? " empty" : "")
                    }
                    tabIndex="0"
                    onClick={showKeyboard}
                >
                    {results.length ? (
                        <span
                            className="ParaId Chapter"
                            style={{
                                marginLeft: lang === "ar" ? 20 : 10,
                                fontSize: ".8em",
                            }}
                        >
                            {results.length}
                        </span>
                    ) : null}
                    {renderTypedText()}
                </div>
                <button className="CommandButton" onClick={onSubmitSearch}>
                    <Icon icon={faSearch} />
                </button>
                {results.length ? (
                    <button
                        id="SearchViewToggler"
                        className={"TreeToggler".appendWord("active", treeView)}
                        onClick={toggleTreeView}
                    >
                        <Icon icon={faIndent} />
                    </button>
                ) : null}
            </div>
            {searchTerm.length === 0 && (
                <div id="SearchHistory">
                    {searchHistory.map((s, i) => {
                        return (
                            <button key={i} onClick={onHistoryButtonClick}>
                                {s}
                            </button>
                        );
                    })}
                </div>
            )}

            <div
                className="PopupBody"
                onTouchStart={hideKeyboard}
                onMouseDown={hideKeyboard}
                // ref={bodyRef}
                style={{ marginTop: 0 }}
            >
                {/* <div className="ResultsInfo">
                    {results.length ? (
                        <button
                            id="SearchViewToggler"
                            className={"TreeToggler".appendWord(
                                "active",
                                treeView
                            )}
                            onClick={toggleTreeView}
                        >
                            <Icon icon={faIndent} />
                        </button>
                    ) : null}
                    <String className="SuraTitle" id="results_for">
                        {(resultsFor) => {
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
                </div> */}
                {renderSuras()}
                {treeView ? renderResultsTree() : renderResults()}
                {renderKeyboard()}
            </div>
        </>
    );
}
