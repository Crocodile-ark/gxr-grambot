# commands.py

from telegram.ext import CommandHandler
from users import claim_reward, get_user_status, connect_wallet, export_csv
from referral import show_referral_code, apply_referral

def register_handlers(dispatcher):
    dispatcher.add_handler(CommandHandler("start", start))
    dispatcher.add_handler(CommandHandler("claim", claim_reward))
    dispatcher.add_handler(CommandHandler("rank", get_user_status))
    dispatcher.add_handler(CommandHandler("connectwallet", connect_wallet))
    dispatcher.add_handler(CommandHandler("referral", show_referral_code))
    dispatcher.add_handler(CommandHandler("exportcsv", export_csv))
    dispatcher.add_handler(CommandHandler("usecode", apply_referral))

def start(update, context):
    update.message.reply_text("🚀 Selamat datang di GXR Airdrop Bot!\nGunakan /claim untuk mulai!")
  
