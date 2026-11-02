// Bound to the Google Sheet: Extensions > Apps Script. Deploy as Web app (Execute as: Me, Access: Anyone).
const SHEET = 'RSVP';
function sheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let s = ss.getSheetByName(SHEET);
  if (!s) { s = ss.insertSheet(SHEET); s.appendRow(['Timestamp', 'Name', 'Attendance', 'Message']); s.setFrozenRows(1); }
  return s;
}
function out_(o) { return ContentService.createTextOutput(JSON.stringify(o)).setMimeType(ContentService.MimeType.JSON); }
function doPost(e) {
  const lock = LockService.getScriptLock(); lock.waitLock(10000);
  try {
    const p = e.parameter, name = String(p.name || '').trim().slice(0, 80);
    if (!name || p.website) return out_({ ok: false });
    const att = p.attendance === 'Not Attending' ? 'Not Attending' : 'Attending';
    const s = sheet_(), r = s.getLastRow() + 1;
    // Plain-text format blocks formula injection from guest input.
    s.getRange(r, 1, 1, 4).setNumberFormats([['yyyy-mm-dd hh:mm:ss', '@', '@', '@']])
      .setValues([[new Date(), name, att, String(p.message || '').trim().slice(0, 500)]]);
    return out_({ ok: true });
  } catch (err) { return out_({ ok: false }); } finally { lock.releaseLock(); }
}
function doGet() {
  const s = sheet_(), n = s.getLastRow();
  if (n < 2) return out_([]);
  const rows = s.getRange(Math.max(2, n - 99), 1, Math.min(n - 1, 100), 4).getValues();
  return out_(rows.filter(r => r[3]).reverse().map(r => ({ name: r[1], message: r[3] })));
}
