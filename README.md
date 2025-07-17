
# 🤖 GXR Grambot - Telegram Airdrop Bot
![banner](assets/banner.jpg)

Bot Telegram airdrop dengan sistem evolusi 7 level yang terintegrasi dengan dashboard web modern dan sistem blockchain.

## 📋 Deskripsi Sistem

GXR Grambot adalah bot airdrop Telegram yang menggunakan arsitektur hybrid dengan:
- **Python Backend**: Bot Telegram utama untuk interaksi user
- **Node.js/Express**: API server untuk dashboard web 
- **React Frontend**: Dashboard modern dengan real-time updates
- **PostgreSQL**: Database persistent dengan Drizzle ORM

## 🎮 Fitur Utama

### ⚡ Sistem Evolusi 7 Level
- **Evol 1 (Rookie)**: 0-999 points, 500H pool
- **Evol 2 (Charger)**: 1000-14,999 points, 1M pool  
- **Evol 3 (Breaker)**: 15,000-29,999 points, 1,2M pool
- **Evol 4 (Phantom)**: 30,000-49,999 points, 1,8M pool
- **Evol 5 (Overdrive)**: 50,000-99,999 points, 2,5M pool
- **Evol 6 (Genesis)**: 100,000-249,999 points, 3M pool
- **Evol 7 (Final Form)**: 250,000+ points, 5M pool
  **Total Airdrop** : 17.000.000 [20% dari total suplai]

### 🚜 Farming System
- Claim reward setiap 6 jam (250 points per claim)
- Auto-reset timer untuk farming berikutnya
- Real-time countdown di dashboard

### ✅ Task Management
- **Original Tasks**: Task dasar bot
- **Partnership Tasks**: Task kolaborasi partner
- **Collaborator Tasks**: Task khusus kolaborator
- Tracking completion dengan progress bar

### 👥 Referral System  
- Kode referral unik per user
- Reward 20 points untuk referrer
- Tracking total referral dan earnings

### 💳 Wallet Integration
- Support 12+ jenis wallet (MetaMask, Trust Wallet, dll)
- Wallet connection untuk claim reward
- Address validation dan storage

### 🏆 Ranking & Leaderboard
- Real-time ranking berdasarkan points
- Global leaderboard dengan pagination
- User position tracking

## 📁 Struktur Folder

```
extracted/GuideMate/
├── Python Bot Files
│   ├── main.py              # Entry point dengan PID management
│   ├── commands.py          # Handler command Telegram
│   ├── users.py             # User management & claim
│   ├── evol.py              # Sistem evolusi 7 tier
│   ├── tasks.py             # Task management
│   ├── pool.py              # Pool reward distribution
│   ├── ranking.py           # Leaderboard functionality
│   ├── referral.py          # Sistem referral
│   ├── config.py            # Konfigurasi bot
│   └── requirements.txt     # Python dependencies
│
├── React Dashboard
│   ├── client/src/
│   │   ├── pages/           # Pages (Farming, Tasks, Rank, dll)
│   │   ├── components/      # UI components
│   │   └── hooks/           # Custom hooks & WebSocket
│   └── index.html           # Entry point dashboard
│
├── Node.js Backend  
│   ├── server/
│   │   ├── index.ts         # Express server
│   │   ├── routes.ts        # API endpoints
│   │   └── storage.ts       # Database layer
│   └── shared/schema.ts     # Database schema
│
└── Configuration
    ├── package.json         # Node dependencies
    ├── drizzle.config.ts    # Database config
    └── .replit              # Replit configuration
```

## 🚀 Quick Start

### 1. Setup Environment
```bash
# Set environment variables di Replit Secrets
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=your_postgresql_url
```

### 2. Install Dependencies
```bash
# Python dependencies (auto-install)
pip install -r requirements.txt

# Node.js dependencies (auto-install) 
npm install
```

### 3. Jalankan Bot
```bash
# Start Python bot
python main.py

# Start dashboard (terminal terpisah)
npm run dev
```

### 4. Setup Bot Commands
Di BotFather Telegram, set commands:
```
start - 🚀 Mulai bot dan lihat menu utama
claim - 🚜 Claim farming reward  
rank - 🏆 Lihat status dan ranking
connectwallet - 💳 Connect wallet untuk claim
referral - 👥 Lihat kode referral
usecode - ✅ Gunakan kode referral
```

## 🛠️ Tech Stack

### Backend Python
- `python-telegram-bot==20.7` - Framework bot Telegram
- `urllib3` - HTTP client library
- Process management dengan PID file

### Backend Node.js  
- `express` - Web server framework
- `drizzle-orm` - Database ORM
- `@neondatabase/serverless` - PostgreSQL driver
- WebSocket untuk real-time updates

### Frontend React
- `React 18` - UI framework
- `Radix UI` - Component library
- `Tailwind CSS` - Styling framework  
- `wouter` - Routing
- `react-query` - State management

### Database
- **PostgreSQL** - Primary database
- **Neon Database** - Serverless PostgreSQL
- **Drizzle ORM** - Type-safe database access

## 📱 Dashboard Features

### 🎮 Bottom Navigation (5 Sections)
1. **🚜 Farming**: Claim rewards, timer countdown
2. **✅ Task Completed**: Track completed tasks
3. **🏆 Rank**: Evolution status, leaderboard  
4. **👤 Profile**: User stats, referral info
5. **💳 Wallet Connect**: Multi-wallet support

### 🎨 Design System
- Dark gaming theme dengan GXR green/blue
- Mobile-first responsive design
- Loading screen dengan startup background
- Real-time notifications dan updates

## 🔧 Konfigurasi

### Bot Configuration (`config.py`)
```python
CLAIM_INTERVAL_HOURS = 6    # Interval claim farming
CLAIM_REWARD = 250          # Points per claim
REFERRAL_REWARD = 50        # Points untuk referrer
```

### Pool Configuration
Pool reward per evolusi level sudah dikonfigurasi sesuai sistem 7 tier.

## 📊 Monitoring & Management

### Process Management
- PID file untuk prevent multiple instances
- Graceful shutdown dengan signal handling
- Auto-restart capability

### Admin Features
- CSV export user data
- System monitoring via dashboard
- Real-time user analytics

## 📞 Support & Development

### Development Mode
```bash
# Bot development
python main.py

# Dashboard development
npm run dev
```

### Production Deployment
Bot sudah siap deploy di Replit dengan:
- Auto-install dependencies
- Environment variable management
- Always-on capability dengan health check

### Troubleshooting
- Check bot PID: `cat bot.pid`
- Stop bot: `python stop_bot.py`  
- Restart: `python main.py`
- Dashboard logs: Check browser console

---

**🎮 GXR Grambot - Evolution Gaming Experience**
