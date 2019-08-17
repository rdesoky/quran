import React from "react";
import { FormattedMessage } from "react-intl";
import { PlayerConsumer } from "../../context/Player";

const ReciterName = ({ id, player }) => {
    const reciter_id = id || player.reciter;

    const changeReciter = event => {
        player.changeReciter(reciter_id);
    };

    return <FormattedMessage id={"r." + reciter_id} />;
};

export default PlayerConsumer(ReciterName);
