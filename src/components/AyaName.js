import { FormattedMessage as Message } from "react-intl";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import useSuraName from "../hooks/useSuraName";
import { ayaIdInfo } from "../services/QData";
import { gotoAya } from "../store/navSlice";

export default function AyaName({ index, clickable = false }) {
    const ayaInfo = ayaIdInfo(index);
    const suraName = useSuraName(ayaInfo.sura);
    const history = useHistory();
    const dispatch = useDispatch();

    const onClickAya = () => {
        dispatch(gotoAya(history, index, { sel: true }));
    };

    const msg = (
        <Message
            id="sura_name_aya_num"
            values={{ sura: suraName, aya: ayaInfo.aya + 1 }}
        />
    );

    return clickable ? <button onClick={onClickAya}>{msg}</button> : msg;
}
