import React, { useDeferredValue, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { analytics } from "../services/analytics";
import { ayaIdInfo } from "../services/qData";
import { selectPagerWidth, selectPopupWidth } from "../store/layoutSlice";
import { selectStartSelection } from "../store/navSlice";
import { SimpleSuraIndexCell } from "./SimpleSuraCell";
import { SuraIndexCell } from "./SuraIndexCell";

export const SuraList = ({
    filter,
    simple,
    trigger = "chapters_index",
    listWidth: requestedWidth,
    cellWidth: requestedCellWidth,
}) => {
    const popupWidth = useSelector(selectPopupWidth);
    const selectStart = useSelector(selectStartSelection);
    const [actionsIndex, setActionsIndex] = useState(0);
    const selectedAya = useDeferredValue(selectStart);
    const pagerWidth = useSelector(selectPagerWidth);

    useEffect(() => {
        analytics.setTrigger(trigger);
    }, [trigger]);

    useEffect(() => {
        const currentSura = ayaIdInfo(selectedAya).sura;
        setActionsIndex(currentSura);
    }, [selectedAya]);

    const CellComponent = simple ? SimpleSuraIndexCell : SuraIndexCell;
    const maxWidth = pagerWidth - 50;
    const autoWidth = popupWidth - 50;
    const autoCellWidth = 180;
    const width = requestedWidth
        ? requestedWidth > maxWidth
            ? maxWidth
            : requestedWidth
        : undefined;
    const tableWidth = width || autoWidth;
    const columnWidth = requestedCellWidth || autoCellWidth;
    const columnCount = Math.floor(tableWidth / columnWidth);
    return (
        <ul
            className="SpreadSheet"
            style={{
                width,
                columnCount,
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
