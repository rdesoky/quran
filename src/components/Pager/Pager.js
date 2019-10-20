import React, { useEffect } from "react";
import { Redirect } from "react-router-dom";
import Page from "../Page/Page";
import { AppConsumer } from "../../context/App";
import { PlayerConsumer } from "../../context/Player";
import QData from "../../services/QData";
import "./Pager.scss";
import Utils from "../../services/utils";
import Header from "./Header";

function fnPageRedirect({ match, app }) {
    let { aya } = match.params;
    let pageNum = 1;

    if (aya !== undefined) {
        setTimeout(() => {
            app.selectAya(parseInt(aya));
        }, 10);
        pageNum = QData.ayaIdPage(aya) + 1;
    }
    return <Redirect to={process.env.PUBLIC_URL + "/page/" + pageNum} />;
}

function Pager({ match, app, player }) {
    let pageIndex = 0;
    const REPLACE = true;

    let { page } = match.params;

    const pageUp = e => {
        app.offsetPage(-1);
        e.stopPropagation();
    };
    const pageDown = e => {
        app.offsetPage(1);
        e.stopPropagation();
    };

    //ComponentDidMount
    useEffect(() => {}, []);

    //ComponentDidUpdate
    useEffect(() => {
        page = match.params.page;
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, [match.params.page, app.popup, app.maskStart]);

    const handleWheel = e => {
        if (e.deltaY > 0) {
            //scroll down
            pageDown(e);
        } else {
            pageUp(e);
        }
    };

    const offsetSelection = ({ shiftKey }, offset) => {
        let selectedAyaId;
        if (shiftKey) {
            selectedAyaId = app.extendSelection(app.selectStart + offset);
        } else {
            selectedAyaId = app.offsetSelection(offset);
        }
        app.gotoAya(selectedAyaId);
    };

    const handleKeyDown = e => {
        const { tagName, type } = document.activeElement;
        const isInput = ["INPUT", "BUTTON", "TEXTAREA"].includes(tagName);
        const isTextInput =
            isInput && ["text", "number", "textarea"].includes(type);

        if (["Search", "Exercise"].includes(app.popup)) {
            return;
        }

        switch (e.code) {
            // case "Enter":
            // 	if (!isTextInput && app.popup === null) {
            // 		app.selectAya();
            // 		app.setPopup("Tafseer");
            // 	}
            // 	break;
            // case "KeyP":
            //   player.show(player.visible === false);
            //   break;
            case "Insert":
                Utils.copy2Clipboard(app.getSelectedText());
                app.pushRecentCommand("Copy");
                break;
            case "Escape":
                if (app.popup !== null) {
                    app.closePopup();
                } else if (app.maskStart !== -1) {
                    app.hideMask();
                }
                break;
            case "KeyI":
                if (!isTextInput) {
                    app.setPopup("Index");
                }
                break;
            case "KeyG":
                if (!isTextInput) {
                    app.setPopup("Goto");
                }
                break;
            case "KeyC":
                if (!isTextInput) {
                    app.setPopup("Commands");
                }
                break;
            case "KeyF":
                if (!isTextInput) {
                    app.setPopup("Search");
                }
                break;
            case "KeyT":
                if (!isTextInput) {
                    app.selectAya();
                    app.setPopup("Tafseer");
                }
                break;
            case "KeyM":
                if (!isTextInput) {
                    app.setMaskStart();
                }
                break;
            case "ArrowDown":
                if (!isTextInput) {
                    if (app.maskStart !== -1) {
                        increment(e);
                    } else {
                        offsetSelection(e, 1);
                    }
                }
                break;
            case "ArrowUp":
                if (!isTextInput) {
                    if (app.maskStart !== -1) {
                        decrement(e);
                    } else {
                        offsetSelection(e, -1);
                    }
                }
                break;
            case "PageDown":
            case "ArrowLeft":
                if (!isTextInput) {
                    pageDown(e);
                }
                break;
            case "PageUp":
            case "ArrowRight":
                if (!isTextInput) {
                    pageUp(e);
                }
                break;
            default:
                return;
        }
        if (!isTextInput) {
            e.preventDefault();
        }
    };

    if (page !== undefined) {
        pageIndex = parseInt(page) - 1;
    }

    const decrement = e => {
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
    };

    const increment = e => {
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
    };

    const renderPage = order => {
        if (app.pagesCount < order + 1) {
            return;
        }

        let thisPage =
            app.pagesCount === 1
                ? pageIndex
                : pageIndex - (pageIndex % 2) + order;

        function selectPage() {
            if (pageIndex !== thisPage) {
                app.gotoPage(thisPage + 1);
            }
        }

        let pageClass = thisPage % 2 === 0 ? " RightPage" : " LeftPage";
        let activeClass = pageIndex === thisPage ? " Active" : "";

        // let textAlign =
        // 	app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

        return (
            <div
                onClick={selectPage}
                className={"PageSide" + pageClass + activeClass}
                style={{
                    height: app.appHeight + "px",
                    width: 100 / app.pagesCount + "%"
                }}
            >
                <Page
                    index={thisPage}
                    order={order}
                    onPageUp={pageUp}
                    onPageDown={pageDown}
                    onIncrement={increment}
                    onDecrement={decrement}
                />
            </div>
        );
    };

    return (
        <div
            className={"Pager" + (app.isNarrow ? " narrow" : "")}
            onWheel={handleWheel}
            style={{ width: app.pagerWidth() }}
        >
            {/* <Header
                onPageUp={pageUp}
                onPageDown={pageDown}
                onIncrement={increment}
                onDecrement={decrement}
            /> */}
            {renderPage(0)}
            {renderPage(1)}
        </div>
    );
}

export default AppConsumer(Pager);
export let PageRedirect = AppConsumer(PlayerConsumer(fnPageRedirect));
