import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import { PlayerConsumer, AudioState } from "./../../context/Player";
import Modal from "./Modal";
import QData from "./../../services/QData";
import AKeyboard from "../AKeyboard/AKeyboard";
import Utils from "./../../services/utils";

const Exercise = ({ app, player }) => {
    const [currStep, setCurrStep] = useState("");
    const [verse, setVerse] = useState(app.selectStart);
    const [duration, setDuration] = useState(-1);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [counterInterval, setCounterInterval] = useState(null);
    const [answerText, setAnswerText] = useState("");
    const [testResult, setTestResult] = useState(-1);

    const verseList = app.verseList();

    const gotoRandomVerse = e => {
        player.stop();
        player.setPlayingAya(-1);
        const new_verse = Math.floor(Math.random() * verseList.length);
        app.gotoAya(new_verse, { sel: true });
        setCurrStep("instructions");
    };

    const startReciting = e => {
        setTimeout(() => {
            setCurrStep("reciting");
            player.play();
        }, 100);

        stopCounter();
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
        stopCounter();
        setCurrStep("answering");
    };

    // const onUserTyping = ({ target }) => {
    //     setAnswerText(target.value);
    // };

    let textArea = null,
        defaultButton = null;

    useEffect(() => {
        setVerse(app.selectStart);
        setAnswerText("");
    }, [app.selectStart]);

    useEffect(() => {
        const savedRepeat = player.setRepeat(5); //single verse
        const savedFollowPlayer = player.setFollowPlayer(true);
        player.stop(true);
        setCurrStep("instructions");
        return () => {
            player.setRepeat(savedRepeat);
            player.setFollowPlayer(savedFollowPlayer);
            player.stop(true);
            app.setModalPopup(false);
        };
    }, []);

    useEffect(() => {
        if (defaultButton) {
            defaultButton.focus();
        }
        switch (currStep) {
            case "answering":
                app.setMaskStart(verse);
            case "reciting":
            case "results":
                app.setModalPopup(); //block outside selection
                break;
            default:
                app.setModalPopup(false); //allow selecting outside
        }
    }, [currStep]);

    //monitor player to start answer upon player ends
    useEffect(() => {
        if (
            ["reciting"].includes(currStep) &&
            player.audioState === AudioState.stopped
        ) {
            startAnswer();
        }
        if (
            ["answering", "instructions", "results"].includes(currStep) &&
            player.audioState === AudioState.playing
        ) {
            startReciting();
        }

        if (player.audioState == AudioState.playing) {
            setDuration(player.trackDuration());
            setRemainingTime(player.trackRemainingTime());
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
                {Math.floor(remainingTime) + "/" + Math.floor(duration)}
            </span>
        );
    };

    const showInstructions = () => {
        setCurrStep("instructions");
        // app.setMaskStart(app.selectStart + 1, true);
        app.hideMask();
    };

    const answerNextVerse = () => {
        app.setMaskStart(verse + 1);
        app.gotoAya(verse + 1);
        setTimeout(startAnswer, 1);
    };

    const startPlaying = e => {
        startReciting(verse);
    };

    const renderExerciseBar = () => {
        switch (currStep) {
            case "answering":
                return (
                    <div className="buttonsBar">
                        <span
                            tabIndex="0"
                            ref={ref => {
                                defaultButton = ref;
                            }}
                        ></span>

                        <button onClick={testAnswer}>
                            <String id="check" />
                        </button>
                        <button onClick={startReciting}>
                            <String id="start" />
                        </button>
                        <button onClick={gotoRandomVerse}>
                            <String id="new_verse" />
                        </button>
                        <button onClick={showInstructions}>
                            <String id="cancel" />
                        </button>
                    </div>
                );
            case "results":
                return (
                    <div className="buttonsBar">
                        {testResult === -1 ? (
                            ""
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
                                <button onClick={startPlaying}>
                                    <String id="start" />
                                </button>
                            </>
                        )}
                        <button
                            ref={ref => {
                                if (testResult === -1) {
                                    //correct answer
                                    defaultButton = ref;
                                }
                            }}
                            onClick={answerNextVerse}
                        >
                            <String id="next_verse" />
                        </button>
                        <button onClick={gotoRandomVerse}>
                            <String id="new_verse" />
                        </button>
                        <button onClick={showInstructions}>
                            <String id="cancel" />
                        </button>
                    </div>
                );
            case "instructions":
                return (
                    <>
                        <String id="exercise" />
                        <div className="buttonsBar">
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

            case "reciting":
                return (
                    <div className="buttonsBar">
                        <button
                            onClick={startAnswer}
                            ref={ref => {
                                defaultButton = ref;
                            }}
                        >
                            <String id="answer" />
                        </button>
                        <button onClick={gotoRandomVerse}>
                            <String id="new_verse" />
                        </button>
                        <button
                            onClick={e => {
                                player.stop(true);
                                setCurrStep("instructions");
                            }}
                        >
                            <String id="cancel" />
                        </button>
                        <span id="TrackDuration">{renderCounter()}</span>
                    </div>
                );
        }
    };

    const renderInstructions = () => {
        if (currStep == "instructions") {
            if (app.isWide || app.pagesCount > 1) {
                return <h3>{app.verseList()[verse]}</h3>;
            }
        }
    };

    const onUpdateText = text => {
        setAnswerText(text);
    };

    const testAnswer = e => {
        if (!answerText.trim().length) {
            return;
        }
        const normVerse = app.normVerseList()[verse].trim();
        const verseWords = normVerse.split(/\s+/);
        const normAnswerText = Utils.normalizeText(answerText).trim();
        const answerWords = normAnswerText.split(/\s+/);
        let wrongWord = -1;
        verseWords.forEach((word, index) => {
            if (
                wrongWord == -1 &&
                (answerWords.length < index || answerWords[index] != word)
            ) {
                wrongWord = index;
            }
        });
        setTestResult(wrongWord);
        app.setMaskStart(app.selectStart + 1, true);
        setCurrStep("results");
    };

    const renderAnswerForm = () => {
        if (currStep == "answering") {
            return (
                <>
                    <textarea
                        disabled={true}
                        placeholder="Write verse from your memory"
                        value={answerText}
                    ></textarea>
                    <AKeyboard
                        initText={answerText}
                        onUpdateText={onUpdateText}
                        onEnter={testAnswer}
                        onCancel={showInstructions}
                    />
                </>
            );
        }
    };

    const renderResults = () => {
        if (currStep === "results") {
            const answerWords = answerText.trim().split(/\s+/);
            const verseText = app.verseList()[verse];
            const normVerseWords = app
                .normVerseList()
                [verse].trim()
                .split(/\s+/);
            const missingWords = normVerseWords.length - answerWords.length;
            return (
                <>
                    {testResult !== -1 ? (
                        ""
                    ) : (
                        <h4>
                            <String id="correct_answer" />
                        </h4>
                    )}
                    <h2>
                        {answerWords.map((word, index) => (
                            <span
                                key={index}
                                style={{
                                    color:
                                        testResult == -1 || index < testResult
                                            ? "green"
                                            : "red"
                                }}
                            >
                                {word}{" "}
                            </span>
                        ))}
                        {missingWords < 1
                            ? ""
                            : new Array(missingWords + 1)
                                  .join("0")
                                  .split("")
                                  .map((x, index) => (
                                      <span
                                          key={index}
                                          style={{ color: "red" }}
                                      >
                                          {" "}
                                          ?{" "}
                                      </span>
                                  ))}
                    </h2>
                    {testResult == -1 ? (
                        ""
                    ) : (
                        <h3 style={{ color: "green" }}>{verseText}</h3>
                    )}
                </>
            );
        }
    };

    const renderMemorizing = () => {
        if (currStep === "reciting") {
            if (app.isWide || app.pagesCount > 1) {
                return <h3>{app.verseList()[verse]}</h3>;
            }
        }
    };

    return (
        <>
            <div className="Title">{renderExerciseBar()}</div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                {renderMemorizing()}
                {renderInstructions()}
                {renderAnswerForm()}
                {renderResults()}
            </div>
        </>
    );
};

export default AppConsumer(PlayerConsumer(Exercise));
