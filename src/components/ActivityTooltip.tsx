import React from "react";
import { FormattedMessage as String } from "react-intl";

type ActivityTooltipProps = {
    active?: boolean;
    payload?: { value: number }[];
    label?: string;
    activity: "pages" | "chars";
};
export const ActivityTooltip = ({
    active,
    payload,
    label,
    activity,
}: ActivityTooltipProps) => {
    if (active && payload && label) {
        const value =
            Array.isArray(payload) && payload.length ? payload[0].value : 0;

        const [month, day] = label.split("-").map((x) => parseInt(x));
        const date = new Date();
        date.setMonth(month - 1);
        date.setDate(day);
        const dateStr = new Date(date).toDateString();

        return (
            <div className="custom-tooltip">
                <p className="label">
                    {dateStr}
                    <br />
                    <String
                        id={`activity_${activity}`}
                        values={{ value: value }}
                    />
                </p>
            </div>
        );
    }

    return null;
};
