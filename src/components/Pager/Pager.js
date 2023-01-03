import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, {
    useCallback,
    useContext,
    useEffect,
    useRef,
    useState,
} from "react";
import { FormattedMessage as String, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useHistory, useLocation, useParams } from "react-router-dom";
import { AppRefs } from "../../RefsProvider";
import {
    ayaIdPage,
    getPageFirstAyaId,
    TOTAL_VERSES,
} from "../../services/QData";
import {
    checkActiveInput,
    copy2Clipboard,
    downloadPageImage,
} from "../../services/utils";
import {
    selectActivePage,
    selectIsNarrow,
    selectPagerWidth,
    selectPagesCount,
    selectPageWidth,
    selectShownPages,
    selectZoom,
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
    selectMenuExpanded,
    selectModalPopup,
    selectPopup,
    showMenu,
    showPopup,
    showToast,
    toggleMenu,
} from "../../store/uiSlice";
import { shownMessageBoxes } from "../MessageBox";
import Page from "../Page/Page";
import PageHeader from "../Page/PageHeader";
import { analytics } from "./../../services/Analytics";
import DDrop from "./../DDrop";

import { faExpand } from "@fortawesome/free-solid-svg-icons";
import "./Pager.scss";
import { AddHifz } from "../AddHifz";
import { AudioState, selectAudioState } from "../../store/playerSlice";

export default function Pager() {
    const zoomLevels = useSelector(selectZoomLevels);
    const zoom = useSelector(selectZoom);
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
    const contextPopup = useContext(AppRefs).get("contextPopup");
    const msgBox = useContext(AppRefs).get("msgBox");
    const selectedText = useSelector(selectSelectedText);
    const maskShift = useSelector(selectMaskShift);
    const params = useParams();
    const shownPages = useSelector(selectShownPages);
    const pageIndex = useSelector(selectActivePage);
    const location = useLocation();
    const [loading, setLoading] = useState(true);
    const popup = useSelector(selectPopup);
    const pagerRef = useRef();
    const intl = useIntl();
    const audio = useContext(AppRefs).get("audio");
    const audioState = useSelector(selectAudioState);

    useEffect(() => {
        if (loading && pageIndex !== -1) {
            const savedActiveAya = parseInt(localStorage.getItem("activeAya"));

            dispatch(
                setSelectedAya(
                    !isNaN(savedActiveAya)
                        ? savedActiveAya
                        : getPageFirstAyaId(pageIndex)
                )
            );
            setLoading(false);
        }
        // pagerRef.current && (pagerRef.current.scrollTop = 0);
    }, [loading, pageIndex, dispatch]);
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
        (e) => {
            // let count = activePopup && !isWide ? 1 : pagesCount;
            let count = pagesCount;
            if (count > 1 && pageIndex % 2 === 0) {
                count = 1; //right page is active
            }
            dispatch(offsetPage(history, -count));
            analytics.logEvent("nav_prev_page");
        },
        [dispatch, history, pageIndex, pagesCount]
    );

    const pageDown = useCallback(
        (e) => {
            // let count = activePopup && !isWide ? 1 : pagesCount;
            let count = pagesCount;
            if (count > 1 && pageIndex % 2 === 1) {
                count = 1; //left page is active
            }
            dispatch(offsetPage(history, count));
            analytics.logEvent("nav_next_page");
        },
        [dispatch, history, pageIndex, pagesCount]
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
        if (zoom > 0) {
            return;
        }

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
            if (shownPages.includes(incrementedMaskPage)) {
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
                    dispatch(gotoPage(history, maskPage, { select: true }));
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

            const vEditorOn = ["Search", "Index"].includes(activePopup);

            const canShowPopup = activePopup === null && isTextInput === false;

            if (modalPopup) {
                return;
            }
            e.stopPropagation();

            switch (e.code) {
                case "Slash":
                    if (canShowPopup) {
                        dispatch(showPopup("Help"));
                    }
                    break;

                case "KeyU":
                    if (canShowPopup) {
                        dispatch(showPopup("Profile"));
                    }
                    break;
                case "KeyC":
                    copy2Clipboard(selectedText);
                    dispatch(showToast({ id: "text_copied" }));
                    //     // app.pushRecentCommand("Copy");
                    break;
                case "KeyR":
                    audio.play();
                    break;
                case "KeyP":
                    if (audioState === AudioState.playing) {
                        audio.pause();
                    } else {
                        audio.resume();
                    }
                    break;
                case "KeyS":
                    audio.stop();
                    break;
                case "KeyZ":
                    dispatch(toggleZoom());
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
                case "KeyF":
                    if (canShowPopup) {
                        dispatch(showPopup("Search"));
                    }
                    break;
                case "KeyA":
                    if (popup) {
                        dispatch(closePopup());
                    }
                    dispatch(toggleMenu());
                    break;
                case "KeyH":
                    msgBox.set({
                        title: <String id="update_hifz" />,
                        content: <AddHifz />,
                    });
                    if (popup && pagesCount === 1) {
                        dispatch(closePopup());
                    }
                    break;
                case "KeyT":
                    if (canShowPopup) {
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
            contextPopup,
            expandedMenu,
            maskStart,
            onArrowKey,
            pageDown,
            pageUp,
            msgBox,
            dispatch,
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
            if (pageIndex !== thisPageIndex) {
                dispatch(gotoPage(history, thisPageIndex));
                // console.log(`Set active page: ${thisPageIndex + 1}`);
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
