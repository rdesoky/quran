import React from "react";
import { useSelector } from "react-redux";
import { selectHifzRanges } from "@/store/dbSlice";
import { selectActivePage } from "@/store/layoutSlice";
import { getPageSuras } from "@/services/qData";
import { HifzRange } from "@/components/HifzRange";

export const AddHifz: React.FC = () => {
    const pageIndex = useSelector(selectActivePage);
    const hifzRanges = useSelector(selectHifzRanges);

    const suras = getPageSuras(pageIndex);

    return (
        <ul className="FlowingList">
            {suras.map((sura) => {
                const hifzRange = hifzRanges.find((r) => {
                    return (
                        r.sura === sura &&
                        pageIndex >= r.startPage &&
                        pageIndex <= r.endPage
                    );
                });
                return (
                    <HifzRange
                        range={
                            hifzRange ||
                            ({
                                sura,
                                startPage: pageIndex,
                                endPage: pageIndex,
                                pages: 1,
                            } as HifzRange)
                        }
                        key={pageIndex.toString() + "-" + sura.toString()}
                        showActions={true}
                        pages={true}
                        trigger="update_hifz_popup"
                    />
                );
            })}
        </ul>
    );
};
