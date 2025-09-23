import { useEffect } from "react";

export const useCheckForUpdate = (mins: number) => {

	useEffect(() => {
		const checkForUpdates = () => {
			if ('serviceWorker' in navigator) {
				console.log("useCheckForUpdate: service worker supported");
				navigator.serviceWorker.getRegistration().then(registration => {
					if (registration) {
						console.log("useCheckForUpdate: Checking for updates...");
						registration.update();
					} else {
						console.log("useCheckForUpdate: No service worker registration found.");
					}
				});
			} else {
				console.log("useCheckForUpdate: Service workers are not supported in this browser.");
			}
		};

		const intervalId = setInterval(checkForUpdates, mins * 60 * 1000);

		return () => clearInterval(intervalId); // Cleanup on unmount
	}, [mins]);

};