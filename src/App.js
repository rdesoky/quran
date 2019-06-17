import React, { useEffect, useState } from "react";
import "./App.scss";
import Pager from "./components/Pager/Pager";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import GotoPage from "./components/Sidebar/GotoPage";
import QIndex from "./components/Sidebar/QIndex";

function App() {
	const [popup, updatePopup] = useState(null);

	//Handles componentDidMount/unmount, props changes
	useEffect(() => {
		window.addEventListener("selectstart", e => {
			e.preventDefault();
		});
	});

	const onSidebarCommand = id => {
		console.log(`Command ${id} invoked`);
		updatePopup(id);
	};

	const onClosePopup = () => {
		updatePopup(null);
	};

	const renderPopup = () => {
		switch (popup) {
			case "Find":
				return <GotoPage onClose={onClosePopup} open={popup === "Find"} />;
			case "QIndex":
				return <QIndex onClose={onClosePopup} open={popup === "QIndex"} />;
			default:
				return null;
		}
	};

	return (
		<div className="App">
			<Router>
				<Route path="/page/:page" component={Pager} />
				<Route path="/sura/:sura/aya/:aya" component={Pager} />
				<Route path="/aya/:aya" component={Pager} />
				<Route exact path="/" render={() => <Redirect to="/page/1" />} />
				<Sidebar onCommand={onSidebarCommand} />
				{renderPopup()}
			</Router>
		</div>
	);
}

export default App;
