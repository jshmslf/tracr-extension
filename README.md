# Tracr Extension

Chrome/Edge (Manifest V3) extension for adding job applications to [Tracr](https://github.com) directly from any job posting page.

## Load it locally

1. Open `chrome://extensions` (or `edge://extensions`).
2. Enable Developer mode.
3. Click "Load unpacked" and select this folder.

## Connect it to your account

1. In Tracr, sign in and go to Profile, then "Browser extension", then "Connect a device". This shows a 12-word phrase, valid once for 10 minutes.
2. Open the extension popup, paste the phrase, click Connect.

## Using it

- "Add this page": reads the active tab's URL, sends it to Tracr to auto-fill, shows a small form to review before saving.
- "View dashboard": opens your Tracr applications list in a new tab.
- "Disconnect this device": clears the stored token locally. To fully revoke access from Tracr's side (so the old token stops working even if it leaked), use "Revoke" on the Profile page's connected-devices list.

## Configuration

`config.js` has a single `TRACR_ORIGIN` constant, defaulting to `http://localhost:3000` for local development. Update it to your deployed Tracr URL before publishing. The deployed origin also needs to be added to `manifest.json`'s `host_permissions` (currently includes a placeholder `https://*.tracr.app/*` — replace with the real domain once known).

## Notes

- Icons in `icons/` are the source Tracr logo copied at each declared size, not individually re-rendered/optimized per size — fine for development, worth regenerating properly sized assets before a store submission.
- No build step, no bundler, no dependencies. `popup.html`/`popup.css`/`popup.js`/`config.js` are loaded directly.
