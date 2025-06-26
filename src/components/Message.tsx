import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Icon from "@/components/Icon";
import { useLayoutEffect, useRef } from "react";
import { FormattedMessage as String } from "react-intl";

type MessageBoxInfo = Msg & {
    onYes?: () => void;
    onNo?: () => void;
};

type MessageProps = {
    msgBoxInfo: MessageBoxInfo;
    onClose: (e: React.MouseEvent<HTMLButtonElement>) => void;
    disabled?: boolean;
    style?: React.CSSProperties;
};

export const Message = ({
    msgBoxInfo,
    onClose,
    disabled,
    style,
}: MessageProps) => {
    const yesRef = useRef<HTMLButtonElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const closeBtnRef = useRef<HTMLButtonElement>(null);

    useLayoutEffect(() => {
        if (yesRef.current) {
            yesRef.current.focus();
        } else if (contentRef.current) {
            const btn:
                | HTMLButtonElement
                | HTMLInputElement
                | HTMLSelectElement
                | HTMLTextAreaElement
                | null = contentRef.current.querySelector(
                "button,input,select,radio"
            );
            if (btn) {
                btn.focus();
            } else {
                closeBtnRef.current?.focus();
            }
        }
    }, []);

    const onYes = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (msgBoxInfo.onYes) {
            setTimeout(() => {
                msgBoxInfo.onYes?.();
            });
        }
        onClose(e);
    };

    const onNo = (e: React.MouseEvent<HTMLButtonElement>) => {
        if (msgBoxInfo.onNo) {
            setTimeout(() => {
                msgBoxInfo.onNo?.();
            });
        }
        onClose(e);
    };

    return (
        <div className="MessageBox" style={style}>
            <div className="MessageBoxTitle">{msgBoxInfo.title}</div>
            <button className="CloseButton" onClick={onClose}>
                <Icon icon={faTimes} />
            </button>
            <div className="MessageBoxContent" ref={contentRef}>
                {msgBoxInfo.content}
            </div>
            {msgBoxInfo.onYes && (
                <div className="ButtonsBar">
                    <button onClick={onYes} ref={yesRef}>
                        <String id="yes" />
                    </button>
                    <button onClick={onNo}>
                        <String id="no" />
                    </button>
                </div>
            )}
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
