const WASM_CACHE_NAME = "redline-pdf-wasm-v1";
const WASM_URL = new URL("./pdf-project_bg.wasm", import.meta.url).href;

export async function loadCachedWasm() {
  if (!("caches" in window)) {
    return fetch(WASM_URL);
  }

  const cache = await caches.open(WASM_CACHE_NAME);
  const cachedResponse = await cache.match(WASM_URL);
  if (cachedResponse) {
    return cachedResponse;
  }

  const response = await fetch(WASM_URL, { cache: "no-cache" });
  if (!response.ok) {
    throw new Error(`Unable to fetch WASM: ${response.status} ${response.statusText}`);
  }

  await cache.put(WASM_URL, response.clone());
  return response;
}
