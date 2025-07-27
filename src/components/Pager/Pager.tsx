import DDrop from "@/components/DDrop";
import Page from "@/components/Page/Page";
import PageFooter from "@/components/Page/PageFooter";
import { useAudio, useContextPopup, useMessageBox } from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import { ayaIdPage, getPageFirstAyaId, TOTAL_VERSES } from "@/services/qData";
import {
	checkActiveInput,
	copy2Clipboard,
	downloadPageImage,
	keyValues,
} from "@/services/utils";
import {
	selectActivePage,
	selectIsNarrow,
	selectPagerWidth,
	selectPagesCount,
	selectPageWidth,
	selectShownPages,
	selectZoomLevels,
	setActivePageIndex,
	toggleZoom
} from "@/store/layoutSlice";
import {
	extendSelection,
	gotoAya,
	gotoPage,
	hideMask,
	offsetPage,
	offsetSelection,
	selectMaskShift,
	selectMaskStart,
	selectSelectedText,
	selectStartSelection,
	setSelectedAya,
	setSelectStart,
	startMask,
} from "@/store/navSlice";
import {
	closePopup,
	closePopupIfBlocking,
	selectMenuExpanded,
	selectModalPopup,
	selectPopup,
	showMenu,
	showPopup,
	showToast,
	toggleMenu,
} from "@/store/uiSlice";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { FormattedMessage as Message, useIntl } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { useLocation, useParams } from "react-router";

import { AddHifz } from "@/components/AddHifz";
import "@/components/Pager/Pager.scss";
import PlayPrompt from "@/components/PlayPrompt";
import { useHistory } from "@/hooks/useHistory";
import { AppDispatch } from "@/store/config";
import { AudioState, selectAudioState } from "@/store/playerSlice";
import { PageHeader } from "./PageHeader";

export default function Pager() {
	const pagesCount = useSelector(selectPagesCount);
	const pageWidth = useSelector(selectPageWidth);
	const pagerWidth = useSelector(selectPagerWidth);
	const dispatch = useDispatch() as AppDispatch;
	const isNarrow = useSelector(selectIsNarrow);
	const expandedMenu = useSelector(selectMenuExpanded);
	const activePopup = useSelector(selectPopup);
	const modalPopup = useSelector(selectModalPopup);
	const history = useHistory();
	const selectStart = useSelector(selectStartSelection);
	const maskStart = useSelector(selectMaskStart);
	const contextPopup = useContextPopup();
	const msgBox = useMessageBox();
	const selectedText = useSelector(selectSelectedText);
	const maskShift = useSelector(selectMaskShift);
	const params = useParams<{ page: string }>();
	const shownPages = useSelector(selectShownPages);
	const activePage = useSelector(selectActivePage);
	const location = useLocation();
	const [loading, setLoading] = useState(true);
	const popup = useSelector(selectPopup);
	const pagerRef = useRef<HTMLDivElement>(null);
	const intl = useIntl();
	const audio = useAudio();
	const audioState = useSelector(selectAudioState);

	useEffect(() => {
		if (loading && activePage !== -1) {
			const savedActiveAya = Number(localStorage.getItem("activeAya"));

			dispatch(
				setSelectedAya(
					!isNaN(savedActiveAya)
						? savedActiveAya
						: getPageFirstAyaId(activePage)
				)
			);
			setLoading(false);
		}
	}, [loading, activePage, dispatch]);

	useEffect(() => {
		if (!loading) {
			localStorage.setItem("activeAya", String(selectStart));
		}
	}, [selectStart, loading]);

	useEffect(() => {
		if (params.page && Number(params.page) >= 1) {
			dispatch(setActivePageIndex(Number(params.page) - 1));
			localStorage.setItem("activePage", params.page);
		}
	}, [dispatch, params?.page]);

	useEffect(() => {
		analytics.setCurrentScreen(location.pathname);
	}, [location]);

	const pageUp = useCallback(
		(bottom = false) => {
			let count = pagesCount;
			if (count > 1 && activePage % 2 === 0) {
				count = 1; //right page is active
			}
			dispatch(offsetPage(history, -count));
			analytics.logEvent("nav_prev_page");
			const viewRef = pagerRef.current;
			viewRef?.scrollTo?.({
				top: bottom ? viewRef?.scrollHeight - viewRef?.clientHeight : 0,
			});
		},
		[dispatch, history, activePage, pagesCount]
	);

	const pageDown = useCallback(() => {
		// let count = activePopup && !isWide ? 1 : pagesCount;
		let count = pagesCount;
		if (count > 1 && activePage % 2 === 1) {
			count = 1; //left page is active
		}
		dispatch(offsetPage(history, count));
		analytics.logEvent("nav_next_page");
		pagerRef.current?.scrollTo?.({ top: 0 });
	}, [dispatch, history, activePage, pagesCount]);

	//ComponentDidUpdate
	useEffect(() => {
		//cache next pages
		if (pagesCount === 1) {
			downloadPageImage(activePage + 1).catch((e) => { });
		} else {
			downloadPageImage(activePage + 2).catch((e) => { });
			downloadPageImage(activePage + 3).catch((e) => { });
		}
	}, [pagesCount, activePage]);

	const handleWheel = (e: React.WheelEvent<HTMLDivElement>) => {
		let viewRef = pagerRef.current;
		const LINE_HEIGHT = 12;
		//Check if page next or prev to active page is in the view

		if (viewRef && e.deltaY > 0) {
			const { scrollHeight, clientHeight, scrollTop } = viewRef;
			if (
				Number(scrollTop) + LINE_HEIGHT >=
				Number(scrollHeight) - Number(clientHeight)
			) {
				analytics.setTrigger("mouse_wheel");
				//scroll down ( forward )
				setTimeout(() => {
					viewRef.scrollTo?.({ top: 0, behavior: "smooth" });
				}, 10);
				if (shownPages.includes(activePage + 1)) {
					dispatch(setActivePageIndex(activePage + 1));
					console.log(`~~scrollForward`);
					return;
				}

				pageDown();
			}
		} else if (pagerRef.current?.scrollTop === 0) {
			//scroll up ( backward )
			if (viewRef?.scrollTop === 0) {
				analytics.setTrigger("mouse_wheel");
				setTimeout(() =>
					viewRef.scrollTo?.({
						top: viewRef.scrollHeight - viewRef.clientHeight,
						behavior: "smooth",
					})
				);
				if (shownPages.includes(activePage - 1)) {
					dispatch(setActivePageIndex(activePage - 1));
					console.log(`~~scrollBackward`);
					return;
				}
				pageUp(true);
			}
		}
	};

	const onOffsetSelection = useCallback(
		(shiftKey: boolean, offset: number) => {
			let selectedAyaId;
			if (shiftKey) {
				selectedAyaId = dispatch(extendSelection(selectStart + offset));
			} else {
				selectedAyaId = dispatch(offsetSelection(offset));
			}
			// dispatch(gotoAya(history, selectedAyaId));
			dispatch(setSelectStart(selectedAyaId));
			// const page = ayaIdPage(selectedAyaId);
			// if (maskStart !== -1 && getPageFirstAyaId(page) === selectedAyaId) {
			//     return;
			// }
			dispatch(gotoPage(history, ayaIdPage(selectedAyaId)));
		},
		[dispatch, history, selectStart]
	);

	const incrementMask = useCallback(() => {
		const incrementedMask = maskStart + 1;
		if (incrementedMask >= TOTAL_VERSES) {
			dispatch(hideMask());
			return;
		}
		const incrementedMaskPage = ayaIdPage(incrementedMask);
		if (activePage === incrementedMaskPage) {
			dispatch(gotoAya(history, dispatch(offsetSelection(1))));
			return;
		} else {
			const pageFirstAya = getPageFirstAyaId(incrementedMaskPage);
			if (maskStart === pageFirstAya) {
				dispatch(
					gotoPage(history, incrementedMaskPage, {
						sel: true,
					})
				);
				return; //mask head page is not visible
			}
		}
		dispatch(setSelectStart(dispatch(offsetSelection(1))));
	}, [activePage, dispatch, history, maskStart]);

	const decrementMask = useCallback(() => {
		if (maskStart > 0) {
			const maskPage = ayaIdPage(maskStart - 1);
			if (shownPages.includes(maskPage)) {
				dispatch(gotoAya(history, dispatch(offsetSelection(-1))));
				return;
			} else {
				dispatch(gotoPage(history, maskPage, { sel: false }));
				const viewRef = pagerRef.current;
				viewRef?.scrollTo?.({
					top: viewRef?.scrollHeight - viewRef?.clientHeight,
					behavior: "smooth",
				});
				return; //mask head page is not visible
			}
		}
		dispatch(setSelectStart(dispatch(offsetSelection(-1)))); //soft selection
	}, [dispatch, history, maskStart, shownPages]);

	const onArrowKey = useCallback(
		(shiftKey: boolean, direction: "up" | "down") => {
			const { isTextInput } = checkActiveInput();

			if (!isTextInput) {
				if (direction === "down") {
					analytics.setTrigger("down_key");
					if (!maskShift && maskStart !== -1) {
						incrementMask();
					} else {
						onOffsetSelection(shiftKey, 1);
					}
					analytics.logEvent("nav_next_verse", {});
				} else {
					analytics.setTrigger("up_key");
					if (maskStart !== -1 && !maskShift) {
						decrementMask();
					} else {
						onOffsetSelection(shiftKey, -1);
					}
					analytics.logEvent("nav_prev_verse", {});
				}
			}
		},
		[decrementMask, incrementMask, maskShift, maskStart, onOffsetSelection]
	);

	const handleKeyDown = useCallback(
		(e: KeyboardEvent) => {
			const { isTextInput } = checkActiveInput();

			const vEditorOn =
				activePopup &&
				["Search", "Indices", "Exercise"].includes(activePopup);

			const canShowPopup = activePopup === null && isTextInput === false;

			if (modalPopup || msgBox.getMessages().length > 0) {
				return;
			}
			e.stopPropagation();

			switch (e.code) {
				case "Slash":
					if (canShowPopup && !vEditorOn) {
						dispatch(showPopup("Help"));
					}
					break;

				case "KeyU":
					if (canShowPopup && !vEditorOn) {
						dispatch(showPopup("Profile"));
					}
					break;
				case "KeyC":
					if (!vEditorOn) {
						copy2Clipboard(selectedText);
						dispatch(showToast({ id: "text_copied" }));
						//     // app.pushRecentCommand("Copy");
					}
					break;
				case "KeyS":
				case "KeyR":
					if (!vEditorOn) {
						msgBox.set({
							title: (
								<Message id="play" values={keyValues("r")} />
							),
							content: (
								<PlayPrompt
									{...{
										trigger: "keyboard",
										showReciters: false,
									}}
								/>
							),
						});
					}
					break;
				case "KeyP":
					if (!vEditorOn) {
						if (audioState === AudioState.playing) {
							audio.pause();
						} else {
							audio.resume();
						}
					}
					break;
				case "KeyZ":
					if (!vEditorOn) {
						dispatch(toggleZoom());
					}
					break;
				case "Escape":
					if (contextPopup.info) {
						contextPopup.close();
					} else if (msgBox.getMessages().length > 0) {
						msgBox.pop();
					} else if (activePopup !== null) {
						dispatch(closePopup());
					} else if (expandedMenu) {
						dispatch(showMenu(false));
						// app.setExpandedMenu(false);
					} else if (maskStart !== -1) {
						// app.hideMask();
						dispatch(hideMask());
					}
					break;
				case "KeyI":
					if (!vEditorOn && canShowPopup) {
						dispatch(showPopup("Indices"));
					}
					break;
				case "KeyG":
					if (!vEditorOn && canShowPopup) {
						dispatch(showPopup("Goto"));
					}
					break;
				case "KeyX":
					if (!vEditorOn && canShowPopup) {
						dispatch(showPopup("Exercise"));
					}
					break;
				case "KeyB":
					if (!vEditorOn && canShowPopup) {
						dispatch(showPopup("Bookmarks"));
					}
					break;
				case "KeyO":
					if (!vEditorOn && canShowPopup) {
						dispatch(showPopup("Settings"));
					}
					break;
				case "KeyF":
					if (!vEditorOn && canShowPopup) {
						dispatch(showPopup("Search"));
					}
					break;
				case "KeyA":
					if (!popup && !vEditorOn) {
						dispatch(toggleMenu());
					}
					break;
				case "KeyH":
					if (!vEditorOn) {
						msgBox.set({
							title: <Message id="update_hifz" />,
							content: <AddHifz />,
						});
						dispatch(closePopupIfBlocking());
					}
					break;
				case "KeyT":
					if (!vEditorOn && canShowPopup) {
						dispatch(showPopup("Tafseer"));
					}
					break;
				case "KeyM":
					if (!vEditorOn) {
						dispatch(startMask(history));
						// app.setMaskStart();
					}
					break;
				case "ArrowDown":
					onArrowKey(e.shiftKey, "down");
					break;
				case "ArrowUp":
					onArrowKey(e.shiftKey, "up");
					break;
				case "ArrowLeft":
					analytics.setTrigger("left_key");
					pageDown();
					break;
				case "PageDown":
					if (!isTextInput) {
						analytics.setTrigger("page_down_key");
						pageDown();
					}
					break;
				case "ArrowRight":
					analytics.setTrigger("right_key");
					pageUp();
					break;
				case "PageUp":
					if (!isTextInput) {
						analytics.setTrigger("page_up_key");
						pageUp();
					}
					break;
				default:
					return;
			}
			if (!isTextInput) {
				e.preventDefault();
			}
		},
		[
			activePopup,
			modalPopup,
			selectedText,
			dispatch,
			audio,
			audioState,
			contextPopup,
			expandedMenu,
			maskStart,
			popup,
			msgBox,
			onArrowKey,
			pageDown,
			pageUp,
			history,
		]
	);

	useEffect(() => {
		// page = match.params.page;
		document.addEventListener("keydown", handleKeyDown);
		return () => {
			document.removeEventListener("keydown", handleKeyDown);
		};
	}, [
		params.page,
		activePopup,
		maskStart,
		selectStart,
		expandedMenu,
		handleKeyDown,
	]);

	return (
		<>
			<div className="PagerHeader" style={{ width: pagerWidth }}>
				<PageHeader
					order={0}
				/>
				{shownPages.length > 1 && (
					<PageHeader
						order={1}
					/>
				)}
			</div>
			<DDrop
				maxShift={200}
				dropShift={50}
				onDrop={({ dX, dY }: { dX: number; dY: number }) => {
					if (dX > 50) {
						analytics.setTrigger("dragging");
						pageDown();
					}
					if (dX < -50) {
						analytics.setTrigger("dragging");
						pageUp();
					}
				}}
			>
				{({ dX, dY }: { dX: number; dY: number }) => {
					//Shrink the width using the scaling
					// const angle = (90 * (pageWidth - Math.abs(dX))) / pageWidth;
					// const scaleX = 1 - accel; //(pageWidth - Math.abs(dX)) / pageWidth; // * accel;
					// const shiftX = dX * accel;
					const scaleX = (pageWidth - Math.abs(dX)) / pageWidth; // * accel;
					// const angle = 90 * scaleX;
					// const accel = Math.cos(angle2Radians(angle));
					const shiftX = dX * scaleX; //accel;
					// (accel * (pageWidth - Math.abs(dX))) / pageWidth;
					// console.log(
					//     `dX:${dX}, Sh:${shiftX} Sc:${scaleX} Wd:${pageWidth}`
					// );
					const firstPageShiftX =
						pagesCount === 1 ? shiftX : shiftX < 0 ? shiftX : 0;
					const firstPageScaleX =
						pagesCount === 1 ? scaleX : shiftX < 0 ? scaleX : 1;
					const secondPageShiftX = shiftX > 0 ? shiftX : 0;
					const secondPageScaleX = shiftX > 0 ? scaleX : 1;

					return (
						<div
							ref={pagerRef}
							className={"Pager" + (isNarrow ? " narrow" : "")}
							onWheel={handleWheel}
							style={{
								width: pagerWidth,
							}}
						>
							<Page
								order={0}
								scaleX={firstPageScaleX}
								shiftX={firstPageShiftX}
								incrementMask={incrementMask}
							/>
							<Page
								order={1}
								scaleX={secondPageScaleX}
								shiftX={secondPageShiftX}
								incrementMask={incrementMask}
							/>
						</div>
					);
				}}
			</DDrop>
			<div className="PagerFooter" style={{ width: pagerWidth }}>
				<PageFooter
					index={shownPages[0]}
					order={0}
					onArrowKey={onArrowKey}
					onPageUp={pageUp}
					onPageDown={pageDown}
				/>
				{shownPages.length > 1 && (
					<PageFooter
						index={shownPages[1]}
						order={1}
						onArrowKey={onArrowKey}
						onPageUp={pageUp}
						onPageDown={pageDown}
					/>
				)}
			</div>
		</>
	);
}
