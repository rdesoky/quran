import React, { useState } from "react";

const SettingsState = {
	exerciseLevel: localStorage.getItem("exerciseLevel") || 0,
	exerciseMemorized: JSON.parse(
		localStorage.getItem("exerciseMemorized") || false
	),
	randomAutoRecite: JSON.parse(
		localStorage.getItem("randomAutoRecite") || false
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
	const [randomAutoRecite, setRandomAutoRecite] = useState(
		SettingsState.randomAutoRecite
	);

	const methods = {
		setExerciseLevel: level => {
			setExerciseLevel(level);
			localStorage.setItem("exerciseLevel", level);
		},
		setExerciseMemorized: val => {
			setExerciseMemorized(val);
			localStorage.setItem("exerciseMemorized", val);
		},
		setRandomAutoRecite: val => {
			setRandomAutoRecite(val);
			localStorage.setItem("randomAutoRecite", val);
		}
	};

	return (
		<SettingsContext.Provider
			value={{
				exerciseLevel,
				exerciseMemorized,
				randomAutoRecite,
				...methods
			}}
		>
			{children}
		</SettingsContext.Provider>
	);
};
