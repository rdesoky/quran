import React, { useEffect } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useDispatch } from "react-redux";
import { useHistory } from "@/hooks/useHistory";
import { analytics } from "@/services/analytics";
import { gotoPart } from "@/store/navSlice";

export const PartCell = ({ part: partIndex, selected }) => {
    const history = useHistory();
    const dispatch = useDispatch();
    let btn;
    const onClickPart = (e) => {
        analytics.logEvent("goto_part", { part: partIndex });
        dispatch(gotoPart(history, partIndex));
    };
    useEffect(() => {
        if (selected === partIndex && btn) {
            btn.focus();
        }
    }, [btn, partIndex, selected]);
    return (
        <li className="PartIndexCell">
            <button
                onClick={onClickPart}
                ref={(ref) => {
                    btn = ref;
                }}
                className={partIndex === selected ? "active" : null}
            >
                <Message id="part_num" values={{ num: partIndex + 1 }} />
            </button>
        </li>
    );
};
