import React from "react";
import { FormattedMessage } from "react-intl";
import { keyValues } from "@/services/utils";

const Play = () => {
    return (
        <>
            <div className="Title">
                <FormattedMessage id="play" values={keyValues("r")} />
            </div>
            <div>
                <button>Play</button>
            </div>
        </>
    );
};

export default Play;
