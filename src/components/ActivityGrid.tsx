import React, { useEffect, useState } from "react";
import { FormattedMessage as String, useIntl } from "react-intl";
import { useSelector } from "react-redux";
import { selectDailyActivities } from "@/store/dbSlice";

type ActivityGridProps = {
	activity: "pages" | "chars";
};

export const ActivityGrid = ({ activity }: ActivityGridProps) => {
	const [data, setData] = useState<DailyActivity[]>([]);
	const dailyActivities = useSelector(selectDailyActivities);
	const intl = useIntl();

	useEffect(() => {
		if (Array.isArray(dailyActivities?.[activity])) {
			setData(
				dailyActivities[activity].slice(0, 30).map((pgInfo) => {
					return Object.assign({}, pgInfo, {
						day: pgInfo.day.substring(5),
					});
				})
			);
		}
	}, [activity, dailyActivities]);

	if (!data.length) {
		return null;
	}

	// const chartWidth = popupWidth - 60;
	const values = data.map((d) => d[activity] || 0);
	const dates = data.map((d) => d.day);
	const max = Math.max(...values);
	return (
		<>
			<String id={`${activity}_daily_graph`} />
			<div>
				{new Array(3).fill(0).map((_v, r) => (
					<div
						key={r}
						style={{
							display: "flex",
							justifyContent: "space-between",
						}}
					>
						{new Array(10).fill(0).map((_v, c) => (
							<div
								key={c}
								style={{
									display: "flex",
									borderRadius: 5,
									flexGrow: 1,
									margin: 2,
									border: "solid 1px #444",
									height: 30,
								}}
							>
								<div
									key={c}
									style={{
										backgroundColor: `rgba(0, 160, 0, ${values[r * 10 + c] / max
											}`,
										flexGrow: 1,
										borderRadius: 5,
										fontSize: 8,
										cursor: "default",
										padding: "0 4px",
									}}
									className="HACentered"
									title={intl.formatMessage(
										{
											id: `activity_${activity}`,
										},
										{ value: values[r * 10 + c] }
									)}
								>
									<span>{dates[r * 10 + c]}</span>
								</div>
							</div>
						))}
					</div>
				))}
			</div>
		</>
	);
};
