import { analytics as firebaseAnalytics } from "firebase";

export const analytics = {
    devMode: () => window.location.hostname === "localhost",
    //devMode: () => false,
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
        if (!analytics.devMode()) {
            firebaseAnalytics().logEvent(name, params);
        }
        return analytics;
    },
    setCurrentScreen: name => {
        console.log(`SetScreen '${name}'`);
        if (!analytics.devMode()) {
            firebaseAnalytics().setCurrentScreen(name);
        }
        return analytics;
    },
    setUserProps: props => {
        console.log(`SetUserProperties: ${JSON.stringify(props)}`);
        if (!analytics.devMode()) {
            firebaseAnalytics().setUserProperties(props);
        }
        return analytics;
    }
};
