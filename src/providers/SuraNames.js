import { useContext, useEffect, useState } from "react";
import { AppRefs } from "../RefsProvider";
import { useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { selectLang } from "../store/settingsSlice";

export default function SuraNames() {
  const appRefs = useContext(AppRefs);
  const [suraNames, setSuraNames] = useState([]);
  const intl = useIntl();
  const lang = useSelector(selectLang);

  useEffect(() => {
    setSuraNames(intl.formatMessage({ id: "sura_names" }).split(","));
  }, [intl, lang]);

  useEffect(() => {
    appRefs.add("suraNames", { suraNames });
  }, [appRefs, suraNames]);

  return null;
}
