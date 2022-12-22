import React, { useCallback, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useHistory } from "react-router-dom";
import { AppContext } from "../../context/App";
import { AppRefs } from "../../RefsProvider";
import { ayaIdPage, TOTAL_VERSES } from "../../services/QData";
import { copy2Clipboard, downloadPageImage } from "../../services/utils";
import {
    selectAppHeight,
    selectIsNarrow,
    selectIsWide,
    selectModalPopup,
    selectPagerWidth,
    selectPagesCount,
    selectPageWidth,
} from "../../store/layoutSlice";
import {
    extendSelection,
    gotoAya,
    gotoPage,
    hideMask,
    offsetPage,
    offsetSelection,
    selectAya,
    selectMaskStart,
    selectStartSelection,
    showMask,
} from "../../store/navSlice";
import {
    closePopup,
    selectPopup,
    selectShowMenu,
    showMenu,
    showPopup,
} from "../../store/uiSlice";
import { shownMessageBoxes } from "../MessageBox";
import Page from "../Page/Page";
import { analytics } from "./../../services/Analytics";
import DDrop from "./../DDrop";
import "./Pager.scss";

export function PageRedirect({ match }) {
    const dispatch = useDispatch();
    let { aya } = match.params;
    let pageNum = 1;

    if (aya !== undefined) {
        setTimeout(() => {
            // app.selectAya(parseInt(aya));
            dispatch(selectAya(parseInt(aya)));
        }, 10);
        pageNum = ayaIdPage(aya) + 1;
    }
    return <Redirect to={process.env.PUBLIC_URL + "/page/" + pageNum} />;
}

export default function Pager({ match }) {
    const app = useContext(AppContext);
    const pagesCount = useSelector(selectPagesCount);
    const isWide = useSelector(selectIsWide);
    const appHeight = useSelector(selectAppHeight);
    const pageWidth = useSelector(selectPageWidth);
    const pagerWidth = useSelector(selectPagerWidth);
    const dispatch = useDispatch();
    const isNarrow = useSelector(selectIsNarrow);
    const expandedMenu = useSelector(selectShowMenu);
    const activePopup = useSelector(selectPopup);
    const modalPopup = useSelector(selectModalPopup);
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const maskStart = useSelector(selectMaskStart);
    const contextPopup = useContext(AppRefs).get("contextPopup");
    const msgBox = useContext(AppRefs).get("msgBox");

    let pageIndex = 0;

    let { page } = match.params;

    if (page !== undefined) {
        pageIndex = parseInt(page) - 1;
    }

    const pageUp = useCallback(
        (e) => {
            let count = activePopup && !isWide ? 1 : pagesCount;
            if (count > 1 && pageIndex % 2 === 0) {
                count = 1; //right page is active
            }
            dispatch(offsetPage(history, -count));
            "object" == typeof e && e.stopPropagation();
            analytics.logEvent("nav_prev_page");
        },
        [activePopup, dispatch, history, isWide, pageIndex, pagesCount]
    );

    const pageDown = useCallback(
        (e) => {
            let count = activePopup && !isWide ? 1 : pagesCount;
            if (count > 1 && pageIndex % 2 === 1) {
                count = 1; //left page is active
            }
            dispatch(offsetPage(history, count));
            "object" == typeof e && e.stopPropagation();
            analytics.logEvent("nav_next_page");
        },
        [activePopup, dispatch, history, isWide, pageIndex, pagesCount]
    );

    //ComponentDidUpdate
    useEffect(() => {
        //cache next pages
        const pageIndex = match.params.page - 1;
        if (pagesCount === 1) {
            downloadPageImage(pageIndex + 1).catch((e) => {});
        } else {
            downloadPageImage(pageIndex + 2).catch((e) => {});
            downloadPageImage(pageIndex + 3).catch((e) => {});
        }
    }, [pagesCount, match.params.page]);

    const handleWheel = (e) => {
        if (e.deltaY > 0) {
            analytics.setTrigger("mouse_wheel");
            //scroll down
            pageDown(e);
        } else {
            analytics.setTrigger("mouse_wheel");
            pageUp(e);
        }
    };

    const onOffsetSelection = useCallback(
        ({ shiftKey }, offset) => {
            let selectedAyaId;
            if (shiftKey) {
                // selectedAyaId = app.extendSelection(selectStart + offset);
                selectedAyaId = dispatch(extendSelection(selectStart + offset));
            } else {
                selectedAyaId = dispatch(offsetSelection(offset));
            }
            // app.gotoAya(selectedAyaId);
            dispatch(gotoAya(history, selectedAyaId));
        },
        [dispatch, history, selectStart]
    );

    const inExercise = useCallback(
        () => activePopup === "Exercise",
        [activePopup]
    );

    const onIncrement = useCallback(
        (e) => {
            // if (inExercise()) {
            //     offsetSelection(e, 1);
            //     return;
            // }
            // if (maskStart !== -1) {
            //     //Mask is active
            //     if (maskStart >= TOTAL_VERSES) {
            //         return;
            //     }
            //     let currPageNum = parseInt(match.params.page);
            //     let maskPageIndex = ayaIdPage(maskStart);
            //     if (maskPageIndex + 1 !== currPageNum) {
            //         // app.gotoPage(maskPageNum, REPLACE);
            //         dispatch(
            //             gotoPage(history, {
            //                 index: maskPageIndex,
            //                 replace: true,
            //             })
            //         );
            //         return;
            //     }
            //     // app.offsetMask(1);
            //     dispatch(offsetSelection(1));
            //     let maskNewPageIndex = ayaIdPage(maskStart + 1);
            //     if (maskNewPageIndex !== currPageNum - 1) {
            //         //Mask would move to a new page
            //         if (pagesCount === 1 || maskNewPageIndex % 2 === 0) {
            //             return; //Don't change page
            //         }
            //         //app.gotoPage(maskNewPageIndex, REPLACE);
            //         dispatch(
            //             gotoPage(history, {
            //                 index: maskNewPageIndex,
            //                 replace: true,
            //             })
            //         );
            //     }
            // } else {
            onOffsetSelection(e, 1);
            // }
            e.stopPropagation();
        },
        [onOffsetSelection]
    );

    const decrement = useCallback(
        (e) => {
            // if (inExercise()) {
            //     offsetSelection(e, -1);
            //     return;
            // }
            // if (maskStart !== -1) {
            //     //Mask is active
            //     if (maskStart <= 0) {
            //         return;
            //     }
            //     let maskNewPageNum = ayaIdPage(maskStart - 1) + 1;
            //     if (maskNewPageNum !== parseInt(match.params.page)) {
            //         //Mask would move to a new page
            //         // app.gotoPage(maskNewPageNum, REPLACE);
            //         dispatch(
            //             gotoPage(history, {
            //                 index: maskNewPageNum - 1,
            //                 replace: true,
            //             })
            //         );
            //         if (pagesCount === 1 || maskNewPageNum % 2 === 0) {
            //             return; //Don't move mask
            //         }
            //     }
            //     dispatch(offsetMask(-1));
            //     // app.offsetMask(-1);
            // } else {
            onOffsetSelection(e, -1);
            // }
            e.stopPropagation();
        },
        [onOffsetSelection]
    );

    const handleKeyDown = useCallback(
        (e) => {
            const { tagName, type } = document.activeElement;
            const isInput = ["INPUT", "BUTTON", "TEXTAREA"].includes(tagName);
            const isTextInput =
                isInput && ["text", "number", "textarea"].includes(type);

            const vEditorOn = ["Search", "Index"].includes(activePopup);

            const canShowPopup = activePopup === null && isTextInput === false;

            if (modalPopup) {
                return;
            }

            switch (e.code) {
                case "Insert":
                    copy2Clipboard(app.getSelectedText());
                    app.pushRecentCommand("Copy");
                    break;
                case "Escape":
                    if (contextPopup.info) {
                        contextPopup.close();
                    } else if (shownMessageBoxes.length > 0) {
                        msgBox.pop();
                    } else if (activePopup !== null) {
                        dispatch(closePopup());
                    } else if (expandedMenu) {
                        dispatch(showMenu(false));
                        // app.setExpandedMenu(false);
                    } else if (maskStart !== -1) {
                        // app.hideMask();
                        dispatch(hideMask());
                    }
                    break;
                case "KeyI":
                    if (canShowPopup) {
                        dispatch(showPopup("Indices"));
                    }
                    break;
                case "KeyF":
                    if (canShowPopup) {
                        // app.setMessageBox({
                        //   title: <String id="update_hifz" />,
                        //   content: <AddHifz />,
                        // });
                    }
                    break;
                case "KeyG":
                    if (canShowPopup) {
                        dispatch(showPopup("Goto"));
                    }
                    break;
                case "KeyX":
                    if (canShowPopup) {
                        dispatch(showPopup("Exercise"));
                    }
                    break;
                case "KeyB":
                    if (canShowPopup) {
                        dispatch(showPopup("Bookmarks"));
                    }
                    break;
                case "KeyO":
                    if (canShowPopup) {
                        dispatch(showPopup("Settings"));
                    }
                    break;
                case "KeyS":
                    if (canShowPopup) {
                        dispatch(showPopup("Search"));
                    }
                    break;
                case "KeyT":
                    if (canShowPopup) {
                        dispatch(showPopup("Tafseer"));
                    }
                    break;
                case "KeyM":
                    if (!vEditorOn) {
                        dispatch(showMask());
                        // app.setMaskStart();
                    }
                    break;
                case "ArrowDown":
                    if (!isTextInput) {
                        analytics.setTrigger("down_key");
                        if (maskStart !== -1) {
                            onIncrement(e);
                        } else {
                            onOffsetSelection(e, 1);
                        }
                        analytics.logEvent("nav_next_verse", {});
                    }
                    break;
                case "ArrowUp":
                    if (!isTextInput) {
                        analytics.setTrigger("up_key");
                        if (maskStart !== -1 && !inExercise()) {
                            decrement(e);
                        } else {
                            onOffsetSelection(e, -1);
                        }
                        analytics.logEvent("nav_prev_verse", {});
                    }
                    break;
                case "ArrowLeft":
                    analytics.setTrigger("left_key");
                    pageDown(e);
                    break;
                case "PageDown":
                    if (!isTextInput) {
                        analytics.setTrigger("page_down_key");
                        pageDown(e);
                    }
                    break;
                case "ArrowRight":
                    analytics.setTrigger("right_key");
                    pageUp(e);
                    break;
                case "PageUp":
                    if (!isTextInput) {
                        analytics.setTrigger("page_up_key");
                        pageUp(e);
                    }
                    break;
                default:
                    return;
            }
            if (!isTextInput) {
                e.preventDefault();
            }
        },
        [
            activePopup,
            app,
            contextPopup,
            decrement,
            dispatch,
            expandedMenu,
            inExercise,
            maskStart,
            modalPopup,
            msgBox,
            onIncrement,
            onOffsetSelection,
            pageDown,
            pageUp,
        ]
    );

    useEffect(() => {
        // page = match.params.page;
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        match.params.page,
        activePopup,
        maskStart,
        selectStart,
        expandedMenu,
        handleKeyDown,
    ]);

    const renderPage = (order, shiftX, scaleX) => {
        if (pagesCount < order + 1) {
            return; //skip second page
        }

        let thisPageIndex =
            pagesCount === 1 ? pageIndex : pageIndex - (pageIndex % 2) + order;

        function selectPage(e) {
            if (pageIndex !== thisPageIndex) {
                // app.gotoPage(thisPage + 1);
                dispatch(gotoPage(history, { index: thisPageIndex }));
                console.log(`Set active page: ${thisPageIndex + 1}`);
            }
        }

        let pageClass = thisPageIndex % 2 === 0 ? "RightPage" : "LeftPage";
        let activeClass = pageIndex === thisPageIndex ? "Active" : "";

        return (
            <div
                onClick={selectPage}
                className={"PageSide"
                    .appendWord(pageClass)
                    .appendWord(activeClass)}
                style={{
                    height: appHeight + "px",
                    width: 100 / pagesCount + "%",
                }}
            >
                <Page
                    index={thisPageIndex}
                    order={order}
                    onPageUp={pageUp}
                    onPageDown={pageDown}
                    onIncrement={onIncrement}
                    onDecrement={decrement}
                    scaleX={scaleX}
                    shiftX={shiftX}
                />
            </div>
        );
    };

    return (
        <DDrop
            maxShift={200}
            onDrop={({ dX, dY }) => {
                if (dX > 50) {
                    analytics.setTrigger("dragging");
                    pageDown(2);
                }
                if (dX < -50) {
                    analytics.setTrigger("dragging");
                    pageUp(2);
                }
            }}
        >
            {({ dX, dY }) => {
                //Shrink the width using the scaling
                const scaleX = (pageWidth - Math.abs(dX)) / pageWidth;
                const shiftX = dX * scaleX;
                // console.log(
                //     `dX:${dX}, shiftX=${shiftX}, pageWidth:${pageWidth}, scaleX:${scaleX}`
                // );
                const firstPageShiftX =
                    pagesCount === 1 ? shiftX : shiftX < 0 ? shiftX : 0;
                const firstPageScaleX =
                    pagesCount === 1 ? scaleX : shiftX < 0 ? scaleX : 1;
                const secondPageShiftX = shiftX > 0 ? shiftX : 0;
                const secondPageScaleX = shiftX > 0 ? scaleX : 1;

                return (
                    <div
                        className={"Pager" + (isNarrow ? " narrow" : "")}
                        onWheel={handleWheel}
                        style={{
                            width: pagerWidth,
                        }}
                    >
                        {renderPage(0, firstPageShiftX, firstPageScaleX)}
                        {renderPage(1, secondPageShiftX, secondPageScaleX)}
                    </div>
                );
            }}
        </DDrop>
    );
}
