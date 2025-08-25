### 1. Set Up Environment

```bash
# Set environment variables in Replit Secrets
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=your_postgresql_url
ADMIN_TELEGRAM_ID=your_telegram_id
MAX_CONCURRENT_USERS=30000
```
### Admin Features

- Export user data as CSV
- System monitoring via dashboard
- Real-time user analytics
- Web Admin Panel appears automatically when the loaded user matches `ADMIN_TELEGRAM_ID`.
- Server enforces max concurrent users via WebSocket. When full, users see a popup message that capacity is full and to wait a few minutes.