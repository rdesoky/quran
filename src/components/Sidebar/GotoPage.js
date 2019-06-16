import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { withRouter } from "react-router-dom";

const GotoPage = ({ onClose, open, history, page }) => {
	const [isOpen, setIsOpen] = useState(true);
	const [pageNumber, updatePageNumber] = useState(page || "1");

	// const onClickClose = e => {
	// 	setIsOpen(false);
	// 	onClose();
	// };

	useEffect(() => {
		setIsOpen(open); //update internal state to match
	}, [open]);

	const gotoPage = e => {
		const { target: form } = e;
		history.push("/page/" + form["PageNumber"].value);
		setIsOpen(false);
		onClose();
		e.preventDefault();
	};

	const updatePage = e => {
		updatePageNumber(e.target.value);
	};

	return (
		<Modal open={isOpen} onClose={onClose}>
			<div className="Title">Goto Page</div>
			<form onSubmit={gotoPage}>
				<div className="FieldRow">
					<div className="FieldLabel">
						<label htmlFor="PageNumber">Page Number:</label>
					</div>
					<div className="FieldValue">
						<input
							type="Number"
							name="PageNumber"
							min="1"
							max="604"
							id="PageNumber"
							value={pageNumber}
							onChange={updatePage}
						/>
					</div>
				</div>
				<div className="ActionBar">
					<button type="submit">Go</button>
				</div>
			</form>
		</Modal>
	);
};

export default withRouter(GotoPage);
