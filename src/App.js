import firebase from "firebase";
import React, { useDeferredValue, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import {
    BrowserRouter as Router,
    Redirect,
    Route,
    Switch,
} from "react-router-dom";
import { Audio } from "./components/Audio";
import { ContextPopup } from "./components/ContextPopup";
import { MessageBox } from "./components/MessageBox";
import PopupView from "./components/Modal/PopupView";
import Pager, { PageRedirect } from "./components/Pager/Pager";
import Sidebar from "./components/Sidebar/Sidebar";
import { ToastMessage } from "./components/Widgets";
import RefsProvider from "./RefsProvider";
import { analytics } from "./services/Analytics";
import { onResize, selectAppSize } from "./store/layoutSlice";
import { selectLang, selectTheme } from "./store/settingsSlice";
import useInitApp from "./useInitApp";
import "./App.scss";

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
    measurementId: "G-XZ7PLZ8DY3",
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

if (!analytics.devMode()) {
    firebase.analytics();
}

analytics.setCurrentScreen(window.location.pathname);
analytics.setUserProps({ web_user: "yes" });

// analytics.logEvent("page_view");

export default function App() {
    //Handles componentDidMount/unmount, props changes
    const [localeMessages, setLocaleMessages] = useState();
    const [windowSize, setWindowSize] = useState({
        width: window.innerWidth,
        height: window.innerHeight,
    });
    const deferredWindowSize = useDeferredValue(windowSize);
    const app_size = useSelector(selectAppSize);
    useInitApp();

    // const themeContext = useContext(ThemeContext);
    // const lang = themeContext.lang;
    const dispatch = useDispatch();
    const lang = useSelector(selectLang);
    const theme = useSelector(selectTheme);

    useEffect(() => {
        analytics.setParams({ app_size });
    }, [app_size]);

    useEffect(() => {
        dispatch(onResize(deferredWindowSize));
        console.log("App: onResize", deferredWindowSize);
    }, [deferredWindowSize, dispatch]);

    useEffect(() => {
        window.addEventListener("selectstart", (e) => {
            e.preventDefault();
        });
        window.addEventListener("resize", (e) => {
            const { innerWidth: width, innerHeight: height } = e.target;
            setWindowSize({ width, height });
        });
    }, [dispatch]);

    useEffect(() => {
        document.body.dir = lang === "en" ? "ltr" : "rtl";
        setLocaleMessages(require(`./translations/${lang}.json`));
        // addLocaleData(require(`react-intl/locale-data/${lang}`));
    }, [lang]);

    return (
        localeMessages && (
            <IntlProvider locale={lang} messages={localeMessages}>
                <RefsProvider>
                    <div className={"App " + theme + "Theme"}>
                        <Router>
                            <Switch>
                                <Route
                                    path={
                                        process.env.PUBLIC_URL + "/page/:page"
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
                                    path={process.env.PUBLIC_URL + "/aya/:aya"}
                                    component={PageRedirect}
                                />
                                <Route
                                    render={() => {
                                        const defUrl =
                                            process.env.PUBLIC_URL + "/page/1";
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
                            <Audio />
                        </Router>
                    </div>
                </RefsProvider>
            </IntlProvider>
        )
    );
}

export const quranText = [];

fetch(`${process.env.PUBLIC_URL}/quran.txt`)
    .then((results) => results.text())
    .then((text) => {
        quranText.push(...text.split("\n"));
    })
    .catch((e) => {});

export const quranNormalizedText = [];

fetch(`${process.env.PUBLIC_URL}/normalized_quran.txt`)
    .then((results) => results.text())
    .then((text) => {
        quranNormalizedText.push(...text.split("\n"));
    })
    .catch((e) => {});
