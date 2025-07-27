import {
	faBookmark,
	faHeart,
	faListAlt,
	faTimes,
} from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import { FormattedMessage as Message } from "react-intl";
import { useSelector } from "react-redux";
import useSnapHeightToBottomOf from "@/hooks/useSnapHeightToBottomOff";
import { selectAppHeight } from "@/store/layoutSlice";
import { selectLang } from "@/store/settingsSlice";
import AKeyboard from "@/components/AKeyboard/AKeyboard";
import { BookmarksList } from "@/components/BookmarksList";
import { HifzRanges } from "@/components/HifzRanges";
import Icon from "@/components/Icon";
import { SuraList } from "@/components/SuraList";

type QIndexProps = {
	simple?: boolean;
};

export default function QIndex({ simple }: QIndexProps) {
	const lang = useSelector(selectLang);
	const [keyboard, setKeyboard] = useState(false);
	const [activeTab, setActiveTab] = useState(
		localStorage.getItem("activeTab") || "index"
	);
	const [filter, setFilter] = useState("");
	const appHeight = useSelector(selectAppHeight);
	const bodyRef = useSnapHeightToBottomOf(appHeight - 15);

	const selectTab = (tabId: string) => {
		localStorage.setItem("activeTab", tabId);
		setActiveTab(tabId);
	};

	let typingConsole: HTMLDivElement | null = null;

	const hideKeyboard = () => {
		setKeyboard(false);
	};

	useEffect(() => {
		if (typingConsole) {
			typingConsole.focus();
		}
	}, [typingConsole]);

	const showKeyboard = () => {
		setKeyboard(true);
	};

	const updateFilter = (filter: string) => {
		setFilter(filter);
	};

	const clearFilter = (e: React.MouseEvent<HTMLDivElement>) => {
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
				<div className="ButtonsBar" style={{ height: 45 }}>
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
				tabIndex={0}
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
