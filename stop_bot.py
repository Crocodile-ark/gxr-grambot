
#!/usr/bin/env python3
import os
import signal
import sys

PID_FILE = "/tmp/gxr_bot.pid"

def stop_bot():
    """Stop running bot instance"""
    if not os.path.exists(PID_FILE):
        print("❌ Bot tidak sedang berjalan")
        return
    
    try:
        with open(PID_FILE, 'r') as f:
            pid = int(f.read().strip())
        
        # Send termination signal
        os.kill(pid, signal.SIGTERM)
        
        # Wait a moment then force kill if needed
        import time
        time.sleep(2)
        
        try:
            os.kill(pid, 0)  # Check if still running
            os.kill(pid, signal.SIGKILL)  # Force kill
            print(f"🔴 Bot (PID {pid}) dihentikan paksa")
        except OSError:
            print(f"✅ Bot (PID {pid}) berhasil dihentikan")
        
        # Remove PID file
        os.remove(PID_FILE)
        
    except (ValueError, OSError) as e:
        print(f"❌ Error saat menghentikan bot: {e}")
        if os.path.exists(PID_FILE):
            os.remove(PID_FILE)

if __name__ == "__main__":
    stop_bot()
