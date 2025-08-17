import Icon from "@/components/Icon";
import { PageContextButtons } from "@/components/Widgets";
import { useHistory } from "@/hooks/useHistory";
import { useContextPopup } from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import { selectActivePage, selectIsNarrow } from "@/store/layoutSlice";
import { gotoPage } from "@/store/navSlice";
import { faAngleLeft, faAngleRight } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";

type PageFooterProps = {
	index: number;
	order: number;
	onArrowKey?: (shiftKey: boolean, direction: "up" | "down") => void;
	onPageDown?: () => void;
	onPageUp?: () => void;
};

const trigger = "page_footer";

const PageFooter: React.FC<PageFooterProps> = ({
	index: pageIndex,
	// order,
	// onArrowKey,
	onPageDown,
	onPageUp,
}) => {
	const intl = useIntl();
	const history = useHistory();
	const dispatch = useDispatch();
	const contextPopup = useContextPopup();
	const activePage = useSelector(selectActivePage);
	// const { runCommand } = useCommands();
	const isNarrow = useSelector(selectIsNarrow);

	const showPageContextPopup = (e: React.MouseEvent) => {
		e.stopPropagation();
		const { target } = e;
		analytics.logEvent("show_page_context", { trigger });
		contextPopup.show({
			target,
			content: <PageContextButtons page={pageIndex} />,
		});
	};

	const gotoNextPage = (e: React.MouseEvent) => {
		e.stopPropagation();
		analytics.setTrigger(trigger);
		onPageDown?.();
	};

	const gotoPrevPage = (e: React.MouseEvent) => {
		e.stopPropagation();
		analytics.setTrigger(trigger);
		onPageUp?.();
	};

	const onClickFooter = () => {
		if (activePage !== pageIndex) {
			dispatch(gotoPage(history, pageIndex));
		}
		// runCommand("Commands", "page_footer");
	};

	// const audioCommand = audioState !== AudioState.playing ? "play" : "stop";

	return (
		<div
			className={"PageFooter".appendWord(
				"active",
				pageIndex === activePage
			)}
			onClick={onClickFooter}
		>
			{/* <div
				className="HeaderFooterContent"
				style={{ maxWidth: pagerWidth - (isNarrow ? 50 : 0) }}
			> */}
			<div className="HeaderFooterSection">
				{!isNarrow && (
					<button
						className="NavButton NavBackward"
						onClick={gotoPrevPage}
					>
						<Icon icon={faAngleRight} />
					</button>
				)}
				<button
					onClick={showPageContextPopup}
					className="IconButton"
					title={intl.formatMessage(
						{ id: "page_num" },
						{ num: pageIndex + 1 }
					)}
				// style={{ minWidth: 25 }}
				>
					<FormattedMessage
						id={"pg_num"}
						values={{ num: pageIndex + 1 }}
					/>
				</button>
				{/* {!isNarrow && ( */}
				<button
					onClick={gotoNextPage}
					className="NavButton NavForward"
				>
					<Icon icon={faAngleLeft} />
				</button>
				{/* )} */}
			</div>
		</div>
	);
};

export default PageFooter;
