import React, { useEffect, useState, useCallback } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import {
    PlayerConsumer,
    AudioState,
    AudioRepeat
} from "./../../context/Player";
import AKeyboard from "../AKeyboard/AKeyboard";
import Utils from "./../../services/utils";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import QData from "./../../services/QData";

// const useForceUpdate = useCallback(() => updateState({}), []);
// const useForceUpdate = () => useState()[1];

const Step = {
    unknown: -1,
    intro: 0,
    reciting: 1,
    typing: 2,
    results: 3
};

const VerseInfo = AppConsumer(({ app, verse, show }) => {
    if (verse === undefined) {
        verse = app.selectStart;
    }
    if (show === false) {
        return "";
    }
    const verseInfo = QData.ayaIdInfo(verse);

    return (
        <div className="VerseInfo">
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
            </div>
        </div>
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
    const [currStep, setCurrStep] = useState(Step.unknown);
    const [verse, setVerse] = useState(app.selectStart);
    const [duration, setDuration] = useState(-1);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [counterInterval, setCounterInterval] = useState(null);
    const [writtenText, setAnswerText] = useState("");
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
        setCurrStep(Step.intro);
        if (currStep === Step.intro && defaultButton) {
            defaultButton.focus();
        }
    };

    const startReciting = e => {
        setCurrStep(Step.reciting);
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
        setCurrStep(Step.typing);
    };

    let defaultButton = null;

    useEffect(() => {
        setVerse(app.selectStart);
        setAnswerText("");
    }, [app.selectStart]);

    const handleKeyDown = ({ code }) => {
        if (code == "Escape") {
            showIntro();
        }
    };

    useEffect(() => {
        const savedRepeat = player.setRepeat(AudioRepeat.verse);
        const savedFollowPlayer = player.setFollowPlayer(true);
        player.stop(true);
        setCurrStep(Step.intro);
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            player.setRepeat(savedRepeat);
            player.setFollowPlayer(savedFollowPlayer);
            player.stop(true);
            app.setModalPopup(false);
            app.hideMask();
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    useEffect(() => {
        if (defaultButton) {
            defaultButton.focus();
        }
        switch (currStep) {
            case Step.typing:
                app.setMaskStart(verse);
                app.setModalPopup(); //block outside selection
                break;
            case Step.reciting:
                player.play();
                app.setModalPopup(); //block outside selection
                break;
            case Step.results:
                app.setModalPopup(); //block outside selection
                break;
            case Step.intro:
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
            if ([Step.reciting].includes(currStep)) {
                startAnswer();
            }
        }
        if (
            [Step.typing, Step.intro, Step.results].includes(currStep) &&
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

    const showIntro = e => {
        player.stop(true);
        setCurrStep(Step.intro);
    };

    const reciteNextVerse = () => {
        app.setMaskStart(verse + 1);
        app.gotoAya(verse + 1);
        setCurrStep(Step.reciting);
    };

    const typeNextVerse = () => {
        app.setMaskStart(verse + 1);
        app.gotoAya(verse + 1);
        setTimeout(startAnswer, 1);
        if (defaultButton) {
            defaultButton.focus();
        }
    };

    const renderTitle = () => {
        switch (currStep) {
            case Step.intro:
                return renderIntroTitle();

            case Step.typing:
                return renderTypingTitle();

            case Step.results:
                return renderResultsTitle();

            case Step.reciting:
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
        testAnswer(text);
        // forceUpdate();
    };

    const onFinishedTyping = () => {
        testAnswer(writtenText);
        app.setMaskStart(app.selectStart + 1, true);
        setCurrStep(Step.results);
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
                    {writtenText.trim().length && isCorrect() ? (
                        <button onClick={typeNextVerse}>
                            <span class="Correct">
                                <Icon icon={faThumbsUp} />
                            </span>{" "}
                            <String id="type_next" />
                        </button>
                    ) : (
                        ""
                    )}
                    <button onClick={showIntro}>
                        <String id="cancel" />
                    </button>
                </div>
            </>
        );
    };
    const renderTypingConsole = () => {
        const correct = isTypingCorrect();
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
                            (!writtenText.length
                                ? " empty"
                                : correct
                                ? " Correct"
                                : " Wrong")
                        }
                    >
                        {writtenText || <String id="writing_prompt" />}
                    </div>
                </div>
                <AKeyboard
                    initText={writtenText}
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
                                onClick={typeNextVerse}
                            >
                                <String id="type_next" />
                            </button>
                            <button onClick={reciteNextVerse}>
                                <String id="recite_next" />
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
    const isTypingCorrect = () =>
        wrongWord === -1 || wrongWord == writtenText.split(/\s+/).length - 1;

    const renderResults = () => {
        const answerWords = writtenText.trim().split(/\s+/);

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
                        <button onClick={gotoRandomVerse}>
                            <String id="new_verse" />
                        </button>
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
                    <button onClick={showIntro}>
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
            case Step.intro:
                return renderIntro();
            case Step.reciting:
                return renderReciting();
            case Step.typing:
                return renderTypingConsole();
            case Step.results:
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
