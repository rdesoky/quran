import React from "react";
import { FormattedMessage } from "react-intl";

const ReciterName = ({ id }) => {
    return <FormattedMessage id={"r." + id} />;
};

export default ReciterName;
