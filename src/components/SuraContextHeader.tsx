import React from "react";
import { SuraHifzChart } from "@/components/SuraHifzChart";
import { SuraContextButtons } from "@/components/SuraContextButtons";

type SuraContextHeaderProps = {
	sura: number; // Replace 'any' with the appropriate type for 'sura'
};

export const SuraContextHeader = ({ sura }: SuraContextHeaderProps) => {
	return (
		<>
			<SuraContextButtons sura={sura} />
			<div className="SuraContextHeader">
				<SuraHifzChart sura={sura} />
				{/* <SuraNavigator sura={suraIndex} /> */}
			</div>
		</>
	);
};
