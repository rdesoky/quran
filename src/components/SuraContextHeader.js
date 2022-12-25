import React from "react";
import { SuraHifzChart } from "./Hifz";
import { SuraContextButtons } from "./SuraContextButtons";

export const SuraContextHeader = ({ sura }) => {
    // const [suraIndex, setSura] = useState(sura || 0);
    // useEffect(() => {
    //     const ayaInfo = ayaIdInfo(selectStart);
    //     setSura(ayaInfo.sura);
    // }, [selectStart]);

    return (
        <>
            <SuraContextButtons sura={sura} />
            <div className="SuraContextHeader">
                <SuraHifzChart sura={sura} />
                {/* <SuraNavigator sura={suraIndex} /> */}
            </div>
        </>
    );
};
