import { faTimes } from "@fortawesome/free-solid-svg-icons";
import React from "react";
import { useSelector } from "react-redux";
import {
    selectIsNarrow,
    selectPopupLeft,
    selectPopupWidth,
} from "@/store/layoutSlice";
import { selectModalPopup } from "@/store/uiSlice";
import Transition from "@/services/Transition";
import "@/components/Modal/Modal.scss";
import Icon from "@/components/Icon";
import { PopupName } from "./PopupView";

type ModalProps = {
    onClose?: (e: React.MouseEvent<HTMLButtonElement>) => void;
    children?: React.ReactNode;
    show?: boolean;
    name?: PopupName;
};

const Modal = ({ onClose, children, show, name }: ModalProps) => {
    // const pagerWidth = useSelector(selectPagerWidth);
    const isNarrow = useSelector(selectIsNarrow);
    // const sidebarWidth = useSelector(selectSidebarWidth);
    const modalPopup = useSelector(selectModalPopup);
    const popupWidth = useSelector(selectPopupWidth);
    const popupLeft = useSelector(selectPopupLeft);

    const onClickClose = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (typeof onClose === "function") {
            onClose(e);
        }
        e.preventDefault();
    };

    const preventClose = (e: React.MouseEvent<HTMLDivElement>) => {
        e.stopPropagation();
    };

    return (
        <Transition>
            <div
                id={`${name}Popup`}
                className={"ModalOverlay".appendWord("modal", modalPopup)}
                style={{
                    left: isNarrow ? 0 : 51,
                    zIndex: isNarrow ? 3 : 1,
                    // pointerEvents: isBlockMouse() ? "fill" : "none"
                }}
                // onClick={onClickClose}
            >
                <div
                    style={{
                        left: popupLeft,
                        width: popupWidth - 1,
                    }}
                    className={
                        "ModalContent" + (show === false ? " HiddenPopup" : "")
                    }
                    onClick={preventClose}
                >
                    {children}
                    <button
                        className="CancelButton"
                        onClick={onClickClose}
                        // style={{ right: calcRight() }}
                    >
                        <Icon icon={faTimes} />
                    </button>
                </div>
                {/* <button
                    className="CancelButton"
                    onClick={onClickClose}
                    style={{ right: calcRight() }}
                >
                    <Icon icon={faTimes} />
                </button> */}
            </div>
        </Transition>
    );
};

export default Modal;
