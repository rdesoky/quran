import { analytics as firebaseAnalytics } from "firebase";

export const analytics = {
    params: { trigger: "session_start" },
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
        firebaseAnalytics().logEvent(name, params);
        console.log(`Post '${name}'->${JSON.stringify(params)}`);
        return analytics;
    },
    setCurrentScreen: name => {
        console.log(`SetScreen '${name}'`);
        firebaseAnalytics().setCurrentScreen(name);
        return analytics;
    }
};
