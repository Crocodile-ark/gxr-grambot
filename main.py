# main.py

from telegram.ext import Updater
from commands import register_handlers
from config import BOT_TOKEN

def main():
    updater = Updater(token=BOT_TOKEN, use_context=True)
    dispatcher = updater.dispatcher
    register_handlers(dispatcher)
    print("Bot GXR Airdrop is running...")
    updater.start_polling()
    updater.idle()

if __name__ == "__main__":
    main()
  
