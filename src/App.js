import React, { useEffect, useState } from "react";
import "./App.scss";
import Pager from "./components/Pager/Pager";
import { BrowserRouter as Router, Route, Redirect } from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import { IntlProvider, addLocaleData } from "react-intl";
import AppProvider from "./context/App";
import PopupView from "./components/Modal/PopupView";
//import ar_strings from "./translations/ar.json"
//import en_strings from "./translations/en.json"

function App() {
	// const [popup, updatePopup] = useState(null);
	const [locale, setLocale] = useState(localStorage.getItem("locale") || "ar");
	const [theme, setTheme] = useState(
		localStorage.getItem("theme") || "Default"
	);

	//Handles componentDidMount/unmount, props changes
	useEffect(() => {
		window.addEventListener("selectstart", e => {
			e.preventDefault();
		});
	});

	const locale_data = require(`react-intl/locale-data/${locale}`);

	addLocaleData(locale_data);

	const locale_messages = require(`./translations/${locale}.json`);

	return (
		<IntlProvider locale={locale} messages={locale_messages}>
			<div className={"App " + theme + "Theme"}>
				<Router>
					<AppProvider>
						<Route path="/page/:page" component={Pager} />
						<Route path="/sura/:sura/aya/:aya" component={Pager} />
						<Route
							path="/aya/:aya"
							render={() => {
								return <Redirect to="/page/6" />;
							}}
						/>
						<Route exact path="/" render={() => <Redirect to="/page/1" />} />
						<Sidebar />
						<PopupView />
					</AppProvider>
				</Router>
			</div>
		</IntlProvider>
	);
}

export default App;
