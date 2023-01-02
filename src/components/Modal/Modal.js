import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React from "react";
import { useSelector } from "react-redux";
import {
    selectActiveSide,
    selectAppWidth,
    selectIsCompact,
    selectIsNarrow,
    selectIsWide,
    selectPagerWidth,
    selectPagesCount,
} from "../../store/layoutSlice";
import { selectModalPopup, selectSidebarWidth } from "../../store/uiSlice";
import Transition from "./../../services/Transition";
import "./Modal.scss";

const Modal = ({ onClose, children, show, name }) => {
    const pagerWidth = useSelector(selectPagerWidth);
    const activeSide = useSelector(selectActiveSide);
    const isCompact = useSelector(selectIsCompact);
    const isWide = useSelector(selectIsWide);
    const appWidth = useSelector(selectAppWidth);
    const pagesCount = useSelector(selectPagesCount);
    const isNarrow = useSelector(selectIsNarrow);
    const sidebarWidth = useSelector(selectSidebarWidth);
    const modalPopup = useSelector(selectModalPopup);

    const onClickClose = (e) => {
        if (typeof onClose === "function") {
            onClose(e);
        }
        e.preventDefault();
    };

    const preventClose = (e) => {
        e.stopPropagation();
    };

    const calcLeft = () => {
        return isWide || isCompact ? 0 : activeSide === 0 ? 0 : "50%";
    };

    const calcRight = () => {
        if (isWide || isCompact) {
            return pagerWidth;
        }
        if (pagesCount === 2 && activeSide === 0) {
            return appWidth - pagerWidth / 2 - sidebarWidth;
        }
        return 0; //the full width of the app
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
                        left: calcLeft(),
                        right: calcRight(),
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
