// A global context to set/get shared objects across app components
// without passing them through props.
// It is different from Redux as it can store non-serializable objects ( i.e. functions to play audio, show message box, etc. )
// TODO: implement a re-render when a ref is added/updated through "updates" state

import { createContext, useCallback, useContext, useRef } from "react";
import { AudioRef, ContextPopupRef, MessageBoxRef } from "./components/types";

export type RefsType = { [x: string]: object; };

//TODO: implement a generic type
export type AppRefsType = {
	add: (id: string, ref: object) => void;
	get: (id: string) => object | undefined;
};

export const AppRefs = createContext({} as AppRefsType);

const RefsProvider: React.FC<{ children: React.ReactNode; }> = ({
	children,
}) => {
	// const [updates, setUpdates] = useState(0);
	const refs = useRef({} as RefsType);

	const addRef = useCallback((id: string, ref: object) => {
		if (refs.current[id] !== undefined) {
			Object.assign(refs.current[id], ref);
		} else {
			refs.current[id] = ref;
		}
		// setUpdates((updates) => updates + 1);
		// console.log(`RefsProvider/${id} add`);
	}, []);

	const getRef = useCallback((id: string) => {
		// console.log(`RefsProvider/${id} get`);
		return refs.current[id];
	}, []);

	return (
		<AppRefs.Provider value={{ add: addRef, get: getRef }}>
			{children}
		</AppRefs.Provider>
	);
};

export default RefsProvider;

//Quick hooks to access common refs

export const useMessageBox = () => {
	const refs = useContext(AppRefs);
	return refs.get("msgBox") as MessageBoxRef | undefined;
};

export const useAudio = () => {
	const refs = useContext(AppRefs);
	return refs.get("audio") as AudioRef | undefined;
};

export const useContextPopup = () => {
	const refs = useContext(AppRefs);
	return refs.get("contextPopup") as ContextPopupRef | undefined;
};
