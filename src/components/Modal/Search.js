import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import Utils from "../../services/utils";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext, AppContext } from "./../../context/App";
import { Link } from "react-router-dom";

let verseList = [];
let normalizedList = [];

const Search = ({ onClose, appContext }) => {
	const input = useRef(null);
	const [searchTerm, setSearchTerm] = useState("");
	const [results, setResults] = useState([]);

	useEffect(() => {
		input.current.focus();
		if (verseList.length === 0) {
			fetch(`${process.env.PUBLIC_URL}/quran.xml`)
				.then(results => results.text())
				.then(text => new window.DOMParser().parseFromString(text, "text/xml"))
				.then(xmlDoc => {
					//verseList = [].slice.call(xmlDoc.getElementsByTagName("a"));
					verseList = Array.prototype.map.call(
						xmlDoc.getElementsByTagName("a"),
						i => i.textContent
					);
					normalizedList = verseList.map(t => t.replace(/\p{M}/gu, ""));
				});
		}
		return () => {
			//unmount
			// document.body.focus();
		};
	}, []);

	const gotoAya = e => {
		const aya = e.target.getAttribute("aya");
		onClose();
		appContext.gotoAya(parseInt(aya));
		e.preventDefault();
	};

	const renderResults = () => {
		if (searchTerm.length >= 3) {
			return (
				<ol>
					{normalizedList.map((verse, i) => {
						if (verse.includes(searchTerm)) {
							return (
								<li class="link" onClick={gotoAya} aya={i}>
									{verseList[i]}
								</li>
							);
						}
					})}
				</ol>
			);
		}
	};

	return (
		<Modal onClose={onClose}>
			<div className="Title">
				<FormattedMessage id="search" />
			</div>
			<div>
				<input
					placeholder="Search for sura name or aya text"
					className="SearchInput"
					ref={input}
					type="text"
					value={searchTerm}
					onChange={e => setSearchTerm(e.target.value)}
				/>
			</div>
			<FormattedMessage className="SuraTitle" id="results_for">
				{resultsFor => {
					if (searchTerm.length) {
						return (
							<>
								<hr />
								{resultsFor + " " + searchTerm}
							</>
						);
					}
					return null;
				}}
			</FormattedMessage>
			{renderResults()}
		</Modal>
	);
};

export default withAppContext(Search);
