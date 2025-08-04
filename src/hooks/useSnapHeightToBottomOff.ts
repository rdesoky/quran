import { useEffect, useRef } from "react";

const MIN_HEIGHT = 10;

export default function useSnapHeightToBottomOf(
    height: number,
    itemNumber: number | string = 0,
    style: "height" | "maxHeight" = "height"
) {
    const ref = useRef<HTMLDivElement>(null);
    // useEffect(() => {
    //     if (ref.current) {
    //         const setHeight = height - ref.current.offsetTop;
    //         if (setHeight > MIN_HEIGHT) {
    //             ref.current.style[style] =
    //                 (setHeight > 0 ? setHeight : 0) + "px";
    //         } else {
    //             ref.current.style[style] = MIN_HEIGHT + "px";
    //         }
    //     }
    // }, [height, itemNumber, style]);
    return ref;
}
