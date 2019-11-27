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
import { SuraList } from "../Modal/QIndex";

const PageHeader = ({
    index: pageIndex,
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
    const app = useContext(AppContext);

    // const onSelectSura = ({ target }) => {
    //     app.hideMask();
    //     const suraIndex = parseInt(target.value);
    //     app.gotoSura(suraIndex);
    //     Utils.selectTopCommand();
    // };

    // const onSelectPart = ({ target }) => {
    //     app.hideMask();
    //     const partIndex = target.value;
    //     app.gotoPart(partIndex);
    //     Utils.selectTopCommand();
    // };

    const showPartContextPopup = ({ currentTarget: target }) => {
        app.setContextPopup(() => {
            return {
                target,
                component: (
                    <ul className="SpreadSheet">
                        {Array(30)
                            .fill(0)
                            .map((zero, index) => (
                                <li key={index}>
                                    <button
                                        onClick={e => {
                                            app.gotoPart(index);
                                        }}
                                    >
                                        <String
                                            id="part_num"
                                            values={{ num: index + 1 }}
                                        />
                                    </button>
                                </li>
                            ))}
                    </ul>
                )
            };
        });
    };

    const showPageContextPopup = ({ target }) => {
        app.setContextPopup(() => {
            return {
                target,
                component: (
                    <ul className="SpreadSheet">
                        <li>
                            <button>Goto Page</button>
                        </li>
                        <li>
                            <button>Add To Hifz</button>
                        </li>
                    </ul>
                )
            };
        });
    };

    const showSuraContextPopup = ({ target }) => {
        app.setContextPopup(() => {
            return {
                target,
                component: <SuraList simple={true} />
            };
        });
    };

    const suraIndex = QData.pageSura(pageIndex + 1);
    let justifyContent =
        app.pagesCount === 1
            ? "center"
            : order === 0
            ? "flex-end"
            : "flex-start";

    let partIndex = QData.pagePart(pageIndex + 1) - 1;
    let selectedAyaInfo = QData.ayaIdInfo(app.selectStart);
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
