import {
  faCheck,
  faLightbulb,
  faPlayCircle,
  faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { memo, useContext, useEffect, useState } from "react";
import { FormattedMessage as String, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { analytics } from "../services/Analytics";
import {
  selectIsCompact,
  selectPagesCount,
  selectPopupWidth,
} from "../store/layoutSlice";
import { AppContext } from "./../context/App";
import { PlayerContext } from "./../context/Player";
import {
  ayaID,
  getPageFirstAyaId,
  getRangeVerses,
  sura_info,
  getArSuraName,
  verseLocation,
} from "./../services/QData";
import { VerseText } from "./Widgets";
import { selectLang } from "../store/settingsSlice";
import { closePopup, showToast } from "../store/uiSlice";
import { pushMessageBox, setMessageBox } from "./MessageBox";
import useSuraName from "../hooks/useSuraName";

const dayLength = 24 * 60 * 60 * 1000;

const HifzRange = ({
  range,
  filter,
  showActions = false,
  pages = true,
  setActiveRange,
  trigger = "hifz_range",
}) => {
  const app = useContext(AppContext);
  const player = useContext(PlayerContext);
  // const theme = useContext(ThemeContext);
  const suraName = useSuraName(range.sura);
  const [rangeInfo, setRangeInfo] = useState("");
  // const [ageClass, setAgeClass] = useState("NoHifz");
  const [ageInfo, setAgeInfo] = useState("");
  const [actions, setActions] = useState(showActions);
  const pagesCount = useSelector(selectPagesCount);
  const lang = useSelector(selectLang);
  const isCompact = useSelector(selectIsCompact);
  const dispatch = useDispatch();
  const intl = useIntl();

  const suraInfo = sura_info[range.sura];

  useEffect(() => {
    // const suraName = app.suraName(range.sura);
    // setSuraName(suraName);

    const suraPagesCount = suraInfo.ep - suraInfo.sp + 1;
    const rangePagesCount = range.endPage - range.startPage + 1;
    let id = range.date
      ? rangePagesCount === suraPagesCount
        ? "sura_hifz_desc"
        : "range_desc"
      : "the_page_num";

    let values = {
      // sura: suraName,
      page: range.startPage - (suraInfo.sp - 1) + 1,
      start_page: range.startPage - (suraInfo.sp - 1) + 1,
      end_page: range.pages > 1 ? "-" + (range.endPage + 1) : "",
      pages: rangePagesCount,
    };

    setRangeInfo(intl.formatMessage({ id }, values));

    if (!range.date) {
      // setAgeClass("NoHifz");
      setAgeInfo("");
      return;
    }
    const age = Math.floor((Date.now() - range.date) / dayLength);
    id =
      range.revs > 0
        ? age === 0
          ? "last_revised_today"
          : "last_revised_since"
        : "not_revised";
    values = { days: age };

    const ageInfo = intl.formatMessage({ id }, values);

    // let ageClass = "GoodHifz";
    // if (age > 7) {
    //     ageClass = "FairHifz";
    // }
    // if (age > 14) {
    //     ageClass = "WeakHifz";
    // }

    // setAgeClass(ageClass);
    setAgeInfo(ageInfo);
  }, [range.date, lang]);

  useEffect(() => {
    setActions(showActions);
  }, [showActions]);

  const rangeStartAya = (sura, page) => {
    const suraStartPage = suraInfo.sp - 1;
    if (suraStartPage === page) {
      return ayaID(sura, 0);
    } else {
      return getPageFirstAyaId(page);
    }
  };

  const playRange = (e) => {
    player.stop(true);
    const { startVerse } = selectRange();
    setTimeout(() => {
      player.play();
    }, 500);
    analytics.logEvent("play_audio", {
      trigger,
      ...verseLocation(startVerse),
    });
  };

  const reviewRange = (e) => {
    const { startVerse } = selectRange();
    setTimeout(() => {
      app.setMaskStart();
      checkClosePopup();
    });
    analytics.logEvent("show_mask", {
      trigger,
      ...verseLocation(startVerse),
    });
  };

  const selectRange = () => {
    const [startVerse, endVerse] = getRangeVerses(
      range.sura,
      range.startPage,
      range.endPage
    );
    app.gotoAya(startVerse, { sel: true });
    // app.setSelectStart(rangeStartVerse);
    app.setSelectEnd(endVerse);
    return { startVerse, endVerse };
  };

  const readRange = (e) => {
    const [rangeStartVerse] = getRangeVerses(
      range.sura,
      range.startPage,
      range.endPage
    );
    app.gotoAya(rangeStartVerse, { sel: true });
    //app.closePopup();
    checkClosePopup();
  };

  const checkClosePopup = () => {
    if (!isCompact && pagesCount === 1) {
      dispatch(closePopup());
    }
    setMessageBox(null);
  };

  const setRangeRevised = (e) => {
    pushMessageBox({
      title: <String id="are_you_sure" />,
      onYes: () => {
        analytics.logEvent("revised_today", {
          trigger,
          chapter: range.sura,
          startPage: range.startPage,
          pagesCount: range.pages,
        });
        app.setRangeRevised(range);
        dispatch(showToast("ack_range_revised"));
      },
      content: <String id="revise_confirmation" />,
    });
  };

  const confirmAddHifz = (startPage, chapter, pagesCount, range) => {
    if (app.addHifzRange(startPage, chapter, pagesCount)) {
      analytics.logEvent("add_hifz", {
        trigger,
        range,
        chapter,
        startPage,
        pagesCount,
      });
    } else {
      pushMessageBox({
        title: <String id="are_you_sure" />,
        onYes: () => {
          analytics.logEvent("add_hifz", {
            trigger,
            range,
            chapter,
            startPage,
            pagesCount,
          });
          app.addHifzRange(startPage, chapter, pagesCount, true /*overwrite*/);
        },
        content: <String id="overwrite_exisiting_hifz" />,
      });
    }
  };

  const addCurrentPage = (e) => {
    confirmAddHifz(range.startPage, range.sura, 1, "page");
  };

  const addSura = (e) => {
    const pagesCount = suraInfo.ep - suraInfo.sp + 1;
    confirmAddHifz(suraInfo.sp - 1, range.sura, pagesCount, "full_sura");
  };

  const addFromSuraStart = (e) => {
    const pagesCount = range.startPage - suraInfo.sp + 2;
    confirmAddHifz(suraInfo.sp - 1, range.sura, pagesCount, "from_sura_start");
  };

  const addToSuraEnd = (e) => {
    const pagesCount = suraInfo.ep - range.startPage;
    confirmAddHifz(range.startPage, range.sura, pagesCount, "from_sura_start");
  };

  const deleteHifzRange = (e) => {
    pushMessageBox({
      title: <String id="are_you_sure" />,
      onYes: () => {
        analytics.logEvent("remove_hifz", {
          chapter: range.sura,
          startPage: range.startPage,
          pagesCount: range.pages,
          trigger,
        });
        app.deleteHifzRange(range);
      },
      content: <String id="remove_hifz" />,
    });
  };

  if (filter && suraName.match(new RegExp(filter, "i")) === null) {
    return "";
  }

  const toggleActions = (e) => {
    if (showActions) {
      readRange(e);
      return;
    }
    setActiveRange && setActiveRange(range.id);
  };

  return (
    <li className={"HifzRangeRow"}>
      <SuraHifzChart pages={pages} range={range} trigger="update_hifz_popup" />
      <div
        className="HifzRangeBody"
        tabIndex="0"
        onClick={toggleActions}
        style={{
          textAlign: "inherit",
        }}
      >
        <div className="RangeInfo">
          {suraName}
          {": "}
          {rangeInfo}
        </div>
        <div className="AgeInfo">{ageInfo}</div>
        <div
          className="RangeText"
          style={{
            whiteSpace: "nowrap",
            pointerEvents: "none",
          }}
        >
          {!actions ? (
            <VerseText verse={rangeStartAya(range.sura, range.startPage)} />
          ) : (
            ""
          )}
        </div>
      </div>
      {range.date ? (
        actions ? (
          <div className="ActionsBar">
            <button
              onClick={playRange}
              title={intl.formatMessage({ id: "play" })}
            >
              <Icon icon={faPlayCircle} />
            </button>
            <button
              onClick={reviewRange}
              title={intl.formatMessage({ id: "revise" })}
            >
              <Icon icon={faLightbulb} />
            </button>
            <button onClick={setRangeRevised}>
              <Icon icon={faCheck} /> <String id="revised" />
            </button>
            {/* <button onClick={readRange}>
                            <Icon icon={faBookOpen} />
                        </button> */}
            <button
              onClick={deleteHifzRange}
              title={intl.formatMessage({ id: "remove_hifz" })}
            >
              <Icon icon={faTimes} />
            </button>
          </div>
        ) : (
          ""
        )
      ) : (
        <div className="ActionsBar">
          <String id="add" />
          <button onClick={addCurrentPage}>
            <String id="the_page" />
          </button>
          <button onClick={addSura}>
            <String id="the_sura" />
          </button>
          <button onClick={addFromSuraStart}>
            <String id="from_start" />
          </button>
          <button onClick={addToSuraEnd}>
            <String id="to_end" />
          </button>
        </div>
      )}
    </li>
  );
};

// export const HifzRanges = AppConsumer(({ app, filter }) => {

const HifzRanges = ({ filter, trigger = "hifz_index" }) => {
  const [activeRange, setActiveRange] = useState(null);
  const app = useContext(AppContext);
  // const suraNames = app.suraNames();

  const { hifzRanges } = app;

  useEffect(() => {
    analytics.setTrigger("hifz_index");
  }, []);

  if (!hifzRanges.length) {
    return (
      <div>
        <String id="no_hifz" />
      </div>
    );
  }

  return (
    <ul id="HifzRanges" className="FlowingList">
      {hifzRanges.map((range, index) => {
        return (
          <HifzRange
            range={range}
            key={range.id}
            filter={filter}
            showActions={activeRange === range.id}
            setActiveRange={setActiveRange}
            pages={false}
            trigger={trigger}
          />
        );
      })}
    </ul>
  );
};
//});

const SuraHifzChart = memo(
  ({
    sura,
    range,
    pages = true,
    onClickPage,
    trigger = "header_chapter_index",
  }) => {
    const app = useContext(AppContext);
    const [suraRanges, setSuraRanges] = useState([]);
    const [activeRange, setActiveRange] = useState(null);

    const suraIndex = sura !== undefined ? sura : range.sura;
    const suraInfo = sura_info[suraIndex];
    const suraPages = suraInfo.ep - suraInfo.sp + 1;
    const pageList = Array(suraPages).fill(0);
    // const pageWidth = `${100 / suraPages}%`;

    useEffect(() => {
      if (sura !== undefined) {
        setSuraRanges(app.suraRanges(sura));
      }
      if (range) {
        setSuraRanges(app.suraRanges(range.sura));
        setActiveRange(range);
      }
    }, [app, app.hifzRanges, range, sura]);

    const activePage = app.getCurrentPageIndex();

    const suraStartPage = suraInfo.sp;

    const onClickChart = ({ target }) => {
      const page = parseInt(target.getAttribute("page"));
      if (onClickPage) {
        onClickPage(suraStartPage + page);
      } else {
        app.gotoPage(suraStartPage + page, false, true);
      }
      analytics.logEvent("chart_page_click", {
        trigger,
        page,
        chapter_num: sura + 1,
        chapter: getArSuraName(sura),
      });
    };

    return (
      <div className="SuraHifzChart" onClick={onClickChart}>
        <div className="HifzRanges">
          {suraRanges.map((r, i) => {
            const rangeStart = r.startPage - suraInfo.sp + 1;
            const start = (100 * rangeStart) / suraPages;
            const width = (100 * r.pages) / suraPages;
            let age,
              ageClass = "NoHifz";
            if (r.date !== undefined) {
              age = Math.floor((Date.now() - r.date) / dayLength);
              ageClass =
                age <= 7 ? "GoodHifz" : age <= 14 ? "FairHifz" : "WeakHifz";
            }
            return (
              <div
                key={`${r.startPage}-${r.sura}`}
                className={"SuraRange"
                  .appendWord(ageClass)
                  .appendWord(
                    "active",
                    activeRange &&
                      activeRange.startPage === r.startPage &&
                      activeRange.sura === r.sura
                  )}
                style={{
                  right: `${start}%`,
                  width: `${width}%`,
                }}
              />
            );
          })}
        </div>
        <div className="PageThumbs">
          {pages
            ? pageList.map((z, i) => {
                const activeClass =
                  activePage === i + suraInfo.sp - 1 ? "ActivePage" : "";
                return (
                  <div
                    key={i}
                    page={i}
                    className={"PageThumb".appendWord(activeClass)}
                    title={i + 1}
                    //   style={{
                    //       right: `${(100 * i) / suraPages}%`,
                    //       width: pageWidth
                    //   }}
                  />
                );
              })
            : null}
        </div>
      </div>
    );
  }
);

const ActivityTooltip = ({ active, payload, label, activity }) => {
  if (active) {
    const value =
      Array.isArray(payload) && payload.length ? payload[0].value : 0;

    const [month, day] = label.split("-").map((x) => parseInt(x));
    const date = new Date();
    date.setMonth(month - 1);
    date.setDate(day);
    const dateStr = new Date(date).toDateString();

    return (
      <div className="custom-tooltip">
        <p className="label">
          {dateStr}
          <br />
          <String id={`activity_${activity}`} values={{ value: value }} />
        </p>
      </div>
    );
  }

  return null;
};

const ActivityChart = ({ activity = "pages" }) => {
  const [data, setData] = useState([]);
  const app = useContext(AppContext);
  const popupWidth = useSelector(selectPopupWidth);

  useEffect(() => {
    setData(
      app.daily[activity]
        .slice(0, 14)
        .reverse()
        .map((pgInfo) => {
          return Object.assign({}, pgInfo, {
            day: pgInfo.day.substring(5),
          });
        })
    );
  }, [activity, app.daily]);

  if (!data.length) {
    return null;
  }

  const chartWidth = popupWidth - 60;
  return (
    <>
      <String id={`${activity}_daily_graph`} />
      <BarChart
        width={chartWidth}
        height={240}
        data={data}
        margin={{
          top: 5,
          right: 0,
          left: 0,
          bottom: 5,
        }}
      >
        <Bar dataKey={activity} stroke="green" fill="rgba(0, 128, 0, 0.3)" />
        <CartesianGrid stroke="#444" strokeDasharray="3 3" />
        <XAxis dataKey="day" />
        <YAxis />
        <Tooltip
          content={<ActivityTooltip activity={activity} />}
          cursor={{ fill: "#eeeeee20" }}
        />
      </BarChart>
    </>
  );
};

export { SuraHifzChart, HifzRange, HifzRanges, ActivityChart };
