import React, { useContext } from "react";
import { AppConsumer, AppContext } from "../../context/App";
import { FormattedMessage as String } from "react-intl";
import QData from "../../services/QData";
import Utils from "../../services/utils";
import { PlayerConsumer, AudioState } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faAngleRight,
    faAngleLeft,
    faAngleDown,
    faAngleUp,
    faBoxOpen,
    faBookOpen,
    faFile
} from "@fortawesome/free-solid-svg-icons";
import { CircleProgress } from "../Widgets";
import { SuraList, PartsList } from "../Modal/QIndex";
import { AddHifz } from "../Modal/Favorites";

const PageHeader = ({
    index: pageIndex,
    order,
    onPageUp,
    onPageDown,
    onIncrement,
    onDecrement
}) => {
    const app = useContext(AppContext);
    const partIndex = QData.pagePart(pageIndex + 1) - 1;
    const selectedAyaInfo = QData.ayaIdInfo(app.selectStart);

    const showPartContextPopup = ({ currentTarget: target }) => {
        app.setContextPopup({
            target,
            content: <PartsList part={partIndex} />
        });
    };

    const showPageContextPopup = ({ target }) => {
        const openGoto = e => {
            app.setPopup("Goto");
        };
        const addToHifz = e => {
            app.setMessageBox({
                title: <String id="update_hifz" />,
                content: <AddHifz page={pageIndex} />
            });
        };
        app.setContextPopup({
            target,
            content: (
                <ul className="SpreadSheet">
                    <li>
                        <button onClick={openGoto}>
                            <String id="goto" />
                        </button>
                    </li>
                    <li>
                        <button onClick={addToHifz}>
                            <String id="update_hifz" />
                        </button>
                    </li>
                </ul>
            )
        });
    };

    const showSuraContextPopup = ({ target }) => {
        app.setContextPopup({
            target,
            content: <SuraList simple={true} />
        });
    };

    const suraIndex = QData.pageSura(pageIndex + 1);
    let justifyContent =
        app.pagesCount === 1
            ? "center"
            : order === 0
            ? "flex-end"
            : "flex-start";

    // let isActive = app.pagesCount === 1 ? true : app.getActiveSide() === order;

    return (
        <div className="PageHeader">
            <div className="PageHeaderContent">
                <CircleProgress
                    target={QData.pages_count}
                    progress={pageIndex + 1}
                    display={partIndex + 1}
                    onClick={showPartContextPopup}
                />
                <button onClick={showSuraContextPopup}>
                    {app.suraName(suraIndex)}
                </button>
                <button onClick={showPageContextPopup} className="IconButton">
                    <Icon icon={faBookOpen} />
                    {pageIndex + 1}
                </button>
                <div
                    className="PageHeaderSection"
                    style={{
                        display: app.pagesCount === 1 || order ? "" : "none"
                    }}
                >
                    <button
                        className="NavButton NavBackward"
                        onClick={onDecrement}
                    >
                        <Icon icon={faAngleUp} />
                    </button>
                    <button
                        onClick={e => {
                            app.gotoAya(app.selectStart);
                        }}
                        className="SelectionButton"
                    >
                        {selectedAyaInfo.sura +
                            1 +
                            ":" +
                            (selectedAyaInfo.aya + 1)}
                    </button>
                    <button
                        onClick={onIncrement}
                        className="NavButton NavForward"
                    >
                        <Icon icon={faAngleDown} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PageHeader;
