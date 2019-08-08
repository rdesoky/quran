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

  return (
    <Transition>
      <div
        id={`${name}Popup`}
        className="ModalOverlay"
        style={{
          left: app.isNarrow ? 0 : 50,
          pointerEvents:
            modeless === true || app.pagesCount > 1 || show === false
              ? "none"
              : "fill"
        }}
        onClick={onClickClose}
      >
        <div
          style={{
            left: app.isWide && app.popup ? 0 : activeSide === 0 ? 0 : "50%",
            right:
              app.isWide && app.popup
                ? app.appHeight * 1.25
                : activeSide === 0 && app.pagesCount === 2
                ? "50%"
                : 0,
            zoom: app.appHeight > 600 ? 1 : app.appHeight / 600
          }}
          className={"ModalContent" + (show === false ? " HiddenPopup" : "")}
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
