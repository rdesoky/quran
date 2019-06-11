import React, { useEffect, useState } from "react";
import "./App.css";
import Pager from "./components/Pager/Pager";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import GotoPage from "./components/Sidebar/GotoPage";

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
		updatePopup("GotoPage");
	};

	const onClosePopup = () => {
		updatePopup(null);
	};

	const renderPopup = Popup => {
		switch (Popup) {
			case "GotoPage":
				return <GotoPage onClose={onClosePopup} />;
		}
	};

	return (
		<div className="App">
			<Router>
				<Route path="/page/:page" component={Pager} />
				<Route path="/sura/:sura/aya/:aya" component={Pager} />
				<Route path="/aya/:aya" component={Pager} />
				<Route exact path="/" render={() => <Redirect to="/page/0" />} />
			</Router>
			<Sidebar onCommand={onSidebarCommand} />
			{renderPopup(popup)}
		</div>
	);
}

export default App;
