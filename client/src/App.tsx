import "./index.css";
import { useState, useEffect } from "react";
import { Switch, Route } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ThemeProvider";
import BottomNavigation from "@/components/BottomNavigation";
import FarmingPage from "./pages/FarmingPage";
import CompletedTasksPage from "./pages/CompletedTasksPage";
import RankPage from "./pages/RankPage";
import WalletPage from "./pages/WalletPage";
import { ProfilePage } from "./pages/SimplePage";
import NotFound from "./pages/not-found";

function Router() {
  const [activeTab, setActiveTab] = useState('farming');
  const [userId] = useState(123456789); // Mock user ID for demo
  const [isLoading, setIsLoading] = useState(true);

  // Simulate loading screen
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    return () => clearTimeout(timer);
  }, []);

  // Loading Screen
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 via-black to-red-500">
        <div className="bg-black/50 backdrop-blur-sm rounded-lg p-8 text-center">
          <div className="animate-spin w-8 h-8 border-4 border-gxr-green border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-bold text-white mb-2">GXR Grambot</h2>
          <p className="text-gray-300">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/" component={() => (
        <MainDashboard activeTab={activeTab} setActiveTab={setActiveTab} userId={userId} />
      )} />
      <Route path="/dashboard" component={() => (
        <MainDashboard activeTab={activeTab} setActiveTab={setActiveTab} userId={userId} />
      )} />
      <Route component={NotFound} />
    </Switch>
  );
}

function MainDashboard({ activeTab, setActiveTab, userId }: {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  userId: number;
}) {
  return (
    <div className="min-h-screen bg-slate-900 dark:bg-black">
      <div className="min-h-screen bg-gradient-to-br from-gxr-dark/50 via-background/95 to-gxr-dark-secondary/50 backdrop-blur-sm">
        <div className="container max-w-md mx-auto px-4 pt-6 pb-24">
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-2xl font-bold bg-gradient-to-r from-gxr-green to-gxr-blue bg-clip-text text-transparent">
              GXR Grambot
            </h1>
            <p className="text-sm text-muted-foreground">Airdrop Farming Dashboard</p>
          </div>

          {/* Page Content */}
          <div className="mb-4">
            {activeTab === 'farming' && <FarmingPage userId={userId} />}
            {activeTab === 'completed' && <CompletedTasksPage userId={userId} />}
            {activeTab === 'rank' && <RankPage userId={userId} />}
            {activeTab === 'profile' && <ProfilePage />}
            {activeTab === 'wallet' && <WalletPage userId={userId} />}
          </div>
        </div>
      </div>
        {/* Bottom Navigation */}
        <BottomNavigation activeTab={activeTab} onTabChange={setActiveTab} />
      </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <ThemeProvider>
          <Toaster />
          <Router />
        </ThemeProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
