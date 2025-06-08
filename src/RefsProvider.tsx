import { createContext, useCallback, useContext, useRef } from "react";

export type RefsType = { [x: string]: any };

export type AppRefsType = {
    add: (id: string, ref: any) => void;
    get: (id: string) => any;
};

export const AppRefs = createContext({} as AppRefsType);

export default function RefsProvider({
    children,
}: {
    children: React.ReactNode;
}): JSX.Element {
    // const [updates, setUpdates] = useState(0);
    const refs = useRef({} as RefsType);

    const addRef = useCallback((id: string, ref: any) => {
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
