import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { FormattedMessage as String } from "react-intl";

export const Message = ({ msgBoxInfo, onClose, disabled }) => {
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
