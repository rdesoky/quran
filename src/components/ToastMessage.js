import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { selectToastMessage, showToast } from "../store/uiSlice";

export const ToastMessage = () => {
    const [hiding, setHiding] = useState(false);
    const dispatch = useDispatch();
    const toastMessage = useSelector(selectToastMessage);

    useEffect(() => {
        if (toastMessage) {
            setTimeout(() => {
                dispatch(showToast(null));
            }, 2000);
        } else if (toastMessage) {
            setHiding(true);
            setTimeout(() => {
                setHiding(false);
            }, 500);
        }
    }, [dispatch, toastMessage]);

    return (
        <div
            className={"ToastMessage"
                .appendWord("ShowToast", toastMessage !== null)
                .appendWord("HideToast", hiding)}
            // onClick={hideMessage}
        >
            {toastMessage && <FormattedMessage id={toastMessage} />}
        </div>
    );
};
