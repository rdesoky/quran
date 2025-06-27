import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import useSnapHeightToBottomOf from "@/hooks/useSnapHeightToBottomOff";
import {
    ayaID,
    ayaIdInfo,
    ayaIdPage,
    getPartIndexByAyaId,
    sura_info,
    TOTAL_PAGES,
    TOTAL_PARTS,
    TOTAL_SURAS,
} from "@/services/qData";
import { selectAppHeight } from "@/store/layoutSlice";
import {
    gotoAya,
    gotoPage,
    gotoPart,
    gotoSura,
    selectStartSelection,
} from "@/store/navSlice";
import { closePopupIfBlocking } from "@/store/uiSlice";
import PartsPie from "@/components/PartsPie";

const GotoPage = () => {
    const dispatch = useDispatch();
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);

    // const [isOpen, setIsOpen] = useState(true);
    const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15, 0, "maxHeight");

    const [pageNumber, updatePageNumber] = useState<string>(() =>
        (ayaIdPage(selectStart) + 1).toString()
    );
    const [partNumber, updatePartNumber] = useState<string>(() =>
        (getPartIndexByAyaId(selectStart) + 1).toString()
    );

    const [suraNumber, updateSuraNumber] = useState<string>(() =>
        (ayaIdInfo(selectStart).sura + 1).toString()
    );
    const [verseNumber, updateVerseNumber] = useState<string>(() =>
        (ayaIdInfo(selectStart).aya + 1).toString()
    );

    const [lastVerseNumber, updateLastVerseNumber] = useState<number>(
        () => sura_info[Number(suraNumber) - 1].ac
    );

    let gotoPageForm: HTMLFormElement | null = null;

    useEffect(() => {
        updatePageNumber((ayaIdPage(Number(selectStart)) + 1).toString());
        updatePartNumber(
            (getPartIndexByAyaId(Number(selectStart)) + 1).toString()
        );
        updateSuraNumber((ayaIdInfo(Number(selectStart)).sura + 1).toString());
        updateVerseNumber((ayaIdInfo(Number(selectStart)).aya + 1).toString());
    }, [selectStart]);

    const pageNumberRef = React.useRef<HTMLInputElement | null>(null);
    const partNumberRef = React.useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        //TODO: implement useFocusRef hook
        pageNumberRef.current?.focus();
        pageNumberRef.current?.select();
        return () => {
            // document.body.focus();
        };
    }, []);

    const onGotoPage = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const pageNum = Number(pageNumberRef.current?.value);
        dispatch(gotoPage(history, pageNum - 1, { sel: true }));
        dispatch(closePopupIfBlocking());
    };

    const onGotoPart = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const part = Number(partNumberRef.current?.value);
        dispatch(gotoPart(history, part - 1));
        dispatch(closePopupIfBlocking());
    };

    const onGotoSura = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(gotoSura(history, Number(suraNumber) - 1));
        dispatch(closePopupIfBlocking());
    };

    const onGotoAya = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        dispatch(
            gotoAya(
                history,
                ayaID(Number(suraNumber) - 1, Number(verseNumber) - 1)
            )
        );
        dispatch(closePopupIfBlocking());
    };

    const updatePage = (e: React.ChangeEvent<HTMLInputElement>) => {
        updatePageNumber(e.target.value);
    };

    const updateSura = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.value === "") {
            updateSuraNumber("");
            return;
        }
        const suraIndex = Number(e.target.value || "1") - 1;
        updateSuraNumber((suraIndex + 1).toString());
        const suraInfo = sura_info[suraIndex];
        updateVerseNumber("1");
        updateLastVerseNumber(suraInfo.ac);
    };

    const updatePart = (e: React.ChangeEvent<HTMLInputElement>) => {
        updatePartNumber(e.target.value);
    };

    const updateVerse = (e: React.ChangeEvent<HTMLInputElement>) => {
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
                                ref={pageNumberRef}
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
                                ref={partNumberRef}
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
