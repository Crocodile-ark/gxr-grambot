
# main.py

import os
import sys
import time
import signal
from telegram.ext import Application
from commands import register_handlers
from config import BOT_TOKEN

# PID file untuk mencegah multiple instances
PID_FILE = "/tmp/gxr_bot.pid"

def check_existing_process():
    """Check if bot is already running"""
    if os.path.exists(PID_FILE):
        with open(PID_FILE, 'r') as f:
            old_pid = f.read().strip()
        try:
            # Check if process is still running
            os.kill(int(old_pid), 0)
            print(f"Bot sudah berjalan dengan PID {old_pid}")
            return True
        except (OSError, ValueError):
            # Process tidak ada, hapus PID file
            os.remove(PID_FILE)
    return False

def create_pid_file():
    """Create PID file"""
    with open(PID_FILE, 'w') as f:
        f.write(str(os.getpid()))

def cleanup_pid_file():
    """Remove PID file"""
    if os.path.exists(PID_FILE):
        os.remove(PID_FILE)

def signal_handler(signum, frame):
    """Handle termination signals"""
    print("\nBot sedang dihentikan...")
    cleanup_pid_file()
    sys.exit(0)

def main():
    # Check if already running
    if check_existing_process():
        print("❌ Bot sudah berjalan! Hentikan instance lain terlebih dahulu.")
        return
    
    # Set up signal handlers
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Create PID file
    create_pid_file()
    
    try:
        application = Application.builder().token(BOT_TOKEN).build()
        register_handlers(application)
        print("✅ Bot GXR Airdrop is running...")
        print(f"🔄 PID: {os.getpid()}")
        application.run_polling(allowed_updates=["message"])
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        cleanup_pid_file()

if __name__ == "__main__":
    main()
