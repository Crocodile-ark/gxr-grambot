import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Copy } from "lucide-react";

interface InvitePanelProps {
  referralLink: string;
  inviteCount: number;
}

export default function InvitePanel({ referralLink, inviteCount }: InvitePanelProps) {
  const { toast } = useToast();

  const handleCopy = () => {
    navigator.clipboard.writeText(referralLink);
    toast({
      title: "Referral Link Copied",
      description: "You have successfully copied your invite link!",
    });
  };

  return (
    <div className="bg-card border border-border/40 rounded-xl p-5 space-y-4">
      {/* Title & Badge */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gxr-green flex items-center gap-2">
          <span>🎉 Invite Friends</span>
        </h3>
        <Badge variant="outline" className="border-gxr-blue text-gxr-blue">
          {inviteCount} Invited
        </Badge>
      </div>

      {/* Referral Link Box */}
      <div className="bg-muted/50 text-sm rounded-lg px-4 py-2 flex justify-between items-center">
        <span className="text-muted-foreground break-all">{referralLink}</span>
        <Button variant="ghost" size="sm" onClick={handleCopy}>
          <Copy className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
}
