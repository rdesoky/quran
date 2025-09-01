import { CommandButton } from "@/components/CommandButton";
import { AudioState, selectAudioState } from "@/store/playerSlice";
import { AudioRange } from "@/store/settingsSlice";
import { selectPopup } from "@/store/uiSlice";
import { useSelector } from "react-redux";

export const VerseContextButtons = () => {
	const audioState = useSelector(selectAudioState);
	const popup = useSelector(selectPopup);
	const trigger = "verse_context";

	return (
		<div className="IconsBar">
			{audioState === AudioState.stopped ? (
				<CommandButton
					{...{
						trigger,
						command: "Play",
						audioRepeat: AudioRange.selection,
					}}
				/>
			) : (
				<CommandButton trigger="verse_context" command="Stop" />
			)}
			{popup !== "Tafseer" ? (
				<CommandButton trigger="verse_context" command="Tafseer" />
			) : null}
			<CommandButton trigger="verse_context" command="Mask" />
			<CommandButton trigger="verse_context" command="update_hifz" />
			<CommandButton trigger="verse_context" command="Copy" />
			<CommandButton trigger="verse_context" command="Bookmark" />
		</div>
	);
};
