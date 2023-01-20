import {
    createContext,
    useCallback,
    useContext,
    useRef,
    useState,
} from "react";

export const AppRefs = createContext({});

export default function RefsProvider({ children }) {
    // const [updates, setUpdates] = useState(0);
    const refs = useRef({});

    const addRef = useCallback((id, ref) => {
        if (refs.current[id] !== undefined) {
            Object.assign(refs.current[id], ref);
        } else {
            refs.current[id] = ref;
        }
        // setUpdates((updates) => updates + 1);
        // console.log(`RefsProvider/${id} add`);
    }, []);

    const getRef = useCallback((id) => {
        // console.log(`RefsProvider/${id} get`);
        return refs.current[id];
    }, []);

    return (
        <AppRefs.Provider value={{ add: addRef, get: getRef }}>
            {children}
        </AppRefs.Provider>
    );
}

export const useMessageBox = () => {
    const refs = useContext(AppRefs);
    return refs.get("msgBox");
};

export const useAudio = () => {
    const refs = useContext(AppRefs);
    return refs.get("audio");
};

export const useContextPopup = () => {
    const refs = useContext(AppRefs);
    return refs.get("contextPopup");
};
