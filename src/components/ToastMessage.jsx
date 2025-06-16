import React, { useEffect, useState } from "react";
import { FormattedMessage } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { selectToastMessage, showToast } from "@/store/uiSlice";

export const ToastMessage = () => {
    const [hiding, setHiding] = useState(false);
    const dispatch = useDispatch();
    const { id: toastMessage, time } = useSelector(selectToastMessage);

    useEffect(() => {
        if (toastMessage) {
            setTimeout(() => {
                setHiding(false);
                dispatch(showToast({ id: null }));
            }, time);

            setTimeout(() => {
                setHiding(true);
            }, time - 500);
        }
    }, [dispatch, toastMessage, time]);

    return (
        <div
            className={"ToastMessage"
                .appendWord("ShowToast", toastMessage !== null)
                .appendWord("HideToast", hiding)}
        >
            {toastMessage && <FormattedMessage id={toastMessage} />}
        </div>
    );
};
