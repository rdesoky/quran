import React from "react";
import { FormattedMessage } from "react-intl";

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

export default Play;
