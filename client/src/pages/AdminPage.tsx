import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Users, Coins, Database, TrendingUp, Download, Settings, Eye, EyeOff } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import type { Task, AdminStats } from '@/types';
import { apiRequest } from '@/lib/queryClient';

// Form validation schema
const taskSchema = z.object({
  name: z.string().min(1, 'Task name is required'),
  description: z.string().optional(),
  category: z.enum(['original', 'collaborator', 'partnership']),
  reward: z.number().min(1, 'Reward must be at least 1'),
  link: z.string().url().optional().or(z.literal('')),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface AdminPageProps {
  userId: number;
}

export default function AdminPage({ userId }: AdminPageProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [showSensitiveData, setShowSensitiveData] = useState(false);

  // Get admin stats
  const { data: adminStats, isLoading: statsLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  // Get all tasks
  const { data: tasks = [], isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: (taskData: TaskFormData) => 
      apiRequest('/api/tasks', { 
        method: 'POST', 
        body: JSON.stringify(taskData)
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      queryClient.invalidateQueries({ queryKey: ['/api/admin/stats'] });
      setIsCreateDialogOpen(false);
      form.reset();
      toast({
        title: "Task Created",
        description: "New task has been successfully created.",
      });
    },
    onError: () => {
      toast({
        title: "Creation Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  // Export data
  const exportMutation = useMutation({
    mutationFn: () => fetch('/api/admin/export').then(res => res.blob()),
    onSuccess: (blob) => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gxr_users.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast({
        title: "Export Complete",
        description: "User data has been exported successfully.",
      });
    },
  });

  // Form setup
  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      name: '',
      description: '',
      category: 'original',
      reward: 50,
      link: '',
    },
  });

  const onSubmit = (data: TaskFormData) => {
    createTaskMutation.mutate(data);
  };

  if (statsLoading || tasksLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-muted rounded-lg mb-4"></div>
          <div className="h-60 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-20">
      {/* Admin Header */}
      <Card className="bg-gradient-to-br from-red-500/10 via-background to-orange-500/10 border-red-500/20">
        <CardHeader>
          <CardTitle className="text-red-500 flex items-center gap-2">
            <Settings className="h-6 w-6" />
            Admin Dashboard
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-muted-foreground">
                Manage GXR Grambot system and user data
              </p>
              <Badge variant="destructive" className="mt-2">
                Admin Access Required
              </Badge>
            </div>
            <Button
              onClick={() => setShowSensitiveData(!showSensitiveData)}
              variant="outline"
              size="sm"
            >
              {showSensitiveData ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              {showSensitiveData ? 'Hide' : 'Show'} Data
            </Button>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="tasks">Task Management</TabsTrigger>
          <TabsTrigger value="users">User Data</TabsTrigger>
        </TabsList>

        {/* Overview Tab */}
        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-gxr-blue" />
                  <div>
                    <p className="text-2xl font-bold text-gxr-blue">
                      {showSensitiveData ? adminStats?.totalUsers.toLocaleString() : '***'}
                    </p>
                    <p className="text-xs text-muted-foreground">Total Users</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-5 w-5 text-gxr-green" />
                  <div>
                    <p className="text-2xl font-bold text-gxr-green">
                      {showSensitiveData ? adminStats?.totalDistributed.toLocaleString() : '***'}
                    </p>
                    <p className="text-xs text-muted-foreground">Points Distributed</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Database className="h-5 w-5 text-yellow-500" />
                  <div>
                    <p className="text-2xl font-bold text-yellow-500">
                      {showSensitiveData ? `${adminStats?.poolUsagePercentage}%` : '***'}
                    </p>
                    <p className="text-xs text-muted-foreground">Pool Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-purple-500" />
                  <div>
                    <p className="text-2xl font-bold text-purple-500">
                      {showSensitiveData ? tasks.length : '***'}
                    </p>
                    <p className="text-xs text-muted-foreground">Active Tasks</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Pool Status */}
          {showSensitiveData && (
            <Card>
              <CardHeader>
                <CardTitle className="text-gxr-blue">Evolution Pool Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {adminStats?.evolPools.map((pool) => (
                    <div key={pool.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                      <div>
                        <h4 className="font-medium">Evol {pool.evolLevel}</h4>
                        <p className="text-sm text-muted-foreground">
                          {pool.usedPool.toLocaleString()} / {pool.totalPool.toLocaleString()} used
                        </p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">
                          {Math.round((pool.usedPool / pool.totalPool) * 100)}%
                        </p>
                        <div className="w-20 h-2 bg-muted rounded-full mt-1">
                          <div 
                            className="h-full bg-gxr-green rounded-full"
                            style={{ width: `${(pool.usedPool / pool.totalPool) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        {/* Task Management Tab */}
        <TabsContent value="tasks" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">Task Management</h3>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gxr-green hover:bg-gxr-green/80 text-black">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Task</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Task Name</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter task name" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Description (Optional)</FormLabel>
                          <FormControl>
                            <Textarea placeholder="Enter task description" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="category"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Category</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select category" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="original">Original</SelectItem>
                              <SelectItem value="collaborator">Collaborator</SelectItem>
                              <SelectItem value="partnership">Partnership</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="reward"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Reward Points</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="50"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="link"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Link (Optional)</FormLabel>
                          <FormControl>
                            <Input placeholder="https://example.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex gap-2">
                      <Button 
                        type="submit" 
                        disabled={createTaskMutation.isPending}
                        className="flex-1 bg-gxr-green hover:bg-gxr-green/80 text-black"
                      >
                        {createTaskMutation.isPending ? 'Creating...' : 'Create Task'}
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => setIsCreateDialogOpen(false)}
                      >
                        Cancel
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="space-y-3">
            {tasks.map((task) => (
              <Card key={task.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{task.name}</h4>
                      {task.description && (
                        <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                      )}
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className="bg-gxr-green/20 text-gxr-green border-gxr-green/30">
                          +{task.reward} points
                        </Badge>
                        <Badge variant="outline">
                          {task.category}
                        </Badge>
                        {task.link && (
                          <Badge variant="outline" className="text-blue-500">
                            Has Link
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        {/* User Data Tab */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-semibold">User Data Management</h3>
            <Button
              onClick={() => exportMutation.mutate()}
              disabled={exportMutation.isPending}
              variant="outline"
            >
              <Download className="h-4 w-4 mr-2" />
              {exportMutation.isPending ? 'Exporting...' : 'Export CSV'}
            </Button>
          </div>

          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-muted-foreground">
                <Database className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <h4 className="font-medium mb-2">User Data Protected</h4>
                <p className="text-sm">
                  User data is protected and can only be exported as CSV. 
                  Use the export button above to download user information.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}