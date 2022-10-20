import React, { useCallback, useContext, useEffect } from "react";
import { FormattedMessage as String } from "react-intl";
import { Redirect } from "react-router-dom";
import { AppContext } from "../../context/App";
import QData from "../../services/QData";
import Utils from "../../services/utils";
import { AddHifz } from "../Modal/Favorites";
import Page from "../Page/Page";
import { analytics } from "./../../services/Analytics";
import DDrop from "./../DDrop";
import "./Pager.scss";

export function PageRedirect({ match }) {
    let { aya } = match.params;
    let pageNum = 1;
    const app = useContext(AppContext);

    if (aya !== undefined) {
        setTimeout(() => {
            app.selectAya(parseInt(aya));
        }, 10);
        pageNum = QData.ayaIdPage(aya) + 1;
    }
    return <Redirect to={process.env.PUBLIC_URL + "/page/" + pageNum} />;
}

const REPLACE = true;

function Pager({ match }) {
    const app = useContext(AppContext);
    let pageIndex = 0;

    let { page } = match.params;

    if (page !== undefined) {
        pageIndex = parseInt(page) - 1;
    }

    const pageUp = useCallback(
        (e) => {
            let count = app.popup && !app.isWide ? 1 : app.pagesCount;
            if (count > 1 && pageIndex % 2 === 0) {
                count = 1; //right page is active
            }
            app.offsetPage(-count);
            "object" == typeof e && e.stopPropagation();
            analytics.logEvent("nav_prev_page");
        },
        [app, pageIndex]
    );

    const pageDown = useCallback(
        (e) => {
            let count = app.popup && !app.isWide ? 1 : app.pagesCount;
            if (count > 1 && pageIndex % 2 === 1) {
                count = 1; //left page is active
            }
            app.offsetPage(count);
            "object" == typeof e && e.stopPropagation();
            analytics.logEvent("nav_next_page");
        },
        [app, pageIndex]
    );

    //ComponentDidUpdate
    useEffect(() => {
        //cache next pages
        const pageIndex = match.params.page - 1;
        if (app.pagesCount === 1) {
            Utils.downloadPageImage(pageIndex + 1).catch((e) => {});
        } else {
            Utils.downloadPageImage(pageIndex + 2).catch((e) => {});
            Utils.downloadPageImage(pageIndex + 3).catch((e) => {});
        }
    }, [app.pagesCount, match.params.page]);

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

    const offsetSelection = useCallback(
        ({ shiftKey }, offset) => {
            let selectedAyaId;
            if (shiftKey) {
                selectedAyaId = app.extendSelection(app.selectStart + offset);
            } else {
                selectedAyaId = app.offsetSelection(offset);
            }
            app.gotoAya(selectedAyaId);
        },
        [app]
    );

    const inExercise = useCallback(() => app.popup === "Exercise", [app.popup]);
    const increment = useCallback(
        (e) => {
            // if (inExercise()) {
            //     offsetSelection(e, 1);
            //     return;
            // }
            let { maskStart } = app;
            if (maskStart !== -1) {
                //Mask is active
                if (maskStart >= QData.ayatCount()) {
                    return;
                }
                let currPageNum = parseInt(match.params.page);
                let maskPageNum = QData.ayaIdPage(maskStart) + 1;
                if (maskPageNum !== currPageNum) {
                    app.gotoPage(maskPageNum, REPLACE);
                    return;
                }
                app.offsetMask(1);
                let maskNewPageNum = QData.ayaIdPage(maskStart + 1) + 1;
                if (maskNewPageNum !== currPageNum) {
                    //Mask would move to a new page
                    if (app.pagesCount === 1 || maskNewPageNum % 2 === 1) {
                        return; //Don't change page
                    }
                    app.gotoPage(maskNewPageNum, REPLACE);
                }
            } else {
                offsetSelection(e, 1);
            }
            e.stopPropagation();
        },
        [app, match.params.page, offsetSelection]
    );

    const decrement = useCallback(
        (e) => {
            // if (inExercise()) {
            //     offsetSelection(e, -1);
            //     return;
            // }
            let { maskStart } = app;
            if (maskStart !== -1) {
                //Mask is active
                if (maskStart <= 0) {
                    return;
                }
                let maskNewPageNum = QData.ayaIdPage(maskStart - 1) + 1;
                if (maskNewPageNum !== parseInt(match.params.page)) {
                    //Mask would move to a new page
                    app.gotoPage(maskNewPageNum, REPLACE);
                    if (app.pagesCount === 1 || maskNewPageNum % 2 === 0) {
                        return; //Don't move mask
                    }
                }
                app.offsetMask(-1);
            } else {
                offsetSelection(e, -1);
            }
            e.stopPropagation();
        },
        [app, match.params.page, offsetSelection]
    );

    const handleKeyDown = useCallback(
        (e) => {
            const { tagName, type } = document.activeElement;
            const isInput = ["INPUT", "BUTTON", "TEXTAREA"].includes(tagName);
            const isTextInput =
                isInput && ["text", "number", "textarea"].includes(type);

            const vEditorOn = ["Search", "Index"].includes(app.popup);

            const canShowPopup = app.popup === null && isTextInput === false;

            if (app.modalPopup) {
                return;
            }

            switch (e.code) {
                case "Insert":
                    Utils.copy2Clipboard(app.getSelectedText());
                    app.pushRecentCommand("Copy");
                    break;
                case "Escape":
                    if (app.getMessageBox()) {
                        app.pushMessageBox(null);
                    } else if (app.popup !== null) {
                        app.closePopup();
                    } else if (app.expandedMenu) {
                        app.setExpandedMenu(false);
                    } else if (app.maskStart !== -1) {
                        app.hideMask();
                    }
                    break;
                case "KeyI":
                    if (canShowPopup) {
                        app.setPopup("Indices");
                    }
                    break;
                case "KeyF":
                    if (canShowPopup) {
                        app.setMessageBox({
                            title: <String id="update_hifz" />,
                            content: <AddHifz />,
                        });
                    }
                    break;
                case "KeyG":
                    if (canShowPopup) {
                        app.setPopup("Goto");
                    }
                    break;
                case "KeyX":
                    if (canShowPopup) {
                        app.setPopup("Exercise");
                    }
                    break;
                case "KeyB":
                    if (canShowPopup) {
                        app.setPopup("Bookmarks");
                    }
                    break;
                case "KeyO":
                    if (canShowPopup) {
                        app.setPopup("Settings");
                    }
                    break;
                case "KeyS":
                    if (canShowPopup) {
                        app.setPopup("Search");
                    }
                    break;
                case "KeyT":
                    if (canShowPopup) {
                        app.setPopup("Tafseer");
                    }
                    break;
                case "KeyM":
                    if (!vEditorOn) {
                        app.setMaskStart();
                    }
                    break;
                case "ArrowDown":
                    if (!isTextInput) {
                        analytics.setTrigger("down_key");
                        if (app.maskStart !== -1) {
                            increment(e);
                        } else {
                            offsetSelection(e, 1);
                        }
                        analytics.logEvent("nav_next_verse", {});
                    }
                    break;
                case "ArrowUp":
                    if (!isTextInput) {
                        analytics.setTrigger("up_key");
                        if (app.maskStart !== -1 && !inExercise()) {
                            decrement(e);
                        } else {
                            offsetSelection(e, -1);
                        }
                        analytics.logEvent("nav_prev_verse", {});
                    }
                    break;
                case "ArrowLeft":
                    analytics.setTrigger("left_key");
                    // app.offsetPage(1);
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
                    //app.offsetPage(-1);
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
            app,
            decrement,
            inExercise,
            increment,
            offsetSelection,
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
        app.popup,
        app.maskStart,
        app.modalPopup,
        app.selectStart,
        app.expandedMenu,
        handleKeyDown,
    ]);

    const pagesCount = app.pagesCount;

    const renderPage = (order, shiftX, scaleX) => {
        if (pagesCount < order + 1) {
            return; //skip second page
        }

        let thisPage =
            pagesCount === 1 ? pageIndex : pageIndex - (pageIndex % 2) + order;

        function selectPage(e) {
            if (pageIndex !== thisPage) {
                app.gotoPage(thisPage + 1);
                console.log(`Set active page: ${thisPage + 1}`);
            }
        }

        let pageClass = thisPage % 2 === 0 ? "RightPage" : "LeftPage";
        let activeClass = pageIndex === thisPage ? "Active" : "";

        return (
            <div
                onClick={selectPage}
                className={"PageSide"
                    .appendWord(pageClass)
                    .appendWord(activeClass)}
                style={{
                    height: app.appHeight + "px",
                    width: 100 / pagesCount + "%",
                }}
            >
                <Page
                    index={thisPage}
                    order={order}
                    onPageUp={pageUp}
                    onPageDown={pageDown}
                    onIncrement={increment}
                    onDecrement={decrement}
                    scaleX={scaleX}
                    shiftX={shiftX}
                />
            </div>
        );
    };

    const pageWidth = app.pageWidth();

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
                        className={"Pager" + (app.isNarrow ? " narrow" : "")}
                        onWheel={handleWheel}
                        style={{
                            width: app.pagerWidth(),
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

export default Pager;
