import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import type { LeaderboardEntry, UserStats } from "@/types";

interface LeaderboardPanelProps {
  userStats: UserStats;
}

export default function LeaderboardPanel({ userStats }: LeaderboardPanelProps) {
  const [selectedEvol, setSelectedEvol] = useState<string>("all");

  const { data: leaderboard = [], isLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard', selectedEvol === "all" ? undefined : selectedEvol],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (selectedEvol !== "all") params.append('evolLevel', selectedEvol);
      params.append('limit', '10');
      
      const response = await fetch(`/api/leaderboard?${params}`);
      if (!response.ok) throw new Error('Failed to fetch leaderboard');
      return response.json();
    },
  });

  const getMedalIcon = (rank: number) => {
    switch (rank) {
      case 1: return "🥇";
      case 2: return "🥈";
      case 3: return "🥉";
      default: return `${rank}.`;
    }
  };

  const isCurrentUser = (entry: LeaderboardEntry) => {
    return entry.user.id === userStats.user.id;
  };

  if (isLoading) {
    return (
      <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-orange-500/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gxr-dark rounded w-1/2"></div>
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="bg-gxr-dark rounded-lg p-3 h-16"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-orange-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <i className="fas fa-trophy text-gxr-warning mr-3"></i>
          Leaderboard
        </h3>
        <Select value={selectedEvol} onValueChange={setSelectedEvol}>
          <SelectTrigger className="w-32 bg-gxr-dark border-gxr-warning/30">
            <SelectValue placeholder="All Evols" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Evols</SelectItem>
            <SelectItem value="1">Evol 1</SelectItem>
            <SelectItem value="2">Evol 2</SelectItem>
            <SelectItem value="3">Evol 3</SelectItem>
            <SelectItem value="4">Evol 4</SelectItem>
            <SelectItem value="5">Evol 5</SelectItem>
            <SelectItem value="6">Evol 6</SelectItem>
            <SelectItem value="7">Evol 7</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-3">
        {leaderboard.length === 0 ? (
          <div className="text-center py-8 text-gxr-text-secondary">
            <i className="fas fa-users text-4xl mb-4"></i>
            <p>No users found for this evolution level</p>
          </div>
        ) : (
          leaderboard.map((entry) => (
            <div 
              key={entry.user.id}
              className={`flex items-center space-x-4 rounded-lg p-3 transition-all duration-200 ${
                isCurrentUser(entry)
                  ? 'bg-gxr-blue/10 border border-gxr-blue/30'
                  : 'bg-gxr-dark hover:bg-gxr-dark/50'
              }`}
            >
              <div className="flex-shrink-0">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                  entry.rank === 1 
                    ? 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-black'
                    : entry.rank === 2
                    ? 'bg-gradient-to-r from-gray-300 to-gray-500 text-black'
                    : entry.rank === 3
                    ? 'bg-gradient-to-r from-orange-400 to-orange-600 text-black'
                    : isCurrentUser(entry)
                    ? 'bg-gxr-blue text-white'
                    : 'bg-gxr-dark-secondary text-gxr-text'
                }`}>
                  {entry.rank <= 3 ? getMedalIcon(entry.rank).slice(0, 2) : entry.rank}
                </div>
              </div>
              <div className="flex-1">
                <div className={`font-medium ${isCurrentUser(entry) ? 'text-gxr-blue' : ''}`}>
                  {isCurrentUser(entry) ? 'You' : (entry.user.username || `User${entry.user.telegramId.slice(-6)}`)}
                </div>
                <div className="text-sm text-gxr-text-secondary">{entry.evolName}</div>
              </div>
              <div className="text-right">
                <div className="font-bold text-gxr-green">
                  {entry.user.points?.toLocaleString() || 0}
                </div>
                <div className="text-xs text-gxr-text-secondary">points</div>
              </div>
            </div>
          ))
        )}
      </div>
      
      {!leaderboard.some(entry => isCurrentUser(entry)) && (
        <div className="mt-4 pt-4 border-t border-gxr-dark">
          <div className="flex items-center space-x-4 bg-gxr-blue/10 border border-gxr-blue/30 rounded-lg p-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-gxr-blue rounded-full flex items-center justify-center text-sm font-bold">
                {userStats.globalRank}
              </div>
            </div>
            <div className="flex-1">
              <div className="font-medium text-gxr-blue">You</div>
              <div className="text-sm text-gxr-text-secondary">{userStats.evolName}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-gxr-green">
                {userStats.user.points?.toLocaleString() || 0}
              </div>
              <div className="text-xs text-gxr-text-secondary">points</div>
            </div>
          </div>
        </div>
      )}
      
      <div className="mt-6 text-center">
        <button className="text-gxr-warning hover:text-gxr-warning/80 font-medium transition-colors duration-200">
          View Full Leaderboard <i className="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}
