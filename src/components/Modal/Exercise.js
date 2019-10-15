import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import { PlayerConsumer, AudioState } from "./../../context/Player";
import Modal from "./Modal";
import QData from "./../../services/QData";

const Exercise = ({ app, player }) => {
    const [currStep, setCurrStep] = useState(0);
    const [verse, setVerse] = useState(-1);
    const [duration, setDuration] = useState(-1);
    const [remainingTime, setRemainingTime] = useState(-1);
    const [counterInterval, setCounterInterval] = useState(null);
    const [answerMode, setAnswerMode] = useState(false);

    const verseList = app.verseList();

    const onClickExercise = e => {
        startExercise();
    };

    const startExercise = (verse = -1) => {
        if (verse == -1) {
            verse = Math.floor(Math.random() * verseList.length);
        }
        setCurrStep(1);
        // setAnswerMode(false);
        setVerse(verse);
        player.stop(true);
        app.gotoAya(verse, { sel: true });
        // app.selectAya(verse);

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
        setTimeout(() => {
            player.stop(true);
        });
        app.setMaskStart();
        stopCounter();
        setCurrStep(2);
    };

    let textArea = null;

    const renderAnswerForm = () => {
        if (currStep == 2) {
            return (
                <>
                    <textarea
                        ref={ref => {
                            textArea = ref;
                        }}
                        placeholder="Write verse from your memory"
                    ></textarea>
                    <br />
                    <button
                        onClick={e => {
                            app.hideMask();
                            setCurrStep(0);
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
                            setCurrStep(0);
                            app.hideMask();
                        }}
                    >
                        Cancel
                    </button>
                </>
            );
        }
    };
    const renderVerse = () => {
        if (!answerMode) {
            return (
                <div id="VerseToTest">
                    {verse === -1 ? "" : verseList[verse]}
                </div>
            );
        }
    };

    useEffect(() => {
        player.stop(true);
        setCurrStep(0);
        // setAnswerMode(false);
    }, []);

    useEffect(() => {
        if (currStep === 2 && textArea !== null) {
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
        if (currStep === 1) {
            return (
                <div className="HeaderButtons">
                    <span id="TrackDuration">{renderCounter()}</span>
                    <button onClick={startAnswer}>Answer</button>
                    <button onClick={onClickExercise}>New</button>
                    <button
                        onClick={e => {
                            player.stop(true);
                            setCurrStep(0);
                        }}
                    >
                        Cancel
                    </button>
                </div>
            );
        }
    };

    const renderInstructions = () => {
        if (currStep == 0) {
            return (
                <div className="buttonsBar">
                    <button onClick={onClickExercise}>Start</button>
                    {verse === -1 ? (
                        ""
                    ) : (
                        <button
                            onClick={e => {
                                startExercise(verse);
                            }}
                        >
                            Retry
                        </button>
                    )}
                </div>
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
            </div>
        </>
    );
};

export default AppConsumer(PlayerConsumer(Exercise));
