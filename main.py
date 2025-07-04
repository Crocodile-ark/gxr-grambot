# main.py

from telegram.ext import Application
from commands import register_handlers
from config import BOT_TOKEN

def main():
    application = Application.builder().token(BOT_TOKEN).build()
    register_handlers(application)
    print("Bot GXR Airdrop is running...")
    application.run_polling()

if __name__ == "__main__":
    main()
  
