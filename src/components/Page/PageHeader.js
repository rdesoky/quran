import React from "react";
import { AppConsumer } from "../../context/App";
import { FormattedMessage as String } from "react-intl";
import QData from "../../services/QData";
import Utils from "../../services/utils";
import { PlayerConsumer, AudioState } from "../../context/Player";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import {
    faAngleRight,
    faAngleLeft,
    faAngleDown,
    faAngleUp
} from "@fortawesome/free-solid-svg-icons";

const PageHeader = ({
    index: pageIndex,
    app,
    order,
    onPageUp,
    onPageDown,
    onIncrement,
    onDecrement
}) => {
    // const showIndexPopup = e => {
    // 	app.setPopup("QIndex");
    // };
    // const showFindPopup = e => {
    // 	app.setPopup("Find");
    // };

    const onSelectSura = ({ target }) => {
        app.hideMask();
        const suraIndex = parseInt(target.value);
        app.gotoSura(suraIndex);
        // if (player.audioState !== AudioState.stopped) {
        //     player.stop();
        // }
        Utils.selectTopCommand();
    };

    const onSelectPart = ({ target }) => {
        app.hideMask();
        const partIndex = target.value;
        app.gotoPart(partIndex);
        // if (player.audioState !== AudioState.stopped) {
        //     player.stop();
        // }
        Utils.selectTopCommand();
    };

    const showGotoPopup = e => {
        app.setPopup("Goto");
    };

    const suraIndex = QData.pageSura(pageIndex + 1);
    let textAlign =
        app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    let partIndex = QData.pagePart(pageIndex + 1) - 1;

    return (
        <div className="PageHeader" style={{ textAlign }}>
            <div
                style={{
                    width: app.pageWidth() + 40
                    // margin: app.pageMargin()
                }}
                className="PageHeaderContent"
            >
                <select
                    onChange={onSelectPart}
                    className="PartTitle"
                    value={partIndex}
                >
                    <String id="part">
                        {partLabel => {
                            let parts = new Array(30).fill("");
                            return parts.map((item, index) => {
                                return (
                                    <option key={index} value={index}>
                                        {partLabel}: {(index + 1).toString()}
                                    </option>
                                );
                            });
                        }}
                    </String>
                </select>

                <button className="NavButton NavPgUp" onClick={onPageUp}>
                    <Icon icon={faAngleRight} />
                </button>

                <String id="pg">
                    {pg => (
                        <button onClick={showGotoPopup} style={{ zIndex: 2 }}>
                            {pg}: {pageIndex + 1}
                        </button>
                    )}
                </String>
                <button className="NavButton NavPgDown" onClick={onPageDown}>
                    <Icon icon={faAngleLeft} />
                </button>
                <select
                    className="SuraTitle"
                    onChange={onSelectSura}
                    value={suraIndex}
                >
                    <String className="SuraTitle" id="sura_names">
                        {sura_names => {
                            return sura_names.split(",").map((name, index) => {
                                return (
                                    <option value={index} key={index}>
                                        {(index + 1).toString()}: {name}
                                    </option>
                                );
                            });
                        }}
                    </String>
                </select>
                <button className="NavButton NavBackward" onClick={onDecrement}>
                    <Icon icon={faAngleUp} />
                </button>
                <button
                    onClick={e => {
                        app.gotoAya(app.selectStart);
                    }}
                >
                    {app.selectStart}
                </button>
                <button onClick={onIncrement} className="NavButton NavForward">
                    <Icon icon={faAngleDown} />
                </button>
            </div>
        </div>
    );
};

export default AppConsumer(PlayerConsumer(PageHeader));
