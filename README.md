# Sweet Seventeen Invitation

## 1. Google Sheet + Apps Script
1. Create Google Sheet. Extensions > Apps Script. Paste `apps-script/Code.gs`. Save.
2. Deploy > New deployment > Web app. Execute as: Me. Access: Anyone. Authorize.
3. Copy Web app URL into `scriptUrl` in `config.js`.
Sheet `RSVP` columns: A Timestamp, B Name, C Attendance, D Message (auto-created).

## 2. Assets
Design graphics and fonts (Sloop, Garamond) are already in `assets/`. Photos (`portrait.jpg` 720x960, `g1-g4.jpg` 600x900, under 120 KB each; list in `config.js` `gallery`) are included. Still add `assets/music.mp3` (under 3 MB, 128 kbps).

## 3. Deploy
Push all files to GitHub repo root. Settings > Pages > Deploy from branch > main / root. URL: `https://USER.github.io/REPO/`.

## 4. Maintenance
- Change name, date, time, venue, text, photos: edit `config.js` only.
- Personal links: `https://USER.github.io/REPO/?to=Keisha%20Madeline`.
- Edit `Code.gs`: Deploy > Manage deployments > Edit > New version. URL stays the same.
- Hide a wish: delete the message cell in column D. Export: File > Download in Sheets.
