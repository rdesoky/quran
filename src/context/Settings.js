import React, { useState } from "react";

const SettingsState = {
    exerciseLevel: localStorage.getItem("exerciseLevel") || 0,
    exerciseMemorized: JSON.parse(
        localStorage.getItem("exerciseMemorized") || false
    )
};

export const SettingsContext = React.createContext(SettingsState);

export const SettingsProvider = ({ children }) => {
    // const useState
    const [exerciseLevel, setExerciseLevel] = useState(
        SettingsState.exerciseLevel
    );
    const [exerciseMemorized, setExerciseMemorized] = useState(
        SettingsState.exerciseMemorized
    );

    const methods = {
        setExerciseLevel: level => {
            setExerciseLevel(level);
            localStorage.setItem("exerciseLevel", level);
        },
        setExerciseMemorized: val => {
            setExerciseMemorized(val);
            localStorage.setItem("exerciseMemorized", val);
        }
    };

    return (
        <SettingsContext.Provider
            value={{
                exerciseLevel,
                exerciseMemorized,
                ...methods
            }}
        >
            {children}
        </SettingsContext.Provider>
    );
};
