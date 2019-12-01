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
import { ThemeConsumer } from "./context/Theme";
import AppProvider from "./context/App";
import PlayerProvider from "./context/Player";
import firebase from "firebase";
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
    appId: "1:922718582198:web:b2719fd5aa71596f"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

function App({ themeContext }) {
    const [locale, setLocale] = useState(
        localStorage.getItem("locale") || "ar"
    );

    //Handles componentDidMount/unmount, props changes
    useEffect(() => {
        window.addEventListener("selectstart", e => {
            e.preventDefault();
        });
    }, []);

    const locale_data = require(`react-intl/locale-data/${locale}`);

    addLocaleData(locale_data);

    const locale_messages = require(`./translations/${locale}.json`);

    return (
        <IntlProvider locale={locale} messages={locale_messages}>
            <div className={"App " + themeContext.theme + "Theme"}>
                <Router>
                    <AppProvider>
                        <SettingsProvider>
                            <PlayerProvider>
                                <Switch>
                                    <Route
                                        path={
                                            process.env.PUBLIC_URL +
                                            "/page/:page"
                                        }
                                        component={Pager}
                                    />
                                    <Route
                                        path={
                                            process.env.PUBLIC_URL +
                                            "/sura/:sura/aya/:aya"
                                        }
                                        component={Pager}
                                    />
                                    <Route
                                        path={
                                            process.env.PUBLIC_URL + "/aya/:aya"
                                        }
                                        component={PageRedirect}
                                    />
                                    <Route
                                        path={
                                            process.env.PUBLIC_URL + "/exercise"
                                        }
                                        component={Exercise}
                                    />
                                    <Route
                                        render={() => {
                                            const defUrl =
                                                process.env.PUBLIC_URL +
                                                "/page/1";
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

export default ThemeConsumer(App);
