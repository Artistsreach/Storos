# YouTube Data API v3 Node.js Quickstart

This sample retrieves the `channel` resource for the `GoogleDevelopers` YouTube channel and prints basic information.

## Prerequisites
- Node.js (includes npm)
- Internet access and a Google account

## Step 1: Turn on the YouTube Data API and create OAuth client
1. Open: https://console.developers.google.com/flows/enableapi?apiid=youtube
2. Click **Continue**, then **Go to credentials**.
3. On the **Create credentials** page, click **Cancel**.
4. Open the **OAuth consent screen** tab. Select an **Email address**, enter a **Product name** (if needed), click **Save**.
5. Go back to **Credentials** tab → **Create credentials** → **OAuth client ID**.
6. Select application type **Other** (or **Desktop App** if "Other" is not available), name it `YouTube Data API Quickstart`, click **Create**.
7. Click **OK**.
8. Click the download icon to download the client credentials JSON.
9. Move the downloaded file to this folder and rename it to `client_secret.json`.

> Windows tip: This project stores the token at `%USERPROFILE%\.credentials\youtube-nodejs-quickstart.json`.

## Step 2: Install dependencies
In this folder:
```bash
npm install
```

If you created the folder fresh, this installs `googleapis` and `google-auth-library` as defined in `package.json`.

## Step 3: Run the sample
```bash
node quickstart.js
```

The first run prints an authorization URL:
1. Open the URL in your browser.
2. Log in (and pick an account) if prompted.
3. Click **Accept** to grant permissions.
4. Copy the authorization code back into the terminal prompt.

You should see the channel ID, title and view count printed.

## Files
- `quickstart.js` — sample code
- `package.json` — dependencies and start script
- `client_secret.json` — your OAuth client credentials (you add this)

## Troubleshooting
- Missing `client_secret.json`: Follow the steps above and place the file in this folder.
- EADDRINUSE / Port conflicts: Not applicable here (no local server is started).
- Invalid grant / redirect URI mismatch: Ensure you created a Desktop/Other client and are using the provided auth URL.
