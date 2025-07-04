# commands.py

from telegram.ext import CommandHandler
from users import claim_reward, get_user_status, connect_wallet, export_csv
from referral import show_referral_code, apply_referral

def register_handlers(application):
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("claim", claim_reward))
    application.add_handler(CommandHandler("rank", get_user_status))
    application.add_handler(CommandHandler("connectwallet", connect_wallet))
    application.add_handler(CommandHandler("referral", show_referral_code))
    application.add_handler(CommandHandler("exportcsv", export_csv))
    application.add_handler(CommandHandler("usecode", apply_referral))

def start(update, context):
    update.message.reply_text("🚀 Selamat datang di GXR Airdrop Bot!\nGunakan /claim untuk mulai!")
  
