import React from "react";
import { useSelector } from "react-redux";
import { getPageSuras } from "@/services/qData";
import { selectPageHeight } from "@/store/layoutSlice";
import { HifzSegment } from "@/components/HifzSegment";

type HifzSegmentsProps = {
    page: number;
    versesInfo: any[];
};

export const HifzSegments = ({ page, versesInfo }: HifzSegmentsProps) => {
    const pageHeight = useSelector(selectPageHeight);
    const page_suras = getPageSuras(page);
    return (
        <div className="HifzSegments" style={{ height: pageHeight }}>
            {page_suras.map((sura) => (
                <HifzSegment
                    key={page.toString() + "-" + sura.toString()}
                    sura={sura}
                    page={page}
                    // pageHeight={pageHeight}
                    versesInfo={versesInfo}
                />
            ))}
        </div>
    );
};
