import React from "react";
import { FormattedMessage } from "react-intl";
import { useSelector } from "react-redux";
import { selectReciter } from "../../store/settingsSlice";

const ReciterName = ({ id }) => {
    const reciter_id = useSelector(selectReciter);

    return <FormattedMessage id={"r." + reciter_id} />;
};

export default ReciterName;
