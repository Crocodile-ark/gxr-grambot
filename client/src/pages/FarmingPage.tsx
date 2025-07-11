import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Clock, Coins, Zap, Star, ExternalLink } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { UserStats, TaskWithCompletion } from '@/types';
import InvitePanel from "@/components/dashboard/InvitePanel";
import { apiRequest } from '@/lib/queryClient';

interface FarmingPageProps {
  userId: number;
}

export default function FarmingPage({ userId }: FarmingPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Get user stats
  const { data: userStats, isLoading: statsLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/me', userId],
  });

  // Get user tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<TaskWithCompletion[]>({
    queryKey: ['/api/users', userId, 'tasks'],
  });

  // Claim mutation
  const claimMutation = useMutation({
    mutationFn: () => fetch(`/api/users/${userId}/claim`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users/me', userId] });
      toast({
        title: "Claim Successful!",
        description: "You have successfully claimed your rewards!",
      });
    },
    onError: () => {
      toast({
        title: "Claim Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Complete task mutation
  const completeTaskMutation = useMutation({
    mutationFn: (taskId: number) => 
      fetch(`/api/users/${userId}/tasks/${taskId}/complete`, { method: 'POST' }).then(res => res.json()),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/users', userId, 'tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/users/me', userId] });
      toast({
        title: "Task Completed!",
        description: "You have earned reward points!",
      });
    },
    onError: () => {
      toast({
        title: "Task Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  if (statsLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-32 bg-muted rounded-lg mb-4"></div>
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Filter tasks by category
  const originalTasks = tasks.filter(task => task.category === 'original' && !task.completed);
  const collabTasks = tasks.filter(task => task.category === 'collab' && !task.completed);
  const partnerTasks = tasks.filter(task => task.category === 'partner' && !task.completed);

  return (
    <div className="space-y-6 pb-20">
      {/* Farming Section */}
      <Card className="bg-gradient-to-br from-gxr-dark via-gxr-dark-secondary to-gxr-dark border-gxr-green/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-gxr-green flex items-center gap-2">
              <Zap className="h-5 w-5" />
              {userStats?.evolName || 'Rookie'} Farming
            </CardTitle>
            <Badge variant="outline" className="border-gxr-blue text-gxr-blue">
              Evol {userStats?.evolLevel || 1}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* User Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-green">
                {userStats?.user.points?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-blue">
                #{userStats?.globalRank || 'N/A'}
              </div>
              <div className="text-sm text-muted-foreground">Global Rank</div>
            </div>
          </div>

          {/* Evolution Progress */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progress to Next Evol</span>
              <span>{userStats?.progressPercentage || 0}%</span>
            </div>
            <Progress value={userStats?.progressPercentage || 0} className="h-2" />
            <div className="text-xs text-muted-foreground text-center">
              Next target: {userStats?.nextEvolTarget?.toLocaleString() || 0} points
            </div>
          </div>

          {/* Claim Button */}
          <div className="flex flex-col items-center space-y-2">
            {userStats?.canClaim ? (
              <Button
                onClick={() => claimMutation.mutate()}
                disabled={claimMutation.isPending}
                className="w-full bg-gxr-green hover:bg-gxr-green/80 text-black font-bold py-3"
              >
                <Coins className="h-5 w-5 mr-2" />
                {claimMutation.isPending ? 'Claiming...' : 'Claim Reward'}
              </Button>
            ) : (
              <div className="text-center">
                <Button disabled className="w-full py-3">
                  <Clock className="h-5 w-5 mr-2" />
                  Next claim in {formatTime(userStats?.timeUntilNextClaim || 0)}
                </Button>
                <p className="text-xs text-muted-foreground mt-1">
                  Daily earnings: {userStats?.dailyEarnings || 0} GXR
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
      <InvitePanel
  referralLink={`https://t.me/GXRBot?start=${userStats?.user?.referralCode || ""}`}
  inviteCount={userStats?.user?.referrals?.length || 0}
/>
      {/* Tasks Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue">Available Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="original" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="original">
                Original ({originalTasks.length})
              </TabsTrigger>
              <TabsTrigger value="collab">
                Collab ({collabTasks.length})
              </TabsTrigger>
              <TabsTrigger value="partner">
                Partner ({partnerTasks.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="original" className="space-y-3 mt-4">
              {originalTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No original tasks available
                </p>
              ) : (
                originalTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={() => completeTaskMutation.mutate(task.id)}
                    isCompleting={completeTaskMutation.isPending}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="collab" className="space-y-3 mt-4">
              {collabTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No collaboration tasks available
                </p>
              ) : (
                collabTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={() => completeTaskMutation.mutate(task.id)}
                    isCompleting={completeTaskMutation.isPending}
                  />
                ))
              )}
            </TabsContent>

            <TabsContent value="partner" className="space-y-3 mt-4">
              {partnerTasks.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No partnership tasks available
                </p>
              ) : (
                partnerTasks.map((task) => (
                  <TaskCard 
                    key={task.id} 
                    task={task} 
                    onComplete={() => completeTaskMutation.mutate(task.id)}
                    isCompleting={completeTaskMutation.isPending}
                  />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Task Card Component
interface TaskCardProps {
  task: TaskWithCompletion;
  onComplete: () => void;
  isCompleting: boolean;
}

function TaskCard({ task, onComplete, isCompleting }: TaskCardProps) {
  return (
    <Card className="border-border/50">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h4 className="font-medium text-foreground">{task.name}</h4>
            {task.description && (
              <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mt-2">
              <Badge className="bg-gxr-green/20 text-gxr-green border-gxr-green/30">
                <Star className="h-3 w-3 mr-1" />
                +{task.reward}
              </Badge>
              <Badge variant="outline">
                {task.category}
              </Badge>
            </div>
          </div>
          <div className="flex gap-2 ml-4">
            {task.link && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => window.open(task.link!, '_blank')}
              >
                <ExternalLink className="h-4 w-4" />
              </Button>
            )}
            <Button
              onClick={onComplete}
              disabled={isCompleting}
              size="sm"
              className="bg-gxr-blue hover:bg-gxr-blue/80"
            >
              {isCompleting ? 'Processing...' : 'Complete'}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}