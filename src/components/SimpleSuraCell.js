import React, { useEffect } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { analytics } from "../services/Analytics";
import { getArSuraName } from "../services/QData";
import { gotoSura } from "../store/navSlice";
import SuraName from "./SuraName";

export const SimpleSuraIndexCell = ({ sura: suraIndex, selectedSura }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    let btn;
    const onClickSura = (e) => {
        analytics.logEvent("goto_chapter", {
            chapter_num: suraIndex + 1,
            chapter: getArSuraName(suraIndex),
        });

        return dispatch(gotoSura(history, suraIndex));
    };

    useEffect(() => {
        if (btn && suraIndex === selectedSura) {
            btn.focus();
        }
    }, [btn, selectedSura, suraIndex]);

    return (
        <li className="SuraIndexCell">
            <button
                ref={(ref) => {
                    btn = ref;
                }}
                onClick={onClickSura}
                className={suraIndex === selectedSura ? "active" : ""}
            >
                {suraIndex + 1 + ". "} <SuraName index={suraIndex} />
            </button>
        </li>
    );
};
