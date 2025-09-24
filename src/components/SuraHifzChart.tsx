import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { analytics } from "@/services/analytics";
import { dayLength } from "@/services/utils";
import { selectSuraRanges } from "@/store/dbSlice";
import { selectActivePage } from "@/store/layoutSlice";
import { gotoPage } from "@/store/navSlice";
import { getArSuraName, sura_info } from "@/services/qData";

type SuraHifzChartProps = {
	sura?: number;
	range?: HifzRange;
	pages?: boolean;
	onClickPage?: (page: number) => void;
	trigger?: string; // e.g., "header_chapter_index", "hifz_chart", etc.
};

export const SuraHifzChart: React.FC<SuraHifzChartProps> = ({
	sura,
	range,
	pages = true,
	onClickPage,
	trigger = "header_chapter_index",
}) => {
	const suraIndex = sura ?? range?.sura ?? 0;
	const suraRanges = useSelector(selectSuraRanges(suraIndex));
	const [activeRange, setActiveRange] = useState<HifzRange | null>(null);

	const suraInfo = sura_info[suraIndex];
	const suraPages = suraInfo.ep - suraInfo.sp + 1;
	const pageList = Array(suraPages).fill(0);
	const dispatch = useDispatch();
	const history = useHistory();
	const activePage = useSelector(selectActivePage);
	// const pageWidth = `${100 / suraPages}%`;

	useEffect(() => {
		if (range) {
			setActiveRange(range);
		}
	}, [range]);

	const suraStartPage = suraInfo.sp;

	const onClickChart = ({ target }: React.MouseEvent<HTMLDivElement>) => {
		const page = Number((target as HTMLElement).getAttribute("data-page"));

		if (onClickPage) {
			onClickPage(suraStartPage + page);
		} else {
			dispatch(
				gotoPage(history, suraStartPage + page - 1, {
					replace: false,
					sel: true,
				})
			);
		}

		if (sura) {
			analytics.logEvent("chart_page_click", {
				trigger,
				page,
				chapter_num: sura + 1,
				chapter: getArSuraName(sura),
			});
		}
	};

	return (
		<div className="SuraHifzChart" onClick={onClickChart}>
			<div className="HifzRanges">
				{suraRanges.map((r) => {
					const rangeStart = r.startPage - suraInfo.sp + 1;
					const start = (100 * rangeStart) / suraPages;
					const width = (100 * r.pages) / suraPages;
					let age,
						ageClass = "NoHifz";
					if (r.date !== undefined) {
						age = Math.floor((Date.now() - r.date) / dayLength);
						ageClass =
							age <= 7
								? "GoodHifz"
								: age <= 14
									? "FairHifz"
									: "WeakHifz";
					}
					return (
						<div
							key={`${r.startPage}-${r.sura}`}
							className={"SuraRange"
								.appendWord(ageClass)
								.appendWord(
									"active",
									activeRange !== null &&
									activeRange.startPage === r.startPage &&
									activeRange.sura === r.sura
								)}
							style={{
								right: `${start}%`,
								width: `${width}%`,
							}}
						/>
					);
				})}
			</div>
			<div className="PageThumbs">
				{pages
					? pageList.map((_z, i) => {
						const activeClass =
							activePage === i + suraInfo.sp - 1
								? "ActivePage"
								: "";
						return (
							<div
								key={i}
								data-page={i}
								className={"PageThumb".appendWord(
									activeClass
								)}
								title={String(i + 1)}
							//   style={{
							//       right: `${(100 * i) / suraPages}%`,
							//       width: pageWidth
							//   }}
							/>
						);
					})
					: null}
			</div>
		</div>
	);
};
