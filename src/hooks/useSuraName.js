import { useIntl } from "react-intl";
import { useEffect, useState } from "react";

export default function useSuraName(index) {
    const [suraName, setSuraName] = useState();
    const intl = useIntl();
    useEffect(() => {
        const suraNames = intl.formatMessage({ id: "sura_names" }).split(",");
        setSuraName(suraNames?.[index]);
    }, [index, intl]);
    return suraName;
}
