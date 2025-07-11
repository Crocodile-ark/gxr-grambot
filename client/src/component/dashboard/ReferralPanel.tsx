import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { UserStats } from "@/types";

interface ReferralPanelProps {
  userStats: UserStats;
}

export default function ReferralPanel({ userStats }: ReferralPanelProps) {
  const [referralCode, setReferralCode] = useState("");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const applyReferralMutation = useMutation({
    mutationFn: async (code: string) => {
      const response = await apiRequest("POST", `/api/users/${userStats.user.id}/referral`, {
        referralCode: code,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/me/${userStats.user.telegramId}`] });
      setReferralCode("");
      toast({
        title: "Referral Applied!",
        description: "You and your friend both received points!",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Referral Failed",
        description: error.message || "Failed to apply referral code",
        variant: "destructive",
      });
    },
  });

  const copyReferralCode = async () => {
    if (!userStats.user.referralCode) return;
    
    try {
      await navigator.clipboard.writeText(userStats.user.referralCode);
      toast({
        title: "Copied!",
        description: "Referral code copied to clipboard",
      });
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "Failed to copy referral code",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-green-500/20">
      <h3 className="text-xl font-bold mb-6 flex items-center">
        <i className="fas fa-users text-gxr-green mr-3"></i>
        Referral System
      </h3>
      
      <div className="space-y-4">
        <div className="bg-gxr-dark rounded-lg p-4">
          <div className="text-sm text-gxr-text-secondary mb-2">Your Referral Code</div>
          <div className="flex items-center space-x-2">
            <div className="flex-1 bg-gxr-dark-secondary border border-green-500/30 rounded-lg px-3 py-2 font-mono text-gxr-green">
              {userStats.user.referralCode || 'Loading...'}
            </div>
            <Button
              onClick={copyReferralCode}
              className="bg-gxr-green hover:bg-gxr-green/80 text-gxr-dark px-4 py-2"
              disabled={!userStats.user.referralCode}
            >
              <i className="fas fa-copy"></i>
            </Button>
          </div>
        </div>
        
        {!userStats.user.refApplied && (
          <div className="bg-gxr-dark rounded-lg p-4">
            <div className="text-sm text-gxr-text-secondary mb-2">Apply Referral Code</div>
            <div className="flex items-center space-x-2">
              <Input
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                placeholder="Enter referral code..."
                className="flex-1 bg-gxr-dark-secondary border-green-500/30"
              />
              <Button
                onClick={() => applyReferralMutation.mutate(referralCode)}
                disabled={!referralCode || applyReferralMutation.isPending}
                className="bg-gxr-blue hover:bg-gxr-blue/80 text-white"
              >
                {applyReferralMutation.isPending ? "Applying..." : "Apply"}
              </Button>
            </div>
          </div>
        )}
        
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gxr-dark rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gxr-green">
              {userStats.user.totalReferrals || 0}
            </div>
            <div className="text-sm text-gxr-text-secondary">Total Referrals</div>
          </div>
          <div className="bg-gxr-dark rounded-lg p-4 text-center">
            <div className="text-2xl font-bold text-gxr-blue">
              {(userStats.user.totalReferrals || 0) * 50}
            </div>
            <div className="text-sm text-gxr-text-secondary">Points Earned</div>
          </div>
        </div>
        
        <div className="space-y-2">
          <div className="text-sm text-gxr-text-secondary">Referral Benefits</div>
          <div className="text-sm space-y-1">
            <div className="flex items-center justify-between bg-gxr-dark rounded-lg px-3 py-2">
              <span>You earn</span>
              <span className="text-gxr-green">+50 points</span>
            </div>
            <div className="flex items-center justify-between bg-gxr-dark rounded-lg px-3 py-2">
              <span>Friend earns</span>
              <span className="text-gxr-green">+50 points</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
