
# ✅ Task Management System - GXR Grambot

Panduan lengkap sistem task management GXR Grambot dengan 3 kategori task dan tracking completion.

## 📋 Overview Task System

GXR Grambot memiliki sistem task yang komprehensif dengan 3 kategori:

### 🎯 Kategori Task
1. **Original Tasks** - Task dasar bot untuk semua user
2. **Partnership Tasks** - Task kolaborasi dengan partner project
3. **Collaborator Tasks** - Task khusus untuk collaborator/admin

## 🏗️ Struktur Task System

### 📁 File Structure
```
extracted/GuideMate/
├── tasks.py              # Core task management
├── client/src/pages/
│   ├── CompletedTasksPage.tsx  # Task completion UI
│   └── FarmingPage.tsx         # Task categories display
└── client/src/components/dashboard/
    └── TasksPanel.tsx          # Task management component
```

### 💾 Database Schema
```sql
-- Task completion tracking
CREATE TABLE task_completions (
    id SERIAL PRIMARY KEY,
    user_id BIGINT NOT NULL,
    task_id VARCHAR(50) NOT NULL,
    category VARCHAR(20) NOT NULL,
    completed_at TIMESTAMP DEFAULT NOW(),
    reward_points INTEGER DEFAULT 0,
    UNIQUE(user_id, task_id)
);

-- Task definitions
CREATE TABLE tasks (
    id VARCHAR(50) PRIMARY KEY,
    category VARCHAR(20) NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    reward_points INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);
```

## 🎮 Implementasi Task Categories

### 1. Original Tasks
Task dasar yang tersedia untuk semua user:

```python
ORIGINAL_TASKS = [
    {
        'id': 'follow_twitter',
        'title': 'Follow Twitter @GXRGrambot',
        'description': 'Follow official Twitter untuk updates',
        'reward': 100,
        'action_url': 'https://twitter.com/GXRGrambot'
    },
    {
        'id': 'join_telegram',
        'title': 'Join Telegram Channel',
        'description': 'Join channel resmi untuk news',
        'reward': 100,
        'action_url': 'https://t.me/gxrgrambot'
    },
    {
        'id': 'visit_website',
        'title': 'Visit Official Website',
        'description': 'Kunjungi website resmi GXR',
        'reward': 50,
        'action_url': 'https://gxr.example.com'
    }
]
```

### 2. Partnership Tasks
Task kolaborasi dengan partner projects:

```python
PARTNERSHIP_TASKS = [
    {
        'id': 'partner_follow_1',
        'title': 'Follow Partner: CryptoProject',
        'description': 'Follow Twitter partner @CryptoProject',
        'reward': 150,
        'partner': 'CryptoProject',
        'action_url': 'https://twitter.com/CryptoProject'
    },
    {
        'id': 'partner_join_1',
        'title': 'Join Partner Channel',
        'description': 'Join Telegram channel partner',
        'reward': 150,
        'partner': 'CryptoProject',
        'action_url': 'https://t.me/cryptoproject'
    }
]
```

### 3. Collaborator Tasks
Task khusus untuk collaborator/admin:

```python
COLLABORATOR_TASKS = [
    {
        'id': 'admin_report',
        'title': 'Submit Weekly Report',
        'description': 'Submit laporan mingguan ke admin',
        'reward': 500,
        'role_required': 'collaborator'
    },
    {
        'id': 'content_creation',
        'title': 'Create Promotional Content',
        'description': 'Buat konten promosi GXR',
        'reward': 300,
        'role_required': 'collaborator'
    }
]
```

## 🔧 Task Management Functions

### Core Functions (`tasks.py`)

```python
async def get_user_tasks(user_id, category=None):
    """Get available tasks for user"""
    completed_tasks = get_completed_tasks(user_id)
    
    if category:
        available_tasks = get_tasks_by_category(category)
    else:
        available_tasks = get_all_tasks()
    
    # Filter completed tasks
    pending_tasks = [
        task for task in available_tasks 
        if task['id'] not in completed_tasks
    ]
    
    return pending_tasks

async def complete_task(user_id, task_id):
    """Mark task as completed and award points"""
    task = get_task_by_id(task_id)
    
    if not task:
        return False, "Task tidak ditemukan"
    
    # Check if already completed
    if is_task_completed(user_id, task_id):
        return False, "Task sudah completed"
    
    # Mark as completed
    mark_task_completed(user_id, task_id, task['category'])
    
    # Award points
    await add_points(user_id, task['reward'])
    
    return True, f"Task completed! +{task['reward']} points"

def get_task_completion_stats(user_id):
    """Get task completion statistics"""
    total_tasks = count_total_tasks()
    completed_tasks = count_completed_tasks(user_id)
    
    by_category = {
        'original': count_completed_by_category(user_id, 'original'),
        'partnership': count_completed_by_category(user_id, 'partnership'),
        'collaborator': count_completed_by_category(user_id, 'collaborator')
    }
    
    return {
        'total': total_tasks,
        'completed': completed_tasks,
        'percentage': (completed_tasks / total_tasks) * 100,
        'by_category': by_category
    }
```

## 🖥️ Dashboard Integration

### Task Completion Page
```typescript
// CompletedTasksPage.tsx
export default function CompletedTasksPage() {
  const [completedTasks, setCompletedTasks] = useState([]);
  const [taskStats, setTaskStats] = useState(null);

  const taskCategories = [
    {
      id: 'original',
      name: 'Original Tasks',
      icon: '🎯',
      description: 'Task dasar bot untuk semua user'
    },
    {
      id: 'partnership', 
      name: 'Partnership Tasks',
      icon: '🤝',
      description: 'Task kolaborasi partner'
    },
    {
      id: 'collaborator',
      name: 'Collaborator Tasks', 
      icon: '👑',
      description: 'Task khusus collaborator'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Task Stats */}
      <TaskStatsCard stats={taskStats} />
      
      {/* Task Categories */}
      {taskCategories.map(category => (
        <TaskCategoryCard 
          key={category.id}
          category={category}
          completedTasks={completedTasks.filter(t => t.category === category.id)}
        />
      ))}
    </div>
  );
}
```

### Task Panel Component
```typescript
// TasksPanel.tsx
export function TasksPanel({ userId, category }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const completeTask = async (taskId) => {
    setLoading(true);
    try {
      const response = await fetch('/api/tasks/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, taskId })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Update UI
        setTasks(prev => prev.filter(t => t.id !== taskId));
        
        // Show success notification
        showNotification({
          type: 'success',
          title: 'Task Completed!',
          message: result.message
        });
      }
    } catch (error) {
      console.error('Error completing task:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      {tasks.map(task => (
        <TaskCard 
          key={task.id}
          task={task}
          onComplete={() => completeTask(task.id)}
          loading={loading}
        />
      ))}
    </div>
  );
}
```

## 🎯 Telegram Bot Commands

### Task Commands
```python
async def tasks_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show available tasks"""
    user_id = update.effective_user.id
    
    # Get pending tasks by category
    original_tasks = await get_user_tasks(user_id, 'original')
    partnership_tasks = await get_user_tasks(user_id, 'partnership')
    collaborator_tasks = await get_user_tasks(user_id, 'collaborator')
    
    # Create inline keyboard
    keyboard = []
    
    if original_tasks:
        keyboard.append([InlineKeyboardButton("🎯 Original Tasks", callback_data="tasks_original")])
    
    if partnership_tasks:
        keyboard.append([InlineKeyboardButton("🤝 Partnership Tasks", callback_data="tasks_partnership")])
    
    if collaborator_tasks:
        keyboard.append([InlineKeyboardButton("👑 Collaborator Tasks", callback_data="tasks_collaborator")])
    
    keyboard.append([InlineKeyboardButton("📊 Task Stats", callback_data="task_stats")])
    keyboard.append([InlineKeyboardButton("🏠 Main Menu", callback_data="main_menu")])
    
    await update.message.reply_text(
        "✅ **TASK CENTER**\n\n"
        "Pilih kategori task yang ingin dikerjakan:\n\n"
        f"🎯 Original: {len(original_tasks)} available\n"
        f"🤝 Partnership: {len(partnership_tasks)} available\n"
        f"👑 Collaborator: {len(collaborator_tasks)} available",
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode='Markdown'
    )

async def show_category_tasks(update: Update, context: ContextTypes.DEFAULT_TYPE, category: str):
    """Show tasks for specific category"""
    query = update.callback_query
    user_id = query.from_user.id
    
    tasks = await get_user_tasks(user_id, category)
    
    if not tasks:
        await query.edit_message_text(f"✅ Semua {category} tasks sudah completed!")
        return
    
    text = f"✅ **{category.upper()} TASKS**\n\n"
    keyboard = []
    
    for task in tasks[:5]:  # Limit 5 tasks per page
        text += f"🎯 **{task['title']}**\n"
        text += f"📝 {task['description']}\n"
        text += f"💰 Reward: {task['reward']} points\n\n"
        
        keyboard.append([
            InlineKeyboardButton(
                f"✅ Complete: {task['title'][:20]}...", 
                callback_data=f"complete_{task['id']}"
            )
        ])
    
    keyboard.append([InlineKeyboardButton("🔙 Back to Tasks", callback_data="tasks_menu")])
    
    await query.edit_message_text(
        text,
        reply_markup=InlineKeyboardMarkup(keyboard),
        parse_mode='Markdown'
    )
```

## 📊 Admin Task Management

### Add New Task
```python
async def admin_add_task(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Admin command to add new task"""
    if not is_admin(update.effective_user.id):
        return
    
    # Parse command: /addtask category title|description|reward|url
    args = context.args
    if len(args) < 2:
        await update.message.reply_text("Format: /addtask category title|description|reward|url")
        return
    
    category = args[0]
    task_data = ' '.join(args[1:]).split('|')
    
    if len(task_data) < 3:
        await update.message.reply_text("Format: title|description|reward|url")
        return
    
    task = {
        'category': category,
        'title': task_data[0],
        'description': task_data[1], 
        'reward': int(task_data[2]),
        'action_url': task_data[3] if len(task_data) > 3 else None
    }
    
    task_id = add_task(task)
    await update.message.reply_text(f"✅ Task added with ID: {task_id}")

async def admin_task_stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Show task completion statistics"""
    if not is_admin(update.effective_user.id):
        return
    
    stats = get_global_task_stats()
    
    text = "📊 **TASK STATISTICS**\n\n"
    text += f"Total Tasks: {stats['total_tasks']}\n"
    text += f"Total Completions: {stats['total_completions']}\n"
    text += f"Unique Users: {stats['unique_users']}\n\n"
    
    text += "**By Category:**\n"
    for category, count in stats['by_category'].items():
        text += f"{category}: {count} completions\n"
    
    await update.message.reply_text(text, parse_mode='Markdown')
```

## 🔄 API Endpoints

### REST API for Dashboard
```typescript
// Task API endpoints
app.get('/api/tasks/:userId', async (req, res) => {
  const { userId } = req.params;
  const { category } = req.query;
  
  const tasks = await get_user_tasks(userId, category);
  res.json({ tasks });
});

app.post('/api/tasks/complete', async (req, res) => {
  const { userId, taskId } = req.body;
  
  const result = await complete_task(userId, taskId);
  res.json({ success: result[0], message: result[1] });
});

app.get('/api/tasks/stats/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const stats = get_task_completion_stats(userId);
  res.json(stats);
});

app.get('/api/tasks/completed/:userId', async (req, res) => {
  const { userId } = req.params;
  
  const completed = get_completed_tasks_detailed(userId);
  res.json({ completed });
});
```

## ⚡ Real-time Updates

### WebSocket Events
```typescript
// WebSocket for real-time task updates
websocket.on('task_completed', (data) => {
  const { userId, taskId, reward, newPoints } = data;
  
  // Update UI
  updateTaskList(taskId);
  updateUserPoints(newPoints);
  
  // Show notification
  showNotification({
    type: 'success',
    title: 'Task Completed!',
    message: `+${reward} points earned`
  });
});

websocket.on('new_task_available', (data) => {
  const { task } = data;
  
  // Add to available tasks
  addTaskToList(task);
  
  // Show notification
  showNotification({
    type: 'info',
    title: 'New Task Available!',
    message: task.title
  });
});
```

## 🎯 Best Practices

### 1. Task Design
- **Clear descriptions** - User tahu apa yang harus dilakukan
- **Appropriate rewards** - Sesuai dengan effort required
- **Verifiable completion** - Bisa diverifikasi secara otomatis/manual

### 2. User Experience
- **Progress tracking** - Show completion percentage
- **Category organization** - Group tasks logically
- **Real-time updates** - Instant feedback on completion

### 3. Admin Management
- **Easy task creation** - Simple commands untuk add tasks
- **Statistics monitoring** - Track completion rates
- **Bulk operations** - Enable/disable multiple tasks

### 4. Performance
- **Efficient queries** - Index task completions properly
- **Caching** - Cache frequently accessed task data
- **Pagination** - Don't load all tasks at once

---

**✅ Happy Task Managing dengan GXR Grambot!**
