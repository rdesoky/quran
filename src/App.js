import React, { useState, useEffect, useDeferredValue } from "react";
import "./App.scss";
import Pager, { PageRedirect } from "./components/Pager/Pager";
import {
    BrowserRouter as Router,
    Route,
    Redirect,
    Switch,
} from "react-router-dom";
import Sidebar from "./components/Sidebar/Sidebar";
import { IntlProvider, addLocaleData } from "react-intl";
import PopupView from "./components/Modal/PopupView";
import AppProvider from "./context/App";
import PlayerProvider from "./context/Player";
import firebase from "firebase";
import { analytics } from "./services/Analytics";
import { ToastMessage, ContextPopup, MessageBox } from "./components/Widgets";
import { useDispatch, useSelector } from "react-redux";
import {
    onResize,
    selectAppSize,
    selectLang,
    selectTheme,
} from "./store/appSlice";
import {
    setActivities,
    setBookmarks,
    setHifzRanges,
    setUserId,
} from "./store/userSlice";

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

function App() {
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
        addLocaleData(require(`react-intl/locale-data/${lang}`));
    }, [lang]);

    return (
        localeMessages && (
            <IntlProvider locale={lang} messages={localeMessages}>
                <div className={"App " + theme + "Theme"}>
                    <Router>
                        <AppProvider>
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
                        </AppProvider>
                    </Router>
                </div>
            </IntlProvider>
        )
    );
}

export default App;

function useInitApp() {
    const dispatch = useDispatch();
    const [user, setUser] = useState(null);

    useEffect(() => {
        const onStateChangeObserver = firebase
            .auth()
            .onAuthStateChanged((user) => {
                // this.setState({ user });
                if (user == null) {
                    //No user yet, signing in anonymously
                    firebase.auth().signInAnonymously();
                } else {
                    //signed in
                    setUser(user);
                    // dispatch(
                    //     readUserData(user, firebase.app().database().ref())
                    // );
                    // this.readFireData(user);
                    // console.log(`Logged in userId ${JSON.stringify(user)}`);
                }
            });
        return () => {
            onStateChangeObserver();
        };
    }, [dispatch]);

    useEffect(() => {
        if (!user) {
            return;
        }
        dispatch(setUserId(user.uid));
        const dbRef = firebase.app().database().ref();
        const userRef = dbRef.child(`data/${user.uid}`);
        const offBookmarksUpdate = userRef
            .child(`aya_marks`)
            ?.on("value", (snapshot) => {
                if (snapshot == null) {
                    return;
                }
                const snapshot_val = snapshot.val();
                const bookmarks = !snapshot_val
                    ? []
                    : Object.keys(snapshot_val)
                          .sort((k1, k2) =>
                              snapshot_val[k1] < snapshot_val[k2] ? -1 : 1
                          )
                          .map((k) => ({ aya: k, ts: snapshot_val[k] }));
                dispatch(setBookmarks({ bookmarks }));
            });

        const offHifzUpdate = userRef.child(`hifz`)?.on("value", (snapshot) => {
            if (!snapshot) {
                return;
            }
            const snapshot_val = snapshot.val();
            const hifzRanges = snapshot_val
                ? Object.keys(snapshot_val)
                      .sort((k1, k2) =>
                          snapshot_val[k1].ts < snapshot_val[k2].ts ? -1 : 1
                      )
                      .map((k) => {
                          const sura = parseInt(k.substr(3, 3));
                          const startPage = parseInt(k.substr(0, 3));
                          const hifzInfo = snapshot_val[k];
                          const pages = hifzInfo.pages;
                          const endPage = startPage + pages - 1;
                          return {
                              id: k,
                              sura,
                              startPage,
                              pages,
                              endPage,
                              date: hifzInfo.ts,
                              revs: hifzInfo.revs,
                          };
                      })
                : [];
            dispatch(setHifzRanges({ hifzRanges }));
        });

        const offActivityUpdate = userRef
            .child(`activity`)
            ?.on("value", (snapshot) => {
                if (!snapshot) {
                    return;
                }
                const snapshot_val = snapshot.val();
                const pages = snapshot_val
                    ? Object.keys(snapshot_val)
                          .sort((k1, k2) => (k1 < k2 ? 1 : -1))
                          .map((k) => {
                              return { day: k, pages: snapshot_val[k].pages };
                          })
                    : [];
                const chars = snapshot_val
                    ? Object.keys(snapshot_val)
                          .sort((k1, k2) => (k1 < k2 ? 1 : -1))
                          .map((k) => {
                              return { day: k, chars: snapshot_val[k].chars };
                          })
                    : [];
                dispatch(
                    setActivities({
                        daily: { chars, pages },
                    })
                );
            });

        return () => {
            offBookmarksUpdate?.();
            offHifzUpdate?.();
            offActivityUpdate?.();
        };
    }, [user]);
}
