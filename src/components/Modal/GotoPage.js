import React, { useState, useEffect } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "./../../context/App";

const GotoPage = ({ onClose, open, appContext }) => {
	const [isOpen, setIsOpen] = useState(true);
	const [pageNumber, updatePageNumber] = useState(
		Utils.pageFromPath(appContext.location.pathname)
	);
	const [partNumber, updatePartNumber] = useState(
		Utils.partFromPath(appContext.location.pathname)
	);
	let gotoPageForm, gotoPartForm;

	useEffect(() => {
		setIsOpen(open); //update internal state to match
	}, [open]);

	useEffect(() => {
		gotoPageForm.PageNumber.focus();
		gotoPageForm.PageNumber.select();
		return () => {
			// document.body.focus();
		};
	}, []);

	const gotoPage = e => {
		const { target: form } = e;
		const pageNum = form["PageNumber"].value;
		appContext.gotoPage(pageNum);
		let ayaId = QData.pageAyaId(pageNum - 1);
		appContext.selectAya(ayaId);
		setIsOpen(false);
		onClose();
		e.preventDefault();
	};

	const gotoPart = e => {
		const { target: form } = e;
		let part = parseInt(form["PartNumber"].value);
		// const partInfo = QData.parts[part - 1];
		appContext.gotoPart(part - 1);
		// const ayaId = QData.ayaID(partInfo.s, partInfo.a);
		// appContext.selectAya(ayaId);
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
				<FormattedMessage id="goto" />
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

export default withAppContext(GotoPage);
