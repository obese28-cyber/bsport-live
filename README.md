# BSPORT LIVE Android

An Android sports-broadcast prototype with animated ticker, rotating sourced historic sports facts and demo basketball/football scoreboards. The app can open a separately hosted secure sports dashboard (backend directory).

## Upload from Windows
1. Download `BSPORT-GitHub-ready.zip` from the conversation and **Extract All**.
2. Open PowerShell in the extracted `BSPORT-GitHub-ready` folder (File Explorer address bar: type `powershell` and press Enter).
3. Install Git for Windows if you do not already have it from https://git-scm.com/download/win.
4. Run the commands provided in the chat, which initialize a repository, commit the files and push to GitHub. GitHub authentication might open a browser window.

## APK build
The `.github/workflows/build-apk.yml` workflow runs on a push to `main`; also supports manual triggering under GitHub > Actions > Build BSPORT Android APK. After a successful build, download the `BSPORT-LIVE-debug-APK` artifact ZIP from that run, extract `app-debug.apk`, and install it on your own Android device.

### Important
- This debug APK is a test build and does not yet contain **live** basketball scores or TikTok streaming integration. All displayed scores are clearly marked as examples.
- To connect real live SportAPI data, deploy the separate `backend` Node.js web app to an HTTPS host, configure `SPORTAPI_KEY` in the host's private environment variables, and enter the hosted dashboard URL in the APK. Do not put the API key in GitHub, the APK, or browser JavaScript.
- TikTok broadcasting/screen-share authorization is separate and must be tested with the user's account.
- Wikipedia references are links to historical information; there is no live Wikimedia feed yet.
- Check broadcasting data-license terms before public use.
