import React, { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { useHistory } from "react-router-dom";
import { analytics } from "../services/analytics";
import { getArSuraName } from "../services/qData";
import { gotoSura } from "../store/navSlice";
import SuraName from "./SuraName";

export const SimpleSuraIndexCell = ({ sura: suraIndex, selectedSura }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const trigger = "chapters_simple_index";
    const btnRef = useRef(null);

    const onClickSura = (e) => {
        analytics.logEvent("goto_chapter", {
            chapter_num: suraIndex + 1,
            chapter: getArSuraName(suraIndex),
            trigger,
        });

        return dispatch(gotoSura(history, suraIndex));
    };

    useEffect(() => {
        if (suraIndex === selectedSura) {
            btnRef.current?.focus?.();
        }
    }, [selectedSura, suraIndex]);

    return (
        <li className="SuraIndexCell">
            <button
                ref={btnRef}
                onClick={onClickSura}
                className={suraIndex === selectedSura ? "active" : ""}
                style={{ display: "flex", alignItems: "center" }}
            >
                {suraIndex + 1 + ". "} <SuraName index={suraIndex} />
            </button>
        </li>
    );
};
