import React, { useEffect, useState } from "react";
import { analytics } from "@/services/analytics";
import { PartCell } from "@/components/PartCell";

export const PartsList = ({ part }) => {
    const [listWidth, setListWidth] = useState(0);
    let list;
    useEffect(() => {
        if (list) {
            setListWidth(list.clientWidth);
        }
        analytics.setTrigger("header_parts_context");
    }, [list]);
    return (
        <ul
            className="SpreadSheet"
            ref={(ref) => {
                list = ref;
            }}
            style={{
                columnCount: Math.floor(listWidth / 80),
            }}
        >
            {Array(30)
                .fill(0)
                .map((zero, index) => (
                    <PartCell part={index} selected={part} key={index} />
                ))}
        </ul>
    );
};
