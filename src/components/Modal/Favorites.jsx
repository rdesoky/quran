import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useSelector } from "react-redux";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import { selectActivePage, selectAppHeight } from "../../store/layoutSlice";
import { AddHifz } from "../AddHifz";
import { ActivityChart, HifzRanges } from "../Hifz";

const Favorites = () => {
    const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15);

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
            <div className="PopupBody" ref={bodyRef}>
                {renderBody()}
            </div>
        </>
    );
};

export default Favorites;
