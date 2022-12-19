import {
  faBookmark,
  faEllipsisH,
  faFileDownload,
  faHeart,
  faListAlt,
  faPlayCircle,
  faQuran,
  faTimes as faDelete,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { memo, useContext, useEffect, useState } from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { AppContext } from "../../context/App";
import { PlayerContext } from "../../context/Player";
import { analytics } from "../../services/Analytics";
import {
  ayaID,
  ayaIdInfo,
  sura_info,
  getArSuraName,
  verseLocation,
} from "../../services/QData";
import {
  selectAppHeight,
  selectIsCompact,
  selectPagesCount,
  selectPopupWidth,
} from "../../store/layoutSlice";
import AKeyboard from "../AKeyboard/AKeyboard";
import { HifzRanges, SuraHifzChart } from "../Hifz";
import { AddHifz } from "./Favorites";
import { TafseerView } from "./Tafseer";
import { selectLang } from "../../store/settingsSlice";
import { quranText } from "../../App";
import { closePopup, showToast } from "../../store/uiSlice";
import { pushMessageBox, setMessageBox } from "../MessageBox";
import useSuraName from "../../hooks/useSuraName";
import SuraName from "../SuraName";

const QIndex = ({ simple }) => {
  const app = useContext(AppContext);
  const lang = useSelector(selectLang);
  const [keyboard, setKeyboard] = useState(false);
  const [activeTab, setActiveTab] = useState(
    localStorage.getItem("activeTab") || "index"
  );
  const [filter, setFilter] = useState("");
  const appHeight = useSelector(selectAppHeight);

  const selectTab = (tabId) => {
    localStorage.setItem("activeTab", tabId);
    setActiveTab(tabId);
  };

  let typingConsole;

  const hideKeyboard = (e) => {
    setKeyboard(false);
  };

  useEffect(() => {
    if (typingConsole) {
      typingConsole.focus();
    }
  }, [typingConsole]);

  const showKeyboard = (e) => {
    setKeyboard(true);
  };

  const updateFilter = (filter) => {
    setFilter(filter);
  };

  const clearFilter = (e) => {
    setFilter("");
    e.stopPropagation();
  };

  if (simple) {
    return (
      <>
        <div className="Title"></div>
        <div
          className="PopupBody"
          style={{
            height: appHeight - 80,
          }}
        >
          <SuraList simple={simple} />
        </div>
      </>
    );
  }

  return (
    <>
      <div className="Title">
        <div className="ButtonsBar">
          <button
            onClick={(e) => selectTab("index")}
            className={"CommandButton".appendWord(
              "active",
              activeTab === "index"
            )}
          >
            <Icon icon={faListAlt} />
            <span>
              <Message id="index" />
            </span>
          </button>
          <button
            onClick={(e) => selectTab("hifz")}
            className={"CommandButton".appendWord(
              "active",
              activeTab === "hifz"
            )}
          >
            <Icon icon={faHeart} />
            <span>
              <Message id="favorites" />
            </span>
          </button>
          <button
            onClick={(e) => selectTab("bookmarks")}
            className={"CommandButton".appendWord(
              "active",
              activeTab === "bookmarks"
            )}
          >
            <Icon icon={faBookmark} />
            <span>
              <Message id="bookmarks" />
            </span>
          </button>
        </div>
      </div>
      <div
        className={"TypingConsole" + (!filter.length ? " empty" : "")}
        ref={(ref) => {
          typingConsole = ref;
        }}
        tabIndex="0"
        onClick={showKeyboard}
      >
        {filter || <Message id="find_sura" />}
        {filter ? (
          <div className="ClearButton" onClick={clearFilter}>
            <Icon icon={faTimes} />
          </div>
        ) : (
          ""
        )}
      </div>

      <AKeyboard
        style={{ display: keyboard ? "block" : "none" }}
        initText={filter}
        onUpdateText={updateFilter}
        onEnter={hideKeyboard}
        onCancel={hideKeyboard}
        lang={lang}
      />

      <div
        className="PopupBody"
        style={{
          height: appHeight - 135,
        }}
        onTouchStart={hideKeyboard}
        onMouseDown={hideKeyboard}
      >
        {activeTab === "index" ? (
          <SuraList filter={filter} trigger="indices_chapters" />
        ) : activeTab === "hifz" ? (
          <HifzRanges filter={filter} trigger="indices_hifz" />
        ) : (
          <BookmarksList filter={filter} trigger="indices_bookmarks" />
        )}
      </div>
    </>
  );
};

export const PartCell = ({ part, selected }) => {
  const app = useContext(AppContext);
  let btn;
  const gotoPart = (e) => {
    analytics.logEvent("goto_part", { part });
    app.gotoPart(part);
  };
  useEffect(() => {
    if (selected === part && btn) {
      btn.focus();
    }
  }, [selected]);
  return (
    <li className="PartIndexCell">
      <button
        onClick={gotoPart}
        ref={(ref) => {
          btn = ref;
        }}
        className={part === selected ? "active" : null}
      >
        <Message id="part_num" values={{ num: part + 1 }} />
      </button>
    </li>
  );
};

export const PartsList = ({ part }) => {
  const [listWidth, setListWidth] = useState(0);
  let list;
  useEffect(() => {
    if (list) {
      setListWidth(list.clientWidth);
    }
    analytics.setTrigger("header_parts_context");
  }, [list]);
  return (
    <ul
      className="SpreadSheet"
      ref={(ref) => {
        list = ref;
      }}
      style={{
        columnCount: Math.floor(listWidth / 80),
      }}
    >
      {Array(30)
        .fill(0)
        .map((zero, index) => (
          <PartCell part={index} selected={part} key={index} />
        ))}
    </ul>
  );
};

export const SuraList = memo(
  ({ filter, simple, trigger = "chapters_index" }) => {
    const app = useContext(AppContext);
    const popupWidth = useSelector(selectPopupWidth);
    const [actionsIndex, setActionsIndex] = useState(0);

    useEffect(() => {
      analytics.setTrigger(trigger);
    }, [trigger]);

    useEffect(() => {
      const { selectStart } = app;
      const currentSura = ayaIdInfo(selectStart).sura;
      setActionsIndex(currentSura);
    }, [app]);

    const CellComponent = simple ? SimpleSuraIndexCell : SuraIndexCell;

    return (
      <ul
        className="SpreadSheet"
        style={{
          columnCount: Math.floor((popupWidth - 50) / 180), //-50px margin
        }}
      >
        {Array(114)
          .fill(0)
          .map((zero, suraIndex) => {
            return (
              <CellComponent
                key={suraIndex}
                sura={suraIndex}
                filter={filter}
                selectSura={setActionsIndex}
                selectedSura={actionsIndex}
                simple={simple}
                trigger={trigger}
              />
            );
          })}
      </ul>
    );
  }
);

export const SimpleSuraIndexCell = ({ sura, selectedSura }) => {
  const app = useContext(AppContext);
  let btn;
  const gotoSura = (e) => {
    analytics.logEvent("goto_chapter", {
      chapter_num: sura + 1,
      chapter: getArSuraName(sura),
    });

    return app.gotoSura(sura);
  };

  useEffect(() => {
    if (btn && sura === selectedSura) {
      btn.focus();
    }
  }, [btn, selectedSura, sura]);

  return (
    <li className="SuraIndexCell">
      <button
        ref={(ref) => {
          btn = ref;
        }}
        onClick={gotoSura}
        className={sura === selectedSura ? "active" : ""}
      >
        {sura + 1 + ". "} <SuraName index={sura} />
      </button>
    </li>
  );
};

export const SuraIndexCell = ({
  sura,
  filter,
  selectedSura,
  selectSura,
  simple,
  trigger = "chapters_index",
}) => {
  const pagesCount = useSelector(selectPagesCount);
  const app = useContext(AppContext);
  const player = useContext(PlayerContext);
  const suraName = useSuraName(sura);
  const isCompact = useSelector(selectIsCompact);
  const dispatch = useDispatch();
  const intl = useIntl();

  const checkClosePopup = () => {
    if (!isCompact && pagesCount === 1) {
      dispatch(closePopup());
    }
  };

  const gotoSura = (e) => {
    // eslint-disable-next-line eqeqeq
    if (selectedSura == sura) {
      analytics.logEvent("goto_chapter", {
        chapter_num: sura + 1,
        chapter: getArSuraName(sura),
        trigger,
      });
      app.hideMask();
      checkClosePopup();
      return app.gotoSura(sura);
    } else {
      selectSura && selectSura(sura);
    }
  };
  const addUpdateHifz = (e) => {
    //TODO: check if sura has old ranges, then confirmation is required
    const suraInfo = sura_info[sura];
    const suraRanges = app.suraRanges(sura);
    const trigger = "chapters_index";

    if (suraRanges.length) {
      checkClosePopup();
      app.gotoSura(sura);
      setMessageBox({
        title: <Message id="update_hifz" />,
        content: <AddHifz />,
      });
      analytics.logEvent("show_update_hifz", {
        ...verseLocation(app.selectStart),
        trigger,
      });
    } else {
      const startPage = suraInfo.sp - 1;
      const pagesCount = suraInfo.ep - suraInfo.sp + 1;
      app.addHifzRange(startPage, sura, suraInfo.ep - suraInfo.sp + 1);
      analytics.logEvent("add_hifz", {
        trigger,
        range: "full_sura",
        chapter: sura,
        startPage,
        pagesCount,
      });
      dispatch(showToast("sura_memorized"));
      // app.showToast(<String id="sura_memorized" />);
    }
  };

  const playSura = (e) => {
    player.stop(true);
    gotoSura(e);
    setTimeout(() => {
      player.play();
    }, 500);
    analytics.logEvent("play_audio", {
      trigger,
      ...verseLocation(ayaID(sura, 0)),
    });
  };

  // const reviewSura = e => {
  //     const verse = gotoSura(e);
  //     setTimeout(() => {
  //         app.setMaskStart(verse, { sel: true });
  //         //app.closePopup();
  //         checkClosePopup();
  //     });
  //     app.pushRecentCommand("Mask");
  // };

  // useEffect(() => {
  //   setSura_name(app.suraName(sura));
  // }, [app, sura]);

  let btn;

  useEffect(() => {
    // eslint-disable-next-line eqeqeq
    if (btn && sura == selectedSura) {
      btn.focus();
    }
  }, [btn, selectedSura, sura]);

  if (filter && suraName.match(new RegExp(filter, "i")) === null) {
    return "";
  }

  return (
    <li className="SuraIndexCell">
      {simple ? "" : <SuraHifzChart pages={false} sura={sura} />}
      <button
        onClick={gotoSura}
        // eslint-disable-next-line eqeqeq
        className={sura == selectedSura ? "active" : ""}
        ref={(ref) => {
          btn = ref;
        }}
      >
        {sura + 1 + ". " + suraName}
      </button>
      <div className="actions">
        {
          // eslint-disable-next-line eqeqeq
          selectedSura == sura ? (
            <>
              <button
                sura={sura}
                onClick={playSura}
                title={intl.formatMessage({ id: "play" })}
              >
                <Icon icon={faPlayCircle} />
              </button>
              <button
                sura={sura}
                onClick={addUpdateHifz}
                title={intl.formatMessage({
                  id: "update_hifz",
                })}
              >
                <Icon icon={faHeart} />
              </button>
              {/* <button sura={sura} onClick={reviewSura}>
                                <Icon icon={faEyeSlash} />
                            </button> */}
            </>
          ) : (
            <Icon icon={faEllipsisH} />
          )
        }
      </div>
    </li>
  );
};

export const BookmarkListItem = ({
  verse,
  filter,
  selectedVerse,
  selectVerse,
  showTafseer = false,
  trigger = "bookmarks",
}) => {
  const app = useContext(AppContext);
  const pagesCount = useSelector(selectPagesCount);
  const player = useContext(PlayerContext);
  const [verseText, setVerseText] = useState("");
  const [bookmarkDesc, setBookmarkDesc] = useState("");
  const suraName = useSuraName(ayaIdInfo(verse).sura);
  const [showTafseerView, setShowTafseer] = useState(showTafseer);
  const isCompact = useSelector(selectIsCompact);
  const dispatch = useDispatch();
  const intl = useIntl();

  useEffect(() => {
    setVerseText(quranText[verse]);

    const bookmarkDesc = intl.formatMessage(
      { id: "bookmark_desc" },
      {
        sura: suraName,
        verse: ayaIdInfo(verse).aya + 1,
      }
    );

    setBookmarkDesc(bookmarkDesc);
  }, [suraName, verse]);

  const checkClosePopup = () => {
    if (!isCompact && pagesCount === 1) {
      dispatch(closePopup());
    }
  };

  const gotoVerse = (e) => {
    if (selectedVerse !== verse) {
      selectVerse(verse);
      return;
    }
    app.gotoAya(verse, { sel: true });
    checkClosePopup();
    analytics.logEvent("goto_verse", {
      ...verseLocation(verse),
      trigger,
    });
  };

  const removeBookmark = (e) => {
    pushMessageBox({
      title: <Message id="are_you_sure" />,
      content: <Message id="delete_bookmark" />,
      onYes: () => {
        if (-1 === app.removeBookmark(verse)) {
          dispatch(showToast("bookmark_deleted"));
          // app.showToast(<String id="bookmark_not_found" />);
          analytics.logEvent("remove_bookmark", {
            ...verseLocation(verse),
            trigger,
          });
        }
      },
    });
  };

  const playVerse = (e) => {
    player.stop(true);
    app.gotoAya(verse, { sel: true });
    setTimeout(() => {
      player.play();
    }, 500);
    analytics.logEvent("play_audio", {
      ...verseLocation(verse),
      trigger,
    });
  };

  // const reviewVerse = e => {
  //     app.gotoAya(verse, { sel: true });
  //     setTimeout(() => {
  //         app.setMaskStart();
  //         //app.closePopup();
  //         checkClosePopup();
  //     });
  //     app.pushRecentCommand("Mask");
  // };

  useEffect(() => {
    setShowTafseer(showTafseer);
  }, [showTafseer]);

  if (filter && suraName.match(new RegExp(filter, "i")) === null) {
    return "";
  }

  const download = (e) => {
    setMessageBox({
      title: <Message id="download_verse_audio" />,
      content: <Message id="download_guide" />,
    });
    e.preventDefault();
  };

  const toggleTafseer = (e) => {
    analytics.logEvent(showTafseerView ? "hide_tafseer" : "show_tafseer", {
      ...verseLocation(verse),
      trigger,
    });
    setShowTafseer(!showTafseerView);
  };

  return (
    <li className="BookmarkRow">
      <div className="actions">
        {
          // eslint-disable-next-line eqeqeq
          selectedVerse == verse ? (
            <>
              <button
                onClick={playVerse}
                title={intl.formatMessage({ id: "play" })}
              >
                <Icon icon={faPlayCircle} />
              </button>
              <button
                onClick={toggleTafseer}
                title={intl.formatMessage({ id: "tafseer" })}
              >
                <Icon icon={faQuran} />
              </button>
              <div
                className="LinkButton"
                title={intl.formatMessage({
                  id: "download_verse_audio",
                })}
              >
                <a href={player.audioSource(verse)} onClick={download}>
                  <Icon icon={faFileDownload} />
                </a>
              </div>
              <button
                onClick={removeBookmark}
                title={intl.formatMessage({ id: "unbookmark" })}
              >
                <Icon icon={faDelete} />
              </button>
            </>
          ) : (
            <Icon icon={faEllipsisH} />
          )
        }
      </div>
      <button onClick={gotoVerse}>
        <Icon icon={faBookmark} />
        &nbsp;
        {bookmarkDesc}
        {showTafseerView ? null : (
          <div
            style={{
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              pointerEvents: "none",
            }}
          >
            {verseText}
          </div>
        )}
      </button>
      {showTafseerView ? (
        <TafseerView verse={verse} showVerse={false} copy={true} />
      ) : null}
    </li>
  );
};

export const BookmarksList = ({ filter, trigger = "bookmarks_index" }) => {
  const app = useContext(AppContext);
  const [actionsIndex, setActionsIndex] = useState(-1);
  const [showTafseer, setShowTafseer] = useState(false);

  const { bookmarks } = app;

  const handleShowTafseerChange = ({ currentTarget }) => {
    const showTafseer = currentTarget.checked;
    setShowTafseer(showTafseer);
  };

  useEffect(() => {
    analytics.setTrigger(trigger);
  }, [trigger]);

  if (!bookmarks.length) {
    return (
      <div>
        <Message id="no_bookmarks" />
      </div>
    );
  }
  return (
    <>
      <div className="InputRow">
        <input
          type="checkbox"
          onChange={handleShowTafseerChange}
          value={showTafseer}
          id="toggleTafseer"
        />
        <label htmlFor="toggleTafseer">
          <Message id="tafseer" />
        </label>
      </div>
      <ul className="FlowingList">
        {bookmarks.map((bookmark) => {
          const verse = parseInt(bookmark.aya);
          return (
            <BookmarkListItem
              key={verse}
              verse={verse}
              filter={filter}
              selectedVerse={actionsIndex}
              selectVerse={setActionsIndex}
              showTafseer={showTafseer}
              trigger={trigger}
            />
          );
        })}
      </ul>
    </>
  );
};

export default QIndex;
