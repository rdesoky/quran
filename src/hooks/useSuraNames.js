import { useEffect, useState } from "react";
import { useIntl } from "react-intl";

export default function useSuraNames() {
    const [suraNames, setSuraNames] = useState([]);
    const intl = useIntl();

    useEffect(() => {
        setSuraNames(intl.formatMessage({ id: "sura_names" }).split(","));
    }, [intl]);

    return suraNames;
}
