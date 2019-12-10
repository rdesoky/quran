import { analytics as firebaseAnalytics } from "firebase";

export const analytics = {
    params: { trigger: "session_start", app_size: "two_pages" },
    setTrigger: trigger => {
        return analytics.setParams({ trigger });
    },
    setParams: params => {
        console.log(`setParams ->${JSON.stringify(params)}`);
        analytics.params = { ...analytics.params, ...params };
        return analytics;
    },
    logEvent: (name, payload = {}) => {
        const params = { ...analytics.params, ...payload };
        console.log(`Post '${name}'->${JSON.stringify(params)}`);
        if (window.location.hostname === "localhost") {
            return analytics;
        }
        firebaseAnalytics().logEvent(name, params);
        return analytics;
    },
    setCurrentScreen: name => {
        console.log(`SetScreen '${name}'`);
        if (window.location.hostname === "localhost") {
            return analytics;
        }
        firebaseAnalytics().setCurrentScreen(name);
        return analytics;
    }
};
