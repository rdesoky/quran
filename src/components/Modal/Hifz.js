import React from "react";
import { FormattedMessage } from "react-intl";
import { AppConsumer } from "../../context/App";

const Hifz = () => {
    return (
        <>
            <div className="Title">
                <FormattedMessage id="favorites" />
            </div>
            <div>Favorites are shown here.</div>
        </>
    );
};

export default AppConsumer(Hifz);
