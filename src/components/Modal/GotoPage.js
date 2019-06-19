import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import { withRouter } from "react-router-dom";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";

const GotoPage = ({ onClose, open, history, location }) => {
	const [isOpen, setIsOpen] = useState(true);
	const [pageNumber, updatePageNumber] = useState(
		Utils.pageFromPath(location.pathname)
	);
	const [partNumber, updatePartNumber] = useState(
		Utils.partFromPath(location.pathname)
	);
	let gotoPageForm, gotoPartForm;

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

	const gotoPart = e => {
		const { target: form } = e;
		let part = parseInt(form["PartNumber"].value);
		let pageNumber = QData.parts[part - 1].p;
		history.push("/page/" + pageNumber);
		setIsOpen(false);
		onClose();
		e.preventDefault();
	};

	const updatePage = e => {
		updatePageNumber(e.target.value);
	};

	const updatePart = e => {
		updatePartNumber(e.target.value);
	};

	return (
		<Modal open={isOpen} onClose={onClose}>
			<div className="Title">
				<FormattedMessage id="find" />
			</div>
			<div className="FieldRow">
				<form
					onSubmit={gotoPage}
					ref={form => {
						gotoPageForm = form;
					}}
				>
					<div className="FieldLabel">
						<label htmlFor="PageNumber">
							<FormattedMessage id="page" />
						</label>
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
					<div className="FieldAction">
						<button type="submit">
							<FormattedMessage id="go" />
						</button>
					</div>
				</form>
			</div>
			<div className="FieldRow">
				<form
					onSubmit={gotoPart}
					ref={form => {
						gotoPartForm = form;
					}}
				>
					<div className="FieldLabel">
						<label htmlFor="PartNumber">
							<FormattedMessage id="part" />
						</label>
					</div>
					<div className="FieldValue">
						<input
							type="Number"
							name="PartNumber"
							min="1"
							max="30"
							id="PartNumber"
							value={partNumber}
							onChange={updatePart}
						/>
					</div>
					<div className="FieldAction">
						<button type="submit">
							<FormattedMessage id="go" />
						</button>
					</div>
				</form>
			</div>
		</Modal>
	);
};

export default withRouter(GotoPage);
