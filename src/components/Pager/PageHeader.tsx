import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPageSuraIndex,
} from "@/services/qData";
import {
    PAGE_HEADER_HEIGHT,
    selectActivePage,
    selectShownPages,
} from "@/store/layoutSlice";
import { selectStartSelection } from "@/store/navSlice";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import SuraName from "../SuraName";

type PageHeaderProps = {
    order: 0 | 1; // 0 for right page, 1 for left page
};

export function PageHeader({ order }: PageHeaderProps) {
    const shownPages = useSelector(selectShownPages);
    const activePage = useSelector(selectActivePage);
    const pageIndex = shownPages[order];
    const suraIndex = useMemo(
        () => getPageSuraIndex(pageIndex + 1),
        [pageIndex]
    );

    return (
        <div
            className={"PageHeader".appendWord(
                "active",
                pageIndex === activePage
            )}
            style={{
                height: PAGE_HEADER_HEIGHT,
                padding: "0 10px",
                boxSizing: "border-box",
            }}
        >
            {/* <div className="PageHeaderContent"> */}
            <SuraName index={suraIndex} />
            {/* </div> */}
        </div>
    );
}
