import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Trophy, Crown, Star, TrendingUp } from 'lucide-react';
import type { UserStats, LeaderboardEntry } from '@/types';

interface RankPageProps {
  userId: number;
}

// Evolution level configurations
const evolLevels = [
  { level: 1, name: 'Rookie', minPoints: 0, maxPoints: 49, color: '#64748B' },
  { level: 2, name: 'Charger', minPoints: 50, maxPoints: 14999, color: '#10B981' },
  { level: 3, name: 'Breaker', minPoints: 15000, maxPoints: 29999, color: '#3B82F6' },
  { level: 4, name: 'Phantom', minPoints: 30000, maxPoints: 49999, color: '#8B5CF6' },
  { level: 5, name: 'Overdrive', minPoints: 50000, maxPoints: 79999, color: '#F59E0B' },
  { level: 6, name: 'Genesis', minPoints: 80000, maxPoints: 119999, color: '#EF4444' },
  { level: 7, name: 'Final Form', minPoints: 120000, maxPoints: Infinity, color: '#F97316' },
];

export default function RankPage({ userId }: RankPageProps) {
  // Get user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/me', userId],
  });

  // Get leaderboard
  const { data: leaderboard = [], isLoading: leaderboardLoading } = useQuery<LeaderboardEntry[]>({
    queryKey: ['/api/leaderboard'],
  });

  if (statsLoading || leaderboardLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-muted rounded-lg mb-4"></div>
          <div className="h-60 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const currentEvol = evolLevels.find(evol => evol.level === userStats?.evolLevel) || evolLevels[0];
  const nextEvol = evolLevels.find(evol => evol.level === (userStats?.evolLevel || 1) + 1);

  return (
    <div className="space-y-6 pb-20">
      {/* Current Rank Card */}
      <Card className="bg-gradient-to-br from-gxr-dark via-gxr-dark-secondary to-gxr-dark border-gxr-green/20">
        <CardHeader>
          <CardTitle className="text-gxr-green flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            Your Rank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current Evolution */}
          <div className="text-center space-y-2">
            <div className="relative mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-gxr-green/20 to-gxr-blue/20 flex items-center justify-center border-2 border-gxr-green/30">
              <div className="text-2xl font-bold text-gxr-green">E{userStats?.evolLevel || 1}</div>
            </div>
            <h3 className="text-xl font-bold text-gxr-green">{currentEvol.name}</h3>
            <Badge variant="outline" className="border-gxr-blue text-gxr-blue">
              Evol {userStats?.evolLevel || 1}
            </Badge>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-green">
                #{userStats?.globalRank || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-blue">
                {userStats?.user.points?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
          </div>

          {/* Evolution Progress */}
          {nextEvol && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress to {nextEvol.name}</span>
                <span>{userStats?.progressPercentage || 0}%</span>
              </div>
              <Progress value={userStats?.progressPercentage || 0} className="h-3" />
              <div className="text-xs text-muted-foreground text-center">
                {(userStats?.nextEvolTarget || 0) - (userStats?.user.points || 0)} points to next level
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Evolution Levels */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue">Evolution Levels</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {evolLevels.map((evol) => {
            const isCurrentLevel = evol.level === userStats?.evolLevel;
            const isUnlocked = (userStats?.user.points || 0) >= evol.minPoints;
            
            return (
              <div
                key={evol.level}
                className={`p-4 rounded-lg border transition-all ${
                  isCurrentLevel 
                    ? 'border-gxr-green bg-gxr-green/10' 
                    : isUnlocked
                    ? 'border-gxr-blue/30 bg-gxr-blue/5'
                    : 'border-border bg-muted/30'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div 
                      className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${
                        isCurrentLevel 
                          ? 'bg-gxr-green text-black' 
                          : isUnlocked
                          ? 'bg-gxr-blue text-white'
                          : 'bg-muted text-muted-foreground'
                      }`}
                    >
                      E{evol.level}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h4 className={`font-medium ${isCurrentLevel ? 'text-gxr-green' : 'text-foreground'}`}>
                          {evol.name}
                        </h4>
                        {isCurrentLevel && <Star className="h-4 w-4 text-gxr-green" />}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {evol.minPoints.toLocaleString()} - {evol.maxPoints === Infinity ? '∞' : evol.maxPoints.toLocaleString()} points
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    {isCurrentLevel && (
                      <Badge className="bg-gxr-green/20 text-gxr-green border-gxr-green/30">
                        Current
                      </Badge>
                    )}
                    {!isCurrentLevel && isUnlocked && (
                      <Badge variant="outline" className="border-gxr-blue/50 text-gxr-blue">
                        Unlocked
                      </Badge>
                    )}
                    {!isUnlocked && (
                      <Badge variant="outline" className="text-muted-foreground">
                        Locked
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Top Players Leaderboard */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue flex items-center gap-2">
            <Crown className="h-5 w-5" />
            Top Players
          </CardTitle>
        </CardHeader>
        <CardContent>
          {leaderboard.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No leaderboard data available
            </p>
          ) : (
            <div className="space-y-3">
              {leaderboard.slice(0, 10).map((entry, index) => {
                const isCurrentUser = entry.user.id === userId;
                const rankIcon = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '';
                
                return (
                  <div
                    key={entry.user.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                      isCurrentUser 
                        ? 'border-gxr-green bg-gxr-green/10' 
                        : 'border-border hover:border-gxr-blue/30'
                    }`}
                  >
                    <div className="flex items-center justify-center w-8 h-8">
                      {rankIcon || (
                        <span className="text-sm font-bold text-muted-foreground">
                          #{entry.rank}
                        </span>
                      )}
                    </div>
                    
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="" alt={entry.user.username || 'User'} />
                      <AvatarFallback className="text-xs">
                        {(entry.user.username || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={`font-medium truncate ${isCurrentUser ? 'text-gxr-green' : 'text-foreground'}`}>
                          {entry.user.username || `User ${entry.user.id}`}
                        </p>
                        {isCurrentUser && <TrendingUp className="h-4 w-4 text-gxr-green" />}
                      </div>
                      <p className="text-sm text-muted-foreground">{entry.evolName}</p>
                    </div>
                    
                    <div className="text-right">
                      <p className={`font-bold ${isCurrentUser ? 'text-gxr-green' : 'text-foreground'}`}>
                        {(entry.user.points || 0).toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">points</p>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}