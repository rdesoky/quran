import React, { useEffect } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useDispatch } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { analytics } from "@/services/analytics";
import { gotoPart } from "@/store/navSlice";

type PartCellProps = {
    part: number; // The index of the part (0-based)
    selected: number; // The currently selected part index
};

export const PartCell = ({ part: partIndex, selected }: PartCellProps) => {
    const history = useHistory();
    const dispatch = useDispatch();
    const btnRef = React.useRef<HTMLButtonElement>(null);
    const onClickPart = (e: React.MouseEvent<HTMLButtonElement>) => {
        analytics.logEvent("goto_part", { part: partIndex });
        dispatch(gotoPart(history, partIndex));
    };
    useEffect(() => {
        if (selected === partIndex && btnRef.current) {
            btnRef.current.focus();
        }
    }, [partIndex, selected]);

    return (
        <li className="PartIndexCell">
            <button
                onClick={onClickPart}
                ref={btnRef}
                className={partIndex === selected ? "active" : undefined}
            >
                <Message id="part_num" values={{ num: partIndex + 1 }} />
            </button>
        </li>
    );
};
