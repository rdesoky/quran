import { useContext, useEffect, useState } from "react";
import { AppRefs } from "../RefsProvider";
import { useSelector } from "react-redux";
import { selectLang } from "../store/settingsSlice";

export default function useSuraNames() {
  const [suraNames, setSuraNames] = useState([]);
  const lang = useSelector(selectLang);
  const ref = useContext(AppRefs).get("suraNames");
  useEffect(() => {
    let cancelled = false;
    if (ref) {
      setSuraNames(ref.suraNames);
      setTimeout(() => {
        //using setTimeout to make sure the provider is updated before the consumer reads it
        if (!cancelled) {
          setSuraNames(ref.suraNames);
        }
      }, 100);
    }
    return () => {
      cancelled = true;
    };
  }, [lang, ref]);

  return suraNames;
}
