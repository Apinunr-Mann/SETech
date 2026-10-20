# SETech Live Manhour Dashboard

Live executive dashboard for the **SETech Manhour** Google Sheet (one tab per person, one row per working day, one column per hour 09:00–18:00).

- **Live artifact:** https://claude.ai/artifact/B4iq4Xkv4z6jmUdpyk1pVU. It reads the sheet through the viewer's Google Sheets connector, re-reads it every minute, and picks up new tabs (new people) automatically.
- **Standalone:** `index.html` also works on any static host if the sheet is shared as "Anyone with the link can view". In that mode it reads the public gviz CSV export for the tabs listed in `FALLBACK_TABS`.

## How cells are read

| Cell value | Treated as |
|---|---|
| `พักเที่ยง` | lunch break (excluded) |
| `ลา` | leave (counted in capacity, not available) |
| `หยุด` | holiday (excluded from capacity) |
| `Next Project`, `Project อื่น` (see `FLEX`) | unassigned, so it can still be allocated |
| empty | free |
| anything else | project hours |

Utilization = project hours ÷ (capacity − leave).
