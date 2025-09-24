import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { ayaID } from "@/services/qData";
import { gotoAya, selectMaskOn, showMask } from "@/store/navSlice";
import { CommandButton } from "@/components/CommandButton";
import { AudioState, selectAudioState } from "@/store/playerSlice";
import { AudioRange } from "@/store/settingsSlice";
import { useContextPopup } from "@/RefsProvider";

type SuraContextButtonsProps = {
	sura: number; // The Sura number for which the buttons are displayed
};

export const SuraContextButtons = ({ sura }: SuraContextButtonsProps) => {
	const audioState = useSelector(selectAudioState);
	const dispatch = useDispatch();
	const history = useHistory();
	const trigger = "sura_context";
	const isMaskOn = useSelector(selectMaskOn);
	const contextPopup = useContextPopup();

	return (
		<div className="IconsBar">
			<CommandButton
				{...{
					trigger,
					command:
						audioState === AudioState.stopped ? "Play" : "Stop",
					audioRepeat: AudioRange.sura,
					playAya: ayaID(sura, 0),
				}}
			/>
			<CommandButton {...{ trigger, command: "update_hifz" }} />
			<CommandButton
				{...{
					trigger,
					command: "Mask",
					onClick: isMaskOn ? undefined : () => {
						dispatch(
							gotoAya(history, ayaID(sura, 0), { sel: true })
						);
						dispatch(showMask());
						contextPopup?.close();
					},
				}}
			/>
			<CommandButton {...{ trigger, command: "Goto" }} />
		</div>
	);
};
