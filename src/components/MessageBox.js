import { useContext, useEffect, useState } from "react";
import { AppRefs } from "../RefsProvider";
import { Message } from "./Message";

export const shownMessageBoxes = [];

export const MessageBox = () => {
    const [messages, setMessages] = useState([]);
    const refs = useContext(AppRefs);

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
            set: (msg) => setMessages(msg ? [{ ...msg, key: Date.now() }] : []),
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
