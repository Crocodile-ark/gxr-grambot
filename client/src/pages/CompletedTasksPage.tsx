import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle, Calendar, Star, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { TaskWithCompletion } from '@/types';

interface CompletedTasksPageProps {
  userId: number;
}

export default function CompletedTasksPage({ userId }: CompletedTasksPageProps) {
  // Get user tasks
  const { data: tasks = [], isLoading } = useQuery<TaskWithCompletion[]>({
    queryKey: ['/api/users', userId, 'tasks'],
  });

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  // Filter completed tasks by category
  const completedTasks = tasks.filter(task => task.completed);
  const originalCompleted = completedTasks.filter(task => task.category === 'original');
  const collabCompleted = completedTasks.filter(task => task.category === 'collab');
  const partnerCompleted = completedTasks.filter(task => task.category === 'partner');

  const totalRewards = completedTasks.reduce((sum, task) => sum + task.reward, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Header Stats */}
      <Card className="bg-gradient-to-br from-gxr-green/10 via-background to-gxr-blue/10 border-gxr-green/20">
        <CardHeader>
          <CardTitle className="text-gxr-green flex items-center gap-2">
            <CheckCircle className="h-6 w-6" />
            Completed Tasks
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-green">
                {completedTasks.length}
              </div>
              <div className="text-sm text-muted-foreground">Tasks Completed</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-blue">
                {totalRewards.toLocaleString()}
              </div>
              <div className="text-sm text-muted-foreground">Total Rewards</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Completed Tasks by Category */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue">Task History</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="all">
                All ({completedTasks.length})
              </TabsTrigger>
              <TabsTrigger value="original">
                Original ({originalCompleted.length})
              </TabsTrigger>
              <TabsTrigger value="collab">
                Collab ({collabCompleted.length})
              </TabsTrigger>
              <TabsTrigger value="partner">
                Partner ({partnerCompleted.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="all" className="space-y-3 mt-4">
              {completedTasks.length === 0 ? (
                <div className="text-center py-12">
                  <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">No tasks completed yet</p>
                  <p className="text-sm text-muted-foreground">
                    Complete tasks from the Farming section to see them here
                  </p>
                </div>
              ) : (
                completedTasks.map((task) => (
                  <CompletedTaskCard key={task.id} task={task} />
                ))
              )}
            </TabsContent>

            <TabsContent value="original" className="space-y-3 mt-4">
              {originalCompleted.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No original tasks completed
                </p>
              ) : (
                originalCompleted.map((task) => (
                  <CompletedTaskCard key={task.id} task={task} />
                ))
              )}
            </TabsContent>

            <TabsContent value="collab" className="space-y-3 mt-4">
              {collabCompleted.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No collaboration tasks completed
                </p>
              ) : (
                collabCompleted.map((task) => (
                  <CompletedTaskCard key={task.id} task={task} />
                ))
              )}
            </TabsContent>

            <TabsContent value="partner" className="space-y-3 mt-4">
              {partnerCompleted.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  No partnership tasks completed
                </p>
              ) : (
                partnerCompleted.map((task) => (
                  <CompletedTaskCard key={task.id} task={task} />
                ))
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

// Completed Task Card Component
interface CompletedTaskCardProps {
  task: TaskWithCompletion;
}

function CompletedTaskCard({ task }: CompletedTaskCardProps) {
  const completedDate = task.completedAt ? new Date(task.completedAt) : new Date();
  const formattedDate = completedDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card className="border-gxr-green/20 bg-gxr-green/5">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <CheckCircle className="h-4 w-4 text-gxr-green" />
              <h4 className="font-medium text-foreground">{task.name}</h4>
            </div>
            {task.description && (
              <p className="text-sm text-muted-foreground mb-2">{task.description}</p>
            )}
            <div className="flex items-center gap-2 mb-2">
              <Badge className="bg-gxr-green/20 text-gxr-green border-gxr-green/30">
                <Star className="h-3 w-3 mr-1" />
                +{task.reward}
              </Badge>
              <Badge variant="outline">
                {task.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Completed on {formattedDate}
            </div>
          </div>
          {task.link && (
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(task.link!, '_blank')}
              className="ml-4"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}