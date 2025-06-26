import { FormattedMessage as Message } from "react-intl";
import { useDispatch } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import useSuraName from "../hooks/useSuraName";
import { ayaIdInfo } from "../services/qData";
import { gotoAya } from "../store/navSlice";

type AyaNameProps = {
    index: number;
    clickable?: boolean;
};

export default function AyaName({ index, clickable = false }: AyaNameProps) {
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
