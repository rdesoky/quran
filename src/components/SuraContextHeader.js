import React from "react";
import { SuraHifzChart } from "./Hifz";

export const SuraContextHeader = ({ sura }) => {
    // const [suraIndex, setSura] = useState(sura || 0);
    // useEffect(() => {
    //     const ayaInfo = ayaIdInfo(selectStart);
    //     setSura(ayaInfo.sura);
    // }, [selectStart]);

    return (
        <div className="SuraContextHeader">
            <SuraHifzChart sura={sura} />
            {/* <SuraNavigator sura={suraIndex} /> */}
        </div>
    );
};
