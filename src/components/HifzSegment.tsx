import React from "react";
import { useSelector } from "react-redux";
import { selectHifzRanges } from "@/store/dbSlice";
import { selectPageHeight } from "@/store/layoutSlice";

type HifzSegmentProps = {
    sura: number;
    page: number;
    versesInfo: VerseInfo[];
};

export const HifzSegment: React.FC<HifzSegmentProps> = ({
    sura,
    page,
    versesInfo,
}) => {
    const pageHeight = useSelector(selectPageHeight);
    const hifzRanges = useSelector(selectHifzRanges);
    const suraVerses = versesInfo.filter((i) => Number(i.sura) - 1 === sura);
    if (suraVerses.length === 0) {
        return "";
    }

    // const { hifzRanges } = app;

    const hifzRange = hifzRanges?.find((r) => {
        return r.sura === sura && page >= r.startPage && page <= r.endPage;
    });

    if (hifzRange === undefined) {
        return "";
    }

    const dayLength = 24 * 60 * 60 * 1000;
    const age = Math.floor((Date.now() - hifzRange.date) / dayLength);
    const firstVerse = suraVerses[0];
    const lastVerse = suraVerses[suraVerses.length - 1];
    const sline = parseInt(firstVerse.sline);
    const top = (pageHeight * sline) / 15;
    const eline = parseInt(lastVerse.eline);
    const bottom = (pageHeight * (eline + 1)) / 15;
    const height = bottom - top;
    const ageClass =
        age <= 7 ? "GoodHifz" : age <= 14 ? "FairHifz" : "WeakHifz";

    return (
        <div
            className={`HifzSegment ${ageClass}`}
            style={{ top, height }}
        ></div>
    );
};
