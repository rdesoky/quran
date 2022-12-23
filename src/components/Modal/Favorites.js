import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useSelector } from "react-redux";
import { selectHifzRanges } from "../../store/dbSlice";
import { selectActivePage, selectAppHeight } from "../../store/layoutSlice";
import { ActivityChart, HifzRange, HifzRanges } from "../Hifz";
import { getPageSuras } from "./../../services/QData";

export const AddHifz = ({ page }) => {
    const pageIndex = useSelector(selectActivePage);
    const hifzRanges = useSelector(selectHifzRanges);

    const suras = getPageSuras(pageIndex);

    return (
        <ul className="FlowingList">
            {suras.map((sura) => {
                const hifzRange = hifzRanges.find((r) => {
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
                                pages: 1,
                            }
                        }
                        key={pageIndex.toString() + "-" + sura.toString()}
                        showActions={true}
                        pages={true}
                        trigger="update_hifz_popup"
                    />
                );
            })}
        </ul>
    );
};

const Favorites = () => {
    const appHeight = useSelector(selectAppHeight);
    const [activeTab, selectTab] = useState("add");
    const pageIndex = useSelector(selectActivePage);

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
                        onClick={(e) => selectTab("add")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "add"
                        )}
                    >
                        <String id="add" />
                    </button>
                    <button
                        onClick={(e) => selectTab("update")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "update"
                        )}
                    >
                        <String id="browse" />
                    </button>
                    <button
                        onClick={(e) => selectTab("graph")}
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "graph"
                        )}
                    >
                        <Icon icon={faChartLine} />
                    </button>
                </div>
            </div>
            <div className="PopupBody" style={{ maxHeight: appHeight - 85 }}>
                {renderBody()}
            </div>
        </>
    );
};

export default Favorites;
