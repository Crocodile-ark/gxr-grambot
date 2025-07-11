import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { User, Mail, Coins, Moon, Sun, MapPin, Calendar } from 'lucide-react';
import { useTheme } from '@/components/ThemeProvider';
import { useToast } from '@/hooks/use-toast';
import type { UserStats } from '@/types';
import { apiRequest } from '@/lib/queryClient';

interface ProfilePageProps {
  userId: number;
}

export default function ProfilePage({ userId }: ProfilePageProps) {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const queryClient = useQueryClient();
  const [email, setEmail] = useState('');
  const [isEmailEditing, setIsEmailEditing] = useState(false);

  // Get user stats
  const { data: userStats, isLoading } = useQuery<UserStats>({
    queryKey: ['/api/users/me', userId],
  });

  // Email update mutation
  const updateEmailMutation = useMutation({
    mutationFn: (newEmail: string) => 
      fetch(`/api/users/${userId}`, { 
        method: 'PATCH', 
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: newEmail })
      }).then(res => res.json()),
    onSuccess: () => {
      setIsEmailEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/users/me', userId] });
      toast({
        title: "Email Updated",
        description: "Your email has been successfully updated.",
      });
    },
    onError: () => {
      toast({
        title: "Update Failed",
        description: "Please try again later.",
        variant: "destructive",
      });
    },
  });

  const handleEmailSave = () => {
    if (email.trim()) {
      updateEmailMutation.mutate(email.trim());
    }
  };

  const roadmapItems = [
    { phase: 'Phase 1', title: 'Bot Launch', status: 'completed', date: 'Q4 2024' },
    { phase: 'Phase 2', title: 'Dashboard Release', status: 'completed', date: 'Q1 2025' },
    { phase: 'Phase 3', title: 'Mainnet Integration', status: 'upcoming', date: 'Q2 2025' },
    { phase: 'Phase 4', title: 'Staking Features', status: 'upcoming', date: 'Q3 2025' },
    { phase: 'Phase 5', title: 'DAO Governance', status: 'upcoming', date: 'Q4 2025' },
  ];

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-40 bg-muted rounded-lg mb-4"></div>
          <div className="h-60 bg-muted rounded-lg"></div>
        </div>
      </div>
    );
  }

  const joinDate = userStats?.user.createdAt ? new Date(userStats.user.createdAt) : new Date();
  const formattedJoinDate = joinDate.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <div className="space-y-6 pb-20">
      {/* Profile Header */}
      <Card className="bg-gradient-to-br from-gxr-dark via-gxr-dark-secondary to-gxr-dark border-gxr-green/20">
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 border-2 border-gxr-green/30">
              <AvatarImage src="" alt={userStats?.user.username || 'User'} />
              <AvatarFallback className="text-lg bg-gxr-green/20 text-gxr-green">
                {(userStats?.user.username || 'U').charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gxr-green">
                {userStats?.user.username || `User ${userStats?.user.id}`}
              </h2>
              <p className="text-muted-foreground">
                Telegram ID: {userStats?.user.telegramId}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="outline" className="border-gxr-blue text-gxr-blue">
                  {userStats?.evolName || 'Rookie'}
                </Badge>
                <Badge className="bg-gxr-green/20 text-gxr-green border-gxr-green/30">
                  Evol {userStats?.evolLevel || 1}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Email Section */}
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-2">
              <Mail className="h-4 w-4" />
              Email Address
            </Label>
            {isEmailEditing ? (
              <div className="flex gap-2">
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  className="flex-1"
                />
                <Button
                  onClick={handleEmailSave}
                  disabled={updateEmailMutation.isPending}
                  size="sm"
                  className="bg-gxr-green hover:bg-gxr-green/80 text-black"
                >
                  {updateEmailMutation.isPending ? 'Saving...' : 'Save'}
                </Button>
                <Button
                  onClick={() => setIsEmailEditing(false)}
                  variant="outline"
                  size="sm"
                >
                  Cancel
                </Button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                <span className="text-muted-foreground">
                  {userStats?.user.email || 'No email linked'}
                </span>
                <Button
                  onClick={() => {
                    setEmail(userStats?.user.email || '');
                    setIsEmailEditing(true);
                  }}
                  variant="outline"
                  size="sm"
                >
                  {userStats?.user.email ? 'Edit' : 'Add Email'}
                </Button>
              </div>
            )}
          </div>

          <Separator />

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4">
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-green flex items-center justify-center gap-1">
                <Coins className="h-5 w-5" />
                {userStats?.user.points?.toLocaleString() || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Points</div>
            </div>
            <div className="text-center p-3 bg-background/50 rounded-lg">
              <div className="text-2xl font-bold text-gxr-blue flex items-center justify-center gap-1">
                <Calendar className="h-5 w-5" />
                {userStats?.totalClaims || 0}
              </div>
              <div className="text-sm text-muted-foreground">Total Claims</div>
            </div>
          </div>

          <div className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">Joined</span>
            </div>
            <span className="text-sm font-medium">{formattedJoinDate}</span>
          </div>
        </CardContent>
      </Card>

      {/* Theme Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue">Theme Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === 'dark' ? (
                <Moon className="h-5 w-5 text-gxr-blue" />
              ) : (
                <Sun className="h-5 w-5 text-gxr-green" />
              )}
              <div>
                <p className="font-medium">Dark Mode</p>
                <p className="text-sm text-muted-foreground">
                  {theme === 'dark' ? 'Dark theme enabled' : 'Light theme enabled'}
                </p>
              </div>
            </div>
            <Switch
              checked={theme === 'dark'}
              onCheckedChange={(checked) => setTheme(checked ? 'dark' : 'light')}
            />
          </div>
        </CardContent>
      </Card>

      {/* Roadmap */}
      <Card>
        <CardHeader>
          <CardTitle className="text-gxr-blue flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            GXR Roadmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {roadmapItems.map((item, index) => (
              <div key={index} className="flex items-center gap-4">
                <div className={`w-3 h-3 rounded-full ${
                  item.status === 'completed' 
                    ? 'bg-gxr-green' 
                    : 'bg-muted-foreground'
                }`} />
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{item.phase}</h4>
                    <Badge variant={item.status === 'completed' ? 'default' : 'outline'}>
                      {item.status === 'completed' ? 'Completed' : 'Upcoming'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{item.title}</p>
                </div>
                <span className="text-sm text-muted-foreground">{item.date}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}