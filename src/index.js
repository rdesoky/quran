import { StrictMode } from "react";
import ReactDOM from "react-dom/client";
import "./index.scss";
import App from "./App";
import { register as registerSW } from "./sw-registration";
import { Provider } from "react-redux";
import { store } from "./store";
import { showToast } from "./store/uiSlice";

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
    onUpdate: (installingWorker) => {
        store.dispatch(showToast({ id: "sw_update", time: 10000 }));
    },
    onSuccess: () => {
        store.dispatch(showToast({ id: "sw_success", time: 5000 }));
    },
});
