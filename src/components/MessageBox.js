import { useCallback, useContext, useEffect, useState } from "react";
import { AppRefs } from "../RefsProvider";
import { Message } from "./Message";

export const MessageBox = () => {
    const [messages, setMessages] = useState([]);
    const refs = useContext(AppRefs);

    const onClose = (e) => {
        setMessages((messages) => messages.slice(0, -1));
    };

    const getMessages = useCallback(() => {
        return [...messages];
    }, [messages]);

    useEffect(() => {
        refs.add("msgBox", {
            push: (msg) =>
                setMessages((messages) => [
                    ...messages,
                    { ...msg, key: Date.now() },
                ]),
            pop: () => setMessages((messages) => messages.slice(0, -1)),
            set: (msg) => setMessages(msg ? [{ ...msg, key: Date.now() }] : []),
            getMessages,
        });
    }, [refs, getMessages]);

    return messages.map((info, index) => (
        <Message
            msgBoxInfo={info}
            onClose={onClose}
            key={info.key}
            disabled={index < messages.length - 1}
        />
    ));
};
