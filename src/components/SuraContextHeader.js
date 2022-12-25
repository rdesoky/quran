import React from "react";
import { SuraHifzChart } from "./Hifz";
import { SuraContextButtons } from "./SuraContextButtons";

export const SuraContextHeader = ({ sura }) => {
    return (
        <>
            <div className="SuraContextHeader">
                <SuraHifzChart sura={sura} />
                {/* <SuraNavigator sura={suraIndex} /> */}
            </div>
            <SuraContextButtons sura={sura} />
        </>
    );
};
