import React from "react";
import { AppConsumer } from "../../context/App";
import { FormattedMessage } from "react-intl";
import QData from "../../services/QData";
import Utils from "../../services/utils";
import { PlayerConsumer, AudioState } from "../../context/Player";

const PageHeader = ({ index: pageIndex, app, order, player }) => {
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
        if (player.audioState !== AudioState.stopped) {
            player.stop();
        }
        Utils.selectTopCommand();
    };

    const onSelectPart = ({ target }) => {
        app.hideMask();
        const partIndex = target.value;
        app.gotoPart(partIndex);
        if (player.audioState !== AudioState.stopped) {
            player.stop();
        }
        Utils.selectTopCommand();
    };

    const showFindPopup = e => {
        app.setPopup("Find");
    };

    const suraIndex = QData.pageSura(pageIndex + 1);
    let textAlign =
        app.pagesCount === 1 ? "center" : order === 0 ? "left" : "right";

    let partIndex = QData.pagePart(pageIndex + 1) - 1;

    return (
        <div className="PageHeader" style={{ textAlign }}>
            <div
                style={{
                    width: app.pageWidth(),
                    margin: app.pageMargin()
                }}
                className="PageHeaderContent"
            >
                <select
                    className="SuraTitle"
                    onChange={onSelectSura}
                    value={suraIndex}
                >
                    <FormattedMessage className="SuraTitle" id="sura_names">
                        {sura_names => {
                            return sura_names.split(",").map((name, index) => {
                                return (
                                    <option value={index} key={index}>
                                        {(index + 1).toString()}: {name}
                                    </option>
                                );
                            });
                        }}
                    </FormattedMessage>
                </select>
                <select
                    onChange={onSelectPart}
                    className="PartTitle"
                    value={partIndex}
                    style={{ left: app.isNarrow ? "50px" : "0" }}
                >
                    <FormattedMessage id="part">
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
                    </FormattedMessage>
                </select>
            </div>
        </div>
    );
};

export default AppConsumer(PlayerConsumer(PageHeader));
