## Admin Panel Guide

This guide explains how to enable and use the GXR Admin Panel that runs in the background of the dashboard.

### Prerequisites

- Set the following environment variables:

```env
ADMIN_TELEGRAM_ID=<your_telegram_id>
MAX_CONCURRENT_USERS=30000
```

- The server sets `user.isAdmin` automatically when the loaded Telegram ID matches `ADMIN_TELEGRAM_ID`.

### Accessing the Admin Panel

1. Open the dashboard (npm run dev).
2. Ensure the dashboard loads your Telegram ID (the same one set as `ADMIN_TELEGRAM_ID`).
3. The Admin Panel appears at the bottom of the main dashboard when `user.isAdmin === true`.

### Admin Features

- View total users, total distributed points, and evolution pool usage.
- List of evolution pools with usage bars per level.
- Export CSV of users via the “Export CSV” button.

### Concurrency Limit Behavior

- The server enforces `MAX_CONCURRENT_USERS` active WebSocket sessions (default 30,000).
- If capacity is full, new connections are sent a `capacity_full` message and the dashboard shows a popup:
  "Kami menghargai partisipasi Anda, tapi saat ini semuanya sedang penuh, harap tunggu beberapa menit lagi untuk login."

### Troubleshooting

- Admin panel not visible:
  - Verify `ADMIN_TELEGRAM_ID` is set and matches the Telegram ID used by the dashboard.
  - Reload the dashboard; the server syncs `isAdmin` on login.
- Export failed:
  - Check server logs; ensure the API `/api/admin/export` is reachable.

### Notes

- The admin panel is read-only except for CSV export.
- Pool reset button is intentionally disabled until a reset policy is defined.