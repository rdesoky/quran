const appVersion = 39;
const appCacheId = `app.v${appVersion}`;
const assetsVersion = 1;
const assetsCacheId = `assets.v${assetsVersion}`;

const assetRoots = [location.origin /*, "https://www.everyayah.com/data"*/];
const cacheExcludes = ["browser-sync"]; //

const deleteOldCaches = async () => {
	const cacheNames = await caches.keys();
	const oldCacheNames = cacheNames.filter(
		(name) => name !== appCacheId && name !== assetsCacheId
	);
	await Promise.all(oldCacheNames.map((name) => caches.delete(name)));
};

const addResourcesToCache = async () => {
	const appManifest = await fetch("app-manifest.json")
		.then((res) => res.json())
		.catch(() => {
			console.error("Failed to fetch app-manifest.json");
			return {};
		});

	const appFiles = Object.values(appManifest.files).filter(
		(file) => !file.includes(".map")
	);

	const appCache = await caches.open(appCacheId);
	await appCache.addAll(appFiles);

	const publicManifest = await fetch("public-manifest.json").then((res) =>
		res.json()
	);
	const publicAssetsFiles = publicManifest.files.filter(
		(name) => !name.includes("sw.js")
	);
	const assetCache = await caches.open(assetsCacheId);
	await assetCache.addAll(publicAssetsFiles);
};

const putInCache = async (request, response) => {
	if (
		request.method !== "GET" ||
		response.status !== 200 ||
		!assetRoots.some((cacheBase) => request.url.startsWith(cacheBase))
	)
	{
		return;
	}
	if (cacheExcludes.some((exclude) => request.url.includes(exclude)))
	{
		return;
	}
	const assetCache = await caches.open(assetsCacheId);
	await assetCache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
	// First try to get the resource from the cache
	const responseFromCache = await caches.match(request);
	if (responseFromCache && responseFromCache.status === 200)
	{
		return responseFromCache;
	}

	// Next try to use the preloaded response, if it's there
	if (preloadResponsePromise)
	{
		const preloadResponse = await preloadResponsePromise;
		if (preloadResponse)
		{
			console.info("using preload response", preloadResponse);
			putInCache(request, preloadResponse.clone());
			return preloadResponse;
		}
	}

	// Next try to get the resource from the network
	try
	{
		const responseFromNetwork = await fetch(request);
		// response may be used only once
		// we need to save clone to put one copy in cache
		// and serve second one
		putInCache(request, responseFromNetwork.clone());
		return responseFromNetwork;
	} catch (_e)
	{
		const fallbackResponse = await caches.match(fallbackUrl);
		if (fallbackResponse)
		{
			return fallbackResponse;
		}
		// when even the fallback response is not available,
		// there is nothing we can do, but we must always
		// return a Response object
		return new Response("Network error happened", {
			status: 408,
			headers: { "Content-Type": "text/plain" },
		});
	}
};

const enableNavigationPreload = async () => {
	if (self.registration.navigationPreload)
	{
		// Enable navigation preloads!
		await self.registration.navigationPreload.enable();
	}
};

self.addEventListener("activate", (event) => {
	event.waitUntil(
		Promise.all([enableNavigationPreload(), deleteOldCaches()])
	);
});

self.addEventListener("install", (event) => {
	const cacheResources = addResourcesToCache();
	event.waitUntil(cacheResources);
	cacheResources.then(() => {
		self.skipWaiting();
	});
});

self.addEventListener("fetch", (event) => {
	const request =
		event.request.mode === "navigate"
			? new Request(location.origin + "/index.html")
			: event.request;

	event.respondWith(
		cacheFirst({
			request: request,
			preloadResponsePromise: event.preloadResponse,
			// fallbackUrl: "/images/offline.png",
		})
	);
});
