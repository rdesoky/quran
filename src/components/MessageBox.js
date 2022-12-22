import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FormattedMessage as String } from "react-intl";
import { useContext, useEffect, useState } from "react";
import { Refs } from "../RefsProvider";

export const shownMessageBoxes = [];

export const MessageBox = () => {
    const [messages, setMessages] = useState([]);
    const refs = useContext(Refs);

    useEffect(() => {
        shownMessageBoxes.length = 0;
        if (messages.length > 0) {
            shownMessageBoxes.push(...messages);
        }
    }, [messages]);

    const onClose = (e) => {
        setMessages((messages) => messages.slice(0, -1));
    };

    useEffect(() => {
        refs.add("msgBox", {
            push: (msg) =>
                setMessages((messages) => [
                    ...messages,
                    { ...msg, key: Date.now() },
                ]),
            pop: () => setMessages((messages) => messages.slice(0, -1)),
            set: (msg) =>
                setMessages((messages) => [{ ...msg, key: Date.now() }]),
        });
    }, [refs]);

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
