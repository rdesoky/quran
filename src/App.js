import React, { useEffect } from "react";
import "./App.css";
import Pager from "./components/Pager/Pager";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";

function App() {
	useEffect(() => {
		window.addEventListener("selectstart", e => {
			e.preventDefault();
		});
	});

	const onSidebarCommand = id => {
		console.log(`Command ${id} invoked`);
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
		</div>
	);
}

export default App;
