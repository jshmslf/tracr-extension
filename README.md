# Tracr Extension

Chrome/Edge (Manifest V3) extension for adding job applications to [Tracr](https://github.com/jshmslf/tracr) directly from any job posting page.

## Links

- Repo: https://github.com/jshmslf/tracr
- Live app: https://tracr-web.vercel.app/

## Install it

This extension isn't published on the Chrome Web Store, so it's installed manually ("load unpacked"):

1. Download or clone this repo.
2. Open `chrome://extensions` (or `edge://extensions`).
3. Enable Developer mode (top right).
4. Click "Load unpacked" and select this folder.

That's it, no store listing or review wait. Chrome/Edge will keep the extension installed until you remove it; pull the latest changes and click the refresh icon on the extension card to update.

## Connect it to your account

1. In Tracr, sign in and go to Profile, then "Browser extension", then "Connect a device". This shows a 12-word phrase, valid once for 10 minutes.
2. Open the extension popup, paste the phrase, click Connect.

## Using it

- "Add application": grabs the active tab's URL and opens the full application form right in the popup (same fields as the website) for you to fill in and save.
- "View dashboard": opens your Tracr applications list in a new tab.
- "Disconnect this device": clears the stored token locally. To fully revoke access from Tracr's side (so the old token stops working even if it leaked), use "Revoke" on the Profile page's connected-devices list.
- In-progress form entries autosave as a draft, so switching back to the job posting tab to copy text doesn't lose your progress.

## Configuration

`config.js` has a single `TRACR_ORIGIN` constant, currently pointed at the live deployment (`https://tracr-web.vercel.app`). Switch it to `http://localhost:3000` if you're testing against a local dev server instead. Whichever origin you use also needs to be listed in `manifest.json`'s `host_permissions` (both the production URL and `localhost:3000` are already included).

## Notes

- Icons in `icons/` are the source Tracr logo copied at each declared size, not individually re-rendered/optimized per size — fine for personal use.
- No build step, no bundler, no dependencies. `popup.html`/`popup.css`/`popup.js`/`config.js` are loaded directly.
- Not published on the Chrome Web Store (that requires a one-time developer registration fee) — install via "Load unpacked" as above.
