import React from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { ayaID } from "@/services/qData";
import { gotoAya, selectMaskOn, showMask } from "@/store/navSlice";
import { CommandButton } from "@/components/CommandButton";

export const SuraContextButtons = ({ sura }) => {
    // const audioState = useSelector(selectAudioState);
    const dispatch = useDispatch();
    const history = useHistory();
    const trigger = "sura_context";
    const isMaskOn = useSelector(selectMaskOn);

    return (
        <div className="IconsBar">
            {/* <CommandButton
                {...{
                    trigger,
                    command:
                        audioState === AudioState.stopped ? "Play" : "Stop",
                    audioRepeat: AudioRepeat.sura,
                    playAya: ayaID(sura, 0),
                }}
            /> */}
            <CommandButton {...{ trigger, command: "update_hifz" }} />
            {!isMaskOn && (
                <CommandButton
                    {...{
                        trigger,
                        command: "Mask",
                        onClick: () => {
                            dispatch(
                                gotoAya(history, ayaID(sura, 0), { sel: true })
                            );
                            dispatch(showMask());
                        },
                    }}
                />
            )}
            <CommandButton {...{ trigger, command: "Goto" }} />
        </div>
    );
};
