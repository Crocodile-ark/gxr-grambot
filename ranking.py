
# ranking.py

from telegram import InlineKeyboardButton, InlineKeyboardMarkup
from users import load_users
from evol import get_evol_info
import os

async def show_rank_navigation(query, context):
    user_id = str(query.from_user.id)
    users = load_users()
    user = users.get(user_id, {"points": 0})
    current_evol, badge_path, _ = get_evol_info(user["points"])
    
    # Extract current evol number
    current_evol_num = 1
    for i in range(1, 8):
        if f"Evol {i}" in current_evol:
            current_evol_num = i
            break
    
    # Navigation buttons
    prev_evol = max(1, current_evol_num - 1)
    next_evol = min(7, current_evol_num + 1)
    
    keyboard = []
    
    # Navigation row
    nav_row = []
    if current_evol_num > 1:
        nav_row.append(InlineKeyboardButton("⬅️ Previous", callback_data=f"evol_{prev_evol}"))
    nav_row.append(InlineKeyboardButton(f"🎯 Evol {current_evol_num}", callback_data=f"evol_{current_evol_num}"))
    if current_evol_num < 7:
        nav_row.append(InlineKeyboardButton("➡️ Next", callback_data=f"evol_{next_evol}"))
    keyboard.append(nav_row)
    
    # Action buttons
    keyboard.append([InlineKeyboardButton("🏆 Top 100 Leaderboard", callback_data=f"leaderboard_{current_evol_num}")])
    keyboard.append([InlineKeyboardButton("📊 My Position", callback_data="my_position")])
    keyboard.append([InlineKeyboardButton("🏠 Back to Home", callback_data="back_main")])
    
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    # Get user ranking
    all_users = [(uid, data.get("points", 0)) for uid, data in users.items()]
    all_users.sort(key=lambda x: x[1], reverse=True)
    user_rank = next((i+1 for i, (uid, _) in enumerate(all_users) if uid == user_id), "Unranked")
    
    rank_text = f"""🏆 **RANK EVOLUTION**

👤 **Your Profile:**
🎮 Evolution: {current_evol}
💎 Points: {user["points"]:,}
📍 Global Rank: #{user_rank}

🎯 **Evolution Progress:**
{'🟢' if current_evol_num >= 1 else '⚪'} Evol 1 - Rookie (0-49)
{'🟢' if current_evol_num >= 2 else '⚪'} Evol 2 - Charger (50-14,999)
{'🟢' if current_evol_num >= 3 else '⚪'} Evol 3 - Breaker (15,000-29,999)
{'🟢' if current_evol_num >= 4 else '⚪'} Evol 4 - Phantom (30,000-49,999)
{'🟢' if current_evol_num >= 5 else '⚪'} Evol 5 - Overdrive (50,000-79,999)
{'🟢' if current_evol_num >= 6 else '⚪'} Evol 6 - Genesis (80,000-119,999)
{'🟢' if current_evol_num >= 7 else '⚪'} Evol 7 - Final Form (120,000+)

Gunakan tombol navigasi untuk melihat evol lainnya!"""

    # Send photo if exists, otherwise send text
    if os.path.exists(badge_path):
        await query.message.reply_photo(
            photo=open(badge_path, "rb"),
            caption=rank_text,
            reply_markup=reply_markup,
            parse_mode='Markdown'
        )
        await query.delete_message()
    else:
        await query.edit_message_text(rank_text, reply_markup=reply_markup, parse_mode='Markdown')

async def show_leaderboard(query, context):
    evol_num = int(query.data.split("_")[1])
    users = load_users()
    
    # Filter users by evol level
    evol_users = []
    for uid, data in users.items():
        points = data.get("points", 0)
        evol_name, _, _ = get_evol_info(points)
        if f"Evol {evol_num}" in evol_name:
            evol_users.append((uid, points, data.get("username", f"User{uid[:6]}")))
    
    # Sort by points
    evol_users.sort(key=lambda x: x[1], reverse=True)
    top_100 = evol_users[:100]
    
    keyboard = [
        [InlineKeyboardButton("🔙 Back to Rank", callback_data="rank")],
        [InlineKeyboardButton("🏠 Back to Home", callback_data="back_main")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    evol_names = {
        1: "Rookie", 2: "Charger", 3: "Breaker", 4: "Phantom",
        5: "Overdrive", 6: "Genesis", 7: "Final Form"
    }
    
    leaderboard_text = f"🏆 **TOP 100 - EVOL {evol_num} ({evol_names[evol_num]})**\n\n"
    
    if not top_100:
        leaderboard_text += "Belum ada pengguna di level ini."
    else:
        for i, (uid, points, username) in enumerate(top_100[:10]):  # Show top 10
            medal = "🥇" if i == 0 else "🥈" if i == 1 else "🥉" if i == 2 else f"{i+1}."
            leaderboard_text += f"{medal} {username}\n💎 {points:,} points\n\n"
        
        if len(top_100) > 10:
            leaderboard_text += f"... dan {len(top_100)-10} pengguna lainnya\n\n"
        
        leaderboard_text += f"📊 Total {len(top_100)} pengguna di Evol {evol_num}"
    
    await query.edit_message_text(leaderboard_text, reply_markup=reply_markup, parse_mode='Markdown')
