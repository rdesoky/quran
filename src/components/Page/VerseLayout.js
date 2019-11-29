import React, { useState, useEffect, useContext } from "react";
import { AppConsumer, AppContext } from "../../context/App";
import { PlayerConsumer, PlayerContext } from "../../context/Player";
import QData from "../../services/QData";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes } from "@fortawesome/free-solid-svg-icons";
import Utils from "../../services/utils";
import { VerseContextButtons } from "../Widgets";

const VerseLayout = ({ page: pageIndex, children, pageWidth, versesInfo }) => {
    const app = useContext(AppContext);
    const player = useContext(PlayerContext);
    const [hoverVerse, setHoverVerse] = useState(-1);

    const pageHeight = app.appHeight - 50;
    const lineHeight = pageHeight / 15;
    const lineWidth = pageWidth;

    const closeMask = e => {
        app.hideMask();
    };

    const onMouseEnter = ({ target }) => {
        setHoverVerse(parseInt(target.getAttribute("aya-id")));
    };

    const onMouseLeave = () => {
        setHoverVerse(-1);
    };

    const onContextMenu = e => {
        const { target } = e;
        //Extend selection
        const aya_id = parseInt(target.getAttribute("aya-id"));
        onClickVerse({ target, shiftKey: true });
        app.setContextPopup({
            target,
            content: <VerseContextButtons verse={aya_id} />
        });
        e.preventDefault();
    };

    const isHovered = aya_id => hoverVerse === aya_id;
    const isSelected = aya_id => {
        const start = Math.min(app.selectStart, app.selectEnd);
        const end = Math.max(app.selectStart, app.selectEnd);
        return aya_id >= start && aya_id <= end;
    };
    const isMasked = aya_id => {
        let { maskStart } = app;
        if (maskStart !== -1 && aya_id >= maskStart) {
            return true;
        }
        return false;
    };

    const onClickVerse = e => {
        const { shiftKey, ctrlKey, altKey, target } = e;
        const aya_id = parseInt(target.getAttribute("aya-id"));
        //set selectStart|selectEnd|maskStart
        if (app.maskStart !== -1) {
            if (app.maskStart > aya_id) {
                app.setMaskStart(aya_id);
            } else {
                let nPageIndex = parseInt(pageIndex);
                let maskStartPage = QData.ayaIdPage(app.maskStart);
                if (maskStartPage === nPageIndex) {
                    //same page
                    app.offsetMask(1);
                } else {
                    let clickedPage = QData.ayaIdPage(aya_id);
                    let clickedPageFirstAyaId = QData.pageAyaId(clickedPage);

                    app.setMaskStart(clickedPageFirstAyaId);
                }
            }
        } else {
            if (shiftKey || ctrlKey) {
                app.extendSelection(aya_id);
            } else {
                if (aya_id.between(app.selectStart, app.selectEnd)) {
                    app.setContextPopup({
                        target: e.target,
                        content: <VerseContextButtons verse={aya_id} />
                    });
                    // if (app.popup === null) {
                    //     app.toggleShowMenu();
                    // }
                    e.stopPropagation();
                } else {
                    app.selectAya(aya_id);
                }
            }
        }
    };

    const ayaClass = aya_id => {
        let className = "";
        let selected = isSelected(aya_id);
        if (selected) {
            className = "Selected";
        }
        let hovered = isHovered(aya_id);
        if (hovered) {
            className += " Hovered";
        }
        if (isMasked(aya_id)) {
            className = "Masked";
            if (selected) {
                className += " Selected";
            }
        }
        if (aya_id === player.playingAya) {
            className += " Playing";
        }
        return className.trim();
    };

    const verseHead = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
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
                        sline === eline ? ((1000 - epos) * lineWidth) / 1000 : 0
                }}
            />
        );
    };

    const verseTail = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
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
                        left: lineWidth - (epos * lineWidth) / 1000
                    }}
                />
            );
        }
    };

    const verseBody = ({ aya_id, sura, aya, sline, spos, eline, epos }) => {
        if (eline - sline > 1) {
            let aClass = ayaClass(aya_id);
            let lines = [];

            for (let i = parseInt(sline) + 1; i < parseInt(eline); i++) {
                lines.push(i);
            }

            return lines.map(line => {
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
                            left: 0
                        }}
                    />
                );
            });
        }
    };

    const verseStructure = verse => {
        return (
            <>
                {verseHead(verse)}
                {verseBody(verse)}
                {verseTail(verse)}
            </>
        );
    };

    function renderMask() {
        const { maskStart } = app;
        if (maskStart === -1) {
            return;
        }
        const maskStartPage = QData.ayaIdPage(maskStart);
        if (maskStartPage > pageIndex) {
            return;
        }

        const fullPageMask = () => {
            return (
                <div
                    className="Mask MaskBody"
                    style={{
                        top: 0,
                        bottom: 0,
                        left: 0,
                        right: 0
                    }}
                />
            );
        };

        if (maskStartPage === pageIndex) {
            let maskStartInfo = versesInfo.find(v => v.aya_id === maskStart);
            if (maskStartInfo) {
                const { sline, spos, eline, epos } = maskStartInfo;
                let right = (spos * lineWidth) / 1000;
                let closeBtnRight = right - lineHeight / 2;
                if (closeBtnRight < 0) {
                    closeBtnRight = 0;
                }
                return (
                    <>
                        <div
                            className="Mask Head"
                            style={{
                                height: lineHeight,
                                top: (sline * pageHeight) / 15,
                                right,
                                left: 0
                            }}
                        />
                        <div
                            className="Mask MaskBody"
                            style={{
                                top: ((parseInt(sline) + 1) * pageHeight) / 15,
                                bottom: 0,
                                right: 0,
                                left: 0
                            }}
                        />
                        {verseStructure(maskStartInfo)}
                        <button
                            onClick={closeMask}
                            style={{
                                pointerEvents: "visible",
                                position: "absolute",
                                width: lineHeight,
                                height: lineHeight,
                                top: (sline * pageHeight) / 15,
                                right: closeBtnRight,
                                backgroundColor: "#777"
                            }}
                        >
                            <FontAwesomeIcon icon={faTimes} />
                        </button>
                    </>
                );
            } else {
                return fullPageMask();
            }
        } else {
            return fullPageMask();
        }
    }

    function renderVerses() {
        return versesInfo.map((verse, index) => {
            return <div key={index}>{verseStructure(verse)}</div>;
        });
    }

    return (
        <>
            <div
                className="VerseLayout"
                style={{
                    direction: "ltr",
                    width: pageWidth,
                    height: app.pageHeight(),
                    margin: app.pageMargin()
                }}
            >
                {renderVerses()}
            </div>
            {children}
            <div
                className="MaskContainer"
                style={{
                    direction: "ltr",
                    top: 0,
                    width: pageWidth,
                    height: app.pageHeight(),
                    margin: app.pageMargin()
                }}
            >
                {renderMask()}
            </div>
        </>
    );
};

export const HifzSegments = ({ page, versesInfo }) => {
    const app = useContext(AppContext);
    const pageSuras = QData.pageSuras(page);
    return (
        <div className="HifzSegments">
            {pageSuras.map(sura => (
                <HifzSegment
                    key={page.toString() + "-" + sura.toString()}
                    sura={sura}
                    page={page}
                    pageHeight={app.pageHeight()}
                    versesInfo={versesInfo}
                />
            ))}
        </div>
    );
};

export const HifzSegment = ({ sura, page, pageHeight, versesInfo }) => {
    const app = useContext(AppContext);
    const suraVerses = versesInfo.filter(i => i.sura - 1 === sura);
    if (suraVerses.length === 0) {
        return "";
    }

    const { hifzRanges } = app;

    const hifzRange = hifzRanges.find(r => {
        return r.sura === sura && page >= r.startPage && page <= r.endPage;
    });

    if (hifzRange === undefined) {
        return "";
    }

    const dayLength = 24 * 60 * 60 * 1000;
    const age = Math.floor((Date.now() - hifzRange.date) / dayLength);
    const firstVerse = suraVerses[0];
    const lastVerse = suraVerses[suraVerses.length - 1];
    const sline = parseInt(firstVerse.sline);
    const top = (pageHeight * sline) / 15;
    const eline = parseInt(lastVerse.eline);
    const bottom = (pageHeight * (eline + 1)) / 15;
    const height = bottom - top;
    const ageClass =
        age <= 7 ? "GoodHifz" : age <= 14 ? "FairHifz" : "WeakHifz";

    return (
        <div
            className={`HifzSegment ${ageClass}`}
            style={{ top, height }}
        ></div>
    );
};

export default VerseLayout;
