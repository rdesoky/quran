import React, { useEffect, useState } from "react";
import "./App.scss";
import Pager, { PageRedirect } from "./components/Pager/Pager";
import {
	BrowserRouter as Router,
	Route,
	Redirect,
	Switch
} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import { IntlProvider, addLocaleData } from "react-intl";
import PopupView from "./components/Modal/PopupView";
import { withThemeContext } from "./context/Theme";
import AppProvider from "./context/App";
import AudioPlayer from "./components/AudioPlayer/AudioPlayer";

//import ar_strings from "./translations/ar.json"
//import en_strings from "./translations/en.json"

function App({ themeContext }) {
	const [locale, setLocale] = useState(localStorage.getItem("locale") || "ar");

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
			<div className={"App " + themeContext.theme + "Theme"}>
				<Router>
					<AppProvider>
						<Switch>
							<Route
								path={process.env.PUBLIC_URL + "/page/:page"}
								component={Pager}
							/>
							<Route
								path={process.env.PUBLIC_URL + "/sura/:sura/aya/:aya"}
								component={Pager}
							/>
							<Route
								path={process.env.PUBLIC_URL + "/aya/:aya"}
								component={PageRedirect}
							/>
							<Route
								render={() => {
									const defUrl = process.env.PUBLIC_URL + "/page/1";
									console.log(
										`PUBLIC_URL=${process.env.PUBLIC_URL}, To=${defUrl}`
									);
									return <Redirect to={defUrl} />;
								}}
							/>
						</Switch>
						<Sidebar />
						<PopupView />
						<AudioPlayer />
					</AppProvider>
				</Router>
			</div>
		</IntlProvider>
	);
}

export default withThemeContext(App);
