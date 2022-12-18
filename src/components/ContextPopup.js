import { useSelector } from "react-redux";
import { selectAppHeight, selectAppWidth } from "../store/layoutSlice";
import { useEffect, useRef, useState } from "react";

export const contextPopupInfo = {};
export const showContextPopup = (info) => {
  window.dispatchEvent(new CustomEvent("show_context_popup", { detail: info }));
};
export const closeContextPopup = () => {
  window.dispatchEvent(new CustomEvent("close_context_popup"));
};

export const ContextPopup = () => {
  const [contextPopup, setContextPopup] = useState();
  const appHeight = useSelector(selectAppHeight);
  const appWidth = useSelector(selectAppWidth);
  const closePopup = (e) => {
    setContextPopup(null);
  };
  const popupRef = useRef();

  useEffect(() => {
    // app.setContextPopup(null);
    setContextPopup(null);
  }, [appWidth]);

  useEffect(() => {
    const onShowContextPopup = (e) => {
      setContextPopup(e.detail);
    };
    const onCloseContextPopup = ({ details: popupInfo }) => {
      setContextPopup(null);
    };
    window.addEventListener("show_context_popup", onShowContextPopup);
    window.addEventListener("close_context_popup", onCloseContextPopup);
    return () => {
      window.removeEventListener("show_context_popup", onShowContextPopup);
      window.removeEventListener("close_context_popup", onCloseContextPopup);
    };
  }, []);

  useEffect(() => {
    contextPopupInfo.context = contextPopup;
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
          (popupRect.width / 2 + popupRect.left - shift).toString() + "px";
      }
    }
  }, [contextPopup]);

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
          bottom: !isBelow ? appHeight - targetRect.top + 15 : undefined,
          left: left,
          maxHeight:
            (isBelow ? appHeight - targetRect.bottom : targetRect.top) - 40,
        }}
      >
        <div className="ContextHeader">{header}</div>
        <div className="ContextBody">{content}</div>
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
