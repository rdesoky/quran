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
import { FormattedMessage, useIntl } from "react-intl";
import { useContextPopup, useMessageBox } from "@/RefsProvider";
import PlayPrompt from "../PlayPrompt";
import { commandKey, keyValues } from "@/services/utils";
import { AudioState, selectAudioState } from "@/store/playerSlice";
import { analytics } from "@/services/analytics";
import { SuraContextHeader } from "../SuraContextHeader";
import { SuraList } from "../SuraList";
import { CommandIcon } from "../CommandIcon";
import PartsPie from "../PartsPie";

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
				// padding: "0 10px",
				boxSizing: "border-box",
				// borderRadius: "0 0 12px 0"
			}}
		>
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
			{/* <span style={{ padding: "0 10px" }}><SuraName index={suraIndex} /></span> */}
			<div className="HeaderFooterContent">
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
						<SuraName index={suraIndex} />
					</button>
				</div>
			</div>
		</div>
	);
}
