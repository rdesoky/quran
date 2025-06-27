import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import React, { useState, RefObject } from "react";
import { FormattedMessage as String } from "react-intl";
import { useSelector } from "react-redux";
import useSnapHeightToBottomOf from "@/hooks/useSnapHeightToBottomOff";
import { selectActivePage, selectAppHeight } from "@/store/layoutSlice";
import { AddHifz } from "../AddHifz";
import { ActivityChart, HifzRanges } from "../Hifz";
import Icon from "../Icon";

const Favorites: React.FC = () => {
    const appHeight: number = useSelector(selectAppHeight);
    const bodyRef: RefObject<HTMLDivElement | null> = useSnapHeightToBottomOf(
        appHeight - 15
    );

    const [activeTab, selectTab] = useState<string>("add");
    const pageIndex: number = useSelector(selectActivePage);

    const renderBody = (): React.ReactNode => {
        switch (activeTab) {
            case "add":
                return <AddHifz />;
            case "update":
                return <HifzRanges />;
            case "graph":
                return <ActivityChart activity="pages" />;
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
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                            selectTab("add")
                        }
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "add"
                        )}
                    >
                        <String id="add" />
                    </button>
                    <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                            selectTab("update")
                        }
                        className={"CommandButton".appendWord(
                            "active",
                            activeTab === "update"
                        )}
                    >
                        <String id="browse" />
                    </button>
                    <button
                        onClick={(e: React.MouseEvent<HTMLButtonElement>) =>
                            selectTab("graph")
                        }
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
