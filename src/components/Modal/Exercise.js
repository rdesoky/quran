import React, { useEffect, useState, useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "./../../context/App";
import {
    PlayerConsumer,
    AudioState,
    AudioRepeat,
    PlayerContext
} from "./../../context/Player";
import AKeyboard from "../AKeyboard/AKeyboard";
import Utils from "./../../services/utils";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faThumbsUp, faThumbsDown } from "@fortawesome/free-solid-svg-icons";
import { TafseerView } from "./Tafseer";
import { VerseInfo, VerseText } from "./../Widgets";

// const useForceUpdate = useCallback(() => updateState({}), []);
// const useForceUpdate = () => useState()[1];

const Step = {
    unknown: -1,
    intro: 0,
    reciting: 1,
    typing: 2,
    results: 3
};

const Exercise = ({ }) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const [currStep, setCurrStep] = useState(Step.unknown);
    const [verse, setVerse] = useState(app.selectStart);
    const [duration, setDuration] = useState(-1);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [counterInterval, setCounterInterval] = useState(null);
    const [writtenText, setWrittenText] = useState("");
    const [wrongWord, setWrongWord] = useState(-1);
    const [missingWords, setMissingWords] = useState(0);
    const verseList = app.verseList();
    const normVerseList = app.normVerseList();
    const [quickMode, setQuickMode] = useState(false);

    const isNarrowLayout = () => {
        return !(app.isWide || app.isCompact || app.pagesCount > 1);
    };

    const gotoRandomVerse = e => {
        player.stop();
        player.setPlayingAya(-1);
        const new_verse = Math.floor(Math.random() * verseList.length);
        app.gotoAya(new_verse, { sel: true, keepMask: true });
        // app.setMaskStart(new_verse + 1, true);
        setCurrStep(Step.intro);
        if (currStep === Step.intro && defaultButton) {
            defaultButton.focus();
        }
    };

    const startReciting = e => {
        setCurrStep(Step.reciting);
        //app.setMaskStart(verse + 1, true);
    };

    const redoReciting = e => {
        setWrittenText("");
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

    let resultsDefaultButton =
        localStorage.getItem("resultsDefaultButton") || "typeNext";
    let defaultButton = null;

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
        app.gotoAya();
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
        setVerse(app.selectStart);
        setWrittenText("");
        if (currStep == Step.results) {
            setCurrStep(Step.intro);
        } else {
            app.setMaskStart(
                app.selectStart + (currStep === Step.typing ? 0 : 1),
                true
            );
        }
    }, [app.selectStart]);

    useEffect(() => {
        if (defaultButton) {
            defaultButton.focus();
        }
        switch (currStep) {
            case Step.typing:
                app.setMaskStart(verse);
                app.setModalPopup(); //block outside selection
                app.setMaskStart(app.selectStart, true);
                break;
            case Step.reciting:
                setTimeout(() => {
                    player.play();
                }, 100);
                app.setModalPopup(); //block outside selection
                app.setMaskStart(app.selectStart + 1, true);
                break;
            case Step.results:
                //TODO: if correct answer, save number of verse letters in Firebase
                app.setMaskStart(app.selectStart + 1, true);
                app.setModalPopup(false);
                break;
            case Step.intro:
                app.setMaskStart(verse + 1, true);
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

    const renderCounter = (sqSize, strokeWidth, progress, target) => {
        if (counterInterval) {
            // SVG centers the stroke width on the radius, subtract out so circle fits in square
            const radius = (sqSize - strokeWidth) / 2;
            // Enclose cicle in a circumscribing square
            // const viewBox = `0 0 ${sqSize} ${sqSize}`;
            // Arc length at 100% coverage is the circle circumference
            const dashArray = radius * Math.PI * 2;
            // Scale 100% coverage overlay with the actual percent
            const percentage = progress / target;
            const dashOffset = dashArray - dashArray * percentage;
            return (
                <svg
                    width={sqSize}
                    height={sqSize}
                    viewBox={`0 0 ${sqSize} ${sqSize}`}
                >
                    <circle
                        className="circle-background"
                        cx={sqSize / 2}
                        cy={sqSize / 2}
                        r={radius}
                        strokeWidth={`${strokeWidth}px`}
                    />
                    <circle
                        className="circle-progress"
                        cx={sqSize / 2}
                        cy={sqSize / 2}
                        r={radius}
                        strokeWidth={`${strokeWidth}px`}
                        // Start progress marker at 12 O'Clock
                        transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                        style={{
                            strokeDasharray: dashArray,
                            strokeDashoffset: dashOffset
                        }}
                    />
                    <text
                        className="circle-text"
                        x="50%"
                        y="50%"
                        dy=".3em"
                        textAnchor="middle"
                    >
                        {`${progress}`}
                    </text>
                </svg>
            );
        }
    };

    const showIntro = e => {
        player.stop(true);
        setCurrStep(Step.intro);
    };

    const moveToNextVerse = () => {
        app.gotoAya(verse + 1, { sel: true, keepMask: true });
    };

    const reciteNextVerse = () => {
        localStorage.setItem("resultsDefaultButton", "reciteNext");
        startReciting();
        setTimeout(moveToNextVerse);
        // app.setMaskStart(verse + 2, true);
    };

    const typeNextVerse = () => {
        localStorage.setItem("resultsDefaultButton", "typeNext");
        // app.setMaskStart(verse + 1);
        setWrittenText("");
        startAnswer();
        setTimeout(moveToNextVerse);
        // if (defaultButton) {
        //     defaultButton.focus();
        // }
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

    const onMoveNext = offset => {
        app.gotoAya(verse + offset, { sel: true, keepMask: true });
    };

    const renderIntro = () => {
        if (isNarrowLayout()) {
            return "";
        }
        return (
            <div className="ContentFrame">
                <VerseInfo onMoveNext={onMoveNext} />
                <VerseText />
                <div className="FootNote">
                    <String id="exercise_intro" />
                </div>
                {/* <TafseerView verse={verse} /> */}
            </div>
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
        setWrittenText(text);
        //test written words ( except the last one )
        setWrongWord(-1);
        setMissingWords(0);
        if (testAnswer(text)) {
            setTimeout(() => {
                if (quickMode) {
                    typeNextVerse();
                    return;
                }
                // app.setMaskStart(app.selectStart + 1, true);
                setCurrStep(Step.results);
            }, 500);
        }
        // forceUpdate();
    };

    const onFinishedTyping = () => {
        testAnswer(writtenText);
        //app.setMaskStart(app.selectStart + 1, true);
        setCurrStep(Step.results);
    };

    const testAnswer = answerText => {
        const normVerse = normVerseList[verse].trim();
        const normAnswerText = Utils.normalizeText(answerText).trim();
        const correctWords = normVerse.split(/\s+/);
        if (!answerText.trim().length) {
            setMissingWords(correctWords.length);
            return false;
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
        if (quickMode && wrongWord === -1 && answerWords.length >= 3) {
            return true;
        }
        return wrongWord === -1 && correctWords.length === answerWords.length;
    };

    const renderTypingTitle = () => {
        // const correct = wrongWord === -1;
        return (
            <>
                <VerseInfo />
                <div className="ButtonsBar">
                    <button onClick={startReciting}>
                        <String id="start" />
                    </button>
                    {/* <button onClick={typeNextVerse}>
                        <String id="type_next" />
                    </button> */}
                    <button onClick={showIntro}>
                        <String id="cancel" />
                    </button>
                </div>
            </>
        );
    };

    const renderCursor = () => {
        return <span className="TypingCursor"></span>;
    };

    const renderText = () => {
        if (!writtenText) {
            return <String id="writing_prompt" />;
        }
        return (
            <>
                {writtenText}
                {renderCursor()}
            </>
        );
    };

    const onUpdateQuickMode = ({ target }) => {
        setQuickMode(target.checked);
        defaultButton.focus();
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
                        {renderText()}
                    </div>
                    <div>
                        <label>
                            <input
                                type="checkbox"
                                onChange={onUpdateQuickMode}
                                checked={quickMode}
                            // disabled={player.repeat == 1}
                            />
                            <span>
                                <String id="quick_mode" />
                            </span>
                        </label>
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
        setWrittenText("");
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
                                    if (resultsDefaultButton === "typeNext") {
                                        defaultButton = ref;
                                    }
                                }}
                                onClick={typeNextVerse}
                            >
                                <String id="type_next" />
                            </button>
                            <button
                                ref={ref => {
                                    if (resultsDefaultButton === "reciteNext") {
                                        defaultButton = ref;
                                    }
                                }}
                                onClick={reciteNextVerse}
                            >
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
                    <div>
                        <span className="Correct">
                            <Icon icon={faThumbsUp} />
                        </span>{" "}
                        <String id="correct_answer" />
                    </div>
                );
            }
            return (
                <div>
                    <span className="Wrong">
                        <Icon icon={faThumbsDown} />
                    </span>{" "}
                    <String id="wrong_answer" />
                </div>
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
            <div className="ContentFrame">
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
                    <>
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
                        <TafseerView verse={verse} showVerse={false} />
                    </>
                ) : (
                        <>
                            <hr />
                            <h3 className="Correct">
                                <VerseText />
                            </h3>
                        </>
                    )}
            </div>
        );
    };

    const renderRecitingTitle = () => {
        return (
            <>
                <VerseInfo show={isNarrowLayout()} />
                <span id="TrackDuration">
                    {renderCounter(32, 3, Math.floor(remainingTime), duration)}
                </span>
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
            <div className="ContentFrame">
                <VerseInfo />
                <VerseText />
                <div className="FootNote">
                    <String id="exercise_intro" />
                </div>
            </div>
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

export default Exercise;
