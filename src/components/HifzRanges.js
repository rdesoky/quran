import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useSelector } from "react-redux";
import { analytics } from "../services/Analytics";
import { selectHifzRanges } from "../store/dbSlice";
import { HifzRange } from "./HifzRange";

export const HifzRanges = ({ filter, trigger = "hifz_index" }) => {
    const [activeRange, setActiveRange] = useState(null);
    const hifzRanges = useSelector(selectHifzRanges);

    useEffect(() => {
        analytics.setTrigger("hifz_index");
    }, []);

    if (!hifzRanges.length) {
        return (
            <div>
                <String id="no_hifz" />
            </div>
        );
    }

    return (
        <ul id="HifzRanges" className="FlowingList">
            {hifzRanges.map((range, index) => {
                return (
                    <HifzRange
                        range={range}
                        key={range.id}
                        filter={filter}
                        showActions={activeRange === range.id}
                        setActiveRange={setActiveRange}
                        pages={false}
                        trigger={trigger}
                    />
                );
            })}
        </ul>
    );
};
