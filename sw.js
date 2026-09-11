/* Audrey Closet v13.24 — stable service-worker entry shim
 * Preserves the historical registration URL while delegating all caching and
 * offline behavior to the v13.24 production service worker.
 */
importScripts('./sw-v13.24-release.js');
