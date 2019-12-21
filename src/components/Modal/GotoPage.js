import React, { useState, useEffect } from "react";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer } from "./../../context/App";
import { PlayerConsumer, AudioState } from "../../context/Player";
import { icon } from "@fortawesome/fontawesome-svg-core";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import { faBookOpen } from "@fortawesome/free-solid-svg-icons";

const GotoPage = ({ open, app, player }) => {
    const [isOpen, setIsOpen] = useState(true);
    const [pageNumber, updatePageNumber] = useState(
        Utils.pageFromPath(app.location.pathname)
    );
    const [partNumber, updatePartNumber] = useState(
        Utils.partFromPath(app.location.pathname)
    );
    let gotoPageForm;

    useEffect(() => {
        setIsOpen(open); //update internal state to match
    }, [open]);

    useEffect(() => {
        gotoPageForm.PageNumber.focus();
        gotoPageForm.PageNumber.select();
        return () => {
            // document.body.focus();
        };
    }, []);

    const gotoPage = e => {
        const { target: form } = e;
        const pageNum = form["PageNumber"].value;
        app.gotoPage(pageNum);
        let ayaId = QData.pageAyaId(pageNum - 1);
        app.selectAya(ayaId);
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
        if (player.audioState !== AudioState.stopped) {
            player.stop();
        }
        e.preventDefault();
    };

    const gotoPart = e => {
        const { target: form } = e;
        let part = parseInt(form["PartNumber"].value);
        // const partInfo = QData.parts[part - 1];
        app.gotoPart(part - 1);
        if (!app.isCompact && app.pagesCount === 1) {
            app.closePopup();
        }
        if (player.audioState !== AudioState.stopped) {
            player.stop();
        }
        e.preventDefault();
    };

    const updatePage = e => {
        updatePageNumber(e.target.value);
    };

    const updatePart = e => {
        updatePartNumber(e.target.value);
    };

    return (
        <>
            <div className="Title">
                <String id="goto" />
            </div>
            <div className="FieldRow">
                <form
                    onSubmit={gotoPage}
                    ref={form => {
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
                            min="1"
                            max="604"
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
                <form onSubmit={gotoPart}>
                    <div className="FieldLabel">
                        <label htmlFor="PartNumber">
                            <String id="part" />
                        </label>
                    </div>
                    <div className="FieldValue">
                        <input
                            type="Number"
                            name="PartNumber"
                            min="1"
                            max="30"
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
        </>
    );
};

export default AppConsumer(PlayerConsumer(GotoPage));
