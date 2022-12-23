import { useContext, useEffect } from "react";
import useSuraNames from "../hooks/useSuraNames";
import { AppRefs } from "../RefsProvider";

export default function SuraNames() {
    const appRefs = useContext(AppRefs);
    const suraNames = useSuraNames();

    useEffect(() => {
        appRefs.add("suraNames", { suraNames });
    }, [appRefs, suraNames]);

    return null;
}
