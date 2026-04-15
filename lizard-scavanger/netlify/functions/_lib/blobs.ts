import { getStore } from "@netlify/blobs";

export const inboxStore = () => getStore({ name: "inbox", consistency: "strong" });
export const namesStore = () => getStore({ name: "names", consistency: "strong" });
export const progressStore = () => getStore({ name: "progress", consistency: "strong" });
export const ratelimitStore = () => getStore({ name: "ratelimit", consistency: "strong" });
