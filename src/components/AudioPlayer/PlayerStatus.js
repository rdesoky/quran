import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { ayaIdInfo } from "../../services/qData";
import { gotoAya, selectStartSelection } from "../../store/navSlice";
import {
    AudioState,
    selectAudioState,
    selectPlayingAya,
} from "../../store/playerSlice";
import "./AudioPlayer.scss";

export const PlayerStatus = () => {
    const dispatch = useDispatch();
    const selectStart = useSelector(selectStartSelection);
    const playingAya = useSelector(selectPlayingAya);
    const audioState = useSelector(selectAudioState);

    // const { selectStart } = app;
    // const { playingAya, audioState } = player;
    let ayaId = playingAya === -1 ? selectStart : playingAya;
    let { sura, aya } = ayaIdInfo(ayaId);
    let stateId = "unknown";
    switch (audioState) {
        case AudioState.stopped:
            stateId = "stopped";
            break;
        case AudioState.buffering:
            stateId = "buffering";
            break;
        case AudioState.playing:
            stateId = "playing";
            break;
        case AudioState.paused:
            stateId = "paused";
            break;
        case AudioState.error:
            stateId = "error";
            break;
        default:
            break;
    }

    const gotoPlayingAya = (e) => {
        dispatch(gotoAya(ayaId, { sel: true }));
    };

    return (
        <button onClick={gotoPlayingAya} className="AudioStatusButton">
            <String id={stateId} />
            :&nbsp;
            <String id="sura_names">
                {(sura_names) => {
                    return sura_names.split(",")[sura] + " (" + (aya + 1) + ")";
                }}
            </String>
        </button>
    );
};
