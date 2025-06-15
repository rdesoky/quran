import {
	faBookmark,
	faHeart,
	faListAlt,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon as Icon } from "@fortawesome/react-fontawesome";
import React, { useEffect, useState } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useSelector } from "react-redux";
import useSnapHeightToBottomOf from "../../hooks/useSnapHeightToBottomOff";
import { selectAppHeight } from "../../store/layoutSlice";
import { selectLang } from "../../store/settingsSlice";
import AKeyboard from "../AKeyboard/AKeyboard";
import { BookmarksList } from "../BookmarksList";
import { HifzRanges } from "../Hifz";
import { SuraList } from "../SuraList";

export default function QIndex({ simple }) {
	const lang = useSelector(selectLang);
	const [keyboard, setKeyboard] = useState(false);
	const [activeTab, setActiveTab] = useState(
		localStorage.getItem("activeTab") || "index"
	);
	const [filter, setFilter] = useState("");
	const appHeight = useSelector(selectAppHeight);
    const bodyRef = useSnapHeightToBottomOf(appHeight - 15);

	const selectTab = (tabId) => {
		localStorage.setItem("activeTab", tabId);
		setActiveTab(tabId);
	};

	let typingConsole;

	const hideKeyboard = (e) => {
		setKeyboard(false);
	};

	useEffect(() => {
		if (typingConsole) {
			typingConsole.focus();
		}
	}, [typingConsole]);

	const showKeyboard = (e) => {
		setKeyboard(true);
	};

	const updateFilter = (filter) => {
		setFilter(filter);
	};

	const clearFilter = (e) => {
		setFilter("");
		e.stopPropagation();
	};

	if (simple) {
		return (
			<>
				<div className="Title"></div>
				<div ref={bodyRef} className="PopupBody">
					<SuraList simple={simple} />
				</div>
			</>
		);
	}

	return (
		<>
			<div className="Title">
				<div className="ButtonsBar">
					<button
						onClick={(e) => selectTab("index")}
						className={"CommandButton".appendWord(
							"active",
							activeTab === "index"
						)}
					>
						<Icon icon={faListAlt} />
						<span>
							<Message id="index" />
						</span>
					</button>
					<button
						onClick={(e) => selectTab("hifz")}
						className={"CommandButton".appendWord(
							"active",
							activeTab === "hifz"
						)}
					>
						<Icon icon={faHeart} />
						<span>
							<Message id="favorites" />
						</span>
					</button>
					<button
						onClick={(e) => selectTab("bookmarks")}
						className={"CommandButton".appendWord(
							"active",
							activeTab === "bookmarks"
						)}
					>
						<Icon icon={faBookmark} />
						<span>
							<Message id="bookmarks" />
						</span>
					</button>
				</div>
			</div>
			<div
				className={"TypingConsole" + (!filter.length ? " empty" : "")}
				ref={(ref) => {
					typingConsole = ref;
				}}
				tabIndex="0"
				onClick={showKeyboard}
			>
				{filter || <Message id="find_sura" />}
				{filter ? (
					<div className="ClearButton" onClick={clearFilter}>
						<Icon icon={faTimes} />
					</div>
				) : (
					""
				)}
			</div>

			<AKeyboard
				style={{ display: keyboard ? "block" : "none" }}
				initText={filter}
				onUpdateText={updateFilter}
				onEnter={hideKeyboard}
				onCancel={hideKeyboard}
				lang={lang}
			/>

			<div
				className="PopupBody"
				ref={bodyRef}
				onTouchStart={hideKeyboard}
				onMouseDown={hideKeyboard}
			>
				{activeTab === "index" ? (
					<SuraList filter={filter} trigger="indices_chapters" />
				) : activeTab === "hifz" ? (
					<HifzRanges filter={filter} trigger="indices_hifz" />
				) : (
					<BookmarksList
						filter={filter}
						trigger="indices_bookmarks"
					/>
				)}
			</div>
		</>
	);
}
