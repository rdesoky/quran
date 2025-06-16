import React from "react";
import { SuraHifzChart } from "@/components/Hifz";
import { SuraContextButtons } from "@/components/SuraContextButtons";

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
