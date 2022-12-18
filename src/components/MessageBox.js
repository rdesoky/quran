import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage as String } from "react-intl";
import { useEffect, useState } from "react";

export const pushMessageBox = (msgBoxInfo) => {
  window.dispatchEvent(new CustomEvent("push_mbox", { detail: msgBoxInfo }));
};

export const popMessageBox = () => {
  window.dispatchEvent(new CustomEvent("pop_mbox"));
};

export const setMessageBox = (msgBoxInfo) => {
  if (!msgBoxInfo) {
    return popMessageBox();
  }
  window.dispatchEvent(new CustomEvent("set_mbox", { detail: msgBoxInfo }));
};

export const shownMessageBoxes = [];

export const MessageBox = () => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    shownMessageBoxes.length = 0;
    if (messages.length > 0) {
      shownMessageBoxes.push(...messages);
    }
  }, [messages]);

  // const msgBoxInfo = app.getMessageBox();
  useEffect(() => {
    const onPushMessageBox = (e) => {
      const msg = e.detail;
      setMessages((messages) => [...messages, { ...msg, key: Date.now() }]);
    };
    const onSetMessageBox = (e) => {
      const msg = e.detail;
      setMessages((messages) => [{ ...msg, key: Date.now() }]);
    };
    const onPopMessageBox = (e) => {
      setMessages((messages) => messages.slice(0, -1));
    };
    window.addEventListener("push_mbox", onPushMessageBox);
    window.addEventListener("pop_mbox", onPopMessageBox);
    window.addEventListener("set_mbox", onSetMessageBox);

    return () => {
      window.removeEventListener("push_mbox", onPushMessageBox);
      window.removeEventListener("pop_mbox", onPopMessageBox);
      window.removeEventListener("set_mbox", onSetMessageBox);
    };
  }, []);

  const onClose = (e) => {
    setMessages((messages) => messages.slice(0, -1));
  };

  return messages.map((info, index) => (
    <Message
      msgBoxInfo={info}
      onClose={onClose}
      key={info.key}
      disabled={index < messages.length - 1}
    />
  ));
};

const Message = ({ msgBoxInfo, onClose, disabled }) => {
  const onYes = (e) => {
    if (msgBoxInfo.onYes) {
      setTimeout(() => {
        msgBoxInfo.onYes();
      });
    }
    onClose(e);
  };

  const onNo = (e) => {
    if (msgBoxInfo.onNo) {
      setTimeout(() => {
        msgBoxInfo.onNo();
      });
    }
    onClose(e);
  };

  return (
    <div className="MessageBox">
      <div className="MessageBoxTitle">{msgBoxInfo.title}</div>
      <button className="CloseButton" onClick={onClose}>
        <Icon icon={faTimes} />
      </button>
      <div className="MessageBoxContent">{msgBoxInfo.content}</div>
      {msgBoxInfo.onYes ? (
        <div className="ButtonsBar">
          <button onClick={onYes}>
            <String id="yes" />
          </button>
          <button onClick={onNo}>
            <String id="no" />
          </button>
        </div>
      ) : null}
      {disabled && (
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            opacity: 0.2,
            background: "white",
          }}
        />
      )}
    </div>
  );
};
