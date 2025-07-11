
# 🤖 Setup Bot Telegram GXR Grambot

Panduan lengkap untuk setup bot Telegram GXR Grambot dengan BotFather dan konfigurasi commands.

## 📱 Langkah 1: Membuat Bot di BotFather

### 1. Buka BotFather
- Cari `@BotFather` di Telegram
- Ketik `/start` untuk memulai

### 2. Buat Bot Baru
```
/newbot
```
- Masukkan nama bot: `GXR Grambot`
- Masukkan username: `gxr_grambot` (atau yang tersedia)

### 3. Simpan Bot Token
Bot akan memberikan token seperti:
```
1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

⚠️ **PENTING**: Simpan token ini dengan aman!

## ⚙️ Langkah 2: Konfigurasi Bot Commands

### 1. Set Bot Commands
Kirim command berikut ke BotFather:
```
/setcommands
```

Pilih bot Anda, lalu paste commands berikut:

```
start - 🚀 Mulai bot dan lihat menu utama
claim - 🚜 Claim farming reward setiap 6 jam
rank - 🏆 Lihat evolution status dan ranking
connectwallet - 💳 Connect wallet untuk claim GXR
referral - 👥 Lihat kode referral dan earnings
usecode - ✅ Gunakan kode referral orang lain
```

### 2. Set Bot Description
```
/setdescription
```

Description:
```
🎮 GXR Grambot - Gaming Airdrop Bot

Bot airdrop dengan sistem evolusi 7 level (Rookie hingga Final Form). Claim reward setiap 6 jam, complete tasks, dan naik level untuk unlock pool reward yang lebih besar!

✨ Features:
🚜 Farming setiap 6 jam (250 points)
🏆 7 Evolution levels dengan pool berbeda
✅ Task system (Original, Partnership, Collaborator)
👥 Referral system (50 points per invite)
💳 Multi-wallet support
📊 Real-time dashboard

Join sekarang dan mulai evolusi gaming Anda!
```

### 3. Set About Text
```
/setabouttext
```

About:
```
🎮 GXR Grambot - Evolution Gaming Airdrop

Sistem evolusi 7 level dari Rookie hingga Final Form dengan pool reward hingga 2B GXR!
```

### 4. Set Bot Picture
```
/setuserpic
```
Upload logo atau gambar GXR yang sesuai.

## 🔧 Langkah 3: Setup Environment

### 1. Di Replit Secrets
Tambahkan environment variable:
```
BOT_TOKEN=your_bot_token_here
DATABASE_URL=your_postgresql_url
```

### 2. Update config.py
```python
import os

BOT_TOKEN = os.getenv('BOT_TOKEN')
DATABASE_URL = os.getenv('DATABASE_URL')

# Bot Configuration
CLAIM_INTERVAL_HOURS = 6
CLAIM_REWARD = 250
REFERRAL_REWARD = 50

# Admin Configuration
ADMIN_CHAT_ID = 123456789  # Your Telegram chat ID
```

## 🚀 Langkah 4: Test Bot

### 1. Start Bot
```bash
python main.py
```

### 2. Test Commands
Buka bot di Telegram dan test:
- `/start` - Menu utama
- `/claim` - Farming system
- `/rank` - Evolution status
- `/referral` - Referral code

### 3. Verifikasi Features
- ✅ Inline keyboard berfungsi
- ✅ Farming timer 6 jam
- ✅ Evolution system
- ✅ Database connection
- ✅ Dashboard integration

## 🎮 Langkah 5: Konfigurasi Advanced

### 1. Webhook (Opsional)
Untuk production, gunakan webhook:
```python
# Dalam main.py
application.run_webhook(
    listen="0.0.0.0",
    port=5000,
    url_path="webhook",
    webhook_url="https://your-replit-url.repl.co/webhook"
)
```

### 2. Admin Commands
Tambah admin-only commands:
```python
@admin_only
async def admin_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    # Admin statistics
    pass
```

### 3. Error Handling
```python
async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    print(f"Error: {context.error}")
    # Log ke admin
```

## 📊 Monitoring & Logs

### 1. Bot Status
```bash
# Check if running
ps aux | grep python

# Check PID file
cat /tmp/gxr_bot.pid
```

### 2. Stop Bot
```bash
python stop_bot.py
```

### 3. Logs
Monitor bot logs untuk debugging:
- Connection errors
- Database issues
- Command errors
- User activities

## 🔒 Security Tips

1. **Never share bot token** publicly
2. **Use Replit Secrets** untuk sensitive data
3. **Enable admin-only commands** untuk management
4. **Validate user input** untuk prevent injection
5. **Rate limiting** untuk prevent spam

## 🎯 Command Examples

### Start Command
```
🎮 Selamat datang di GXR Grambot!

🏆 Current Status:
Evolution: Evol 1 (Rookie)
Points: 0
Next Claim: Available now

🚜 Farming: Claim setiap 6 jam untuk 250 points
🏆 Evolution: 7 level dari Rookie ke Final Form  
✅ Tasks: Complete untuk bonus points
👥 Referral: Invite teman untuk 50 points
💳 Wallet: Connect untuk claim GXR rewards
```

### Claim Command
```
🚜 FARMING REWARD CLAIMED!

✅ +250 Points earned
🏆 Evolution: Evol 1 (Rookie) - 250/50 points
⏰ Next claim: 6 jam lagi

💡 Tip: Complete tasks untuk bonus points!
```

### Rank Command
```
🏆 YOUR EVOLUTION STATUS

🎮 Current Level: Evol 2 (Charger)
📊 Points: 15,750
💰 Max Claim: 10 GXR
🏊‍♂️ Pool: 5M GXR

📈 Progress to Evol 3: 750/15,000
🏅 Global Rank: #234

🎯 Next Level: Evol 3 (Breaker)
💰 Unlock: 15 GXR max, 7.5M pool
```

---

**🎮 Happy Gaming dengan GXR Grambot!**
