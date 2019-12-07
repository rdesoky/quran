import React, { useContext } from "react";
import { AppConsumer, AppContext } from "../../context/App";
import { FormattedMessage as String } from "react-intl";
import QData from "../../services/QData";
import Utils from "../../services/utils";
import { PlayerConsumer, AudioState } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faAngleDown,
    faAngleUp,
    faBookOpen,
    faBackward,
    faForward
} from "@fortawesome/free-solid-svg-icons";
import {
    CircleProgress,
    VerseContextButtons,
    PageContextButtons,
    SuraNavigator
} from "../Widgets";
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
    const suraIndex = QData.pageSura(pageIndex + 1);

    const showPartContextPopup = ({ currentTarget: target }) => {
        app.setContextPopup({
            target,
            content: <PartsList part={partIndex} />
        });
    };

    const showPageContextPopup = ({ target }) => {
        // const openGoto = e => {
        //     app.setPopup("Goto");
        // };
        // const addToHifz = e => {
        //     app.setMessageBox({
        //         title: <String id="update_hifz" />,
        //         content: <AddHifz />
        //     });
        // };
        app.setContextPopup({
            target,
            // header: <div>Page Header</div>,
            content: <PageContextButtons page={pageIndex} />
        });
    };

    const showVerseContextPopup = ({ target }) => {
        app.setContextPopup({
            target,
            content: <VerseContextButtons verse={app.selectStart} />
        });
    };

    // let justifyContent =
    //     app.pagesCount === 1
    //         ? "center"
    //         : order === 0
    //         ? "flex-end"
    //         : "flex-start";

    // let isActive = app.pagesCount === 1 ? true : app.getActiveSide() === order;

    const showSuraContextPopup = ({ target }) => {
        app.setContextPopup({
            target,
            header: <SuraNavigator />,
            content: <SuraList simple={true} />
        });
    };

    return (
        <div className="PageHeader">
            <div className="PageHeaderContent">
                <CircleProgress
                    target={QData.pages_count}
                    progress={pageIndex + 1}
                    display={partIndex + 1}
                    onClick={showPartContextPopup}
                    strokeWidth={3}
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
                            showVerseContextPopup(e);
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
