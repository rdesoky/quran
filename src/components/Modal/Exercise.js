import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import { PlayerConsumer, AudioState } from "./../../context/Player";
import Modal from "./Modal";
import QData from "./../../services/QData";

const Exercise = ({ app, player }) => {
    const [currStep, setCurrStep] = useState("instructions");
    const [verse, setVerse] = useState(app.selectStart);
    const [duration, setDuration] = useState(-1);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [counterInterval, setCounterInterval] = useState(null);
    const [answerText, setAnswerText] = useState("");

    const verseList = app.verseList();

    const onClickExercise = e => {
        startExercise();
    };

    const startExercise = (verse = -1) => {
        if (verse == -1) {
            verse = Math.floor(Math.random() * verseList.length);
        }
        setCurrStep("memorizing");
        setVerse(verse);
        player.stop(true);
        app.gotoAya(verse, { sel: true });

        setTimeout(() => {
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
        setAnswerText("");
        setTimeout(() => {
            player.stop(true);
        });
        app.setMaskStart();
        stopCounter();
        setCurrStep("answering");
    };

    const onUserTyping = ({ target }) => {
        setAnswerText(target.value);
    };

    let textArea = null;

    const renderAnswerForm = () => {
        if (currStep == "answering") {
            return (
                <>
                    <textarea
                        ref={ref => {
                            textArea = ref;
                        }}
                        placeholder="Write verse from your memory"
                        value={answerText}
                        onChange={onUserTyping}
                    ></textarea>
                    <div className="buttonsBar">
                        <button
                            onClick={e => {
                                app.hideMask();
                                setCurrStep("results");
                            }}
                        >
                            Check
                        </button>
                        <button
                            onClick={e => {
                                startExercise(verse);
                            }}
                        >
                            Retry
                        </button>
                        <button onClick={onClickExercise}>New</button>
                        <button
                            onClick={e => {
                                setCurrStep("instructions");
                                app.hideMask();
                            }}
                        >
                            Cancel
                        </button>
                    </div>
                </>
            );
        }
    };

    useEffect(() => {
        const savedRepeat = player.setRepeat(0);
        const savedFollowPlayer = player.setFollowPlayer(true);
        player.stop(true);
        setCurrStep("instructions");
        return () => {
            player.setRepeat(savedRepeat);
            player.setFollowPlayer(savedFollowPlayer);
            player.stop(true);
        };
    }, []);

    useEffect(() => {
        if (currStep === "answering" && textArea !== null) {
            textArea.focus();
        }
    }, [currStep]);

    useEffect(() => {
        if (
            player.playingAya !== -1 &&
            verse !== -1 &&
            player.playingAya !== verse
        ) {
            startAnswer();
        }
    }, [player.playingAya]);

    useEffect(() => {
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

    const renderExerciseBar = () => {
        if (currStep === "memorizing") {
            return (
                <div className="buttonsBar">
                    <button onClick={startAnswer}>Answer</button>
                    <button onClick={onClickExercise}>New</button>
                    <button
                        onClick={e => {
                            player.stop(true);
                            setCurrStep("instructions");
                        }}
                    >
                        Cancel
                    </button>
                    <span id="TrackDuration">{renderCounter()}</span>
                </div>
            );
        }
    };

    const renderInstructions = () => {
        if (currStep == "instructions") {
            return (
                <div className="buttonsBar">
                    <button onClick={onClickExercise}>New</button>
                    {verse === -1 ? (
                        ""
                    ) : (
                        <button
                            onClick={e => {
                                startExercise(verse);
                            }}
                        >
                            Start
                        </button>
                    )}
                </div>
            );
        }
    };

    const renderResults = () => {
        if (currStep === "results") {
            return (
                <>
                    <h2>{answerText}</h2>
                    <div className="buttonsBar">
                        <button
                            onClick={e => {
                                startExercise(verse);
                            }}
                        >
                            Retry
                        </button>
                        <button onClick={onClickExercise}>New</button>
                    </div>
                </>
            );
        }
    };

    return (
        <>
            <div className="Title">
                <String id="exercise" />
                {renderExerciseBar()}
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                {renderInstructions()}
                {renderAnswerForm()}
                {renderResults()}
            </div>
        </>
    );
};

export default AppConsumer(PlayerConsumer(Exercise));
