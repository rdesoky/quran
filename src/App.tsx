import "@/App.scss";
import { Audio } from "@/components/Audio";
import { MessageBox } from "@/components/MessageBox";
import PopupView from "@/components/Modal/PopupView";
import Pager from "@/components/Pager/Pager";
import PageRedirect from "@/components/Pager/PageRedirect";
import Sidebar from "@/components/Sidebar/Sidebar";
import { ToastMessage } from "@/components/Widgets";
import SuraNames from "@/providers/SuraNames";
import RefsProvider from "@/RefsProvider";
import { analytics } from "@/services/analytics";
import { onResize, selectIsNarrow, selectZoomClass } from "@/store/layoutSlice";
import { selectLang, selectTheme } from "@/store/settingsSlice";
import useInitApp from "@/useInitApp";
import useWakeLock from "@/hooks/useWakeLock";
import firebase from "firebase";
import { useDeferredValue, useEffect, useState } from "react";
import { IntlProvider } from "react-intl";
import { useDispatch, useSelector } from "react-redux";
import { BrowserRouter, Navigate, Route, Routes } from "react-router";
import { ContextPopup } from "@/components/ContextPopup";
import { selectMaskOn } from "./store/navSlice";
import { useCheckForUpdate } from "./hooks/useCheckForUpdate";

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

// if (!analytics.devMode()) {
//     firebase.analytics();
// }

analytics.setCurrentScreen(window.location.pathname);
analytics.setUserProps({ web_user: "yes" });

const App: React.FC = () => {
	//Handles componentDidMount/unmount, props changes
	const isNarrow = useSelector(selectIsNarrow);
	const maskOn = useSelector(selectMaskOn);
	const [localeMessages, setLocaleMessages] = useState();
	const [windowSize, setWindowSize] = useState({
		width: window.innerWidth,
		height: window.innerHeight,
	});
	const deferredWindowSize = useDeferredValue(windowSize);
	// const app_size = useSelector(selectAppSize);
	const zoomClass = useSelector(selectZoomClass);
	useInitApp();
	useCheckForUpdate(10); //check for updates every 10 minutes

	// Keep screen awake while using the app
	useWakeLock({
		enabled: true,
		onAcquired: () => {
			console.log('Screen will stay awake while using Quran Hafiz');
		},
		onError: (error) => {
			console.warn('Wake lock not available:', error.message);
		}
	});

	// const themeContext = useContext(ThemeContext);
	// const lang = themeContext.lang;
	const dispatch = useDispatch();
	const lang = useSelector(selectLang);
	const theme = useSelector(selectTheme);

	// useEffect(() => {
	//     analytics.setParams({ app_size });
	// }, [app_size]);

	useEffect(() => {
		dispatch(onResize(deferredWindowSize));
		// console.log("App: onResize", deferredWindowSize);
	}, [deferredWindowSize, dispatch]);

	useEffect(() => {
		window.addEventListener("selectstart", (e: Event) => {
			e.preventDefault();
		});
		window.addEventListener("resize", (_e: UIEvent) => {
			const { innerWidth: width, innerHeight: height } = window;
			setWindowSize({ width, height });
		});
	}, [dispatch]);

	useEffect(() => {
		document.body.setAttribute("lang", lang);
		import(`@/translations/${lang}.json`).then((messages) => {
			setLocaleMessages(messages.default);
		});
		// addLocaleData(require(`react-intl/locale-data/${lang}`));
	}, [lang]);

	if (!localeMessages) {
		return null;
	}

	return (
		<IntlProvider locale={lang} messages={localeMessages}>
			<RefsProvider>
				<div className={
					`App ${theme}Theme`.appendWord(zoomClass)
						.appendWord("narrow", isNarrow)
						.appendWord("maskOn", maskOn)}>
					<BrowserRouter>
						<Routes>
							<Route
								path={import.meta.env.BASE_URL + "page/:page"}
								element={<Pager />}
							/>
							<Route
								path={
									import.meta.env.BASE_URL +
									"/sura/:sura/aya/:aya"
								}
								element={<Pager />}
							/>
							<Route
								path={import.meta.env.BASE_URL + "aya/:aya"}
								element={<PageRedirect />}
							/>
							<Route path="*" element={<DefaultRoute />} />
						</Routes>
						<PopupView />
						<MessageBox />
						<ContextPopup />
						<Sidebar />
						<Audio />
					</BrowserRouter>
				</div>
				<ToastMessage />
				<SuraNames />
			</RefsProvider>
		</IntlProvider>
	);
};

function DefaultRoute() {
	const activePage = Number(localStorage.getItem("activePage"));
	const activePageNumber =
		activePage <= 0 || isNaN(activePage) ? 1 : activePage;
	const defUrl = import.meta.env.BASE_URL + "page/" + activePageNumber;
	console.log(`BASE_URL=${import.meta.env.BASE_URL}, To=${defUrl}`);
	return <Navigate to={defUrl} replace={true} />;
}

export default App;
