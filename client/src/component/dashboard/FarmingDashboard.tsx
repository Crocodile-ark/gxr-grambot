import { useState, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { UserStats } from "@/types";

interface FarmingDashboardProps {
  userStats: UserStats;
}

export default function FarmingDashboard({ userStats }: FarmingDashboardProps) {
  const [timeRemaining, setTimeRemaining] = useState(userStats.timeUntilNextClaim);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const claimMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", `/api/users/${userStats.user.id}/claim`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/me/${userStats.user.telegramId}`] });
      toast({
        title: "Claim Successful!",
        description: "You've successfully claimed 250 GXR Points!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Claim Failed",
        description: error.message || "Failed to claim reward",
        variant: "destructive",
      });
    },
  });

  useEffect(() => {
    if (!userStats.canClaim && userStats.timeUntilNextClaim > 0) {
      const timer = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1000) {
            clearInterval(timer);
            queryClient.invalidateQueries({ queryKey: [`/api/users/me/${userStats.user.telegramId}`] });
            return 0;
          }
          return prev - 1000;
        });
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [userStats.canClaim, userStats.timeUntilNextClaim, queryClient, userStats.user.telegramId]);

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  };

  return (
    <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-green-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <i className="fas fa-seedling text-gxr-green mr-3"></i>
          Farming Dashboard
        </h3>
        <div className="flex items-center space-x-2">
          <div className="w-3 h-3 bg-gxr-success rounded-full animate-pulse"></div>
          <span className="text-sm text-gxr-success">Active</span>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Claim Timer */}
        <div className="bg-gxr-dark rounded-lg p-6 border border-orange-500/30">
          <div className="text-center">
            <div className="text-4xl font-bold text-gxr-warning mb-2">
              {userStats.canClaim ? "00:00:00" : formatTime(timeRemaining)}
            </div>
            <p className="text-gxr-text-secondary mb-4">
              {userStats.canClaim ? "Ready to Claim!" : "Next Claim Available"}
            </p>
            
            <Button
              onClick={() => claimMutation.mutate()}
              disabled={!userStats.canClaim || claimMutation.isPending}
              className={`w-full font-medium transition-all duration-200 ${
                userStats.canClaim 
                  ? "bg-gxr-success hover:bg-gxr-success/80 text-white pulse-glow-animation" 
                  : "bg-gxr-warning/20 text-gxr-warning cursor-not-allowed"
              }`}
            >
              <i className={`mr-2 ${userStats.canClaim ? "fas fa-gift" : "fas fa-clock"}`}></i>
              {claimMutation.isPending 
                ? "Claiming..." 
                : userStats.canClaim 
                  ? "Claim 250 Points" 
                  : "Wait for Timer"
              }
            </Button>
          </div>
        </div>
        
        {/* Farming Stats */}
        <div className="space-y-4">
          <div className="bg-gxr-dark rounded-lg p-4 border border-green-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gxr-text-secondary">Daily Earnings</span>
              <span className="text-xl font-bold text-gxr-green">{userStats.dailyEarnings.toLocaleString()}</span>
            </div>
          </div>
          
          <div className="bg-gxr-dark rounded-lg p-4 border border-blue-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gxr-text-secondary">Total Claims</span>
              <span className="text-xl font-bold text-gxr-blue">{userStats.totalClaims}</span>
            </div>
          </div>
          
          <div className="bg-gxr-dark rounded-lg p-4 border border-orange-500/30">
            <div className="flex justify-between items-center">
              <span className="text-gxr-text-secondary">Pool Status</span>
              <span className="text-sm text-gxr-success">Active</span>
            </div>
            <div className="w-full bg-gxr-dark rounded-full h-2 mt-2">
              <div className="bg-gxr-warning h-2 rounded-full" style={{ width: "73%" }}></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}