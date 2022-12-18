import React, { useContext, useEffect, useState } from "react";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AudioState, PlayerContext } from "../../context/Player";
import { useDispatch, useSelector } from "react-redux";
import { selectIsCompact, selectPagesCount } from "../../store/layoutSlice";
import { closePopup } from "../../store/uiSlice";
import { AppContext } from "../../context/App";

const GotoPage = ({ open }) => {
  const player = useContext(PlayerContext);
  const app = useContext(AppContext);
  const isCompact = useSelector(selectIsCompact);
  const dispatch = useDispatch();

  // const [isOpen, setIsOpen] = useState(true);
  const pagesCount = useSelector(selectPagesCount);

  const [pageNumber, updatePageNumber] = useState(
    QData.ayaIdPage(app.selectStart) + 1
  );
  const [partNumber, updatePartNumber] = useState(
    QData.ayaIdPart(app.selectStart) + 1
  );

  const [suraNumber, updateSuraNumber] = useState(
    QData.ayaIdInfo(app.selectStart).sura + 1
  );
  const [verseNumber, updateVerseNumber] = useState(
    QData.ayaIdInfo(app.selectStart).aya + 1
  );

  const [lastVerseNumber, updateLastVerseNumber] = useState(
    QData.sura_info[suraNumber - 1].ac
  );

  let gotoPageForm;

  // useEffect(() => {
  //     setIsOpen(open); //update internal state to match
  // }, [open]);

  useEffect(() => {
    updatePageNumber(QData.ayaIdPage(app.selectStart) + 1);
    updatePartNumber(QData.ayaIdPart(app.selectStart) + 1);
    updateSuraNumber(QData.ayaIdInfo(app.selectStart).sura + 1);
    updateVerseNumber(QData.ayaIdInfo(app.selectStart).aya + 1);
  }, [app.selectStart]);

  useEffect(() => {
    gotoPageForm.PageNumber.focus();
    gotoPageForm.PageNumber.select();
    return () => {
      // document.body.focus();
    };
  }, []);

  const stopAudio = () => {
    if (player.audioState !== AudioState.stopped) {
      player.stop();
    }
  };

  const checkClosePopup = () => {
    if (!isCompact && pagesCount === 1) {
      dispatch(closePopup());
    }
  };

  const gotoPage = (e) => {
    e.preventDefault();
    const { target: form } = e;
    const pageNum = form["PageNumber"].value;
    app.gotoPage(pageNum);
    let ayaId = QData.pageAyaId(pageNum - 1);
    app.selectAya(ayaId);
    checkClosePopup();
    stopAudio();
  };

  const gotoPart = (e) => {
    const { target: form } = e;
    const part = parseInt(form["PartNumber"].value);
    // const partInfo = QData.parts[part - 1];
    app.gotoPart(part - 1);
    checkClosePopup();
    stopAudio();
    e.preventDefault();
  };

  const gotoSura = (e) => {
    app.gotoSura(suraNumber - 1);
    checkClosePopup();
    stopAudio();
    e.preventDefault();
  };

  const gotoVerse = (e) => {
    app.gotoAya(QData.ayaID(suraNumber - 1, verseNumber - 1), {
      sel: true,
    });
    checkClosePopup();
    stopAudio();
    e.preventDefault();
  };

  const updatePage = (e) => {
    updatePageNumber(e.target.value);
  };

  const updateSura = (e) => {
    const suraIndex = e.target.value - 1;
    updateSuraNumber(suraIndex + 1);
    const suraInfo = QData.sura_info[suraIndex];
    updateVerseNumber(1);
    updateLastVerseNumber(suraInfo.ac);
  };

  const updatePart = (e) => {
    updatePartNumber(e.target.value);
  };

  const updateVerse = (e) => {
    updateVerseNumber(e.target.value);
  };

  return (
    <>
      <div className="Title">
        <String id="goto" />
      </div>
      <div className="FieldRow">
        <form
          onSubmit={gotoPage}
          ref={(form) => {
            gotoPageForm = form;
          }}
        >
          <div className="FieldLabel">
            <label htmlFor="PageNumber">
              <String id="page" />
            </label>
          </div>
          <div className="FieldValue">
            <input
              type="Number"
              name="PageNumber"
              min="1"
              max="604"
              id="PageNumber"
              value={pageNumber}
              onChange={updatePage}
            />
          </div>
          <div className="FieldAction">
            <button type="submit">
              <String id="go" />
            </button>
          </div>
        </form>
      </div>
      <div className="FieldRow">
        <form onSubmit={gotoPart}>
          <div className="FieldLabel">
            <label htmlFor="PartNumber">
              <String id="part" />
            </label>
          </div>
          <div className="FieldValue">
            <input
              type="Number"
              name="PartNumber"
              min="1"
              max="30"
              id="PartNumber"
              value={partNumber}
              onChange={updatePart}
            />
          </div>
          <div className="FieldAction">
            <button type="submit">
              <String id="go" />
            </button>
          </div>
        </form>
      </div>
      <div className="FieldRow">
        <form onSubmit={gotoSura}>
          <div className="FieldLabel">
            <label htmlFor="SuraNumber">
              <String id="sura" />
            </label>
          </div>
          <div className="FieldValue">
            <input
              type="Number"
              name="SuraNumber"
              min="1"
              max="114"
              id="SuraNumber"
              value={suraNumber}
              onChange={updateSura}
            />
          </div>
          <div className="FieldAction">
            <button type="submit">
              <String id="go" />
            </button>
          </div>
        </form>
      </div>
      <div className="FieldRow">
        <form onSubmit={gotoVerse}>
          <div className="FieldLabel">
            <label htmlFor="SuraNumber">
              <String id="verse" />
            </label>
          </div>
          <div className="FieldValue">
            <input
              type="Number"
              name="VerseNumber"
              min="1"
              max={lastVerseNumber}
              id="VerseNumber"
              value={verseNumber}
              onChange={updateVerse}
            />
          </div>
          <div className="FieldAction">
            <button type="submit">
              <String id="go" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

export default GotoPage;
