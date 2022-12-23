import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { analytics } from "../services/Analytics";
import { ayaIdInfo } from "../services/QData";
import { selectPopupWidth } from "../store/layoutSlice";
import { selectStartSelection } from "../store/navSlice";
import { SimpleSuraIndexCell } from "./SimpleSuraCell";
import { SuraIndexCell } from "./SuraIndexCell";

export const SuraList = ({ filter, simple, trigger = "chapters_index" }) => {
    const popupWidth = useSelector(selectPopupWidth);
    const selectStart = useSelector(selectStartSelection);
    const [actionsIndex, setActionsIndex] = useState(0);

    useEffect(() => {
        analytics.setTrigger(trigger);
    }, [trigger]);

    useEffect(() => {
        const currentSura = ayaIdInfo(selectStart).sura;
        setActionsIndex(currentSura);
    }, [selectStart]);

    const CellComponent = simple ? SimpleSuraIndexCell : SuraIndexCell;

    return (
        <ul
            className="SpreadSheet"
            style={{
                columnCount: Math.floor((popupWidth - 50) / 180), //-50px margin
            }}
        >
            {Array(114)
                .fill(0)
                .map((zero, suraIndex) => {
                    return (
                        <CellComponent
                            key={suraIndex}
                            sura={suraIndex}
                            filter={filter}
                            selectSura={setActionsIndex}
                            selectedSura={actionsIndex}
                            simple={simple}
                            trigger={trigger}
                        />
                    );
                })}
        </ul>
    );
};
