import { useHistory } from "@/hooks/useHistory";
import { useContextPopup, useMessageBox } from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import {
	getPagePartNumber,
	getPageSuraIndex,
	TOTAL_PAGES
} from "@/services/qData";
import { commandKey, keyValues } from "@/services/utils";
import { AppDispatch } from "@/store/config";
import {
	PAGE_HEADER_HEIGHT,
	selectActivePage,
	selectShownPages,
} from "@/store/layoutSlice";
import { gotoPage } from "@/store/navSlice";
import { AudioState, selectAudioState } from "@/store/playerSlice";
import { useMemo } from "react";
import { FormattedMessage, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { CircleProgress } from "../CircleProgress";
import { CommandIcon } from "../CommandIcon";
import PartsPie from "../PartsPie";
import PlayPrompt from "../PlayPrompt";
import { SuraContextHeader } from "../SuraContextHeader";
import { SuraList } from "../SuraList";
import SuraName from "../SuraName";

type PageHeaderProps = {
	order: 0 | 1; // 0 for right page, 1 for left page
};

const trigger = "page_header";


export function PageHeader({ order }: PageHeaderProps) {
	const shownPages = useSelector(selectShownPages);
	const activePage = useSelector(selectActivePage);
	const pageIndex = shownPages[order];
	const msgBox = useMessageBox();
	const audioState = useSelector(selectAudioState);
	const contextPopup = useContextPopup();
	const dispatch = useDispatch() as AppDispatch;
	const history = useHistory();

	const suraIndex = useMemo(
		() => getPageSuraIndex(pageIndex + 1),
		[pageIndex]
	);
	const partIndex = useMemo(
		() => getPagePartNumber(pageIndex + 1) - 1,
		[pageIndex]
	);
	const intl = useIntl();
	const onTogglePlay = () => {
		msgBox.set({
			title: <FormattedMessage id="play" values={keyValues("r")} />,
			content: <PlayPrompt trigger={trigger} />,
		});
		// } else {
		//   audio.stop();
		// }
	};

	const audioCommand = audioState !== AudioState.playing ? "play" : "stop";
	const onClickHeader = () => {
		if (activePage !== pageIndex) {
			dispatch(gotoPage(history, pageIndex));
		}
	};

	const showSuraContextPopup = ({ target }: React.MouseEvent) => {
		analytics.logEvent("show_chapter_context", {
			trigger,
		});
		contextPopup.show({
			target,
			header: <SuraContextHeader sura={suraIndex} />,
			content: (
				<SuraList
					trigger="header_chapter_context"
					simple={true}
					listWidth={400}
					cellWidth={120}
				/>
			),
		});
	};

	const showPartContextPopup = ({
		currentTarget: target,
	}: React.MouseEvent) => {
		analytics.logEvent("show_part_context", { trigger });
		contextPopup.show({
			target,
			content: <PartsPie size={280} />, //<PartsList part={partIndex} />,
		});
	};


	return (
		<div
			className={"PageHeader".appendWord(
				"active",
				pageIndex === activePage
			)}
			style={{
				height: PAGE_HEADER_HEIGHT,
				boxSizing: "border-box",
			}}
			onClick={onClickHeader}
		>
			<FormattedMessage id="part" />
			<CircleProgress
				target={TOTAL_PAGES}
				progress={pageIndex + 1}
				display={partIndex + 1}
				onClick={showPartContextPopup}
				strokeWidth={3}
				title={intl.formatMessage(
					{ id: "part_num" },
					{ num: partIndex + 1 }
				)}
				style={{ margin: 1 }}
			/>
			<div className="HeaderFooterSection">
				<button
					// sura={suraIndex}
					onClick={onTogglePlay}
					title={intl.formatMessage(
						{
							id: audioCommand,
						},
						keyValues(commandKey(audioCommand))
					)}
				>
					<CommandIcon
						command={
							audioState === AudioState.stopped
								? "Play"
								: "AudioPlayer"
						}
					/>
				</button>
				<button
					onClick={showSuraContextPopup}
					title={intl.formatMessage(
						{ id: "sura_num" },
						{ num: suraIndex + 1 }
					)}
				>
					{suraIndex + 1}. <SuraName index={suraIndex} />
				</button>
			</div>
		</div>
	);
}
