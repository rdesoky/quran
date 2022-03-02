import React from "react";
import { FormattedMessage } from "react-intl";
import { AppConsumer } from "../../context/App";

const Play = () => {
    return (
        <>
            <div className="Title">
                <FormattedMessage id="play" />
            </div>
            <div>
                <button>Play</button>
            </div>
        </>
    );
};

export default AppConsumer(Play);
