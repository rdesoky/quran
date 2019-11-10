import React, { useEffect, useState, useContext } from "react";
import { FormattedMessage as String } from "react-intl";
import { AppConsumer, AppContext } from "./../../context/App";
import QData from "./../../services/QData";
import { HifzRanges, HifzRange } from "../Hifz";

const Favorites = ({ app }) => {
    const pageIndex = app.getCurrentPageIndex();
    const suras = QData.pageSuras(pageIndex);

    return (
        <>
            <div className="Title">
                <String id="favorites" />
            </div>
            <div
                className="PopupBody"
                style={{ maxHeight: app.appHeight - 85 }}
            >
                <ul className="FlowingList">
                    {suras.map(sura => (
                        <HifzRangeOptions
                            sura={sura}
                            page={pageIndex}
                            key={pageIndex.toString() + "-" + sura.toString()}
                        />
                    ))}
                </ul>
                <hr />
                <HifzRanges />
            </div>
        </>
    );
};

export const HifzRangeOptions = ({ page, sura }) => {
    const app = useContext(AppContext);
    const [hifzRange, setHifzRange] = useState(null);

    useEffect(() => {
        const hifzRange = app.hifzRanges.find(r => {
            return r.sura === sura && page >= r.startPage && page <= r.endPage;
        });
        setHifzRange(hifzRange);
    }, [page, app.hifzRanges]);

    if (hifzRange) {
        return <HifzRange range={hifzRange} />;
    }

    return (
        <div>
            <String
                id="sura_name"
                values={{ sura: app.suraName(sura) }}
            ></String>
            {" - "}
            <String
                id="the_page"
                values={{ page: page - QData.suraStartPage(sura) + 1 }}
            ></String>
            <div className="ButtonsBar">
                <button>This page</button>
                <button>From sura start</button>
                <button>To sura end</button>
                <button>All sura</button>
            </div>
        </div>
    );
};

export default AppConsumer(Favorites);
