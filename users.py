# users.py

import json, os, time
from evol import get_evol_info
from config import CLAIM_REWARD, CLAIM_INTERVAL_HOURS
from pool import check_and_reduce_pool

DATA_PATH = "data/users.json"

def load_users():
    if not os.path.exists(DATA_PATH):
        return {}
    with open(DATA_PATH, "r") as f:
        return json.load(f)

def save_users(data):
    with open(DATA_PATH, "w") as f:
        json.dump(data, f)

def claim_reward(update, context):
    user_id = str(update.effective_user.id)
    users = load_users()
    now = time.time()

    user = users.get(user_id, {"points": 0, "last_claim": 0, "wallet": ""})
    elapsed = now - user.get("last_claim", 0)

    if elapsed < CLAIM_INTERVAL_HOURS * 3600:
        remaining = int(CLAIM_INTERVAL_HOURS * 3600 - elapsed)
        update.message.reply_text(f"Tunggu {remaining//3600} jam {remaining%3600//60} menit lagi.")
        return

    name, _, max_gxr = get_evol_info(user["points"])
    if not check_and_reduce_pool(name, max_gxr):
        update.message.reply_text("⚠️ Pool tier kamu sudah habis. Tunggu refill.")
        return

    user["points"] += CLAIM_REWARD
    user["last_claim"] = now
    users[user_id] = user
    save_users(users)
    update.message.reply_text(f"✅ Klaim berhasil! +{CLAIM_REWARD} poin.\nEvolusimu: {name}")

def get_user_status(update, context):
    user_id = str(update.effective_user.id)
    users = load_users()
    user = users.get(user_id, {"points": 0})
    name, badge, _ = get_evol_info(user["points"])
    context.bot.send_photo(chat_id=update.effective_chat.id, photo=open(badge, "rb"),
        caption=f"Evolusimu: {name}\nPoin: {user['points']}")

def connect_wallet(update, context):
    if not context.args:
        update.message.reply_text("Gunakan format: /connectwallet gxr1xxxx")
        return
    address = context.args[0]
    if not address.startswith("gxr1"):
        update.message.reply_text("Alamat tidak valid.")
        return
    user_id = str(update.effective_user.id)
    users = load_users()
    user = users.get(user_id, {"points": 0})
    user["wallet"] = address
    users[user_id] = user
    save_users(users)
    update.message.reply_text("✅ Wallet berhasil dihubungkan.")

def export_csv(update, context):
    if str(update.effective_user.id) != "123456789":  # Ganti dengan Telegram ID kamu
        update.message.reply_text("Kamu bukan admin.")
        return

    import csv
    users = load_users()
    with open("data/export.csv", "w", newline="") as f:
        writer = csv.writer(f)
        writer.writerow(["User ID", "Points", "Wallet"])
        for uid, u in users.items():
            writer.writerow([uid, u["points"], u.get("wallet", "")])
    update.message.reply_document(document=open("data/export.csv", "rb"))
                  
