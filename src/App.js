import React, { useEffect } from "react";
import "./App.css";
import Pager from "./components/Pager/Pager";

function App() {
	useEffect(() => {
		window.addEventListener("selectstart", e => {
			e.preventDefault();
		});
	});

	return (
		<div className="App">
			<Pager number="0" />
		</div>
	);
}

export default App;
