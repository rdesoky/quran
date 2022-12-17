import React, { useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "../../context/App";
import { VerseText } from "./../Widgets";
import { BookmarksList } from "./QIndex";
import { PlayerButtons } from "../AudioPlayer/AudioPlayer";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";
import { useSelector } from "react-redux";
import { selectAppHeight, selectIsNarrow } from "../../store/appSlice";

const Bookmarks = () => {
  const app = useContext(AppContext);
  const appHeight = useSelector(selectAppHeight);
  const isNarrow = useSelector(selectIsNarrow);

  const toggleBookmark = (e) => {
    if (app.isBookmarked()) {
      app.pushMessageBox({
        title: <String id="are_you_sure" />,
        content: <String id="delete_bookmark" />,
        onYes: () => {
          app.removeBookmark();
        },
      });
    } else {
      app.addBookmark();
    }
  };

  return (
    <>
      <div className="Title">
        <String id="bookmarks" />
        {isNarrow ? <PlayerButtons trigger="bookmarks_title" /> : ""}
      </div>
      <div className="PopupBody" style={{ maxHeight: appHeight - 85 }}>
        <div className="BigToggler">
          <button onClick={toggleBookmark}>
            <Icon icon={app.isBookmarked() ? faBookmark : farBookmark} />
          </button>
        </div>
        <VerseText showInfo={true} copy={true} trigger="bookmarks_ui" />
        <hr style={{ clear: "both" }} />
        <BookmarksList />
      </div>
    </>
  );
};

export default AppConsumer(Bookmarks);
