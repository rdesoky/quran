import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage as String, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { useAudio, useContextPopup, useMessageBox } from "../../RefsProvider";
import {
    ayaIdPage,
    getPageFirstAyaId,
    TOTAL_VERSES,
} from "../../services/QData";
import {
    checkActiveInput,
    copy2Clipboard,
    downloadPageImage,
    keyValues,
} from "../../services/utils";
import {
    selectActivePage,
    selectIsNarrow,
    selectPagerWidth,
    selectPagesCount,
    selectPageWidth,
    selectShownPages,
    selectZoomLevels,
    setActivePageIndex,
    toggleZoom,
} from "../../store/layoutSlice";
import {
    extendSelection,
    gotoAya,
    gotoPage,
    hideMask,
    offsetPage,
    offsetSelection,
    selectMaskShift,
    selectMaskStart,
    selectSelectedText,
    selectStartSelection,
    setSelectedAya,
    setSelectStart,
    startMask,
} from "../../store/navSlice";
import {
    closePopup,
    closePopupIfBlocking,
    selectMenuExpanded,
    selectModalPopup,
    selectPopup,
    showMenu,
    showPopup,
    showToast,
    toggleMenu,
} from "../../store/uiSlice";
import Page from "../Page/Page";
import PageHeader from "../Page/PageHeader";
import { analytics } from "./../../services/Analytics";
import DDrop from "./../DDrop";

import { faExpand } from "@fortawesome/free-solid-svg-icons";
import { AudioState, selectAudioState } from "../../store/playerSlice";
import { AddHifz } from "../AddHifz";
import PlayPrompt from "../PlayPrompt";
import "./Pager.scss";

export default function Pager() {
    const zoomLevels = useSelector(selectZoomLevels);
    const pagesCount = useSelector(selectPagesCount);
    const pageWidth = useSelector(selectPageWidth);
    const pagerWidth = useSelector(selectPagerWidth);
    const dispatch = useDispatch();
    const isNarrow = useSelector(selectIsNarrow);
    const expandedMenu = useSelector(selectMenuExpanded);
    const activePopup = useSelector(selectPopup);
    const modalPopup = useSelector(selectModalPopup);
    const history = useHistory();
    const selectStart = useSelector(selectStartSelection);
    const maskStart = useSelector(selectMaskStart);
    const contextPopup = useContextPopup();
    const msgBox = useMessageBox();
    const selectedText = useSelector(selectSelectedText);
    const maskShift = useSelector(selectMaskShift);
    const params = useParams();
    const shownPages = useSelector(selectShownPages);
    const activePage = useSelector(selectActivePage);
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const popup = useSelector(selectPopup);
    const pagerRef = useRef();
    const intl = useIntl();
    const audio = useAudio();
    const audioState = useSelector(selectAudioState);

    useEffect(() => {
        if (loading && activePage !== -1) {
            const savedActiveAya = parseInt(localStorage.getItem("activeAya"));

            dispatch(
                setSelectedAya(
                    !isNaN(savedActiveAya)
                        ? savedActiveAya
                        : getPageFirstAyaId(activePage)
                )
            );
            setLoading(false);
        }
    }, [loading, activePage, dispatch]);

    useEffect(() => {
        if (!loading) {
            localStorage.setItem("activeAya", selectStart);
        }
    }, [selectStart, loading]);

    useEffect(() => {
        if (params?.page >= 1) {
            dispatch(setActivePageIndex(params?.page - 1));
            localStorage.setItem("activePage", params.page);
        }
    }, [dispatch, params?.page]);

    useEffect(() => {
        analytics.setCurrentScreen(location.pathname);
    }, [location]);

    const pageUp = useCallback(
        (e, options = { bottom: false }) => {
            let count = pagesCount;
            if (count > 1 && activePage % 2 === 0) {
                count = 1; //right page is active
            }
            dispatch(offsetPage(history, -count));
            analytics.logEvent("nav_prev_page");
            const viewRef = pagerRef.current;
            viewRef?.scrollTo?.({
                top: options?.bottom
                    ? viewRef?.scrollHeight - viewRef?.clientHeight
                    : 0,
            });
        },
        [dispatch, history, activePage, pagesCount]
    );

    const pageDown = useCallback(
        (e, scroll = true) => {
            // let count = activePopup && !isWide ? 1 : pagesCount;
            let count = pagesCount;
            if (count > 1 && activePage % 2 === 1) {
                count = 1; //left page is active
            }
            dispatch(offsetPage(history, count));
            analytics.logEvent("nav_next_page");
            pagerRef.current?.scrollTo?.({ top: 0 });
        },
        [dispatch, history, activePage, pagesCount]
    );

    //ComponentDidUpdate
    useEffect(() => {
        //cache next pages
        if (pagesCount === 1) {
            downloadPageImage(activePage + 1).catch((e) => {});
        } else {
            downloadPageImage(activePage + 2).catch((e) => {});
            downloadPageImage(activePage + 3).catch((e) => {});
        }
    }, [pagesCount, activePage]);

    const handleWheel = (e) => {
        let viewRef = pagerRef.current;
        const LINE_HEIGHT = 12;
        //Check if page next or prev to active page is in the view

        if (e.deltaY > 0) {
            if (
                viewRef?.scrollTop + LINE_HEIGHT >=
                viewRef?.scrollHeight - viewRef?.clientHeight
            ) {
                analytics.setTrigger("mouse_wheel");
                //scroll down ( forward )
                if (shownPages.includes(activePage + 1)) {
                    dispatch(setActivePageIndex(activePage + 1));
                    setTimeout(() =>
                        viewRef.scrollTo?.({ top: 0, behavior: "smooth" })
                    );
                    console.log(`~~scrollForward`);
                    return;
                }

                pageDown(e);
            }
        } else if (pagerRef.current?.scrollTop === 0) {
            //scroll up ( backward )
            if (viewRef?.scrollTop === 0) {
                analytics.setTrigger("mouse_wheel");
                if (shownPages.includes(activePage - 1)) {
                    dispatch(setActivePageIndex(activePage - 1));
                    console.log(`~~scrollBackward`);
                    setTimeout(() =>
                        viewRef.scrollTo?.({
                            top: viewRef.scrollHeight - viewRef.clientHeight,
                            behavior: "smooth",
                        })
                    );
                    return;
                }
                pageUp(e, { bottom: true });
            }
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
            dispatch(gotoPage(history, ayaIdPage(selectedAyaId)));
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
            if (activePage === incrementedMaskPage) {
                dispatch(gotoAya(history, dispatch(offsetSelection(1))));
                return;
            } else {
                const pageFirstAya = getPageFirstAyaId(incrementedMaskPage);
                if (maskStart === pageFirstAya) {
                    dispatch(
                        gotoPage(history, incrementedMaskPage, {
                            select: true,
                        })
                    );
                    return; //mask head page is not visible
                }
            }
            dispatch(setSelectStart(dispatch(offsetSelection(1))));
        },
        [activePage, dispatch, history, maskStart]
    );

    const decrementMask = useCallback(
        (e) => {
            if (maskStart > 0) {
                const maskPage = ayaIdPage(maskStart - 1);
                if (shownPages.includes(maskPage)) {
                    dispatch(gotoAya(history, dispatch(offsetSelection(-1))));
                    return;
                } else {
                    dispatch(gotoPage(history, maskPage, { select: true }));
                    const viewRef = pagerRef.current;
                    viewRef?.scrollTo?.({
                        top: viewRef?.scrollHeight - viewRef?.clientHeight,
                        behavior: "smooth",
                    });
                    return; //mask head page is not visible
                }
            }
            dispatch(setSelectStart(dispatch(offsetSelection(-1)))); //soft selection
        },
        [dispatch, history, maskStart, shownPages]
    );
    const onArrowKey = useCallback(
        (e, direction) => {
            const { isTextInput } = checkActiveInput();

            if (!isTextInput) {
                if (direction === "down") {
                    analytics.setTrigger("down_key");
                    if (!maskShift && maskStart !== -1) {
                        incrementMask(e);
                    } else {
                        onOffsetSelection(e, 1);
                    }
                    analytics.logEvent("nav_next_verse", {});
                } else {
                    analytics.setTrigger("up_key");
                    if (maskStart !== -1 && !maskShift) {
                        decrementMask(e);
                    } else {
                        onOffsetSelection(e, -1);
                    }
                    analytics.logEvent("nav_prev_verse", {});
                }
            }
        },
        [decrementMask, incrementMask, maskShift, maskStart, onOffsetSelection]
    );

    const handleKeyDown = useCallback(
        (e) => {
            const { isTextInput } = checkActiveInput();

            const vEditorOn = ["Search", "Indices", "Exercise"].includes(
                activePopup
            );

            const canShowPopup = activePopup === null && isTextInput === false;

            if (modalPopup || msgBox.getMessages().length > 0) {
                return;
            }
            e.stopPropagation();

            switch (e.code) {
                case "Slash":
                    if (canShowPopup && !vEditorOn) {
                        dispatch(showPopup("Help"));
                    }
                    break;

                case "KeyU":
                    if (canShowPopup && !vEditorOn) {
                        dispatch(showPopup("Profile"));
                    }
                    break;
                case "KeyC":
                    if (!vEditorOn) {
                        copy2Clipboard(selectedText);
                        dispatch(showToast({ id: "text_copied" }));
                        //     // app.pushRecentCommand("Copy");
                    }
                    break;
                case "KeyS":
                case "KeyR":
                    if (!vEditorOn) {
                        msgBox.set({
                            title: <String id="play" values={keyValues("r")} />,
                            content: <PlayPrompt trigger={"keyboard"} />,
                        });
                    }
                    break;
                case "KeyP":
                    if (!vEditorOn) {
                        if (audioState === AudioState.playing) {
                            audio.pause();
                        } else {
                            audio.resume();
                        }
                    }
                    break;
                case "KeyZ":
                    if (!vEditorOn) {
                        dispatch(toggleZoom());
                    }
                    break;
                case "Escape":
                    if (contextPopup.info) {
                        contextPopup.close();
                    } else if (msgBox.getMessages().length > 0) {
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
                    if (!vEditorOn && canShowPopup) {
                        dispatch(showPopup("Indices"));
                    }
                    break;
                case "KeyG":
                    if (!vEditorOn && canShowPopup) {
                        dispatch(showPopup("Goto"));
                    }
                    break;
                case "KeyX":
                    if (!vEditorOn && canShowPopup) {
                        dispatch(showPopup("Exercise"));
                    }
                    break;
                case "KeyB":
                    if (!vEditorOn && canShowPopup) {
                        dispatch(showPopup("Bookmarks"));
                    }
                    break;
                case "KeyO":
                    if (!vEditorOn && canShowPopup) {
                        dispatch(showPopup("Settings"));
                    }
                    break;
                case "KeyF":
                    if (!vEditorOn && canShowPopup) {
                        dispatch(showPopup("Search"));
                    }
                    break;
                case "KeyA":
                    if (!popup && !vEditorOn) {
                        dispatch(toggleMenu());
                    }
                    break;
                case "KeyH":
                    if (!vEditorOn) {
                        msgBox.set({
                            title: <String id="update_hifz" />,
                            content: <AddHifz />,
                        });
                        dispatch(closePopupIfBlocking());
                    }
                    break;
                case "KeyT":
                    if (!vEditorOn && canShowPopup) {
                        dispatch(showPopup("Tafseer"));
                    }
                    break;
                case "KeyM":
                    if (!vEditorOn) {
                        dispatch(startMask(history));
                        // app.setMaskStart();
                    }
                    break;
                case "ArrowDown":
                    onArrowKey(e, "down");
                    break;
                case "ArrowUp":
                    onArrowKey(e, "up");
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
            modalPopup,
            selectedText,
            dispatch,
            audio,
            audioState,
            contextPopup,
            expandedMenu,
            maskStart,
            popup,
            msgBox,
            onArrowKey,
            pageDown,
            pageUp,
            history,
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
            if (activePage !== thisPageIndex) {
                dispatch(gotoPage(history, thisPageIndex));
                // console.log(`Set active page: ${thisPageIndex + 1}`);
            }
        }

        let pageClass = thisPageIndex % 2 === 0 ? "RightPage" : "LeftPage";
        let activeClass = activePage === thisPageIndex ? "Active" : "";

        return (
            <div
                onClick={selectPage}
                className={"PageSide"
                    .appendWord(pageClass)
                    .appendWord(activeClass)}
                style={{
                    // height: appHeight + "px",
                    width: 100 / pagesCount + "%",
                }}
                key={thisPageIndex}
            >
                <Page
                    index={thisPageIndex}
                    order={order}
                    onPageUp={pageUp}
                    onPageDown={pageDown}
                    onArrowKey={onArrowKey}
                    scaleX={scaleX}
                    shiftX={shiftX}
                    incrementMask={incrementMask}
                />
            </div>
        );
    };

    return (
        <>
            <DDrop
                maxShift={200}
                dropShift={50}
                onDrop={({ dX, dY }) => {
                    if (dX > 50) {
                        analytics.setTrigger("dragging");
                        pageDown();
                    }
                    if (dX < -50) {
                        analytics.setTrigger("dragging");
                        pageUp();
                    }
                }}
            >
                {({ dX, dY }) => {
                    //Shrink the width using the scaling
                    // const angle = (90 * (pageWidth - Math.abs(dX))) / pageWidth;
                    // const scaleX = 1 - accel; //(pageWidth - Math.abs(dX)) / pageWidth; // * accel;
                    // const shiftX = dX * accel;
                    const scaleX = (pageWidth - Math.abs(dX)) / pageWidth; // * accel;
                    // const angle = 90 * scaleX;
                    // const accel = Math.cos(angle2Radians(angle));
                    const shiftX = dX * scaleX; //accel;
                    // (accel * (pageWidth - Math.abs(dX))) / pageWidth;
                    // console.log(
                    //     `dX:${dX}, Sh:${shiftX} Sc:${scaleX} Wd:${pageWidth}`
                    // );
                    const firstPageShiftX =
                        pagesCount === 1 ? shiftX : shiftX < 0 ? shiftX : 0;
                    const firstPageScaleX =
                        pagesCount === 1 ? scaleX : shiftX < 0 ? scaleX : 1;
                    const secondPageShiftX = shiftX > 0 ? shiftX : 0;
                    const secondPageScaleX = shiftX > 0 ? scaleX : 1;

                    return (
                        <div
                            ref={pagerRef}
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
            <div className="PagerFooter" style={{ width: pagerWidth }}>
                <PageHeader
                    index={shownPages[0]}
                    order={0}
                    onArrowKey={onArrowKey}
                    onPageUp={pageUp}
                    onPageDown={pageDown}
                />
                {shownPages.length > 1 && (
                    <PageHeader
                        index={shownPages[1]}
                        order={1}
                        onArrowKey={onArrowKey}
                        onPageUp={pageUp}
                        onPageDown={pageDown}
                    />
                )}
            </div>
            {!popup && zoomLevels > 0 && (
                <div style={{ position: "fixed", left: 50, bottom: 0 }}>
                    <button
                        className="CommandButton"
                        style={{ height: 50 }}
                        onClick={(e) => dispatch(toggleZoom())}
                        title={intl.formatMessage({ id: "zoom" })}
                    >
                        <Icon icon={faExpand} />
                    </button>
                </div>
            )}
        </>
    );
}
