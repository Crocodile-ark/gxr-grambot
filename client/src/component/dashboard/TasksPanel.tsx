import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import type { TaskWithCompletion } from "@/types";

interface TasksPanelProps {
  userId: number;
}

export default function TasksPanel({ userId }: TasksPanelProps) {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: tasks = [], isLoading } = useQuery<TaskWithCompletion[]>({
    queryKey: [`/api/users/${userId}/tasks`],
  });

  const completeTaskMutation = useMutation({
    mutationFn: async (taskId: number) => {
      const response = await apiRequest("POST", `/api/users/${userId}/tasks/${taskId}/complete`);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/users/${userId}/tasks`] });
      toast({
        title: "Task Completed!",
        description: "Congratulations! You've earned points.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Task Failed",
        description: error.message || "Failed to complete task",
        variant: "destructive",
      });
    },
  });

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "original": return "fas fa-star";
      case "partnership": return "fas fa-handshake";
      case "collaborator": return "fas fa-users";
      default: return "fas fa-tasks";
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "original": return "text-gxr-green border-green-500/20";
      case "partnership": return "text-gxr-blue border-blue-500/20";
      case "collaborator": return "text-gxr-warning border-orange-500/20";
      default: return "text-gxr-text border-gray-500/20";
    }
  };

  const availableTasks = tasks.filter(task => !task.completed).slice(0, 3);
  const completedCount = tasks.filter(task => task.completed).length;

  if (isLoading) {
    return (
      <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-blue-500/20">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gxr-dark rounded w-1/3"></div>
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-gxr-dark rounded-lg p-4 h-20"></div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gxr-dark-secondary rounded-xl p-6 border border-blue-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <i className="fas fa-tasks text-gxr-blue mr-3"></i>
          Available Tasks
        </h3>
        <Badge variant="secondary" className="bg-gxr-success/20 text-gxr-success">
          {completedCount} Completed
        </Badge>
      </div>
      
      <div className="space-y-4">
        {availableTasks.length === 0 ? (
          <div className="text-center py-8 text-gxr-text-secondary">
            <i className="fas fa-check-circle text-4xl mb-4 text-gxr-success"></i>
            <p>All available tasks completed!</p>
          </div>
        ) : (
          availableTasks.map((task) => (
            <div 
              key={task.id} 
              className={`bg-gxr-dark rounded-lg p-4 border hover:border-opacity-40 transition-all duration-200 ${getCategoryColor(task.category)}`}
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-3">
                  <div className={`w-8 h-8 bg-opacity-20 rounded-lg flex items-center justify-center ${getCategoryColor(task.category).includes('green') ? 'bg-gxr-green' : getCategoryColor(task.category).includes('blue') ? 'bg-gxr-blue' : 'bg-gxr-warning'}`}>
                    <i className={`${getCategoryIcon(task.category)} ${getCategoryColor(task.category).split(' ')[0]}`}></i>
                  </div>
                  <div>
                    <h4 className="font-medium">{task.name}</h4>
                    <p className="text-sm text-gxr-text-secondary capitalize">{task.category} Task</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${getCategoryColor(task.category).split(' ')[0]}`}>
                    +{task.reward}
                  </div>
                  <div className="text-xs text-gxr-text-secondary">Points</div>
                </div>
              </div>
              <Button
                onClick={() => completeTaskMutation.mutate(task.id)}
                disabled={completeTaskMutation.isPending}
                className={`w-full py-2 rounded-lg font-medium transition-all duration-200 ${
                  getCategoryColor(task.category).includes('green')
                    ? 'bg-gxr-green hover:bg-gxr-green/80 text-gxr-dark'
                    : getCategoryColor(task.category).includes('blue')
                    ? 'bg-gxr-blue hover:bg-gxr-blue/80 text-white'
                    : 'bg-gxr-warning hover:bg-gxr-warning/80 text-gxr-dark'
                }`}
              >
                {completeTaskMutation.isPending ? "Completing..." : "Complete Task"}
              </Button>
            </div>
          ))
        )}
      </div>
      
      <div className="mt-6 text-center">
        <button className="text-gxr-blue hover:text-gxr-blue/80 font-medium transition-colors duration-200">
          View All Tasks <i className="fas fa-arrow-right ml-1"></i>
        </button>
      </div>
    </div>
  );
}
