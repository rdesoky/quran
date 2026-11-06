import AKeyboard from "@/components/AKeyboard/AKeyboard";
import { BookmarksList } from "@/components/BookmarksList";
import { HifzRanges } from "@/components/HifzRanges";
import Icon from "@/components/Icon";
import { SuraList } from "@/components/SuraList";
import useSnapHeightToBottomOf from "@/hooks/useSnapHeightToBottomOff";
import { selectAppHeight } from "@/store/layoutSlice";
import { selectLang } from "@/store/settingsSlice";
import {
	faBookmark,
	faBrain,
	faListAlt,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useSelector } from "react-redux";

/**
 * QIndex — Modal component for navigating the Quran.
 *
 * Provides three tabs:
 *   - Index: Sura (chapter) list with text filter
 *   - Hifz: Memorization range picker
 *   - Bookmarks: User bookmark list
 *
 * Props:
 *   simple — When true, renders only a SuraList without tabs/filter (compact mode).
 */
type QIndexProps = {
	simple?: boolean;
};

/**
 * Main modal for Quran navigation (surah index, hifz ranges, bookmarks).
 *
 * State flow:
 *   activeTab (persisted to localStorage) → renders SuraList | HifzRanges | BookmarksList
 *   filter (text) → passed to all child lists for search
 *   keyboard (boolean) → toggles on-screen keyboard overlay
 */
export default function QIndex({ simple }: QIndexProps) {
	const lang = useSelector(selectLang);

	// --- State ---
	const [keyboard, setKeyboard] = useState(false); // toggles on-screen keyboard visibility
	const [activeTab, setActiveTab] = useState(
		localStorage.getItem("activeTab") || "index", // persisted tab preference: "index" | "hifz" | "bookmarks"
	);
	const [filter, setFilter] = useState(""); // text filter for searching surahs/bookmarks
	const appHeight = useSelector(selectAppHeight);
	const bodyRef = useSnapHeightToBottomOf(appHeight - 15); // no longer used

	/** Switch active tab and persist choice to localStorage */
	const selectTab = (tabId: string) => {
		localStorage.setItem("activeTab", tabId);
		setActiveTab(tabId);
	};

	// Ref to the typing console div for programmatic focus
	let typingConsole: HTMLDivElement | null = null;

	/** Hide the on-screen keyboard */
	const hideKeyboard = () => {
		setKeyboard(false);
	};

	/** Auto-focus the typing console when it mounts/changes */
	useEffect(() => {
		if (typingConsole) {
			typingConsole.focus();
		}
	}, [typingConsole]);

	/** Show the on-screen keyboard */
	const showKeyboard = () => {
		setKeyboard(true);
	};

	/** Update the filter text from the on-screen keyboard */
	const updateFilter = (filter: string) => {
		setFilter(filter);
	};

	/** Clear the filter text and stop event propagation */
	const clearFilter = (e: React.MouseEvent<HTMLDivElement>) => {
		setFilter("");
		e.stopPropagation();
	};

	if (simple) {
		return (
			<>
				{/* Compact mode: only surah list without tabs or search */}
				<div className="Title"></div>
				<div ref={bodyRef} className="PopupBody">
					<SuraList simple={simple} />
				</div>
			</>
		);
	}

	return (
		<>
			{/* Header with tab navigation */}
			<div className="Title">
				<div className="ButtonsBar" style={{ height: 45 }}>
					{/* Tab: Surah Index */}
					<button
						onClick={(_e) => selectTab("index")}
						className={"CommandButton".appendWord(
							"active",
							activeTab === "index",
						)}
					>
						<Icon icon={faListAlt} />
						<span>
							<Message id="index" />
						</span>
					</button>
					{/* Tab: Hifz (Memorization) Ranges */}
					<button
						onClick={(_e) => selectTab("hifz")}
						className={"CommandButton".appendWord(
							"active",
							activeTab === "hifz",
						)}
					>
						<Icon icon={faBrain} />
						<span>
							<Message id="favorites" />
						</span>
					</button>
					{/* Tab: Bookmarks */}
					<button
						onClick={(_e) => selectTab("bookmarks")}
						className={"CommandButton".appendWord(
							"active",
							activeTab === "bookmarks",
						)}
					>
						<Icon icon={faBookmark} />
						<span>
							<Message id="bookmarks" />
						</span>
					</button>
				</div>
			</div>

			{/* Search input field that triggers keyboard on click */}
			<div
				className={"TypingConsole" + (!filter.length ? " empty" : "")}
				ref={(ref) => {
					typingConsole = ref;
				}}
				tabIndex={0}
				onClick={showKeyboard}
			>
				{/* Display filter text or placeholder */}
				{filter || <Message id="find_sura" />}
				{/* Show clear button when filter has text */}
				{filter ? (
					<div className="ClearButton" onClick={clearFilter}>
						<Icon icon={faTimes} />
					</div>
				) : (
					""
				)}
			</div>

			{/* On-screen keyboard for text input (visible when keyboard state is true) */}
			<AKeyboard
				style={{ display: keyboard ? "block" : "none" }}
				initText={filter}
				onUpdateText={updateFilter}
				onEnter={hideKeyboard}
				onCancel={hideKeyboard}
				lang={lang}
			/>

			{/* Main content area that switches between tabs */}
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
					<BookmarksList filter={filter} trigger="indices_bookmarks" />
				)}
			</div>
		</>
	);
}
