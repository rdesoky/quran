import React, { useEffect, useState, useCallback } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import { PlayerConsumer, AudioState } from "./../../context/Player";
import AKeyboard from "../AKeyboard/AKeyboard";
import Utils from "./../../services/utils";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import QData from "./../../services/QData";

// const useForceUpdate = useCallback(() => updateState({}), []);
// const useForceUpdate = () => useState()[1];

const VerseInfo = AppConsumer(({ app, verse, show }) => {
    if (verse === undefined) {
        verse = app.selectStart;
    }
    if (show === false) {
        return "";
    }
    const verseInfo = QData.ayaIdInfo(verse);

    return (
        <String id="sura_names">
            {sura_names => (
                <>
                    {sura_names.split(",")[verseInfo.sura]}:{verseInfo.aya + 1}
                </>
            )}
        </String>
    );
});

const VerseText = AppConsumer(({ verse, app }) => {
    if (verse === undefined) {
        verse = app.selectStart;
    }
    const verseList = app.verseList();
    return <div>{verse < verseList.length ? verseList[verse] : ""}</div>;
});

const Exercise = ({ app, player }) => {
    const [currStep, setCurrStep] = useState("");
    const [verse, setVerse] = useState(app.selectStart);
    const [duration, setDuration] = useState(-1);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [counterInterval, setCounterInterval] = useState(null);
    const [answerText, setAnswerText] = useState("");
    const [wrongWord, setWrongWord] = useState(-1);
    const [missingWords, setMissingWords] = useState(0);
    const verseList = app.verseList();
    const normVerseList = app.normVerseList();
    // const forceUpdate = useForceUpdate();

    const isNarrowLayout = () => {
        return !(app.isWide || app.isCompact || app.pagesCount > 1);
    };

    const gotoRandomVerse = e => {
        player.stop();
        player.setPlayingAya(-1);
        const new_verse = Math.floor(Math.random() * verseList.length);
        app.gotoAya(new_verse, { sel: true });
        app.setMaskStart(new_verse + 1, true);
        setCurrStep("intro");
        if (currStep === "intro" && defaultButton) {
            defaultButton.focus();
        }
    };

    const startReciting = e => {
        setCurrStep("reciting");
        app.setMaskStart(verse + 1, true);
    };

    const redoReciting = e => {
        setAnswerText("");
        startReciting(e);
    };

    const stopCounter = () => {
        if (counterInterval) {
            clearInterval(counterInterval);
            setCounterInterval(null);
        }
    };

    const startAnswer = () => {
        setTimeout(() => {
            player.stop(true);
        });
        // stopCounter();
        setCurrStep("typing");
    };

    let defaultButton = null;

    useEffect(() => {
        setVerse(app.selectStart);
        setAnswerText("");
    }, [app.selectStart]);

    useEffect(() => {
        const savedRepeat = player.setRepeat(5); //single verse
        const savedFollowPlayer = player.setFollowPlayer(true);
        player.stop(true);
        setCurrStep("intro");
        return () => {
            player.setRepeat(savedRepeat);
            player.setFollowPlayer(savedFollowPlayer);
            player.stop(true);
            app.setModalPopup(false);
            app.hideMask();
        };
    }, []);

    useEffect(() => {
        if (defaultButton) {
            defaultButton.focus();
        }
        switch (currStep) {
            case "typing":
                app.setMaskStart(verse);
                app.setModalPopup(); //block outside selection
                break;
            case "reciting":
                player.play();
                app.setModalPopup(); //block outside selection
                break;
            case "results":
                app.setModalPopup(); //block outside selection
                break;
            case "intro":
                // app.setMaskStart(verse + 1, true);
                app.hideMask();
            default:
                app.setModalPopup(false); //allow selecting outside
        }
    }, [currStep]);

    //monitor player to start answer upon player ends
    useEffect(() => {
        if (player.audioState === AudioState.stopped) {
            stopCounter();
            if (["reciting"].includes(currStep)) {
                startAnswer();
            }
        }
        if (
            ["typing", "intro", "results"].includes(currStep) &&
            player.audioState === AudioState.playing
        ) {
            app.gotoAya(player.playingAya, { sel: true });
            setTimeout(startReciting, 200);
        }

        if (player.audioState == AudioState.playing) {
            setDuration(player.trackDuration());
            setRemainingTime(player.trackRemainingTime());
            stopCounter();
            setCounterInterval(
                setInterval(() => {
                    setRemainingTime(player.trackRemainingTime());
                }, 1000)
            );
        }
    }, [player.audioState]);

    const renderCounter = () => {
        if (!counterInterval) {
            return <span>&nbsp;</span>;
        }

        return (
            <span>
                {"-"}
                {/* {Math.floor(remainingTime) + "/" + Math.floor(duration)} */
                Math.floor(remainingTime)}
            </span>
        );
    };

    const showIntro = () => {
        setCurrStep("intro");
    };

    const answerNextVerse = () => {
        app.setMaskStart(verse + 1);
        app.gotoAya(verse + 1);
        setTimeout(startAnswer, 1);
    };

    const renderTitle = () => {
        switch (currStep) {
            case "intro":
                return renderIntroTitle();

            case "typing":
                return renderTypingTitle();

            case "results":
                return renderResultsTitle();

            case "reciting":
                return renderRecitingTitle();
        }
    };

    const renderIntro = () => {
        if (isNarrowLayout()) {
            return "";
        }
        return (
            <>
                <div className="ContentTitle">
                    <VerseInfo />
                </div>
                <h3>
                    <VerseText />
                </h3>
            </>
        );
    };

    const renderIntroTitle = () => {
        return (
            <>
                <VerseInfo show={isNarrowLayout()} />
                <div className="ButtonsBar">
                    <button
                        onClick={startAnswer}
                        ref={ref => {
                            defaultButton = ref;
                        }}
                    >
                        <String id="answer" />
                    </button>
                    <button onClick={startReciting}>
                        <String id="start" />
                    </button>
                    <button onClick={gotoRandomVerse}>
                        <String id="new_verse" />
                    </button>
                </div>
            </>
        );
    };

    const onUpdateText = text => {
        setAnswerText(text);
        //test written words ( except the last one )
        setWrongWord(-1);
        setMissingWords(0);
        testAnswer(text.replace(/\S+$/, ""));
        // forceUpdate();
    };

    const onFinishedTyping = () => {
        testAnswer(answerText);
        app.setMaskStart(app.selectStart + 1, true);
        setCurrStep("results");
    };

    const testAnswer = answerText => {
        const normVerse = normVerseList[verse].trim();
        const normAnswerText = Utils.normalizeText(answerText).trim();
        const correctWords = normVerse.split(/\s+/);
        if (!answerText.trim().length) {
            setMissingWords(correctWords.length);
            return;
        }
        const answerWords = normAnswerText.split(/\s+/);

        let wrongWord = -1,
            index;

        for (index = 0; index < answerWords.length; index++) {
            const correctWord = correctWords[index];
            const answerWord =
                index < answerWords.length ? answerWords[index] : "";
            if (answerWord != correctWord) {
                wrongWord = index;
                break;
            }
        }
        if (wrongWord == -1 && answerWords.length > correctWords.length) {
            //wrote extra words
            wrongWord = correctWords.length;
        }

        setWrongWord(wrongWord);
        setMissingWords(correctWords.length - answerWords.length);
    };

    const renderTypingTitle = () => {
        // const correct = wrongWord === -1;
        return (
            <>
                <VerseInfo />
                {/* <div className={"iBlock " + (correct ? "Correct" : "Wrong")}>
                    <Icon icon={correct ? faThumbsUp : faThumbsDown} />
                </div> */}
                <div className="ButtonsBar">
                    <button onClick={startReciting}>
                        <String id="start" />
                    </button>
                    <button onClick={answerNextVerse}>
                        <String id="next_verse" />
                    </button>
                    <button onClick={showIntro}>
                        <String id="cancel" />
                    </button>
                </div>
            </>
        );
    };
    const renderTypingConsole = () => {
        const correct = wrongWord === -1;
        return (
            <>
                <div
                    style={{
                        position: "relative",
                        height: app.appHeight - 248 //keyboard and title heights
                    }}
                >
                    <div
                        tabIndex="0"
                        ref={ref => {
                            defaultButton = ref;
                        }}
                        className={
                            "TypingConsole" +
                            (!answerText.length
                                ? " empty"
                                : correct
                                ? " Correct"
                                : " Wrong")
                        }
                    >
                        {answerText || <String id="writing_prompt" />}
                    </div>
                </div>
                <AKeyboard
                    initText={answerText}
                    onUpdateText={onUpdateText}
                    onEnter={onFinishedTyping}
                    onCancel={showIntro}
                />
            </>
        );
    };

    const redoTyping = e => {
        setAnswerText("");
        startAnswer(e);
    };

    const renderResultsTitle = () => {
        return (
            <>
                <VerseInfo />
                <div className="ButtonsBar">
                    {isCorrect() ? (
                        //correct answer
                        <>
                            <button
                                ref={ref => {
                                    defaultButton = ref;
                                }}
                                onClick={answerNextVerse}
                            >
                                <String id="next_verse" />
                            </button>
                            <button onClick={gotoRandomVerse}>
                                <String id="new_verse" />
                            </button>
                        </>
                    ) : (
                        <>
                            <button
                                ref={ref => {
                                    defaultButton = ref;
                                }}
                                onClick={startAnswer}
                            >
                                <String id="correct" />
                            </button>
                            <button onClick={startReciting}>
                                <String id="start" />
                            </button>
                        </>
                    )}
                    <button onClick={showIntro}>
                        <String id="cancel" />
                    </button>
                </div>
            </>
        );
    };

    const isCorrect = () => wrongWord === -1 && missingWords === 0;

    const renderResults = () => {
        const answerWords = answerText.trim().split(/\s+/);

        const renderMessage = () => {
            if (isCorrect()) {
                return (
                    <h4>
                        <span className="Correct">
                            <Icon icon={faThumbsUp} />
                        </span>{" "}
                        <String id="correct_answer" />
                    </h4>
                );
            }
            return (
                <h4>
                    <span className="Wrong">
                        <Icon icon={faThumbsDown} />
                    </span>{" "}
                    <String id="wrong_answer" />
                </h4>
            );
        };

        const renderMissingWords = () => {
            if (!missingWords) {
                return "";
            }
            return new Array(missingWords + 1)
                .join("0")
                .split("")
                .map((x, index) => (
                    <span key={index} className="Wrong">
                        {" ? "}
                    </span>
                ));
        };

        return (
            <>
                {renderMessage()}
                <h3>
                    {answerWords.map((word, index) => (
                        <span
                            key={index}
                            className={
                                wrongWord == -1 || index < wrongWord
                                    ? "Correct"
                                    : "Wrong"
                            }
                        >
                            {word}{" "}
                        </span>
                    ))}
                    {renderMissingWords()}
                </h3>
                {isCorrect() ? (
                    <div className="ButtonsBar">
                        <button onClick={redoTyping}>
                            <String id="retry" />
                        </button>
                        <button onClick={redoReciting}>
                            <String id="start" />
                        </button>
                        {/* <button onClick={answerNextVerse}>
                            <String id="next_verse" />
                        </button> */}
                    </div>
                ) : (
                    <>
                        <hr />
                        <h3 className="Correct">
                            <VerseText />
                        </h3>
                    </>
                )}
            </>
        );
    };

    const renderRecitingTitle = () => {
        return (
            <>
                <VerseInfo show={isNarrowLayout()} />
                <span id="TrackDuration">{renderCounter()}</span>
                <div className="ButtonsBar">
                    <button
                        onClick={startAnswer}
                        ref={ref => {
                            defaultButton = ref;
                        }}
                    >
                        <String id="answer" />
                    </button>
                    {/* <button onClick={gotoRandomVerse}>
                        <String id="new_verse" />
                    </button> */}
                    <button
                        onClick={e => {
                            player.stop(true);
                            setCurrStep("intro");
                        }}
                    >
                        <String id="cancel" />
                    </button>
                </div>
            </>
        );
    };

    const renderReciting = () => {
        if (isNarrowLayout()) {
            return "";
        }
        return (
            <>
                <div className="ContentTitle">
                    <VerseInfo />
                </div>
                <h3>
                    <VerseText />
                </h3>
            </>
        );
    };

    const renderContent = () => {
        switch (currStep) {
            case "intro":
                return renderIntro();
            case "reciting":
                return renderReciting();
            case "typing":
                return renderTypingConsole();
            case "results":
                return renderResults();
        }
    };

    return (
        <>
            <div className="Title">{renderTitle()}</div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 50 }}
            >
                {renderContent()}
            </div>
        </>
    );
};

export { VerseInfo, VerseText };
export default AppConsumer(PlayerConsumer(Exercise));
