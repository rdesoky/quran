import { createContext, useCallback, useRef } from "react";

export const AppRefs = createContext();

export default function RefsProvider({ children }) {
    const refs = useRef({});

    const addRef = useCallback((id, ref) => {
        if (refs.current[id] !== undefined) {
            Object.assign(refs.current[id], ref);
        } else {
            refs.current[id] = ref;
        }
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
