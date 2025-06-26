import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useSelector } from "react-redux";
import { analytics } from "@/services/analytics";
import { selectHifzRanges } from "@/store/dbSlice";
import { HifzRange as HifzRangeComponent } from "@/components/HifzRange";

interface HifzRangesProps {
    filter?: any;
    trigger?: string;
}

export const HifzRanges: React.FC<HifzRangesProps> = ({
    filter,
    trigger = "hifz_index",
}) => {
    const [activeRange, setActiveRange] = useState<string | number | null>(
        null
    );
    const hifzRanges = useSelector(selectHifzRanges);

    useEffect((): void => {
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
                    <HifzRangeComponent
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
