
# 🚀 Deployment Guide - GXR Grambot

Panduan lengkap deployment GXR Grambot di Replit dengan setup production-ready.

## 🎯 Overview Deployment

GXR Grambot menggunakan arsitektur hybrid yang perlu di-deploy dengan konfigurasi khusus:

### 🏗️ Komponen System
- **Python Bot** (main.py) - Telegram bot backend
- **Node.js Dashboard** (server/index.ts) - Web dashboard API
- **React Frontend** (client/) - User interface
- **PostgreSQL Database** - Data persistence

## 📋 Prerequisites

### 1. Replit Account
- Account Replit yang aktif
- Repl dengan Node.js environment

### 2. External Services
- **Telegram Bot Token** dari BotFather
- **PostgreSQL Database** (Neon/Supabase/Aiven)
- **Domain** (opsional untuk custom URL)

### 3. Environment Variables
```bash
BOT_TOKEN=your_telegram_bot_token
DATABASE_URL=postgresql://user:pass@host:port/db
NODE_ENV=production
```

## 🔧 Setup Environment

### 1. Database Setup (Neon DB)
```sql
-- Create database tables
CREATE TABLE IF NOT EXISTS users (
    user_id BIGINT PRIMARY KEY,
    username VARCHAR(100),
    first_name VARCHAR(100),
    points INTEGER DEFAULT 0,
    evolution_level INTEGER DEFAULT 1,
    last_claim TIMESTAMP,
    wallet_address VARCHAR(200),
    referral_code VARCHAR(10) UNIQUE,
    referred_by VARCHAR(10),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS task_completions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW(),
    reward_points INTEGER DEFAULT 0,
    UNIQUE(user_id, task_id)
);

CREATE TABLE IF NOT EXISTS pools (
    id SERIAL PRIMARY KEY,
    evolution_level INTEGER NOT NULL,
    total_pool BIGINT NOT NULL,
    distributed BIGINT DEFAULT 0,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_users_points ON users(points DESC);
CREATE INDEX idx_users_referral ON users(referral_code);
CREATE INDEX idx_task_completions_user ON task_completions(user_id);
```

### 2. Replit Secrets Configuration
Di Replit, buka Secrets tab dan tambahkan:

```bash
# Telegram Bot
BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz

# Database
DATABASE_URL=postgresql://user:password@host:5432/gxr_grambot

# Optional
NODE_ENV=production
ADMIN_CHAT_ID=123456789
WEBHOOK_URL=https://your-repl.repl.co/webhook
```

## 📁 File Configuration

### 1. Update .replit Configuration
```toml
# .replit
modules = ["nodejs-20", "python-3.11"]

[nix]
channel = "stable-24_05"

[workflows]

[workflows.runBot]
name = "Run Bot"
author = "agent"

[workflows.runBot.tasks]

[workflows.runBot.tasks.runPythonBot]
name = "runPythonBot"
command = "python main.py"

[workflows.runBot.tasks.runDashboard]
name = "runDashboard"
command = "npm run dev"

[deployment]
run = ["python", "main.py"]
deploymentTarget = "cloudrun"

[[ports]]
localPort = 5000
externalPort = 80

[[ports]]
localPort = 5173
externalPort = 3000
```

### 2. Update package.json Scripts
```json
{
  "scripts": {
    "dev": "concurrently \"python main.py\" \"vite --host 0.0.0.0 --port 5173\"",
    "build": "tsc && vite build", 
    "start": "concurrently \"python main.py\" \"node server/index.js\"",
    "start:bot": "python main.py",
    "start:dashboard": "vite preview --host 0.0.0.0 --port 5173",
    "stop:bot": "python stop_bot.py"
  }
}
```

### 3. Production Config (config.py)
```python
import os

# Bot Configuration
BOT_TOKEN = os.getenv('BOT_TOKEN')
DATABASE_URL = os.getenv('DATABASE_URL')
WEBHOOK_URL = os.getenv('WEBHOOK_URL')
ADMIN_CHAT_ID = int(os.getenv('ADMIN_CHAT_ID', '0'))

# Environment
IS_PRODUCTION = os.getenv('NODE_ENV') == 'production'
DEBUG = not IS_PRODUCTION

# Claim System
CLAIM_INTERVAL_HOURS = 6
CLAIM_REWARD = 250
REFERRAL_REWARD = 50

# Server Configuration
HOST = "0.0.0.0"
PORT = int(os.getenv('PORT', '5000'))
DASHBOARD_PORT = 5173

# Database Pool
DATABASE_POOL_SIZE = 10
DATABASE_TIMEOUT = 30

# Rate Limiting
RATE_LIMIT_CLAIMS = 1  # per 6 hours
RATE_LIMIT_COMMANDS = 10  # per minute
```

## 🚀 Deployment Steps

### 1. Setup Dependencies
```bash
# Install Python dependencies
pip install -r requirements.txt

# Install Node.js dependencies  
npm install

# Build frontend for production
npm run build
```

### 2. Database Migration
```bash
# Run database setup
python -c "
from users import init_database
from pool import init_pools
init_database()
init_pools()
print('Database initialized successfully')
"
```

### 3. Start Services

#### Option A: Development Mode
```bash
# Start both services concurrently
npm run dev
```

#### Option B: Production Mode
```bash
# Start bot only
python main.py

# In separate terminal - start dashboard
npm run start:dashboard
```

#### Option C: Background Services
```bash
# Start bot in background
nohup python main.py > bot.log 2>&1 &

# Start dashboard in background  
nohup npm run start:dashboard > dashboard.log 2>&1 &
```

### 4. Verify Deployment
```bash
# Check bot status
python -c "
import os
if os.path.exists('/tmp/gxr_bot.pid'):
    with open('/tmp/gxr_bot.pid', 'r') as f:
        print(f'Bot running with PID: {f.read().strip()}')
else:
    print('Bot not running')
"

# Check dashboard
curl http://localhost:5173/api/health

# Test bot commands
# Send /start to your bot in Telegram
```

## 🔄 Process Management

### 1. Bot Process Control
```python
# start_bot.py
import subprocess
import sys

def start_bot():
    """Start bot with proper error handling"""
    try:
        # Check if already running
        from main import check_existing_process
        if check_existing_process():
            print("Bot already running")
            return
        
        # Start bot
        subprocess.run([sys.executable, "main.py"])
    except KeyboardInterrupt:
        print("Bot stopped by user")
    except Exception as e:
        print(f"Error starting bot: {e}")

if __name__ == "__main__":
    start_bot()
```

```python
# stop_bot.py
import os
import signal

def stop_bot():
    """Stop bot gracefully"""
    PID_FILE = "/tmp/gxr_bot.pid"
    
    if not os.path.exists(PID_FILE):
        print("❌ Bot not running")
        return
    
    try:
        with open(PID_FILE, 'r') as f:
            pid = int(f.read().strip())
        
        os.kill(pid, signal.SIGTERM)
        os.remove(PID_FILE)
        print(f"✅ Bot stopped (PID {pid})")
    except Exception as e:
        print(f"❌ Error stopping bot: {e}")

if __name__ == "__main__":
    stop_bot()
```

### 2. Health Check System
```python
# health_check.py
import requests
import time
import os

def check_bot_health():
    """Check if bot is responding"""
    PID_FILE = "/tmp/gxr_bot.pid"
    
    if not os.path.exists(PID_FILE):
        return False, "PID file not found"
    
    try:
        with open(PID_FILE, 'r') as f:
            pid = int(f.read().strip())
        
        # Check if process exists
        os.kill(pid, 0)
        return True, f"Bot healthy (PID {pid})"
    except OSError:
        return False, "Bot process not found"

def check_dashboard_health():
    """Check if dashboard is responding"""
    try:
        response = requests.get("http://localhost:5173/api/health", timeout=5)
        if response.status_code == 200:
            return True, "Dashboard healthy"
        else:
            return False, f"Dashboard error: {response.status_code}"
    except Exception as e:
        return False, f"Dashboard not responding: {e}"

def health_monitor():
    """Monitor system health"""
    while True:
        bot_health, bot_msg = check_bot_health()
        dashboard_health, dashboard_msg = check_dashboard_health()
        
        print(f"[{time.strftime('%Y-%m-%d %H:%M:%S')}]")
        print(f"Bot: {'✅' if bot_health else '❌'} {bot_msg}")
        print(f"Dashboard: {'✅' if dashboard_health else '❌'} {dashboard_msg}")
        print("-" * 50)
        
        time.sleep(60)  # Check every minute

if __name__ == "__main__":
    health_monitor()
```

## 🔐 Security Configuration

### 1. Environment Security
```bash
# Never commit these to git
echo "*.env" >> .gitignore
echo "*.log" >> .gitignore
echo "bot.pid" >> .gitignore
echo "/tmp/gxr_bot.pid" >> .gitignore
```

### 2. Rate Limiting
```python
# rate_limiter.py
import time
from collections import defaultdict

class RateLimiter:
    def __init__(self):
        self.requests = defaultdict(list)
    
    def is_allowed(self, user_id, limit=10, window=60):
        """Check if user is within rate limit"""
        now = time.time()
        user_requests = self.requests[user_id]
        
        # Remove old requests
        self.requests[user_id] = [
            req_time for req_time in user_requests 
            if now - req_time < window
        ]
        
        # Check limit
        if len(self.requests[user_id]) >= limit:
            return False
        
        # Add current request
        self.requests[user_id].append(now)
        return True

# Usage in commands
rate_limiter = RateLimiter()

async def claim_command(update, context):
    user_id = update.effective_user.id
    
    if not rate_limiter.is_allowed(user_id, limit=1, window=21600):  # 6 hours
        await update.message.reply_text("⏰ Claim masih dalam cooldown!")
        return
    
    # Process claim
    # ...
```

### 3. Input Validation
```python
# validators.py
import re

def validate_wallet_address(address):
    """Validate crypto wallet address"""
    if not address or len(address) < 26:
        return False
    
    # Basic validation patterns
    patterns = {
        'ethereum': r'^0x[a-fA-F0-9]{40}$',
        'bitcoin': r'^[13][a-km-zA-HJ-NP-Z1-9]{25,34}$',
        'solana': r'^[1-9A-HJ-NP-Za-km-z]{32,44}$'
    }
    
    return any(re.match(pattern, address) for pattern in patterns.values())

def sanitize_input(text):
    """Sanitize user input"""
    if not text:
        return ""
    
    # Remove potentially dangerous characters
    sanitized = re.sub(r'[<>\'";]', '', text)
    return sanitized.strip()[:200]  # Limit length
```

## 📊 Monitoring & Logging

### 1. Logging Configuration
```python
# logger.py
import logging
import os
from datetime import datetime

def setup_logger():
    """Setup production logging"""
    # Create logs directory
    os.makedirs('logs', exist_ok=True)
    
    # Configure logging
    logging.basicConfig(
        level=logging.INFO,
        format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
        handlers=[
            logging.FileHandler(f'logs/bot_{datetime.now().strftime("%Y%m%d")}.log'),
            logging.StreamHandler()
        ]
    )
    
    return logging.getLogger('GXRGrambot')

logger = setup_logger()

# Usage in commands
async def start_command(update, context):
    user_id = update.effective_user.id
    username = update.effective_user.username
    
    logger.info(f"User {user_id} ({username}) started the bot")
    
    # Command logic...
```

### 2. Performance Monitoring
```python
# performance.py
import time
import functools

def monitor_performance(func):
    """Decorator to monitor function performance"""
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = await func(*args, **kwargs)
            execution_time = time.time() - start_time
            
            if execution_time > 5:  # Log slow operations
                logger.warning(f"Slow operation: {func.__name__} took {execution_time:.2f}s")
            
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            logger.error(f"Error in {func.__name__} after {execution_time:.2f}s: {e}")
            raise
    
    return wrapper

# Usage
@monitor_performance
async def claim_reward(user_id):
    # Claim logic...
    pass
```

## 🔄 Auto-Restart & Recovery

### 1. Restart Script
```bash
#!/bin/bash
# restart_bot.sh

echo "🔄 Restarting GXR Grambot..."

# Stop existing processes
python stop_bot.py
pkill -f "npm run"

# Wait for cleanup
sleep 5

# Start services
python main.py &
npm run start:dashboard &

echo "✅ Bot restarted successfully"
```

### 2. Cron Job for Health Check
```bash
# Add to crontab: crontab -e
# Check every 10 minutes
*/10 * * * * cd /path/to/bot && python health_check.py --auto-restart

# Daily log rotation
0 0 * * * cd /path/to/bot && find logs/ -name "*.log" -mtime +7 -delete
```

### 3. Error Recovery
```python
# error_recovery.py
import asyncio
import subprocess

async def restart_on_error():
    """Restart bot if it crashes"""
    max_retries = 3
    retry_count = 0
    
    while retry_count < max_retries:
        try:
            # Start bot
            process = subprocess.Popen(['python', 'main.py'])
            await asyncio.sleep(3600)  # Check every hour
            
            if process.poll() is not None:
                raise Exception("Bot process died")
                
        except Exception as e:
            retry_count += 1
            logger.error(f"Bot error (attempt {retry_count}/{max_retries}): {e}")
            
            if retry_count < max_retries:
                await asyncio.sleep(60)  # Wait before retry
            else:
                logger.critical("Max retries reached. Manual intervention required.")
                break

if __name__ == "__main__":
    asyncio.run(restart_on_error())
```

## 🚀 Go Live Checklist

### ✅ Pre-Launch
- [ ] Database connection tested
- [ ] Bot token configured
- [ ] All commands working
- [ ] Dashboard loading properly
- [ ] Rate limiting implemented
- [ ] Error handling in place
- [ ] Logging configured

### ✅ Launch
- [ ] Start bot: `python main.py`
- [ ] Start dashboard: `npm run start:dashboard`
- [ ] Verify health checks
- [ ] Test with real users
- [ ] Monitor logs for errors

### ✅ Post-Launch
- [ ] Setup monitoring alerts
- [ ] Configure auto-restart
- [ ] Regular health checks
- [ ] Performance optimization
- [ ] User feedback collection

## 🆘 Troubleshooting

### Common Issues

#### Bot Not Starting
```bash
# Check Python version
python --version  # Should be 3.11+

# Check dependencies
pip list | grep telegram

# Check logs
tail -f logs/bot_*.log
```

#### Dashboard Not Loading
```bash
# Check Node.js version
node --version  # Should be 18+

# Check port availability
lsof -i :5173

# Rebuild frontend
npm run build
```

#### Database Connection
```bash
# Test connection
python -c "
import os
import psycopg2
conn = psycopg2.connect(os.getenv('DATABASE_URL'))
print('Database connected successfully')
conn.close()
"
```

### Emergency Commands
```bash
# Force stop everything
pkill -f python
pkill -f node
pkill -f npm

# Emergency restart
bash restart_bot.sh

# Check system resources
top -p $(pgrep python)
```

---

**🚀 Success! Your GXR Grambot is now live on Replit!**
