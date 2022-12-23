import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useContext, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import { AppRefs } from "../../RefsProvider";
import { ayaIdPage, getPageFirstAyaId } from "../../services/QData";
import { selectAppHeight, selectPageMargin } from "../../store/layoutSlice";
import {
    extendSelection,
    gotoAya,
    hideMask,
    offsetSelection,
    selectEndSelection,
    selectMaskStart,
    selectStartSelection,
} from "../../store/navSlice";
import { selectPlayingAya } from "../../store/playerSlice";
import { VerseContextButtons } from "../Widgets";
import { analytics } from "./../../services/Analytics";

const VerseLayout = ({ page: pageIndex, children, pageWidth, versesInfo }) => {
    const playingAya = useSelector(selectPlayingAya);
    const [hoverVerse, setHoverVerse] = useState(-1);
    const appHeight = useSelector(selectAppHeight);
    const pageMargin = useSelector(selectPageMargin);
    const selectStart = useSelector(selectStartSelection);
    const selectEnd = useSelector(selectEndSelection);
    const dispatch = useDispatch();
    const maskStart = useSelector(selectMaskStart);
    const history = useHistory();
    const contextPopup = useContext(AppRefs).get("contextPopup");

    const pageHeight = appHeight - 50;
    const lineHeight = pageHeight / 15;
    const lineWidth = pageWidth;

    const closeMask = (e) => {
        analytics.logEvent("hide_mask", { trigger: "mask_x_button" });
        // app.hideMask();
        dispatch(hideMask());
    };

    const onMouseEnter = ({ target }) => {
        setHoverVerse(parseInt(target.getAttribute("aya-id")));
    };

    const onMouseLeave = () => {
        setHoverVerse(-1);
    };

    const onContextMenu = (e) => {
        const { target } = e;
        //Extend selection
        // const aya_id = parseInt(target.getAttribute("aya-id"));
        onClickVerse({ target, shiftKey: true });
        // app.setContextPopup({
        //     target,
        //     content: <VerseContextButtons verse={aya_id} />
        // });
        e.preventDefault();
    };

    const isHovered = (aya_id) => hoverVerse === aya_id;
    const isSelected = (aya_id) => {
        return aya_id.between(selectStart, selectEnd);
    };
    const isMasked = (aya_id) => {
        if (maskStart !== -1 && aya_id >= maskStart) {
            return true;
        }
        return false;
    };

    const onClickMask = (e) => {
        let nPageIndex = parseInt(e.target.getAttribute("page"));
        let maskStartPage = ayaIdPage(maskStart);
        if (maskStartPage === nPageIndex) {
            dispatch(offsetSelection(1));
            //same page
            // app.offsetMask(1);
        } else {
            let clickedPageFirstAyaId = getPageFirstAyaId(nPageIndex);
            dispatch(gotoAya(history, clickedPageFirstAyaId));
        }
        e.stopPropagation();
    };

    const onClickVerse = (e) => {
        const { shiftKey, ctrlKey, target } = e;
        const aya_id = parseInt(target.getAttribute("aya-id"));
        //set selectStart|selectEnd|maskStart
        // if (maskStart !== -1) {
        //     if (maskStart > aya_id) {
        //         // app.setMaskStart(aya_id);
        //         dispatch(setMaskStart(aya_id));
        //     }
        // } else
        // {
        if (shiftKey || ctrlKey) {
            analytics.logEvent("extend_selection", {
                trigger: "keyboard",
            });
            dispatch(extendSelection(aya_id));
            // app.extendSelection(aya_id);
        } else {
            if (aya_id.between(selectStart, selectEnd)) {
                analytics.logEvent("show_verse_context", {
                    trigger: "selected_verses",
                });
                contextPopup.show({
                    target: e.target,
                    content: <VerseContextButtons verse={aya_id} />,
                });
                typeof e.stopPropagation === "function" && e.stopPropagation(); //prevent browser context menu
            } else {
                dispatch(gotoAya(history, aya_id, { sel: true }));
                // app.selectAya(aya_id);
            }
        }
        // }
    };

    const ayaClass = (aya_id) => {
        let className = "";
        let selected = isSelected(aya_id);

        if (selected) {
            className = "Selected";
        }

        className = className.appendWord("Hovered", isHovered(aya_id));

        if (isMasked(aya_id)) {
            className = "Masked".appendWord("Selected", selected);
        }

        className = className.appendWord("Playing", aya_id === playingAya);

        return className;
    };

    const VerseHead = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
        let aClass = ayaClass(aya_id);

        return (
            <div
                onClick={onClickVerse}
                onMouseEnter={onMouseEnter}
                onMouseLeave={onMouseLeave}
                onContextMenu={onContextMenu}
                aya-id={aya_id}
                sura={sura}
                aya={aya}
                sline={sline}
                eline={eline}
                spos={spos}
                epos={epos}
                className={["Verse VerseHead", aClass].join(" ").trim()}
                style={{
                    height: lineHeight,
                    top: (sline * pageHeight) / 15,
                    right: (spos * lineWidth) / 1000,
                    left:
                        sline === eline
                            ? ((1000 - epos) * lineWidth) / 1000
                            : 0,
                }}
            />
        );
    };

    const VerseTail = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
        if (eline - sline > 0) {
            let aClass = ayaClass(aya_id);
            return (
                <div
                    onClick={onClickVerse}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    onContextMenu={onContextMenu}
                    aya-id={aya_id}
                    sura={sura}
                    aya={aya}
                    sline={sline}
                    eline={eline}
                    spos={spos}
                    epos={epos}
                    className={["Verse VerseTail", aClass].join(" ").trim()}
                    style={{
                        height: lineHeight,
                        top: (eline * pageHeight) / 15,
                        right: 0,
                        left: lineWidth - (epos * lineWidth) / 1000,
                    }}
                />
            );
        }
        return null;
    };

    const VerseBody = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
        if (eline - sline > 1) {
            let aClass = ayaClass(aya_id);
            let lines = [];

            for (let i = parseInt(sline) + 1; i < parseInt(eline); i++) {
                lines.push(i);
            }

            return lines.map((line) => {
                return (
                    <div
                        key={line}
                        onClick={onClickVerse}
                        onMouseEnter={onMouseEnter}
                        onMouseLeave={onMouseLeave}
                        onContextMenu={onContextMenu}
                        aya-id={aya_id}
                        sura={sura}
                        aya={aya}
                        sline={sline}
                        eline={eline}
                        spos={spos}
                        epos={epos}
                        className={["Verse VerseBody", aClass].join(" ").trim()}
                        style={{
                            height: lineHeight,
                            top: (line * pageHeight) / 15,
                            right: 0,
                            left: 0,
                        }}
                    />
                );
            });
        }
        return null;
    };

    const VerseStructure = (verse) => {
        return (
            <div className="VerseParts" aya={verse.aya_id} key={verse.aya_id}>
                {VerseHead(verse)}
                {VerseBody(verse)}
                {VerseTail(verse)}
                {/* <VerseHead {...verse} />
                <VerseBody {...verse} />
                <VerseTail {...verse} /> */}
            </div>
        );
    };

    function renderMask() {
        if (maskStart === -1) {
            return;
        }
        const maskStartPage = ayaIdPage(maskStart);
        if (maskStartPage > pageIndex) {
            return;
        }

        const fullPageMask = (pageIndex) => {
            return (
                <div
                    className="Mask MaskBody"
                    onClick={onClickMask}
                    page={pageIndex}
                    style={{
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0,
                    }}
                />
            );
        };

        if (maskStartPage === pageIndex) {
            let maskStartInfo = versesInfo.find((v) => v.aya_id === maskStart);
            if (maskStartInfo) {
                const { sline, spos } = maskStartInfo;
                let right = (spos * lineWidth) / 1000;
                let closeBtnRight = right - lineHeight / 2;
                if (closeBtnRight < 0) {
                    closeBtnRight = 0;
                }
                return (
                    <>
                        <div
                            className="Mask Head"
                            onClick={onClickMask}
                            page={pageIndex}
                            style={{
                                height: lineHeight,
                                top: (sline * pageHeight) / 15,
                                right,
                                left: 0,
                            }}
                        />
                        <div
                            className="Mask MaskBody"
                            onClick={onClickMask}
                            page={pageIndex}
                            style={{
                                top: ((parseInt(sline) + 1) * pageHeight) / 15,
                                bottom: 0,
                                right: 0,
                                left: 0,
                            }}
                        />
                        {/* <VerseStructure {...maskStartInfo} /> */}
                        {VerseStructure(maskStartInfo)}
                        <button
                            onClick={closeMask}
                            style={{
                                pointerEvents: "visible",
                                position: "absolute",
                                width: lineHeight,
                                height: lineHeight,
                                top: (sline * pageHeight) / 15,
                                right: closeBtnRight,
                                backgroundColor: "#777",
                            }}
                        >
                            <Icon icon={faTimes} />
                        </button>
                    </>
                );
            } else {
                return fullPageMask(pageIndex);
            }
        } else {
            return fullPageMask(pageIndex);
        }
    }

    const Verses = (versesInfo) => {
        return versesInfo.map((verse, index) => {
            return VerseStructure(verse);
            // return <VerseStructure key={verse.aya_id} {...verse} />;
        });
    };

    return (
        <>
            <div
                className="VerseLayout"
                style={{
                    direction: "ltr",
                    width: pageWidth,
                    height: pageHeight,
                    margin: pageMargin,
                }}
            >
                {/* <Verses verseInfo={versesInfo} /> */}
                {Verses(versesInfo)}
            </div>
            {children}
            <div
                className="MaskContainer"
                style={{
                    direction: "ltr",
                    top: 0,
                    width: pageWidth,
                    height: pageHeight,
                    margin: pageMargin,
                }}
            >
                {renderMask()}
            </div>
        </>
    );
};

export default VerseLayout;
