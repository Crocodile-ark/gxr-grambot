# referral.py

from users import load_users, save_users
from config import REFERRAL_REWARD

async def show_referral_code(update, context):
    user_id = str(update.effective_user.id)
    await update.message.reply_text(f"Kode referralmu: REF{user_id}")

async def apply_referral(update, context):
    if not context.args:
        await update.message.reply_text("Gunakan format: /usecode REF123456")
        return
    code = context.args[0].replace("REF", "")
    referrer_id = code
    new_user_id = str(update.effective_user.id)
    if referrer_id == new_user_id:
        await update.message.reply_text("Kamu tidak bisa mereferensikan dirimu sendiri.")
        return

    users = load_users()
    if users.get(new_user_id, {}).get("ref_applied"):
        await update.message.reply_text("Referral sudah digunakan.")
        return

    users.setdefault(referrer_id, {"points": 0})
    users[referrer_id]["points"] += REFERRAL_REWARD
    users.setdefault(new_user_id, {"points": 0})
    users[new_user_id]["points"] += REFERRAL_REWARD
    users[new_user_id]["ref_applied"] = True
    save_users(users)
    await update.message.reply_text("✅ Referral berhasil! Kamu dan temanmu dapat poin.")
