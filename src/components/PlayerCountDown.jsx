import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import {
    AudioState,
    selectAudioState,
    selectRemainingTime,
    selectTrackDuration,
} from "../store/playerSlice";

export default function PlayerCountDown({ sqSize = 32, strokeWidth = 3 }) {
    const audioState = useSelector(selectAudioState);
    const [show, setShow] = useState(false);
    const target = Math.floor(useSelector(selectTrackDuration));
    const progress = Math.floor(useSelector(selectRemainingTime));

    useEffect(() => {
        if (
            [
                AudioState.playing,
                AudioState.buffering,
                AudioState.paused,
            ].includes(audioState)
        ) {
            setShow(true);
        } else {
            setShow(false);
        }
    }, [audioState]);
    if (!show) {
        return null;
    }

    // SVG centers the stroke width on the radius, subtract out so circle fits in square
    const radius = (sqSize - strokeWidth) / 2;
    // Enclose circle in a circumscribing square
    // const viewBox = `0 0 ${sqSize} ${sqSize}`;
    // Arc length at 100% coverage is the circle circumference
    const dashArray = radius * Math.PI * 2;
    // Scale 100% coverage overlay with the actual percent
    const percentage = progress / target;
    const dashOffset = dashArray - dashArray * percentage;
    return (
        <svg width={sqSize} height={sqSize} viewBox={`0 0 ${sqSize} ${sqSize}`}>
            <circle
                className="circle-background"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
            />
            <circle
                className="circle-progress"
                cx={sqSize / 2}
                cy={sqSize / 2}
                r={radius}
                strokeWidth={`${strokeWidth}px`}
                // Start progress marker at 12 O'Clock
                transform={`rotate(-90 ${sqSize / 2} ${sqSize / 2})`}
                style={{
                    strokeDasharray: dashArray,
                    strokeDashoffset: dashOffset,
                }}
            />
            <text
                className="circle-text"
                x="50%"
                y="50%"
                dy=".3em"
                textAnchor="middle"
            >
                {`${progress}`}
            </text>
        </svg>
    );
}
