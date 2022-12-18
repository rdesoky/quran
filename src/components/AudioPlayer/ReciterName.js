import React, { useContext } from "react";
import { FormattedMessage } from "react-intl";
import { PlayerContext } from "../../context/Player";

const ReciterName = ({ id }) => {
  const player = useContext(PlayerContext);
  const reciter_id = id || player.reciter;

  // const changeReciter = event => {
  //     player.changeReciter(reciter_id);
  // };

  return <FormattedMessage id={"r." + reciter_id} />;
};

export default ReciterName;
