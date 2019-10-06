import React, { useEffect, useState } from "react";
import { FormattedMessage as String } from "react-intl";
import firebase from "firebase";
import { AppConsumer } from "../../context/App";
import QData from "../../services/QData";

const Bookmarks = ({ app }) => {
	const { user, bookmarks } = app;

	const gotoAya = ({ target }) => {
		const aya = parseInt(target.getAttribute("aya"));
		app.gotoAya(aya, { sel: true });
	};

	const renderBookmarks = () => {
		if (!bookmarks.length) {
			return <div>Nothing recorded</div>;
		}
		return (
			<div
				style={{
					columnCount: Math.floor((app.popupWidth() - 50) / 240) //-50px margin
				}}
			>
				<String id="sura_names">
					{sura_names => (
						<String id="verse">
							{verse =>
								bookmarks.map(bookmark => (
									<button
										aya={bookmark.aya}
										key={bookmark.aya}
										onClick={gotoAya}
										style={{
											width: "100%",
											textAlign: "inherit",
											padding: 10
										}}
									>
										{sura_names.split(",")[QData.ayaIdInfo(bookmark.aya).sura] +
											" (" +
											verse +
											" " +
											(QData.ayaIdInfo(bookmark.aya).aya + 1) +
											")"}
									</button>
								))
							}
						</String>
					)}
				</String>
			</div>
		);
	};

	const renderLogin = () => {
		return (
			<div>
				<button onClick={e => app.setPopup("Profile")}>Please Login</button>
			</div>
		);
	};

	return (
		<>
			<div className="Title">
				<String id="bookmarks" />
			</div>
			<div className="PopupBody" style={{ maxHeight: app.appHeight - 85 }}>
				{renderBookmarks()}
			</div>
		</>
	);
};

export default AppConsumer(Bookmarks);
