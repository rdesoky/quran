import { useEffect } from "react";
import { useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { selectLang } from "../store/settingsSlice";
import { setSuraNames } from "../store/uiSlice";

export default function SuraNames() {
    // const appRefs = useContext(AppRefs);
    // const [suraNames, setSuraNames] = useState([]);
    const dispatch = useDispatch();
    const intl = useIntl();
    const lang = useSelector(selectLang);

    useEffect(() => {
        dispatch(
            setSuraNames(intl.formatMessage({ id: "sura_names" }).split(","))
        );
    }, [dispatch, intl, lang]);

    // useEffect(() => {
    //     setTimeout(() => {
    //         appRefs.add("suraNames", { suraNames });
    //     }, 1000);
    // }, [appRefs, suraNames]);

    return null;
}
