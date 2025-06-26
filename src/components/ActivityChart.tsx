import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import { useSelector } from "react-redux";
import { Bar, BarChart, CartesianGrid, Tooltip, XAxis, YAxis } from "recharts";
import { selectDailyActivities } from "../store/dbSlice";
import { selectPopupWidth } from "../store/layoutSlice";
import { ActivityTooltip } from "./ActivityTooltip";

type ActivityChartProps = {
    activity: "pages" | "chars";
};
export const ActivityChart = ({ activity }: ActivityChartProps) => {
    const [data, setData] = useState<DailyActivity[]>([]);
    const popupWidth = useSelector(selectPopupWidth);
    const dailyActivities = useSelector(selectDailyActivities);

    useEffect(() => {
        setData(
            dailyActivities[activity]
                .slice(0, 14)
                .reverse()
                .map((pgInfo) => {
                    return Object.assign({}, pgInfo, {
                        day: pgInfo.day.substring(5),
                    });
                })
        );
    }, [activity, dailyActivities]);

    if (!data.length) {
        return null;
    }

    const chartWidth = popupWidth - 60;
    return (
        <>
            <String id={`${activity}_daily_graph`} />
            <BarChart
                width={chartWidth}
                height={240}
                data={data}
                margin={{
                    top: 5,
                    right: 0,
                    left: 0,
                    bottom: 5,
                }}
            >
                <Bar
                    dataKey={activity}
                    stroke="green"
                    fill="rgba(0, 128, 0, 0.3)"
                />
                <CartesianGrid stroke="#444" strokeDasharray="3 3" />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip
                    content={<ActivityTooltip activity={activity} />}
                    cursor={{ fill: "#eeeeee20" }}
                />
            </BarChart>
        </>
    );
};
