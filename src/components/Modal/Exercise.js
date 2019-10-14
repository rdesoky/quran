import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import { PlayerConsumer, AudioState } from "./../../context/Player";
import Modal from "./Modal";
import QData from "./../../services/QData";

const Exercise = ({ app, player }) => {
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
        setAnswerMode(false);
        setVerse(verse);
        // app.gotoAya(verse, { sel: true });
        app.selectAya(verse);
        player.stop(true);

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
            player.stop();
        });
        stopCounter();
        setAnswerMode(true);
    };

    let textArea = null;

    const renderAnswerForm = () => {
        if (answerMode) {
            return (
                <>
                    <textarea
                        ref={ref => {
                            textArea = ref;
                        }}
                    ></textarea>
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
        setAnswerMode(false);
    }, []);

    useEffect(() => {
        if (answerMode && textArea !== null) {
            textArea.focus();
        }
    }, [answerMode]);

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

    return (
        <div id="ExercisePage">
            <div class="ModalContent" style={{ height: app.appHeight }}>
                <div className="Title">
                    <String id="exercise" />
                </div>
                <div
                    className="PopupBody"
                    style={{ maxHeight: app.appHeight - 85 }}
                >
                    {renderVerse()}
                    {renderAnswerForm()}
                    <div id="TrackDuration">{renderCounter()}</div>
                    <div className="buttonsBar">
                        <button onClick={onClickExercise}>Start</button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AppConsumer(PlayerConsumer(Exercise));
