import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useSelector } from "react-redux";
import {
    selectIsNarrow,
    selectPopupLeft,
    selectPopupWidth,
} from "../../store/layoutSlice";
import { selectModalPopup } from "../../store/uiSlice";
import Transition from "./../../services/Transition";
import "./Modal.scss";

const Modal = ({ onClose, children, show, name }) => {
    // const pagerWidth = useSelector(selectPagerWidth);
    const isNarrow = useSelector(selectIsNarrow);
    // const sidebarWidth = useSelector(selectSidebarWidth);
    const modalPopup = useSelector(selectModalPopup);
    const popupWidth = useSelector(selectPopupWidth);
    const popupLeft = useSelector(selectPopupLeft);

    const onClickClose = (e) => {
        if (typeof onClose === "function") {
            onClose(e);
        }
        e.preventDefault();
    };

    const preventClose = (e) => {
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
