import { useCallback, useContext, useEffect, useState } from "react";
import { AppRefs } from "@/RefsProvider";
import { Message } from "@/components/Message";

export const MessageBox = () => {
    const [messages, setMessages] = useState<Msg[]>([]);
    const refs = useContext(AppRefs);

    const onClose = () => {
        setMessages((messages) => messages.slice(0, -1));
    };

    const getMessages = useCallback(() => {
        return [...messages];
    }, [messages]);

    useEffect(() => {
        refs.add("msgBox", {
            push: (msg: Msg) =>
                setMessages((messages) => [
                    ...messages,
                    { ...msg, key: Date.now() },
                ]),
            pop: () => setMessages((messages) => messages.slice(0, -1)),
            set: (msg: Msg) =>
                setMessages(msg ? [{ ...msg, key: Date.now() }] : []),
            getMessages,
        });
    }, [refs, getMessages]);

    useEffect(() => {
        const onKeyDown = (e: KeyboardEvent) => {
            switch (e.code) {
                case "Escape":
                    onClose();
                    break;
                default:
                    break;
            }
        };
        document.addEventListener("keydown", onKeyDown);
        return () => {
            document.removeEventListener("keydown", onKeyDown);
        };
    }, []);

    return (
        <>
            {messages.map((msg, index) => (
                <Message
                    style={{
                        transform: `translateX(-50%) translateY(calc(-50% + ${
                            100 * index
                        }px)`,
                    }}
                    msgBoxInfo={msg}
                    onClose={onClose}
                    key={msg.key}
                    disabled={index < messages.length - 1}
                />
            ))}
        </>
    );
};
