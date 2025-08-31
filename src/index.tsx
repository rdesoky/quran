import App from "@/App";
import "@/index.scss";
import { store } from "@/store/config";
import { setUpdateAvailable } from "@/store/uiSlice";
import { register as registerSW } from "@/sw-registration";
import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";

ReactDOM.createRoot(document.getElementById("root") || document.body).render(
	<StrictMode>
		<Provider store={store}>
			<App />
		</Provider>
	</StrictMode>
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
registerSW({
	onUpdate: () => {
		store.dispatch(setUpdateAvailable(true));
	},
	onSuccess: () => {
		// store.dispatch(showToast({ id: "sw_success", time: 5000 }));
	},
});

(async function () {
	if ("wakeLock" in navigator) {
		try {
			const wakeLock = await navigator.wakeLock.request("screen");
			// WakeLock is now active
			console.log("Wake Lock is active:", wakeLock);
			wakeLock.addEventListener("release", () => {
				console.log("Wake Lock was released");
			});
		} catch (e: unknown) {
			// Handle denied or failed request
			const err = e as Error;
			console.error(`${err.name}, ${err.message}`);
		}
	}
})();