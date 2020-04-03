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
import {
    faThumbsUp,
    faThumbsDown,
    faPen,
    faPlayCircle,
    faRandom,
    faBackward,
    faBackspace
} from "@fortawesome/free-solid-svg-icons";
import { TafseerView } from "./Tafseer";
import { VerseInfo, VerseText } from "./../Widgets";
import { ActivityChart } from "../Hifz";
import { SettingsContext } from "../../context/Settings";
import QData from "../../services/QData";
import { CommandButton } from "./Commands";
import { faKeyboard } from "@fortawesome/free-regular-svg-icons";
import { analytics } from "../../services/Analytics";
import { ExerciseSettings } from "./Settings";

// const useForceUpdate = useCallback(() => updateState({}), []);
// const useForceUpdate = () => useState()[1];

const Step = {
    unknown: -1,
    intro: 0,
    reciting: 1,
    typing: 2,
    results: 3
};

const Exercise = ({}) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const settings = useContext(SettingsContext);
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
    const [quickMode, setQuickMode] = useState(0);
    const trigger = "exercise";

    const isNarrowLayout = () => {
        return !(app.isWide || app.isCompact || app.pagesCount > 1);
    };

    const checkVerseLevel = new_verse => {
        const text = app.verseText(new_verse);
        const length = text.length;
        switch (parseInt(settings.exerciseLevel)) {
            case 0:
                if (!length.between(1, 50)) {
                    return false;
                }
                break;
            case 1:
                if (!length.between(51, 150)) {
                    return false;
                }
                break;
            case 2:
                if (!length.between(151, 300)) {
                    return false;
                }
                break;
            default:
                if (!(length > 200)) {
                    return false;
                }
        }
        //Length is good, check memorized
        if (settings.exerciseMemorized === false) {
            const { sura, aya } = QData.ayaIdInfo(new_verse);
            const page = QData.ayaPage(sura, aya);
            const { hifzRanges } = app;

            const hifzRange = hifzRanges.find(r => {
                return (
                    r.sura === sura && page >= r.startPage && page <= r.endPage
                );
            });
            if (hifzRange) {
                return false; //verse is memorized,
            }
        }
        return true;
    };

    const gotoRandomVerse = e => {
        player.stop();
        player.setPlayingAya(-1);
        let new_verse;
        do {
            new_verse = Math.floor(Math.random() * verseList.length);
        } while (!checkVerseLevel(new_verse));
        app.gotoAya(new_verse, { sel: true, keepMask: true });
        // app.setMaskStart(new_verse + 1, true);
        // setCurrStep(Step.intro);
        // if (currStep === Step.intro && defaultButton) {
        //     defaultButton.focus();
        // }
        if(settings.randomAutoRecite){
            startReciting(e);
        }

        analytics.logEvent("get_random_verse", {
            trigger,
            level: settings.exerciseLevel
        });
    };

    const startReciting = e => {
        setCurrStep(Step.reciting);
        //app.setMaskStart(verse + 1, true);
        analytics.logEvent("exercise_play_audio", {
            trigger
        });
    };

    const redoReciting = e => {
        setWrittenText("");
        startReciting(e);
        analytics.logEvent("redo_reciting", { trigger });
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
            analytics.logEvent("exercise_go_back", { trigger });
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
                //if correct answer, save number of verse letters in Firebase
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
                analytics.logEvent("start_typing", {
                    trigger: "exercise_audio"
                });
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
        analytics.logEvent("exercise_go_back", { trigger });
    };

    const moveToNextVerse = () => {
        app.gotoAya(verse + 1, { sel: true, keepMask: true });
    };

    const reciteNextVerse = e => {
        localStorage.setItem("resultsDefaultButton", "reciteNext");
        startReciting();
        setTimeout(moveToNextVerse);
        analytics.logEvent("recite_next_verse", { trigger });
        // app.setMaskStart(verse + 2, true);
    };

    const typeNextVerse = e => {
        localStorage.setItem("resultsDefaultButton", "typeNext");
        // app.setMaskStart(verse + 1);
        setWrittenText("");
        startAnswer();
        setTimeout(moveToNextVerse);
        // if (defaultButton) {
        //     defaultButton.focus();
        // }
        analytics.logEvent("type_next_verse", { trigger });
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
                <VerseInfo trigger="exercise_intro" onMoveNext={onMoveNext} />
                <VerseText copy={true} bookmark={true} />
                <div className="FootNote">
                    <String id="exercise_intro" />
                </div>
                <hr />
                <div>
                    <String id="random_exercise" />
                </div>
                <ExerciseSettings />
                <hr />
                <ActivityChart activity="chars" />
            </div>
        );
    };

    const onClickType = e => {
        const trg = e.target.getAttribute("trigger") || trigger;
        analytics.logEvent("start_typing", { trigger: trg });
        startAnswer();
    };

    const renderIntroTitle = () => {
        const narrow = app.isNarrow;
        return (
            <>
                {isNarrowLayout() ? (
                    <div className="TitleNote">
                        <String id="exercise_intro" />
                    </div>
                ) : null}
                <div className="TitleButtons">
                    <VerseInfo
                        trigger="exercise_intro_title"
                        show={isNarrowLayout()}
                    />
                    <div className="ButtonsBar">
                        <button
                            onClick={onClickType}
                            trigger="exercise_intro"
                            ref={ref => {
                                defaultButton = ref;
                            }}
                        >
                            {narrow ? (
                                <Icon icon={faKeyboard} />
                            ) : (
                                <String id="answer" />
                            )}
                        </button>
                        <button onClick={startReciting}>
                            {narrow ? (
                                <Icon icon={faPlayCircle} />
                            ) : (
                                <String id="start" />
                            )}
                        </button>
                        <button onClick={typeNextVerse}>
                            <String id="type_next" />
                        </button>
                        <button onClick={gotoRandomVerse}>
                            {narrow ? (
                                <Icon icon={faRandom} />
                            ) : (
                                <String id="new_verse" />
                            )}
                        </button>
                    </div>
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
                if (quickMode > 0) {
                    app.showToast(
                        app.intl.formatMessage({ id: "success_write_next" })
                    );
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
        if (quickMode == 2 && wrongWord === -1 && answerWords.length >= 3) {
            const typed_chars = app.logTypedVerse(verse, 3);
            analytics.logEvent("exercise_quick_success", {
                ...QData.verseLocation(verse),
                typed_chars,
                trigger
            });
            return true;
        }
        const success =
            wrongWord === -1 && correctWords.length === answerWords.length;

        if (success) {
            const typed_chars = app.logTypedVerse(verse);
            analytics.logEvent("exercise_success", {
                ...QData.verseLocation(verse),
                typed_chars,
                trigger
            });
        }
        return success;
    };

    const renderTypingTitle = () => {
        // const correct = wrongWord === -1;
        return (
            <div className="TitleButtons">
                <VerseInfo
                    trigger="exercise_typing_title"
                    onClick={onFinishedTyping}
                />
                <div className="ButtonsBar">
                    <button onClick={startReciting}>
                        <String id="start" />
                    </button>
                    <button onClick={onFinishedTyping}>
                        <String id="check" />
                    </button>
                    <button onClick={showIntro}>
                        <String id="home" />
                    </button>
                </div>
            </div>
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
        //setQuickMode(target.checked);
        setQuickMode(parseInt(target.value));
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
                    <div className="RadioGroup">
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="quickMode"
                                    value={0}
                                    checked={quickMode === 0}
                                    onChange={onUpdateQuickMode}
                                />
                                <span>
                                    <String id="quick_mode_0" />
                                </span>
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="quickMode"
                                    value={1}
                                    checked={quickMode === 1}
                                    onChange={onUpdateQuickMode}
                                />
                                <span>
                                    <String id="quick_mode_1" />
                                </span>
                            </label>
                        </div>
                        <div>
                            <label>
                                <input
                                    type="radio"
                                    name="quickMode"
                                    value={2}
                                    checked={quickMode === 2}
                                    onChange={onUpdateQuickMode}
                                />
                                <span>
                                    <String id="quick_mode_2" />
                                </span>
                            </label>
                        </div>
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
        startAnswer();
        analytics.logEvent("start_typing", { trigger: "exercise_redo" });
    };

    const renderResultsTitle = () => {
        return (
            <div className="TitleButtons">
                <VerseInfo trigger="exercise_result_title" />
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
                                onClick={onClickType}
                                trigger="exercise_retry"
                            >
                                <String id="correct" />
                            </button>
                            <button onClick={startReciting}>
                                <String id="start" />
                            </button>
                            <button onClick={showIntro}>
                                <String id="home" />
                            </button>
                        </>
                    )}
                </div>
            </div>
        );
    };

    const isCorrect = () => wrongWord === -1 && missingWords === 0;
    const isTypingCorrect = () =>
        wrongWord === -1 || wrongWord == writtenText.split(/\s+/).length - 1;

    const renderSuccessResultsReport = () => {
        return (
            <>
                <div className="ButtonsBar">
                    <button onClick={redoTyping}>
                        <String id="redo" />
                    </button>
                    <button onClick={redoReciting}>
                        <String id="start" />
                    </button>
                    <button onClick={showIntro}>
                        <String id="home" />
                    </button>

                    {/* <CommandButton command="Settings" trigger={trigger} /> */}
                </div>
                <TafseerView
                    verse={verse}
                    showVerse={true}
                    bookmark={true}
                    copy={true}
                    onMoveNext={onMoveNext}
                    trigger={trigger}
                />
                <hr />
                <div>
                    <String id="random_exercise" />
                </div>
                <ExerciseSettings />
                <hr />
                <ActivityChart activity="chars" />
            </>
        );
    };

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
                <h3 className="TypedVerseText">
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
                    renderSuccessResultsReport()
                ) : (
                    <>
                        <hr />
                        <h3 className="Correct">
                            <VerseText copy={true} trigger="correct_exercise" />
                        </h3>
                    </>
                )}
            </div>
        );
    };

    const renderRecitingTitle = () => {
        return (
            <div className="TitleButtons">
                <VerseInfo trigger="reciting_title" show={isNarrowLayout()} />
                <span className="TrackDuration">
                    {renderCounter(32, 3, Math.floor(remainingTime), duration)}
                </span>
                <div className="ButtonsBar">
                    <button
                        onClick={onClickType}
                        trigger="exercise_reciter"
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
                        <String id="home" />
                    </button>
                </div>
            </div>
        );
    };

    const renderReciting = () => {
        if (isNarrowLayout()) {
            return "";
        }
        return (
            <div className="ContentFrame">
                <VerseInfo trigger="exercise_reciting" />
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
