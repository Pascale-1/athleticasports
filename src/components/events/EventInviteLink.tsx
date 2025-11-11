import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Copy, RefreshCw, Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface EventInviteLinkProps {
  eventId: string;
  inviteCode: string;
  allowPublicJoin: boolean;
  eventTitle: string;
}

export const EventInviteLink = ({
  eventId,
  inviteCode,
  allowPublicJoin,
  eventTitle,
}: EventInviteLinkProps) => {
  const { toast } = useToast();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localAllowPublicJoin, setLocalAllowPublicJoin] = useState(allowPublicJoin);

  const inviteLink = `${window.location.origin}/events/join/${inviteCode}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const regenerateCode = async () => {
    setIsRegenerating(true);
    try {
      const newCode = generateRandomCode();
      const { error } = await supabase
        .from("events")
        .update({
          invite_code: newCode,
          created_invite_code_at: new Date().toISOString(),
        })
        .eq("id", eventId);

      if (error) throw error;

      toast({
        title: "Code regenerated!",
        description: "Old invite links will no longer work",
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const togglePublicJoin = async (enabled: boolean) => {
    try {
      const { error } = await supabase
        .from("events")
        .update({ allow_public_join: enabled })
        .eq("id", eventId);

      if (error) throw error;

      setLocalAllowPublicJoin(enabled);
      toast({
        title: enabled ? "Public joining enabled" : "Public joining disabled",
        description: enabled 
          ? "Anyone with the link can join" 
          : "Link sharing is paused",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = () => {
    const message = `Join me for ${eventTitle}! ${inviteLink}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const shareViaSMS = () => {
    const message = `Join me for ${eventTitle}! ${inviteLink}`;
    window.open(`sms:?body=${encodeURIComponent(message)}`);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Share Event
            </CardTitle>
            <CardDescription>Invite others to join this event</CardDescription>
          </div>
          <Badge variant={localAllowPublicJoin ? "default" : "secondary"}>
            {localAllowPublicJoin ? "Active" : "Paused"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Invite Link */}
        <div className="space-y-2">
          <Label>Shareable Link</Label>
          <div className="flex gap-2">
            <Input value={inviteLink} readOnly className="font-mono text-sm" />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(inviteLink, "Link")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Invite Code */}
        <div className="space-y-2">
          <Label>Event Code</Label>
          <div className="flex gap-2">
            <Input
              value={inviteCode}
              readOnly
              className="font-mono text-lg font-bold text-center"
            />
            <Button
              size="icon"
              variant="outline"
              onClick={() => copyToClipboard(inviteCode, "Code")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Share Buttons */}
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="flex-1"
            onClick={shareViaWhatsApp}
          >
            Share via WhatsApp
          </Button>
          <Button
            variant="outline"
            className="flex-1"
            onClick={shareViaSMS}
          >
            Share via SMS
          </Button>
        </div>

        {/* Settings */}
        <div className="pt-4 border-t space-y-3">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Allow anyone to join</Label>
              <p className="text-xs text-muted-foreground">
                Users with the link can RSVP
              </p>
            </div>
            <Switch
              checked={localAllowPublicJoin}
              onCheckedChange={togglePublicJoin}
            />
          </div>

          <Button
            variant="ghost"
            size="sm"
            className="w-full"
            onClick={regenerateCode}
            disabled={isRegenerating}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
            Regenerate Code
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

function generateRandomCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
