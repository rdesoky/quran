import React, { useEffect, useState, useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "./../../context/App";
import QData from "./../../services/QData";
import { HifzRanges, HifzRange } from "../Hifz";
import { ActivityChart } from "../Hifz";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";

export const AddHifz = ({ page }) => {
    const app = useContext(AppContext);
    const pageIndex = page === undefined ? app.match.params.page : page;
    const suras = QData.pageSuras(pageIndex);

    return (
        <ul className="FlowingList">
            {suras.map(sura => {
                const hifzRange = app.hifzRanges.find(r => {
                    return (
                        r.sura === sura &&
                        pageIndex >= r.startPage &&
                        pageIndex <= r.endPage
                    );
                });
                return (
                    <HifzRange
                        range={
                            hifzRange || {
                                sura,
                                startPage: pageIndex,
                                endPage: pageIndex,
                                pages: 1
                            }
                        }
                        key={pageIndex.toString() + "-" + sura.toString()}
                        showActions={true}
                    />
                );
            })}
        </ul>
    );
};

const Favorites = () => {
    const app = useContext(AppContext);
    const [activeTab, selectTab] = useState("add");
    const pageIndex = app.getCurrentPageIndex();
    const suras = QData.pageSuras(pageIndex);

    const renderBody = () => {
        switch (activeTab) {
            case "add":
                return <AddHifz page={pageIndex} />;
            case "update":
                return <HifzRanges />;
            case "graph":
                return <ActivityChart />;
            default:
                return null;
        }
    };

    return (
        <>
            <div className="Title">
                <String id="favorites" />
                <div className="ButtonsBar">
                    <button
                        onClick={e => selectTab("add")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab == "add"
                        )}
                    >
                        <String id="add" />
                    </button>
                    <button
                        onClick={e => selectTab("update")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab == "update"
                        )}
                    >
                        <String id="browse" />
                    </button>
                    <button
                        onClick={e => selectTab("graph")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab == "graph"
                        )}
                    >
                        <Icon icon={faChartLine} />
                    </button>
                </div>
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                {renderBody()}
            </div>
        </>
    );
};

export default Favorites;
