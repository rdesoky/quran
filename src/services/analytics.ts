import firebase from "firebase/";

export const analytics = {
	devMode: () =>
		window.location.hostname === "localhost" ||
		localStorage.getItem("dev") === "1",
	//devMode: () => false,
	params: { trigger: "session_start", app_size: "two_pages" },
	setTrigger: (trigger: string) => {
		return analytics.setParams({ trigger });
	},
	setParams: (params: Record<string, unknown>) => {
		// console.log(`setParams ->${JSON.stringify(params)}`);
		analytics.params = { ...analytics.params, ...params };
		return analytics;
	},
	logEvent: (name: string, payload: Record<string, unknown> = {}) => {
		const params = { ...analytics.params, ...payload };
		// console.log(`Post '${name}'->${JSON.stringify(params)}`);
		if (!analytics.devMode()) {
			firebase.analytics().logEvent(name, params);
		}
		return analytics;
	},
	setCurrentScreen: (name: string) => {
		// console.log(`SetScreen '${name}'`);
		if (!analytics.devMode()) {
			firebase.analytics().setCurrentScreen(name);
		}
		return analytics;
	},
	setUserProps: (props: Record<string, unknown>) => {
		// console.log(`SetUserProperties: ${JSON.stringify(props)}`);
		if (!analytics.devMode()) {
			firebase.analytics().setUserProperties(props);
		}
		return analytics;
	},
};
