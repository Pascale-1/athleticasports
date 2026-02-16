import { useState } from "react";
import { useTranslation } from "react-i18next";
import { Copy, RefreshCw, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useExternalLink } from "@/hooks/useExternalLink";
import { supabase } from "@/integrations/supabase/client";
import { getAppBaseUrl } from "@/lib/appUrl";

interface TeamInviteLinkProps {
  teamId: string;
  inviteCode: string;
  allowLinkJoining: boolean;
  canManage: boolean;
}

export const TeamInviteLink = ({ 
  teamId, 
  inviteCode, 
  allowLinkJoining,
  canManage 
}: TeamInviteLinkProps) => {
  const { toast } = useToast();
  const { t } = useTranslation('teams');
  const { openExternalUrl } = useExternalLink();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [linkJoiningEnabled, setLinkJoiningEnabled] = useState(allowLinkJoining);
  
  const inviteLink = `${getAppBaseUrl()}/teams/join/${inviteCode}`;

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: t('invite.copied'),
      description: t('invite.copiedToClipboard', { label }),
    });
  };

  const handleRegenerateCode = async () => {
    if (!canManage) return;
    
    setIsRegenerating(true);
    try {
      const newCode = generateInviteCode();
      const { error } = await supabase
        .from("teams")
        .update({ 
          invite_code: newCode,
          created_invite_code_at: new Date().toISOString()
        })
        .eq("id", teamId);

      if (error) throw error;

      toast({
        title: t('invite.codeRegenerated'),
        description: t('invite.oldLinksInvalid'),
      });
      
      // Refresh page to show new code
      window.location.reload();
    } catch (error) {
      toast({
        title: t('status.error', { ns: 'common' }),
        description: t('invite.regenerateError'),
        variant: "destructive",
      });
    } finally {
      setIsRegenerating(false);
    }
  };

  const handleToggleLinkJoining = async (enabled: boolean) => {
    if (!canManage) return;
    
    try {
      const { error } = await supabase
        .from("teams")
        .update({ allow_link_joining: enabled })
        .eq("id", teamId);

      if (error) throw error;

      setLinkJoiningEnabled(enabled);
      toast({
        title: enabled ? t('invite.linkJoiningEnabled') : t('invite.linkJoiningDisabled'),
        description: enabled 
          ? t('invite.linkJoiningEnabledDesc')
          : t('invite.linkJoiningDisabledDesc'),
      });
    } catch (error) {
      toast({
        title: t('status.error', { ns: 'common' }),
        description: t('invite.updateError'),
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = async () => {
    const text = `Join my team! ${inviteLink}`;
    await openExternalUrl(`https://wa.me/?text=${encodeURIComponent(text)}`);
  };

  const shareViaSMS = () => {
    const text = `Join my team! ${inviteLink}`;
    // SMS uses native URL scheme, handled directly by the OS
    window.location.href = `sms:?body=${encodeURIComponent(text)}`;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Share2 className="h-5 w-5" />
          {t('invite.title')}
        </CardTitle>
        <CardDescription>
          {t('invite.shareDescription')}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="invite-link">{t('invite.shareLink')}</Label>
          <div className="flex gap-2">
            <Input
              id="invite-link"
              value={inviteLink}
              readOnly
              className="font-mono text-sm"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(inviteLink, t('invite.shareLink'))}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="invite-code">{t('invite.code')}</Label>
          <div className="flex gap-2">
            <Input
              id="invite-code"
              value={inviteCode}
              readOnly
              className="font-mono text-sm text-center text-lg font-bold tracking-wider"
            />
            <Button
              variant="outline"
              size="icon"
              onClick={() => copyToClipboard(inviteCode, t('invite.code'))}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={shareViaWhatsApp}
            className="flex-1"
          >
            {t('invite.shareWhatsApp')}
          </Button>
          <Button
            variant="outline"
            onClick={shareViaSMS}
            className="flex-1"
          >
            {t('invite.shareSMS')}
          </Button>
        </div>

        {canManage && (
          <>
            <div className="border-t pt-4 space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="allow-joining">{t('invite.allowLinkJoining')}</Label>
                  <p className="text-sm text-muted-foreground">
                    {t('invite.toggleDescription')}
                  </p>
                </div>
                <Switch
                  id="allow-joining"
                  checked={linkJoiningEnabled}
                  onCheckedChange={handleToggleLinkJoining}
                />
              </div>

              <Button
                variant="outline"
                onClick={handleRegenerateCode}
                disabled={isRegenerating}
                className="w-full"
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {t('invite.regenerateLink')}
              </Button>
              <p className="text-xs text-muted-foreground">
                {t('invite.regenerateWarning')}
              </p>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};

// Helper function to generate cryptographically secure invite code
function generateInviteCode(): string {
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return Array.from(array, byte =>
    'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'[byte % 36]
  ).join('');
}