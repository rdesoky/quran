import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useAudio } from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import { ListReciters } from "@/services/audioData";
import { selectAppWidth } from "@/store/layoutSlice";
import {
    AudioState,
    selectAudioState,
    selectPlayingAya,
} from "@/store/playerSlice";
import { changeReciter, selectReciter } from "@/store/settingsSlice";
import ReciterName from "@/components/AudioPlayer/ReciterName";

type RecitersGridProps = {
    trigger?: string;
    onClick?: (reciter: string) => void;
};

export default function RecitersGrid({ trigger, onClick }: RecitersGridProps) {
    const [userAction, setUserAction] = useState(false);
    const audio = useAudio();
    const audioState = useSelector(selectAudioState);

    const recitersList = ListReciters("ayaAudio");
    const buttonWidth = 90;
    const [recitersListWidth, setListWidth] = useState<number>(100);

    const recitersPerRow = Math.floor(recitersListWidth / buttonWidth);
    const recitersRowsCount = Math.floor(
        (recitersList.length - 1) / recitersPerRow + 1
    );
    const recitersHeight = recitersRowsCount * buttonWidth + 15;
    const centerPadding =
        (recitersListWidth - recitersPerRow * buttonWidth) / 2;

    const activeReciter = useSelector(selectReciter);
    const dispatch = useDispatch();
    const bodyRef = useRef<HTMLDivElement | null>(null);
    const playingAya = useSelector(selectPlayingAya);
    const appWidth = useSelector(selectAppWidth);

    useEffect(() => {
        bodyRef.current && setListWidth(bodyRef.current.clientWidth);
    }, [appWidth]);

    useEffect(() => {
        if (userAction) {
            bodyRef.current?.scrollIntoView?.({
                behavior: "smooth",
                block: "start",
                inline: "start",
            });
        }
    }, [activeReciter, userAction]);

    const onSelectReciter = (reciter: ReciterID) => {
        // if (!reciter) {
        //     return;
        // }

        if (reciter === activeReciter) {
            onClick?.(reciter);
        } else {
            setUserAction(true);
            dispatch(changeReciter(reciter));
            analytics.logEvent("set_reciter", { reciter, trigger });

            if (playingAya) {
                if (
                    [AudioState.playing, AudioState.buffering].includes(
                        audioState
                    )
                ) {
                    audio.play(playingAya, false); //restart playing aya, don't setup the repeat range
                } else if ([AudioState.paused].includes(audioState)) {
                    // audio.stop(); //change pause to stop ??
                }
            }
            //wait for animation
            setTimeout(() => {
                onClick?.(reciter);
            }, 600);
        }
    };

    return (
        <div
            className="RecitersList"
            style={{
                height: recitersHeight,
            }}
            ref={bodyRef}
        >
            {recitersList.map((reciter, index) => {
                const row = Math.floor(index / recitersPerRow);
                const top = row * 90;
                const col = index - row * recitersPerRow;
                // const left = col * buttonWidth + centerPadding;
                const left =
                    recitersListWidth -
                    (col * buttonWidth + centerPadding) -
                    buttonWidth;
                return (
                    <button
                        key={reciter}
                        className={
                            "ReciterButton" +
                            (reciter === activeReciter ? " Selected" : "")
                        }
                        onClick={() => onSelectReciter(reciter)}
                        style={{
                            top,
                            left,
                        }}
                    >
                        <img
                            className="ReciterIcon"
                            src={
                                import.meta.env.BASE_URL +
                                "images/" +
                                reciter +
                                ".jpg"
                            }
                            alt="reciter"
                        />
                        <div>
                            <ReciterName id={reciter} />
                        </div>
                    </button>
                );
            })}
        </div>
    );
}
