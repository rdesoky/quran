import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPartIndexByAyaId,
    sura_info,
    TOTAL_PAGES,
    TOTAL_PARTS,
    TOTAL_SURAS,
} from "../../services/qData";
import { selectAppHeight } from "../../store/layoutSlice";
import {
    gotoAya,
    gotoPage,
    gotoPart,
    gotoSura,
    selectStartSelection,
} from "../../store/navSlice";
import { closePopupIfBlocking } from "../../store/uiSlice";
import PartsPie from "../PartsPie";

const GotoPage = ({ open }) => {
    const dispatch = useDispatch();
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);

    // const [isOpen, setIsOpen] = useState(true);
    const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15, 0, "maxHeight");

    const [pageNumber, updatePageNumber] = useState(
        () => ayaIdPage(selectStart) + 1
    );
    const [partNumber, updatePartNumber] = useState(
        () => getPartIndexByAyaId(selectStart) + 1
    );

    const [suraNumber, updateSuraNumber] = useState(
        () => ayaIdInfo(selectStart).sura + 1
    );
    const [verseNumber, updateVerseNumber] = useState(
        () => ayaIdInfo(selectStart).aya + 1
    );

    const [lastVerseNumber, updateLastVerseNumber] = useState(
        () => sura_info[suraNumber - 1].ac
    );

    let gotoPageForm;

    useEffect(() => {
        updatePageNumber(ayaIdPage(selectStart) + 1);
        updatePartNumber(getPartIndexByAyaId(selectStart) + 1);
        updateSuraNumber(ayaIdInfo(selectStart).sura + 1);
        updateVerseNumber(ayaIdInfo(selectStart).aya + 1);
    }, [selectStart]);

    useEffect(() => {
        gotoPageForm.PageNumber.focus();
        gotoPageForm.PageNumber.select();
        return () => {
            // document.body.focus();
        };
    }, [gotoPageForm?.PageNumber]);

    const onGotoPage = (e) => {
        e.preventDefault();
        const { target: form } = e;
        const pageNum = parseInt(form["PageNumber"].value);
        dispatch(gotoPage(history, pageNum - 1, { sel: true }));
        // app.gotoPage(pageNum);
        // let ayaId = getPageFirstAyaId(pageNum - 1);
        // app.selectAya(ayaId);
        dispatch(closePopupIfBlocking());
        // stopAudio();
    };

    const onGotoPart = (e) => {
        e.preventDefault();
        const { target: form } = e;
        const part = parseInt(form["PartNumber"].value);
        // const partInfo = parts[part - 1];
        dispatch(gotoPart(history, part - 1, { sel: true }));
        // app.gotoPart(part - 1);
        dispatch(closePopupIfBlocking());
        // stopAudio();
    };

    const onGotoSura = (e) => {
        e.preventDefault();
        // app.gotoSura(suraNumber - 1);
        dispatch(gotoSura(history, suraNumber - 1, { sel: true }));
        dispatch(closePopupIfBlocking());
        // stopAudio();
    };

    const onGotoAya = (e) => {
        dispatch(
            gotoAya(history, ayaID(suraNumber - 1, verseNumber - 1), {
                sel: true,
            })
        );
        // app.gotoAya(ayaID(suraNumber - 1, verseNumber - 1), {
        //     sel: true,
        // });
        dispatch(closePopupIfBlocking());
        // stopAudio();
        e.preventDefault();
    };

    const updatePage = (e) => {
        updatePageNumber(e.target.value);
    };

    const updateSura = (e) => {
        if (e.target.value === "") {
            updateSuraNumber("");
            return;
        }
        const suraIndex = parseInt(e.target.value || "1") - 1;
        updateSuraNumber(suraIndex + 1);
        const suraInfo = sura_info[suraIndex];
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
            <div className="PopupBody" ref={bodyRef}>
                <div className="FieldRow">
                    <form
                        onSubmit={onGotoPage}
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
                                min={1}
                                max={TOTAL_PAGES}
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
                    <form onSubmit={onGotoPart}>
                        <div className="FieldLabel">
                            <label htmlFor="PartNumber">
                                <String id="part" />
                            </label>
                        </div>
                        <div className="FieldValue">
                            <input
                                type="Number"
                                name="PartNumber"
                                min={1}
                                max={TOTAL_PARTS}
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
                    <form onSubmit={onGotoSura}>
                        <div className="FieldLabel">
                            <label htmlFor="SuraNumber">
                                <String id="sura" />
                            </label>
                        </div>
                        <div className="FieldValue">
                            <input
                                type="Number"
                                name="SuraNumber"
                                min={1}
                                max={TOTAL_SURAS}
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
                    <form onSubmit={onGotoAya}>
                        <div className="FieldLabel">
                            <label htmlFor="SuraNumber">
                                <String id="verse" />
                            </label>
                        </div>
                        <div className="FieldValue">
                            <input
                                type="Number"
                                name="VerseNumber"
                                min={1}
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
                <div
                    style={{
                        direction: "ltr",
                        textAlign: "center",
                        padding: "20px 0",
                    }}
                >
                    <PartsPie
                        size={280}
                        onFinish={() => dispatch(closePopupIfBlocking())}
                    />
                </div>
            </div>
        </>
    );
};

export default GotoPage;
