import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import type { AdminStats } from "@/types";

export default function AdminPanel() {
  const { toast } = useToast();

  const { data: adminStats, isLoading } = useQuery<AdminStats>({
    queryKey: ['/api/admin/stats'],
  });

  const exportCSV = async () => {
    try {
      const response = await fetch('/api/admin/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'gxr_users.csv';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({
        title: "Export Successful",
        description: "User data has been exported to CSV",
      });
    } catch (error) {
      toast({
        title: "Export Failed",
        description: "Failed to export user data",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-6 border border-red-500/20">
        <div className="animate-pulse">
          <div className="h-6 bg-gxr-dark rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[1, 2, 3].map(i => (
              <div key={i} className="bg-gxr-dark rounded-lg p-4 h-20"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!adminStats) {
    return (
      <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-6 border border-red-500/20">
        <div className="text-center text-red-400">
          <p>Failed to load admin data</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-red-900/20 to-red-800/20 rounded-xl p-6 border border-red-500/20">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-bold flex items-center">
          <i className="fas fa-shield-alt text-red-400 mr-3"></i>
          Admin Panel
        </h3>
        <Badge variant="destructive" className="bg-red-500/20 text-red-400">
          Admin Only
        </Badge>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div className="bg-gxr-dark rounded-lg p-4">
          <div className="text-sm text-gxr-text-secondary mb-2">Total Users</div>
          <div className="text-2xl font-bold text-gxr-green">
            {adminStats.totalUsers.toLocaleString()}
          </div>
        </div>
        
        <div className="bg-gxr-dark rounded-lg p-4">
          <div className="text-sm text-gxr-text-secondary mb-2">Pool Usage</div>
          <div className="text-2xl font-bold text-gxr-warning">
            {adminStats.poolUsagePercentage}%
          </div>
          <Progress value={adminStats.poolUsagePercentage} className="mt-2 h-2" />
        </div>
        
        <div className="bg-gxr-dark rounded-lg p-4">
          <div className="text-sm text-gxr-text-secondary mb-2">Total Distributed</div>
          <div className="text-2xl font-bold text-gxr-blue">
            {(adminStats.totalDistributed / 1000000).toFixed(1)}M
          </div>
        </div>
      </div>

      <div className="mb-6">
        <h4 className="text-lg font-semibold mb-4">Evolution Pool Status</h4>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {adminStats.evolPools.map((pool) => (
            <div key={pool.id} className="bg-gxr-dark rounded-lg p-3">
              <div className="text-sm text-gxr-text-secondary mb-1">
                Evol {pool.evolLevel}
              </div>
              <div className="text-lg font-bold text-gxr-blue mb-2">
                {((pool.usedPool || 0) / 1000000).toFixed(1)}M / {(pool.totalPool / 1000000).toFixed(1)}M
              </div>
              <Progress 
                value={((pool.usedPool || 0) / pool.totalPool) * 100} 
                className="h-2" 
              />
            </div>
          ))}
        </div>
      </div>
      
      <div className="flex space-x-4">
        <Button
          onClick={exportCSV}
          className="bg-gxr-blue hover:bg-gxr-blue/80 text-white"
        >
          <i className="fas fa-download mr-2"></i>
          Export CSV
        </Button>
        <Button
          variant="outline"
          className="border-gxr-warning text-gxr-warning hover:bg-gxr-warning/10"
          disabled
        >
          <i className="fas fa-sync-alt mr-2"></i>
          Reset Pools
        </Button>
      </div>
    </div>
  );
}
