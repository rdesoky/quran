import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import { Provider } from "react-redux";
import App from "./App";
import "./index.scss";
import { store } from "./store";
import { setUpdateAvailable } from "./store/uiSlice";
import { register as registerSW } from "./sw-registration";

ReactDOM.createRoot(document.getElementById("root")).render(
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
