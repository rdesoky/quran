import React, { useEffect, useState, useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "./../../context/App";
import QData from "./../../services/QData";
import { HifzRanges, HifzRange } from "../Hifz";

const Favorites = ({ app }) => {
    const [activeTab, selectTab] = useState("add");
    const pageIndex = app.getCurrentPageIndex();
    const suras = QData.pageSuras(pageIndex);

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
                </div>
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                {activeTab == "add" ? (
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
                                    key={
                                        pageIndex.toString() +
                                        "-" +
                                        sura.toString()
                                    }
                                    showActions={true}
                                />
                            );
                        })}
                    </ul>
                ) : (
                    <HifzRanges />
                )}
            </div>
        </>
    );
};

export default AppConsumer(Favorites);
