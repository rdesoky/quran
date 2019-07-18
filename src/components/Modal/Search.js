import React, { useState, useEffect, useRef } from "react";
import Modal from "./Modal";
import QData from "../../services/QData";
import { FormattedMessage } from "react-intl";
import { withAppContext } from "./../../context/App";

let verseList = [];
let normalizedList = [];

const Search = ({ onClose, appContext }) => {
	const input = useRef(null);
	const [searchTerm, setSearchTerm] = useState(
		localStorage.getItem("LastSearch") || ""
	);
	const [searchHistory, setSearchHistory] = useState(
		JSON.parse(localStorage.getItem("SearchHistory") || "[]")
	);
	const [results, setResults] = useState([]);
	const [pages, setPages] = useState(1);

	let searchForm, resultsDiv;

	useEffect(() => {
		input.current.focus();
		doSearch(searchTerm);
		return () => {
			//unmount
			// document.body.focus();
		};
	}, []);

	const addToSearchHistory = () => {
		let history = [searchTerm, ...searchHistory.filter(s => s !== searchTerm)];
		history = history.slice(0, 10); //keep last 10 items
		localStorage.setItem("SearchHistory", JSON.stringify(history));
		setSearchHistory(history);
	};

	const gotoAya = e => {
		const aya = e.target.getAttribute("aya");
		onClose();
		appContext.gotoAya(parseInt(aya));
		addToSearchHistory();
		e.preventDefault();
	};

	const renderMore = () => {
		if (results.length > pages * 20) {
			return (
				<button className="MoreResults" onClick={e => setPages(pages + 1)}>
					<FormattedMessage id="more" />
					...
				</button>
			);
		}
	};

	const onResultKeyDown = e => {
		if (e.key === "Enter") {
			gotoAya(e);
		}
	};

	const renderResults = () => {
		if (!results.length) {
			return;
		}
		let page = results.slice(0, pages * 20);
		return (
			<ol
				className="ResultsList"
				style={{ maxHeight: appContext.pageHeight() - 170 }}
				ref={ref => {
					resultsDiv = ref;
				}}
			>
				{page.map(({ aya, text }) => {
					const ayaInfo = QData.ayaIdInfo(aya);
					return (
						<FormattedMessage id="sura_names">
							{sura_names => (
								<li
									tabIndex="0"
									class="link"
									onKeyDown={onResultKeyDown}
									onClick={gotoAya}
									aya={aya}
								>
									<span className="ResultInfo">
										{sura_names.split(",")[ayaInfo.sura] +
											`(${ayaInfo.aya + 1}):
										`}
									</span>
									<span class="ResultText">{text}</span>
								</li>
							)}
						</FormattedMessage>
					);
				})}
				{renderMore()}
			</ol>
		);
	};

	const onChangeSearchInput = e => {
		const searchTerm = e.target.value;
		setSearchTerm(searchTerm);
		doSearch(searchTerm);
	};

	const onHistoryButtonClick = e => {
		const searchTerm = e.target.textContent;
		setSearchTerm(searchTerm);
		doSearch(searchTerm);
	};

	const doSearch = searchTerm => {
		let sResults = [];
		let normSearchTerm = QData.normalizeText(searchTerm);
		const verseList = appContext.verseList();
		if (verseList.length > 0 && normSearchTerm.length > 2) {
			localStorage.setItem("LastSearch", searchTerm);
			sResults = appContext.normVerseList().reduce((results, text, aya) => {
				if (text.includes(normSearchTerm)) {
					results.push({ aya, text: verseList[aya] });
				}
				return results;
			}, []);
		}
		setResults(sResults);
	};

	const onSubmitSearch = e => {
		let firstResult = resultsDiv.querySelector("li");
		if (firstResult) {
			firstResult.focus();
		}
		addToSearchHistory();
		e.preventDefault();
	};

	return (
		<Modal onClose={onClose}>
			<div className="Title">
				<FormattedMessage id="search" />
			</div>
			<form
				id="SearchForm"
				onSubmit={onSubmitSearch}
				ref={form => {
					searchForm = form;
				}}
			>
				<input
					placeholder="Search for sura name or aya text"
					className="SearchInput"
					ref={input}
					type="text"
					value={searchTerm}
					onChange={onChangeSearchInput}
				/>
				<button type="submit">
					<FormattedMessage id="search" />
				</button>
			</form>
			<div id="SearchHistory">
				{searchHistory.map(s => {
					return <button onClick={onHistoryButtonClick}>{s}</button>;
				})}
			</div>
			<FormattedMessage className="SuraTitle" id="results_for">
				{resultsFor => {
					if (searchTerm.length) {
						return <>{results.length + " " + resultsFor + " " + searchTerm}</>;
					}
					return null;
				}}
			</FormattedMessage>
			{renderResults()}
		</Modal>
	);
};

export default withAppContext(Search);
