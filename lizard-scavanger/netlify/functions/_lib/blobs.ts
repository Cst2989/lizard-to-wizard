import { getStore } from "@netlify/blobs";

// Classic Netlify Functions don't auto-inject the Blobs context. We pass
// siteID + a PAT so the SDK can authenticate directly. Set NETLIFY_PAT in
// Netlify env vars (generate one at
// https://app.netlify.com/user/applications#personal-access-tokens).
function store(name: string) {
  const siteID = process.env.SITE_ID;
  const token = process.env.NETLIFY_PAT;
  if (siteID && token) {
    return getStore({ name, siteID, token });
  }
  // Fall back to auto-config — works under the v2 function runtime.
  return getStore(name);
}

export const inboxStore = () => store("inbox");
export const namesStore = () => store("names");
export const progressStore = () => store("progress");
export const ratelimitStore = () => store("ratelimit");
