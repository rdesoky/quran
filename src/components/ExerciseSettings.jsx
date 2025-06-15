import React from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import Switch from "react-switch";
import {
    selectExerciseLevel,
    selectExerciseMemorized,
    selectRandomAutoRecite,
    setExerciseLevel,
    setExerciseMemorized,
    setRandomAutoRecite,
} from "../store/settingsSlice";

export const ExerciseSettings = () => {
    const dispatch = useDispatch();
    const exerciseLevel = useSelector(selectExerciseLevel);
    const randomAutoRecite = useSelector(selectRandomAutoRecite);
    const exerciseMemorized = useSelector(selectExerciseMemorized);
    const intl = useIntl();

    const updateExerciseLevel = ({ currentTarget }) => {
        const exerciseLevel = parseInt(currentTarget.value);
        // settings.setExerciseLevel(exerciseLevel);
        dispatch(setExerciseLevel(exerciseLevel));
        localStorage.setItem("exerciseLevel", exerciseLevel);
    };

    const updateExerciseMemorized = (checked) => {
        dispatch(setExerciseMemorized(checked));
        localStorage.setItem("exerciseMemorized", checked);
    };

    const updateRandomAutoRecite = (checked) => {
        dispatch(setRandomAutoRecite(checked));
        localStorage.setItem("randomAutoRecite", checked);
    };

    return (
        <>
            <div className="OptionRow">
                <label>
                    <span>
                        <Message id="exercise_level" />
                    </span>
                    <select
                        onChange={updateExerciseLevel}
                        value={exerciseLevel}
                    >
                        <option value={0}>
                            {intl.formatMessage({
                                id: "beginner_level",
                            })}
                        </option>
                        <option value={1}>
                            {intl.formatMessage({
                                id: "moderate_level",
                            })}
                        </option>
                        <option value={2}>
                            {intl.formatMessage({ id: "high_level" })}
                        </option>
                        <option value={3}>
                            {intl.formatMessage({
                                id: "advanced_level",
                            })}
                        </option>
                    </select>
                </label>
            </div>
            <div className="OptionRow">
                <label>
                    <span>
                        <Message id="exercise_memorized" />
                    </span>
                    <Switch
                        height={22}
                        width={42}
                        onChange={updateExerciseMemorized}
                        checked={exerciseMemorized || false}
                    />
                </label>
            </div>
            <div className="OptionRow">
                <label>
                    <span>
                        <Message id="random_auto_recite" />
                    </span>
                    <Switch
                        height={22}
                        width={42}
                        onChange={updateRandomAutoRecite}
                        checked={randomAutoRecite || false}
                    />
                </label>
            </div>
        </>
    );
};
