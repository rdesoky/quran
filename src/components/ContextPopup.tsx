import { useContext, useEffect, useRef, useState } from "react";
import { useSelector } from "react-redux";
import { AppRefs } from "@/RefsProvider";
import { selectAppHeight, selectAppWidth } from "@/store/layoutSlice";
import { ContextPopupType } from "@/components/Modal/PopupView";

export const ContextPopup = () => {
    const refs = useContext(AppRefs);
    const [contextPopup, setContextPopup] = useState<ContextPopupType | null>(
        null
    );
    const appHeight = useSelector(selectAppHeight);
    const appWidth = useSelector(selectAppWidth);
    const popupRef = useRef<HTMLDivElement | null>(null);

    const closePopup = (e: React.MouseEvent) => {
        setContextPopup(null);
    };

    useEffect(() => {
        //hide the context popup when the app width changes
        setContextPopup(null);
    }, [appWidth]);

    useEffect(() => {
        refs.add("contextPopup", {
            show: (info: ContextPopupType) => {
                setContextPopup(info);
            },
            close: () => {
                setContextPopup(null);
            },
            info: contextPopup,
        });
    }, [refs, contextPopup]);

    useEffect(() => {
        //Make sure the popup is not outside the viewport
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
                    left,
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
                    left,
                }}
            ></div>
        </div>
    );
};
