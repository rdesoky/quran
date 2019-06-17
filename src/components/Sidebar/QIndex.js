import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { withRouter } from "react-router-dom";
import QData from "../../services/QData";

const QIndex = ({ open, onClose, history }) => {
	const getSuraNames = () => {
		let suraNames = [];
		for (let i = 1; i <= 104; i++) {
			suraNames.push("Sura " + i);
		}
		return suraNames;
	};

	const gotoSura = index => {
		history.push("/page/" + QData.sura_info[index].sp);
		onClose();
	};

	return (
		<Modal open={open} onClose={onClose}>
			<div className="Title">Sura Index</div>
			<ul className="SpreadSheet">
				{getSuraNames().map((name, index) => {
					return (
						<li key={index}>
							<button
								onClick={e => {
									gotoSura(index);
								}}
							>
								{name}
							</button>
						</li>
					);
				})}
			</ul>
		</Modal>
	);
};

export default withRouter(QIndex);
