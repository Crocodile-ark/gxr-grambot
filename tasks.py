
# tasks.py

from telegram import InlineKeyboardButton, InlineKeyboardMarkup
import json
import os

TASKS_FILE = "data/tasks.json"

def load_user_tasks(user_id):
    """Load user's completed tasks"""
    if not os.path.exists(TASKS_FILE):
        return {"original": [], "partnership": [], "collaborator": []}
    
    try:
        with open(TASKS_FILE, "r") as f:
            data = json.load(f)
            return data.get(user_id, {"original": [], "partnership": [], "collaborator": []})
    except:
        return {"original": [], "partnership": [], "collaborator": []}

def save_user_tasks(user_id, tasks):
    """Save user's completed tasks"""
    if not os.path.exists("data"):
        os.makedirs("data")
    
    try:
        with open(TASKS_FILE, "r") as f:
            data = json.load(f)
    except:
        data = {}
    
    data[user_id] = tasks
    with open(TASKS_FILE, "w") as f:
        json.dump(data, f)

async def show_tasks(query, context):
    task_type = query.data.split("_")[1]  # original, partnership, collaborator
    
    tasks = {
        "original": [
            {"name": "Follow Twitter @GXROfficial", "reward": 100, "completed": False},
            {"name": "Join Telegram Channel", "reward": 100, "completed": False},
            {"name": "Share Post on Twitter", "reward": 150, "completed": False},
            {"name": "Invite 5 Friends", "reward": 500, "completed": False}
        ],
        "partnership": [
            {"name": "Complete KYC Verification", "reward": 300, "completed": False},
            {"name": "Trade $100 on DEX", "reward": 800, "completed": False},
            {"name": "Hold 1000 USDT", "reward": 600, "completed": False}
        ],
        "collaborator": [
            {"name": "Create Content Video", "reward": 1000, "completed": False},
            {"name": "Write Article Review", "reward": 750, "completed": False},
            {"name": "Design Banner/Logo", "reward": 500, "completed": False}
        ]
    }
    
    task_titles = {
        "original": "🎯 Original Tasks",
        "partnership": "🤝 Partnership Tasks", 
        "collaborator": "👥 Collaborator Tasks"
    }
    
    user_tasks = load_user_tasks(str(query.from_user.id))
    completed_tasks = user_tasks.get(task_type, [])
    
    keyboard = []
    task_text = f"**{task_titles[task_type]}**\n\n"
    
    for i, task in enumerate(tasks[task_type]):
        status = "✅" if i in completed_tasks else "📝"
        task_text += f"{status} {task['name']}\n💰 Reward: {task['reward']} points\n\n"
        
        if i not in completed_tasks:
            keyboard.append([InlineKeyboardButton(f"Complete: {task['name']}", callback_data=f"complete_{task_type}_{i}")])
    
    keyboard.append([InlineKeyboardButton("🔙 Back to Farming", callback_data="farming")])
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    await query.edit_message_text(task_text, reply_markup=reply_markup, parse_mode='Markdown')

async def show_completed_tasks(query, context):
    user_id = str(query.from_user.id)
    user_tasks = load_user_tasks(user_id)
    
    keyboard = [
        [InlineKeyboardButton("🎯 Original Task", callback_data="completed_original")],
        [InlineKeyboardButton("🤝 Partnership Task", callback_data="completed_partnership")],
        [InlineKeyboardButton("👥 Collaborator Task", callback_data="completed_collaborator")],
        [InlineKeyboardButton("🏠 Back to Home", callback_data="back_main")]
    ]
    reply_markup = InlineKeyboardMarkup(keyboard)
    
    total_completed = len(user_tasks["original"]) + len(user_tasks["partnership"]) + len(user_tasks["collaborator"])
    
    completed_text = f"""✅ **COMPLETED TASKS**

📊 **Summary:**
• Original Tasks: {len(user_tasks["original"])} completed
• Partnership Tasks: {len(user_tasks["partnership"])} completed  
• Collaborator Tasks: {len(user_tasks["collaborator"])} completed

🏆 **Total Completed:** {total_completed} tasks

Pilih kategori untuk melihat detail tasks yang sudah selesai!"""

    await query.edit_message_text(completed_text, reply_markup=reply_markup, parse_mode='Markdown')
