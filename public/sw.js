/* eslint-disable no-restricted-globals */

const version = "%VERSION%";
const cacheId = "v1";

const cachedRoots = [location.origin, "https://www.everyayah.com/data"];
const prefetchResources = ["/index.html"];

const addResourcesToCache = async (resources) => {
    const cache = await caches.open(cacheId);
    await cache.addAll(resources);
    await new Promise((resolve, reject) => {
        setTimeout(resolve, 5000);
    });
};

const putInCache = async (request, response) => {
    if (
        request.method !== "GET" ||
        !cachedRoots.some((cacheBase) => request.url.startsWith(cacheBase))
    ) {
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
    event.waitUntil(
        addResourcesToCache(
            prefetchResources.map((path) => location.origin + path)
        )
    );
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

self.addEventListener("skipWait", () => {
    self.skipWaiting();
});
