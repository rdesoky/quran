import { useEffect, useRef } from "react";

export default function useSnapHeightToBottomOf(height, itemNumber = 0) {
    const ref = useRef();
    useEffect(() => {
        if (ref.current) {
            const setHeight = height - ref.current.offsetTop;
            if (setHeight > 0) {
                ref.current.style.height =
                    (setHeight > 0 ? setHeight : 0) + "px";
            }
        }
    }, [height, itemNumber]);
    return ref;
}
