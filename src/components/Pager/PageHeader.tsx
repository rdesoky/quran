import {
	getPagePartNumber,
	getPageSuraIndex,
	TOTAL_PAGES
} from "@/services/qData";
import {
	PAGE_HEADER_HEIGHT,
	selectActivePage,
	selectShownPages,
} from "@/store/layoutSlice";
import { useMemo } from "react";
import { useSelector } from "react-redux";
import SuraName from "../SuraName";
import { CircleProgress } from "../CircleProgress";
import { useIntl } from "react-intl";

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
	const partIndex = useMemo(
		() => getPagePartNumber(pageIndex + 1) - 1,
		[pageIndex]
	);
	const intl = useIntl();


	return (
		<div
			className={"PageHeader".appendWord(
				"active",
				pageIndex === activePage
			)}
			style={{
				height: PAGE_HEADER_HEIGHT,
				// padding: "0 10px",
				boxSizing: "border-box",
				borderRadius: 12
			}}
		>
			<CircleProgress
				target={TOTAL_PAGES}
				progress={pageIndex + 1}
				display={partIndex + 1}
				// onClick={showPartContextPopup}
				strokeWidth={3}
				title={intl.formatMessage(
					{ id: "part_num" },
					{ num: partIndex + 1 }
				)}
				style={{ margin: 1 }}
			/>

			<span style={{ padding: "0 10px" }}><SuraName index={suraIndex} /></span>

		</div>
	);
}
