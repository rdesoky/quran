import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { AppConsumer } from "../../context/App";
import Transition from "./../../services/Transition";
import "./Modal.scss";
import Utils from "../../services/utils";

const Modal = ({ onClose, children, app, show, name, modeless }) => {
    const onClickClose = e => {
        if (typeof onClose === "function") {
            onClose(e);
        }
        e.preventDefault();
    };

    const preventClose = e => {
        e.stopPropagation();
    };

    let activeSide = app.getActiveSide();

    useEffect(() => {
        const commandBtn = document.querySelector(
            `#RecentCommands button[command=${app.popup}]`
        );
        if (commandBtn) {
            commandBtn.focus();
        }
        return () => {
            Utils.selectTopCommand();
        };
    }, []);

    const pagerWidth = app.pagerWidth();
    const sideBarWidth = app.sideBarWidth();
    const { isCompact, isWide, appWidth, pagesCount } = app;

    const calcLeft = () => {
        return isWide || isCompact ? 0 : activeSide === 0 ? 0 : "50%";
    };

    const calcRight = () => {
        if (isWide || isCompact) {
            return pagerWidth;
        }
        if (pagesCount === 2 && activeSide === 0) {
            return appWidth - pagerWidth / 2 - sideBarWidth;
        }
        return 0;
    };

    const isBlockMouse = () => {
        return modeless === true || isWide || isCompact || show === false;
    };

    return (
        <Transition>
            <div
                id={`${name}Popup`}
                className="ModalOverlay"
                style={{
                    left: app.isNarrow ? 0 : 50,
                    pointerEvents: isBlockMouse() ? "fill" : "none"
                }}
                onClick={onClickClose}
            >
                <div
                    style={{
                        left: calcLeft(),
                        right: calcRight()
                        //,zoom: app.appHeight > 600 ? 1 : app.appHeight / 600
                    }}
                    className={
                        "ModalContent" + (show === false ? " HiddenPopup" : "")
                    }
                    onClick={preventClose}
                >
                    {children}
                    <button className="CancelButton" onClick={onClickClose}>
                        <FontAwesomeIcon icon={faTimes} />
                    </button>
                </div>
            </div>
        </Transition>
    );
};

export default AppConsumer(Modal);
