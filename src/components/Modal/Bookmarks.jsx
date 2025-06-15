import { faBookmark as farBookmark } from "@fortawesome/free-regular-svg-icons";
import { faBookmark } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import { useMessageBox } from "../../RefsProvider";
import {
  addBookmark,
  deleteBookmark,
  selectIsBookmarked,
} from "../../store/dbSlice";
import { selectAppHeight, selectIsNarrow } from "../../store/layoutSlice";
import { selectStartSelection } from "../../store/navSlice";
import { PlayerButtons } from "../AudioPlayer/PlayerButtons";
import { BookmarksList } from "../BookmarksList";
import { VerseText } from "./../Widgets";

const Bookmarks = () => {
  const appHeight = useSelector(selectAppHeight);
  const bodyRef = useSnapHeightToBottomOf(appHeight - 15, 0, "maxHeight");

  const isNarrow = useSelector(selectIsNarrow);
  const dispatch = useDispatch();
  const msgBox = useMessageBox();
  const selectStart = useSelector(selectStartSelection);
  const isBookmarked = useSelector(selectIsBookmarked(selectStart));

  const toggleBookmark = (e) => {
    if (isBookmarked) {
      msgBox.push({
        title: <String id="are_you_sure" />,
        content: <String id="delete_bookmark" />,
        onYes: () => {
          dispatch(deleteBookmark(selectStart));
        },
      });
    } else {
      dispatch(addBookmark(selectStart));
    }
  };

  return (
    <>
      <div className="Title">
        <String id="bookmarks" />
        {isNarrow ? <PlayerButtons trigger="bookmarks_title" /> : ""}
      </div>
      <div className="PopupBody" ref={bodyRef}>
        <div className="BigToggler">
          <button onClick={toggleBookmark}>
            <Icon icon={isBookmarked ? faBookmark : farBookmark} />
          </button>
        </div>
        <VerseText showInfo={true} copy={true} trigger="bookmarks_ui" />
        <hr style={{ clear: "both" }} />
        <BookmarksList />
      </div>
    </>
  );
};

export default Bookmarks;
