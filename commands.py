
# commands.py

from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from telegram.ext import CommandHandler, CallbackQueryHandler
from users import claim_reward, get_user_status, connect_wallet, export_csv
from referral import show_referral_code, apply_referral
from tasks import show_tasks, show_completed_tasks
from ranking import show_rank_navigation, show_leaderboard
import asyncio

def register_handlers(application):
    application.add_handler(CommandHandler("start", start))
    application.add_handler(CommandHandler("claim", claim_reward))
    application.add_handler(CommandHandler("rank", get_user_status))
    application.add_handler(CommandHandler("connectwallet", connect_wallet))
    application.add_handler(CommandHandler("referral", show_referral_code))
    application.add_handler(CommandHandler("exportcsv", export_csv))
    application.add_handler(CommandHandler("usecode", apply_referral))
    application.add_handler(CallbackQueryHandler(handle_callback))

# Kirim splash/loading screen
async def send_splash_screen(update, context):
    await update.message.reply_photo(
        photo=open("assets/splash.jpg", "rb"),
        caption="Loading... Selamat datang di GXR Airdrop Bot!"
    )
    await asyncio.sleep(2)  # Delay loading 2 detik

# Kirim background utama (untuk menu apapun)
async def send_background_message(target, context, caption=None):
    # target: update.message ATAU query.message
    await target.reply_photo(
        photo=open("assets/background.jpg", "rb"),
        caption=caption
    )

# Menu utama setelah splash
async def show_main_menu(target, context):
    await send_background_message(target, context, caption=None)
    keyboard = [
        [
            InlineKeyboardButton("🚜 Farming", callback_data="farming"),
            InlineKeyboardButton("✅ Completed Task", callback_data="completed_task")
        ],
        [
            InlineKeyboardButton("🏆 Rank", callback_data="rank"),
            InlineKeyboardButton("💳 Wallet Connect", callback_data="wallet_connect")
        ]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    welcome_text = """🚀 **Selamat datang di GXR Airdrop Bot!**

🎮 Pilih menu di bawah untuk memulai petualangan evolusimu!

📊 **Status:** Ready to evolve
💎 **Sistem:** Evol 1-7 Active"""
    if hasattr(target, "reply_text"):
        await target.reply_text(welcome_text, reply_markup=reply_markup, parse_mode='Markdown')
    else:
        await target.edit_message_text(welcome_text, reply_markup=reply_markup, parse_mode='Markdown')

# Handler /start
async def start(update, context):
    await send_splash_screen(update, context)
    await show_main_menu(update.message, context)

async def handle_callback(update, context):
    query = update.callback_query
    await query.answer()

    if query.data == "farming":
        await show_farming_menu(query, context)
    elif query.data == "completed_task":
        await show_completed_tasks_menu(query, context)
    elif query.data == "rank":
        await show_rank_navigation_menu(query, context)
    elif query.data == "wallet_connect":
        await show_wallet_menu(query, context)
    elif query.data.startswith("task_"):
        await show_tasks_menu(query, context)
    elif query.data.startswith("evol_"):
        await show_rank_navigation_menu(query, context)
    elif query.data == "back_main":
        await show_main_menu(query.message, context)

# Semua menu utama -- selalu kirim background sebelum teks/tombol

async def show_farming_menu(query, context):
    await send_background_message(query.message, context)
    # Simulasi status farming
    farming_status = "🟢 Box Penuh - Siap Klaim!"
    next_claim = "6 jam"
    keyboard = [
        [InlineKeyboardButton("🎯 Original Task", callback_data="task_original")],
        [InlineKeyboardButton("🤝 Partnership Task", callback_data="task_partnership")],
        [InlineKeyboardButton("👥 Collaborator Task", callback_data="task_collaborator")],
        [InlineKeyboardButton("💎 Claim Reward", callback_data="claim_now")],
        [InlineKeyboardButton("🏠 Back to Home", callback_data="back_main")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    farming_text = f"""🚜 **FARMING DASHBOARD**

📦 **Status Box:** {farming_status}
⏰ **Next Claim:** {next_claim}
💰 **Reward Ready:** 250 GXR Points

🎯 **Available Tasks:**
━━━━━━━━━━━━━━━━━━━━━━━━
Pilih kategori task di bawah untuk memulai farming!"""
    await query.edit_message_text(farming_text, reply_markup=reply_markup, parse_mode='Markdown')

async def show_completed_tasks_menu(query, context):
    await send_background_message(query.message, context)
    await show_completed_tasks(query, context)

async def show_rank_navigation_menu(query, context):
    await send_background_message(query.message, context)
    await show_rank_navigation(query, context)

async def show_wallet_menu(query, context):
    await send_background_message(query.message, context)
    keyboard = [
        [InlineKeyboardButton("🔜 Coming Soon", callback_data="wallet_soon")],
        [InlineKeyboardButton("🏠 Back to Home", callback_data="back_main")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    wallet_text = """💳 **WALLET CONNECTION**

🚧 **Status:** Coming Soon

📝 **Supported Wallets (12 Types):**
• MetaMask
• Trust Wallet  
• Coinbase Wallet
• WalletConnect
• Rainbow Wallet
• Phantom Wallet
• Solflare Wallet
• Exodus Wallet
• Atomic Wallet
• SafePal Wallet
• Ledger Live
• Trezor Wallet

🔔 **Launching Soon!** 
Semua fitur wallet sedang dalam tahap persiapan dan akan segera diluncurkan!"""
    await query.edit_message_text(wallet_text, reply_markup=reply_markup, parse_mode='Markdown')

async def show_tasks_menu(query, context):
    await send_background_message(query.message, context)
    await show_tasks(query, context)