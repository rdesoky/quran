import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "../../context/App";

const QIndex = ({ open, onClose, appContext }) => {
	const getSuraNames = () => {
		let suraNames = [];
		for (let i = 1; i <= 114; i++) {
			suraNames.push("Sura " + i);
		}
		return suraNames;
	};

	const gotoSura = index => {
		appContext.hideMask();
		appContext.gotoPage(QData.sura_info[index].sp);
		onClose();
	};

	return (
		<Modal open={open} onClose={onClose}>
			<div className="Title">
				<FormattedMessage id="index" />
			</div>
			<ul className="SpreadSheet">
				{getSuraNames().map((name, index) => {
					return (
						<li key={index}>
							<button
								onClick={e => {
									gotoSura(index);
								}}
							>
								<FormattedMessage id={"sura_names"}>
									{data => {
										return index + 1 + ". " + data.split(",")[index];
									}}
								</FormattedMessage>
							</button>
						</li>
					);
				})}
			</ul>
		</Modal>
	);
};

export default withAppContext(QIndex);
