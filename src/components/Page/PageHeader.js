import React, { useContext } from "react";
import { analytics } from "./../../services/Analytics";
import { AppContext } from "../../context/App";
import QData from "../../services/QData";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
  faAngleDown,
  faAngleUp,
  faBookOpen,
} from "@fortawesome/free-solid-svg-icons";
import {
  CircleProgress,
  VerseContextButtons,
  PageContextButtons,
  SuraContextHeader,
} from "../Widgets";
import { SuraList, PartsList } from "../Modal/QIndex";
import { useSelector } from "react-redux";
import { selectPagesCount } from "../../store/layoutSlice";
import { useIntl } from "react-intl";
import { showContextPopup } from "../ContextPopup";

const PageHeader = ({
  index: pageIndex,
  order,
  onPageUp,
  onPageDown,
  onIncrement,
  onDecrement,
}) => {
  const app = useContext(AppContext);
  const partIndex = QData.pagePart(pageIndex + 1) - 1;
  const selectedAyaInfo = QData.ayaIdInfo(app.selectStart);
  const suraIndex = QData.pageSura(pageIndex + 1);
  const pagesCount = useSelector(selectPagesCount);
  const intl = useIntl();

  const showPartContextPopup = ({ currentTarget: target }) => {
    analytics.logEvent("show_part_context", { trigger: "page_header" });
    showContextPopup({
      target,
      content: <PartsList part={partIndex} />,
    });
  };

  const showPageContextPopup = ({ target }) => {
    // const openGoto = e => {
    //     app.setPopup("Goto");
    // };
    // const addToHifz = e => {
    //     app.setMessageBox({
    //         title: <String id="update_hifz" />,
    //         content: <AddHifz />
    //     });
    // };
    analytics.logEvent("show_page_context", { trigger: "page_header" });
    showContextPopup({
      target,
      // header: <div>Page Header</div>,
      content: <PageContextButtons page={pageIndex} />,
    });
  };

  const showVerseContextPopup = ({ target }) => {
    analytics.logEvent("show_verse_context", { trigger: "page_header" });
    showContextPopup({
      target,
      content: <VerseContextButtons verse={app.selectStart} />,
    });
  };

  const onClickNext = (e) => {
    onIncrement && onIncrement(e);
    analytics.logEvent("nav_next_verse", { trigger: "page_header" });
  };

  const onClickPrevious = (e) => {
    onDecrement && onDecrement(e);
    analytics.logEvent("nav_prev_verse", { trigger: "page_header" });
  };

  const showSuraContextPopup = ({ target }) => {
    analytics.logEvent("show_chapter_context", {
      trigger: "page_header",
    });
    showContextPopup({
      target,
      header: <SuraContextHeader sura={suraIndex} />,
      content: <SuraList trigger="header_chapter_context" simple={true} />,
    });
  };

  return (
    <div className="PageHeader">
      <div className="PageHeaderContent">
        <CircleProgress
          target={QData.pages_count}
          progress={pageIndex + 1}
          display={partIndex + 1}
          onClick={showPartContextPopup}
          strokeWidth={3}
          title={intl.formatMessage({ id: "part_num" }, { num: partIndex + 1 })}
        />
        <button
          onClick={showSuraContextPopup}
          title={intl.formatMessage({ id: "sura_num" }, { num: suraIndex + 1 })}
        >
          {app.suraName(suraIndex)}
        </button>
        <button
          onClick={showPageContextPopup}
          className="IconButton"
          title={intl.formatMessage({ id: "page_num" }, { num: pageIndex + 1 })}
        >
          <Icon icon={faBookOpen} />
          {pageIndex + 1}
        </button>
        <div
          className="PageHeaderSection"
          style={{
            display: pagesCount === 1 || order ? "" : "none",
          }}
        >
          <button className="NavButton NavBackward" onClick={onClickPrevious}>
            <Icon icon={faAngleUp} />
          </button>
          <button
            onClick={(e) => {
              app.gotoAya(app.selectStart);
              showVerseContextPopup(e);
            }}
            className="SelectionButton"
            title={intl.formatMessage({ id: "goto_selection" })}
          >
            {selectedAyaInfo.sura + 1 + ":" + (selectedAyaInfo.aya + 1)}
          </button>
          <button onClick={onClickNext} className="NavButton NavForward">
            <Icon icon={faAngleDown} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default PageHeader;
