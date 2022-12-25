import { useSelector } from "react-redux";
import { selectAppHeight, selectAppWidth } from "../store/layoutSlice";
import { useContext, useEffect, useRef, useState } from "react";
import { AppRefs } from "../RefsProvider";

export const ContextPopup = () => {
    const refs = useContext(AppRefs);
    const [contextPopup, setContextPopup] = useState();
    const appHeight = useSelector(selectAppHeight);
    const appWidth = useSelector(selectAppWidth);
    const closePopup = (e) => {
        setContextPopup(null);
    };
    const popupRef = useRef();

    useEffect(() => {
        setContextPopup(null);
    }, [appWidth]);

    useEffect(() => {
        refs.add("contextPopup", {
            show: (info) => {
                setContextPopup(info);
            },
            close: () => {
                setContextPopup(null);
            },
            info: contextPopup,
        });
    }, [refs, contextPopup]);

    useEffect(() => {
        const popup = popupRef.current;
        if (popup) {
            const popupRect = popup?.getBoundingClientRect?.();
            if (popupRect.left < 0) {
                popup.style.left = popupRect.width / 2 + "px";
            } else if (popupRect.right > appWidth) {
                let shift = popupRect.right - appWidth;
                if (shift > popupRect.left) {
                    shift = popupRect.left;
                }
                popup.style.left =
                    (popupRect.width / 2 + popupRect.left - shift).toString() +
                    "px";
            }
        }
    }, [appWidth, contextPopup]);

    // const stopPropagation = e => {
    //     e.stopPropagation();
    // };
    if (!contextPopup) {
        return null;
    }
    const { target, content, header } = contextPopup; //app.getContextPopup();
    const targetRect = target.getBoundingClientRect();
    if (!targetRect.width) {
        return null;
    }
    const left = targetRect.left + targetRect.width / 2;
    const isBelow = appHeight - targetRect.bottom > targetRect.top;
    return (
        <div className="ContextPopupBlocker" onClick={closePopup}>
            <div
                className={"ContextPopup".appendWord("DownPointer", !isBelow)}
                ref={popupRef}
                style={{
                    top: isBelow ? targetRect.bottom + 15 : undefined,
                    bottom: !isBelow
                        ? appHeight - targetRect.top + 15
                        : undefined,
                    left: left,
                    maxHeight:
                        (isBelow
                            ? appHeight - targetRect.bottom
                            : targetRect.top) - 40,
                }}
            >
                {content && <div className="ContextBody">{content}</div>}
                {header && <div className="ContextHeader">{header}</div>}
            </div>
            <div
                className={"PopupPointer".appendWord("DownPointer", !isBelow)}
                style={{
                    top: isBelow ? targetRect.bottom : undefined,
                    bottom: !isBelow ? appHeight - targetRect.top : undefined,
                    left: left,
                }}
            ></div>
        </div>
    );
};
