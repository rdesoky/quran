import { createContext, useCallback, useRef } from "react";

export const Refs = createContext();

export default function RefsProvider({ children }) {
    const refs = useRef({});

    const addRef = useCallback((id, ref) => {
        refs.current[id] = ref;
    }, []);

    const getRef = useCallback((id) => {
        return refs.current[id];
    }, []);

    return (
        <Refs.Provider value={{ add: addRef, get: getRef }}>
            {children}
        </Refs.Provider>
    );
}
