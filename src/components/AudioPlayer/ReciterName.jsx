import React from "react";
import { FormattedMessage as Message } from "react-intl";
import { useSelector } from "react-redux";
import { selectReciter } from "../../store/settingsSlice";

export default function ReciterName({ id }) {
    const activeReciter = useSelector(selectReciter);
    const reciter = id ?? activeReciter;

    return reciter && <Message id={"r." + reciter} />;
}
