import { useEffect, useRef } from "react";

export default function useSnapHeightToBottomOf(
    height,
    itemNumber = 0,
    style = "height"
) {
    const ref = useRef();
    useEffect(() => {
        if (ref.current) {
            const setHeight = height - ref.current.offsetTop;
            if (setHeight > 0) {
                ref.current.style[style] =
                    (setHeight > 0 ? setHeight : 0) + "px";
            }
        }
    }, [height, itemNumber, style]);
    return ref;
}
