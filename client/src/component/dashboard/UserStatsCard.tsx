import { Progress } from "@/components/ui/progress";
import type { UserStats } from "@/types";

interface UserStatsCardProps {
  userStats: UserStats;
}

export default function UserStatsCard({ userStats }: UserStatsCardProps) {
  return (
    <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-blue-500/20 slide-up-animation">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="text-center md:text-left">
          <div className="flex items-center justify-center md:justify-start space-x-4 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-gxr-blue to-gxr-green rounded-full flex items-center justify-center text-2xl font-bold glow-animation">
              E{userStats.evolLevel}
            </div>
            <div>
              <h2 className="text-2xl font-bold">{userStats.evolName}</h2>
              <p className="text-gxr-text-secondary">@{userStats.user.username || 'Unknown'}</p>
            </div>
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-gxr-green mb-2">
            {userStats.user.points?.toLocaleString() || 0}
          </div>
          <p className="text-gxr-text-secondary">GXR Points</p>
          <div className="text-sm text-gxr-blue mt-1">
            <i className="fas fa-trophy mr-1"></i>
            Rank #{userStats.globalRank}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-2xl font-bold text-gxr-blue mb-2">
            {userStats.user.totalReferrals || 0}
          </div>
          <p className="text-gxr-text-secondary">Referrals</p>
          <div className="text-sm text-gxr-green mt-1">
            +{((userStats.user.totalReferrals || 0) * 50)} Points Earned
          </div>
        </div>
      </div>
      
      {/* Evolution Progress Bar */}
      <div className="mt-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-gxr-text-secondary">
            {userStats.evolLevel === 7 ? 'Max Evolution Reached!' : `Progress to Evol ${userStats.evolLevel + 1}`}
          </span>
          <span className="text-sm text-gxr-blue">{userStats.progressPercentage}%</span>
        </div>
        <Progress 
          value={userStats.progressPercentage} 
          className="h-3"
        />
        <div className="flex justify-between text-xs text-gxr-text-secondary mt-1">
          <span>{userStats.user.points?.toLocaleString() || 0}</span>
          <span>{userStats.nextEvolTarget.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
