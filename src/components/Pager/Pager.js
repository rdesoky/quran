import React, { useCallback, useContext, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Redirect, useHistory, useLocation, useParams } from "react-router-dom";
import { AppRefs } from "../../RefsProvider";
import {
    ayaIdPage,
    getPageFirstAyaId,
    TOTAL_VERSES,
} from "../../services/QData";
import { copy2Clipboard, downloadPageImage } from "../../services/utils";
import {
    selectActivePage,
    selectAppHeight,
    selectIsNarrow,
    selectIsWide,
    selectModalPopup,
    selectPagerWidth,
    selectPagesCount,
    selectPageWidth,
    selectShownPages,
    setActivePageIndex,
} from "../../store/layoutSlice";
import {
    extendSelection,
    gotoAya,
    gotoPage,
    hideMask,
    offsetPage,
    offsetSelection,
    selectAya,
    selectMaskShift,
    selectMaskStart,
    selectSelectedText,
    selectStartSelection,
    setSelectStart,
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

export default function Pager() {
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
    const selectedText = useSelector(selectSelectedText);
    const maskShift = useSelector(selectMaskShift);
    const params = useParams();
    const shownPages = useSelector(selectShownPages);
    const pageIndex = useSelector(selectActivePage);
    const location = useLocation();

    useEffect(() => {
        if (params?.page >= 1) {
            dispatch(setActivePageIndex(params?.page - 1));
        }
    }, [dispatch, params?.page]);

    useEffect(() => {
        analytics.setCurrentScreen(location.pathname);
    }, [location]);

    const pageUp = useCallback(
        (e) => {
            let count = activePopup && !isWide ? 1 : pagesCount;
            if (count > 1 && pageIndex % 2 === 0) {
                count = 1; //right page is active
            }
            dispatch(offsetPage(history, -count));
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
            analytics.logEvent("nav_next_page");
        },
        [activePopup, dispatch, history, isWide, pageIndex, pagesCount]
    );

    //ComponentDidUpdate
    useEffect(() => {
        //cache next pages
        if (pagesCount === 1) {
            downloadPageImage(pageIndex + 1).catch((e) => {});
        } else {
            downloadPageImage(pageIndex + 2).catch((e) => {});
            downloadPageImage(pageIndex + 3).catch((e) => {});
        }
    }, [pagesCount, pageIndex]);

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
                selectedAyaId = dispatch(extendSelection(selectStart + offset));
            } else {
                selectedAyaId = dispatch(offsetSelection(offset));
            }
            // dispatch(gotoAya(history, selectedAyaId));
            dispatch(setSelectStart(selectedAyaId));
            // const page = ayaIdPage(selectedAyaId);
            // if (maskStart !== -1 && getPageFirstAyaId(page) === selectedAyaId) {
            //     return;
            // }
            dispatch(gotoPage(history, { index: ayaIdPage(selectedAyaId) }));
        },
        [dispatch, history, selectStart]
    );

    const incrementMask = useCallback(
        (e) => {
            const incrementedMask = maskStart + 1;
            if (incrementedMask >= TOTAL_VERSES) {
                dispatch(hideMask());
                return;
            }
            const incrementedMaskPage = ayaIdPage(incrementedMask);
            if (shownPages.includes(incrementedMaskPage)) {
                dispatch(gotoAya(history, dispatch(offsetSelection(1))));
                return;
            } else {
                const pageFirstAya = getPageFirstAyaId(incrementedMaskPage);
                if (maskStart === pageFirstAya) {
                    dispatch(
                        gotoPage(history, {
                            index: incrementedMaskPage,
                            select: true,
                        })
                    );
                    return; //mask head page is not visible
                }
            }
            dispatch(setSelectStart(dispatch(offsetSelection(1))));
        },
        [dispatch, history, maskStart, shownPages]
    );

    const decrementMask = useCallback(
        (e) => {
            if (maskStart > 0) {
                const maskPage = ayaIdPage(maskStart - 1);
                if (shownPages.includes(maskPage)) {
                    dispatch(gotoAya(history, dispatch(offsetSelection(-1))));
                    return;
                } else {
                    dispatch(
                        gotoPage(history, { index: maskPage, select: true })
                    );
                    return; //mask head page is not visible
                }
            }
            dispatch(setSelectStart(dispatch(offsetSelection(-1)))); //soft selection
        },
        [dispatch, history, maskStart, shownPages]
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
            e.stopPropagation();

            switch (e.code) {
                case "Insert":
                    copy2Clipboard(selectedText);
                    // app.pushRecentCommand("Copy");
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
                        if (!maskShift && maskStart !== -1) {
                            incrementMask(e);
                        } else {
                            onOffsetSelection(e, 1);
                        }
                        analytics.logEvent("nav_next_verse", {});
                    }
                    break;
                case "ArrowUp":
                    if (!isTextInput) {
                        analytics.setTrigger("up_key");
                        if (maskStart !== -1 && !maskShift) {
                            decrementMask(e);
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
            contextPopup,
            decrementMask,
            dispatch,
            expandedMenu,
            maskShift,
            maskStart,
            modalPopup,
            msgBox,
            incrementMask,
            onOffsetSelection,
            pageDown,
            pageUp,
            selectedText,
        ]
    );

    useEffect(() => {
        // page = match.params.page;
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [
        params.page,
        activePopup,
        maskStart,
        selectStart,
        expandedMenu,
        handleKeyDown,
    ]);

    const renderPage = (order, shiftX, scaleX) => {
        if (order + 1 > shownPages.length) {
            return; //not enough pages
        }

        // let thisPageIndex =
        //     pagesCount === 1 ? pageIndex : pageIndex - (pageIndex % 2) + order;
        let thisPageIndex = shownPages?.[order];

        function selectPage(e) {
            if (pageIndex !== thisPageIndex) {
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
                    onIncrement={incrementMask}
                    onDecrement={decrementMask}
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
