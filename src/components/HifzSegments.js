import React from "react";
import { useSelector } from "react-redux";
import { getPageSuras } from "../services/QData";
import { selectPageHeight } from "../store/layoutSlice";
import { HifzSegment } from "./HifzSegment";

export const HifzSegments = ({ page, versesInfo }) => {
    const pageHeight = useSelector(selectPageHeight);
    const page_suras = getPageSuras(page);
    return (
        <div className="HifzSegments" style={{ height: pageHeight }}>
            {page_suras.map((sura) => (
                <HifzSegment
                    key={page.toString() + "-" + sura.toString()}
                    sura={sura}
                    page={page}
                    pageHeight={pageHeight}
                    versesInfo={versesInfo}
                />
            ))}
        </div>
    );
};
