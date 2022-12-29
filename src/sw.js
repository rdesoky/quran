/* eslint-disable no-restricted-globals */

const cacheId = "v1";

const cachedRoots = [location.origin, "https://www.everyayah.com/data"];
const cachedExcludes = ["browser-sync"];

const addResourcesToCache = async () => {
    const cache = await caches.open(cacheId);
    const assetManifest = await fetch("asset-manifest.json").then((res) =>
        res.json()
    );
    const assetFiles = Object.values(assetManifest.files).filter(
        (file) => !file.includes(".map")
    );
    const publicManifest = await fetch("public-manifest.json").then((res) =>
        res.json()
    );
    const publicAssetsFiles = publicManifest.files;

    const resources = [...assetFiles, ...publicAssetsFiles].map(
        (path) => location.origin + path
    );
    await cache.addAll(resources);
};

const putInCache = async (request, response) => {
    if (
        request.method !== "GET" ||
        !cachedRoots.some((cacheBase) => request.url.startsWith(cacheBase))
    ) {
        return;
    }
    if (cachedExcludes.some((exclude) => request.url.includes(exclude))) {
        return;
    }
    const cache = await caches.open(cacheId);
    await cache.put(request, response);
};

const cacheFirst = async ({ request, preloadResponsePromise, fallbackUrl }) => {
    // First try to get the resource from the cache
    const responseFromCache = await caches.match(request);
    if (responseFromCache) {
        return responseFromCache;
    }

    // Next try to use the preloaded response, if it's there
    const preloadResponse = await preloadResponsePromise;
    if (preloadResponse) {
        console.info("using preload response", preloadResponse);
        putInCache(request, preloadResponse.clone());
        return preloadResponse;
    }

    // Next try to get the resource from the network
    try {
        const responseFromNetwork = await fetch(request);
        // response may be used only once
        // we need to save clone to put one copy in cache
        // and serve second one
        putInCache(request, responseFromNetwork.clone());
        return responseFromNetwork;
    } catch (error) {
        const fallbackResponse = await caches.match(fallbackUrl);
        if (fallbackResponse) {
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
    if (self.registration.navigationPreload) {
        // Enable navigation preloads!
        await self.registration.navigationPreload.enable();
    }
};

self.addEventListener("activate", (event) => {
    event.waitUntil(enableNavigationPreload());
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
