import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { useExternalLink } from "@/hooks/useExternalLink";
import { Copy, RefreshCw, Share2, MessageCircle, Settings } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Label } from "@/components/ui/label";

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
  const { t } = useTranslation(['events', 'common']);
  const { toast } = useToast();
  const { openExternalUrl } = useExternalLink();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localAllowPublicJoin, setLocalAllowPublicJoin] = useState(allowPublicJoin);

  const inviteLink = `${window.location.origin}/events/join/${inviteCode}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(inviteLink);
    toast({
      title: t('common:actions.copied'),
      description: t('events:invite.linkCopied'),
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
        title: t('events:invite.codeRegenerated'),
        description: t('events:invite.oldLinksInvalid'),
      });

      window.location.reload();
    } catch (error: any) {
      toast({
        title: t('common:errors.generic'),
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
        title: enabled ? t('events:invite.publicJoinEnabled') : t('events:invite.publicJoinDisabled'),
        description: enabled 
          ? t('events:invite.anyoneCanRsvp')
          : t('events:invite.sharingPaused'),
      });
    } catch (error: any) {
      toast({
        title: t('common:errors.generic'),
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const shareViaWhatsApp = async () => {
    const message = t('events:invite.joinMessage', { title: eventTitle }) + ' ' + inviteLink;
    await openExternalUrl(`https://wa.me/?text=${encodeURIComponent(message)}`);
  };

  const shareViaSMS = () => {
    const message = t('events:invite.joinMessage', { title: eventTitle }) + ' ' + inviteLink;
    // SMS uses native URL scheme, handled directly by the OS
    window.location.href = `sms:?body=${encodeURIComponent(message)}`;
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Share2 className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm font-medium">{t('events:invite.shareEvent')}</span>
          {localAllowPublicJoin ? (
            <span className="text-xs text-success">{t('common:status.active')}</span>
          ) : (
            <span className="text-xs text-muted-foreground">{t('events:invite.paused')}</span>
          )}
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <Settings className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-64">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-sm">{t('events:invite.allowJoining')}</Label>
                  <p className="text-xs text-muted-foreground">
                    {t('events:invite.anyoneCanRsvp')}
                  </p>
                </div>
                <Switch
                  checked={localAllowPublicJoin}
                  onCheckedChange={togglePublicJoin}
                />
              </div>
              <Button
                variant="outline"
                size="sm"
                className="w-full"
                onClick={regenerateCode}
                disabled={isRegenerating}
              >
                <RefreshCw className={`h-4 w-4 mr-2 ${isRegenerating ? 'animate-spin' : ''}`} />
                {t('events:invite.regenerateCode')}
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      <div className="flex gap-2">
        <Input 
          value={inviteLink} 
          readOnly 
          className="font-mono text-xs h-9 flex-1" 
        />
        <Button
          size="sm"
          variant="outline"
          className="h-9 px-3"
          onClick={copyToClipboard}
        >
          <Copy className="h-4 w-4" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="outline" className="h-9 px-3">
              <Share2 className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={shareViaWhatsApp}>
              <MessageCircle className="h-4 w-4 mr-2" />
              WhatsApp
            </DropdownMenuItem>
            <DropdownMenuItem onClick={shareViaSMS}>
              <MessageCircle className="h-4 w-4 mr-2" />
              SMS
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

function generateRandomCode(): string {
  return Math.random().toString(36).substring(2, 10).toUpperCase();
}
