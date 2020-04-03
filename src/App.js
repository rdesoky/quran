import React, { useState, useEffect, useContext } from "react";
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
import { ThemeConsumer, ThemeContext } from "./context/Theme";
import AppProvider from "./context/App";
import PlayerProvider from "./context/Player";
import firebase from "firebase";
import { analytics } from "./services/Analytics";
import Exercise from "./components/Modal/Exercise";
import { ToastMessage, ContextPopup, MessageBox } from "./components/Widgets";
import { SettingsProvider } from "./context/Settings";

//import ar_strings from "./translations/ar.json"
//import en_strings from "./translations/en.json"

// Firebase configuration
const firebaseConfig = {
	//     apiKey: "AIzaSyBBYAgJDBm7AYe2bSy96E-yBsD8O-9UeHw",
	apiKey: "AIzaSyB7RhZMVC_PGW3YmkN_adAvsVeOYvz0Kkg",
	authDomain: "quran-hafiz.firebaseapp.com",
	databaseURL: "https://quran-hafiz.firebaseio.com",
	projectId: "quran-hafiz",
	storageBucket: "quran-hafiz.appspot.com",
	messagingSenderId: "922718582198",
	appId: "1:922718582198:web:b2719fd5aa71596f",
	measurementId: "G-XZ7PLZ8DY3"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);
if (!analytics.devMode()) {
	firebase.analytics();
}

analytics.setCurrentScreen(window.location.pathname);
analytics.setUserProps({ web_user: "yes" });
// analytics.logEvent("page_view");

function App({}) {
	//Handles componentDidMount/unmount, props changes
	const [localeMessages, setLocaleMessages] = useState({});

	const themeContext = useContext(ThemeContext);
	const lang = themeContext.lang;

	useEffect(() => {
		window.addEventListener("selectstart", e => {
			e.preventDefault();
		});
	}, []);

	// const localeMessages = require(`./translations/${lang}.json`);
	//const localeData = require(`react-intl/locale-data/${lang}`);

	useEffect(() => {
		document.body.dir = lang == "en" ? "ltr" : "rtl";
		setLocaleMessages(require(`./translations/${lang}.json`));
		// setLocaleData(require(`react-intl/locale-data/${lang}`));
		addLocaleData(require(`react-intl/locale-data/${lang}`));
	}, [themeContext.lang, lang]);

	return (
		<IntlProvider locale={lang} messages={localeMessages}>
			<div className={"App " + themeContext.theme + "Theme"}>
				<Router>
					<AppProvider>
						<SettingsProvider>
							<PlayerProvider>
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
								<ToastMessage />
								<ContextPopup />
								<MessageBox />
							</PlayerProvider>
						</SettingsProvider>
					</AppProvider>
				</Router>
			</div>
		</IntlProvider>
	);
}

export default App;
