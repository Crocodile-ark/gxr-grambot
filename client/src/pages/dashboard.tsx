import { useState, useCallback } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useToast } from "@/hooks/use-toast";
import UserStatsCard from "@/components/dashboard/UserStatsCard";
import FarmingDashboard from "@/components/dashboard/FarmingDashboard";
import TasksPanel from "@/components/dashboard/TasksPanel";
import LeaderboardPanel from "@/components/dashboard/LeaderboardPanel";
import ReferralPanel from "@/components/dashboard/ReferralPanel";
import WalletPanel from "@/components/dashboard/WalletPanel";
import AdminPanel from "@/components/dashboard/AdminPanel";
import NotificationModal from "@/components/dashboard/NotificationModal";
import type { UserStats, NotificationData } from "@/types";

export default function Dashboard() {
  const [telegramId] = useState("123456789"); // In real app, get from Telegram WebApp
  const [notificationData, setNotificationData] = useState<NotificationData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: [`/api/users/me/${telegramId}`],
  });

  const handleWebSocketMessage = useCallback((message: any) => {
    switch (message.type) {
      case 'auth_success':
        setIsConnected(true);
        break;
      case 'user_claimed':
        if (message.userId === userStats?.user.id) {
          setNotificationData({
            title: 'Success!',
            message: `You've successfully claimed ${message.amount} GXR Points!`,
            type: 'success'
          });
        }
        queryClient.invalidateQueries({ queryKey: [`/api/users/me/${telegramId}`] });
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
        break;
      case 'task_completed':
        if (message.userId === userStats?.user.id) {
          toast({
            title: "Task Completed!",
            description: "Congratulations! You've completed a task.",
          });
        }
        queryClient.invalidateQueries({ queryKey: [`/api/users/me/${telegramId}`] });
        queryClient.invalidateQueries({ queryKey: [`/api/users/${userStats?.user.id}/tasks`] });
        queryClient.invalidateQueries({ queryKey: ['/api/leaderboard'] });
        break;
    }
  }, [userStats?.user.id, queryClient, toast, telegramId]);

  useWebSocket({
    onMessage: handleWebSocketMessage,
    userId: userStats?.user.id,
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gxr-dark flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 bg-gradient-to-r from-gxr-green to-gxr-blue rounded-full flex items-center justify-center text-2xl font-bold glow-animation mx-auto mb-4">
            GXR
          </div>
          <p className="text-gxr-text-secondary">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  if (!userStats) {
    return (
      <div className="min-h-screen bg-gxr-dark flex items-center justify-center">
        <div className="text-center text-red-400">
          <p>Failed to load user data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gxr-dark text-gxr-text">
      {/* Header */}
      <header className="border-b border-gxr-dark-secondary bg-gxr-dark-secondary/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-10 h-10 bg-gradient-to-r from-gxr-green to-gxr-blue rounded-lg flex items-center justify-center font-bold text-lg">
                GXR
              </div>
              <div>
                <h1 className="text-xl font-bold text-gxr-text">GXR Grambot</h1>
                <p className="text-sm text-gxr-text-secondary">Gaming Airdrop Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="hidden md:flex items-center space-x-2 bg-gxr-dark-secondary rounded-lg px-3 py-2">
                <div className={`w-2 h-2 rounded-full animate-pulse ${isConnected ? 'bg-gxr-success' : 'bg-red-500'}`}></div>
                <span className="text-sm">{isConnected ? 'Connected' : 'Disconnected'}</span>
              </div>
              
              <button className="bg-gxr-green hover:bg-gxr-green/80 text-gxr-dark px-4 py-2 rounded-lg font-medium transition-all duration-200 hover:shadow-lg hover:shadow-gxr-green/30">
                <i className="fas fa-wallet mr-2"></i>
                {userStats.user.wallet ? 'Wallet Connected' : 'Connect Wallet'}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        <UserStatsCard userStats={userStats} />
        <FarmingDashboard userStats={userStats} />
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <TasksPanel userId={userStats.user.id} />
          <LeaderboardPanel userStats={userStats} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ReferralPanel userStats={userStats} />
          <WalletPanel userStats={userStats} />
        </div>

        {userStats.user.isAdmin && <AdminPanel />}
      </main>

      {/* Footer */}
      <footer className="border-t border-gxr-dark-secondary bg-gxr-dark-secondary/30 mt-12">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-4 mb-4">
              <div className="w-8 h-8 bg-gradient-to-r from-gxr-green to-gxr-blue rounded-lg flex items-center justify-center font-bold">
                GXR
              </div>
              <span className="text-lg font-bold">GXR Grambot</span>
            </div>
            <p className="text-sm text-gxr-text-secondary mb-4">
              Gaming Airdrop Bot with Evolution System
            </p>
            <div className="flex items-center justify-center space-x-6 text-gxr-text-secondary">
              <a href="#" className="hover:text-gxr-green transition-colors duration-200">
                <i className="fab fa-twitter"></i> Twitter
              </a>
              <a href="#" className="hover:text-gxr-blue transition-colors duration-200">
                <i className="fab fa-telegram"></i> Telegram
              </a>
              <a href="#" className="hover:text-gxr-warning transition-colors duration-200">
                <i className="fas fa-globe"></i> Website
              </a>
            </div>
          </div>
        </div>
      </footer>

      <NotificationModal 
        data={notificationData} 
        onClose={() => setNotificationData(null)} 
      />
    </div>
  );
}
