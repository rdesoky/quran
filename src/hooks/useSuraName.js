import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { ayaIdInfo, TOTAL_SURAS } from "../services/QData";
import { selectStartSelection } from "../store/navSlice";
import { selectSuraNames } from "../store/uiSlice";

export default function useSuraName(index = -1) {
    const [suraIndex, setSuraIndex] = useState(index);
    const selectedAya = useSelector(selectStartSelection);
    const suraNames = useSelector(selectSuraNames);
    const [suraName, setSuraName] = useState(suraNames?.[index]);

    useEffect(() => {
        if (index === -1) {
            const ayaInfo = ayaIdInfo(selectedAya);
            setSuraIndex(ayaInfo.sura);
        } else if (index < TOTAL_SURAS) {
            setSuraIndex(index);
        }
    }, [selectedAya, index]);

    useEffect(() => {
        if (suraIndex !== -1 && suraNames.length > 0) {
            setSuraName(suraNames?.[suraIndex]);
        }
    }, [suraIndex, suraNames]);

    return suraName;
}
