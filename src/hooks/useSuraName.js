import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { selectStartSelection } from "../store/navSlice";
import { ayaIdInfo, TOTAL_SURAS } from "../services/QData";
import useSuraNames from "./useSuraNames";

export default function useSuraName(index = -1) {
  const [suraIndex, setSuraIndex] = useState(-1);
  const selectedAya = useSelector(selectStartSelection);
  const suraNames = useSuraNames();
  const [suraName, setSuraName] = useState("");

  useEffect(() => {
    if (index === -1) {
      const ayaInfo = ayaIdInfo(selectedAya);
      setSuraIndex(ayaInfo.sura);
    } else if (index < TOTAL_SURAS) {
      setSuraIndex(index);
    }
  }, [selectedAya, index]);

  useEffect(() => {
    if (suraIndex !== -1) {
      setSuraName(suraNames?.[suraIndex]);
    }
  }, [suraIndex, suraNames]);

  return suraName;
}
