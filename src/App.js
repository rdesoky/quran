import React, { useEffect } from "react";
import "./App.css";
import Pager from "./components/Pager/Pager";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";

function App() {
	useEffect(() => {
		window.addEventListener("selectstart", e => {
			e.preventDefault();
		});
	});

	return (
		<div className="App">
			<Router>
				<Route path="/page/:page" component={Pager} />
				<Route path="/sura/:sura/aya/:aya" component={Pager} />
				<Route path="/aya/:aya" component={Pager} />
				<Route exact path="/" render={() => <Redirect to="/page/0" />} />
			</Router>
		</div>
	);
}

export default App;
