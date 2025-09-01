import { CommandButton } from "@/components/CommandButton";
import { useHistory } from "@/hooks/useHistory";
import { useContextPopup } from "@/RefsProvider";
import { getPageFirstAyaId } from "@/services/qData";
import { selectIsNarrow } from "@/store/layoutSlice";
import { gotoAya, selectMaskOn, showMask } from "@/store/navSlice";
import { AudioState, selectAudioState } from "@/store/playerSlice";
import { AudioRange } from "@/store/settingsSlice";
import { useDispatch, useSelector } from "react-redux";

type PageContextButtonsProps = {
	page: number; // The page number for which the buttons are displayed
};

export const PageContextButtons = ({ page }: PageContextButtonsProps) => {
	const audioState = useSelector(selectAudioState);
	const dispatch = useDispatch();
	const isMaskOn = useSelector(selectMaskOn);
	const history = useHistory();
	const isNarrow = useSelector(selectIsNarrow);
	const contextPopup = useContextPopup();

	const trigger = "page_context";

	return (
		<div className="IconsBar" dir="rtl">
			{isNarrow && <CommandButton command="PrevPage" trigger={trigger} />}
			<CommandButton
				{...{
					trigger,
					command:
						audioState === AudioState.stopped ? "Play" : "Stop",
					audioRepeat: AudioRange.page,
					playAya: getPageFirstAyaId(page),
				}}
			/>
			<CommandButton {...{ trigger, command: "update_hifz" }} />
			<CommandButton
				{...{
					trigger,
					command: "Mask",
					onClick: isMaskOn ? undefined : () => {
						dispatch(
							gotoAya(history, getPageFirstAyaId(page), {
								sel: true,
							})
						);
						dispatch(showMask());
						contextPopup.close();
					},
				}}
			/>
			<CommandButton {...{ trigger, command: "Goto" }} />
			{/* {isNarrow && <CommandButton command="NextPage" trigger={trigger} />} */}
		</div>
	);
};
