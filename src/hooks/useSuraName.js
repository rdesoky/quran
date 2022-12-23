import { useContext, useEffect, useState } from "react";
import { AppRefs } from "../RefsProvider";

export default function useSuraName(index) {
    const ref = useContext(AppRefs).get("suraNames");
    const [suraName, setSuraName] = useState("");

    useEffect(() => {
        if (ref?.suraNames?.length > index) {
            setSuraName(ref.suraNames?.[index]);
        }
    }, [index, ref]);

    return suraName;
}
