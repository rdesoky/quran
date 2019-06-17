import React, { useState, useEffect } from "react";
import Modal from "../Modal/Modal";
import { withRouter } from "react-router-dom";
import Utils from "../../services/utils";

const GotoPage = ({ onClose, open, history, location }) => {
	const [isOpen, setIsOpen] = useState(true);
	const [pageNumber, updatePageNumber] = useState(
		Utils.pageFromPath(location.pathname)
	);
	let gotoPageForm;

	// const onClickClose = e => {
	// 	setIsOpen(false);
	// 	onClose();
	// };

	useEffect(() => {
		setIsOpen(open); //update internal state to match
	}, [open]);

	useEffect(() => {
		gotoPageForm.PageNumber.focus();
		gotoPageForm.PageNumber.select();
	}, []);

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
			<form
				onSubmit={gotoPage}
				ref={form => {
					gotoPageForm = form;
				}}
			>
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
