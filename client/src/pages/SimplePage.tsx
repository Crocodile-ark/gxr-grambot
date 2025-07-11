import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, User, Wallet } from 'lucide-react';

interface SimplePageProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  content?: React.ReactNode;
}

export default function SimplePage({ title, description, icon, content }: SimplePageProps) {
  return (
    <div className="space-y-6 pb-20">
      <Card className="bg-gradient-to-br from-gxr-blue/10 via-background to-gxr-green/10 border-gxr-blue/20">
        <CardHeader>
          <CardTitle className="text-gxr-blue flex items-center gap-2">
            {icon}
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent className="text-center space-y-4">
          <div className="text-6xl mb-4">🚀</div>
          <h3 className="text-xl font-bold text-gxr-green">Coming Soon!</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
          <Badge className="bg-gxr-green/20 text-gxr-green border-gxr-green/30">
            <Clock className="h-3 w-3 mr-1" />
            Available Soon
          </Badge>
        </CardContent>
      </Card>
      
      {content && (
        <Card>
          <CardContent className="p-6">
            {content}
          </CardContent>
        </Card>
      )}
    </div>
  );
}

export function ProfilePage() {
  return (
    <SimplePage
      title="Profile"
      description="User profile management features will be available soon. You'll be able to manage your account settings, view statistics, and customize your experience."
      icon={<User className="h-6 w-6" />}
    />
  );
}