import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Capacitor } from "@capacitor/core";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { toast } from "sonner";
import { useExternalLink } from "@/hooks/useExternalLink";
import { Copy, RefreshCw, Share2, MessageCircle, Settings, Upload } from "lucide-react";
import { copyToClipboard } from "@/lib/clipboard";
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
import { getAppBaseUrl } from "@/lib/appUrl";

interface EventInviteLinkProps {
  eventId: string;
  inviteCode: string;
  allowPublicJoin: boolean;
  eventTitle: string;
  isOrganizer?: boolean;
}

export const EventInviteLink = ({
  eventId,
  inviteCode,
  allowPublicJoin,
  eventTitle,
  isOrganizer = false,
}: EventInviteLinkProps) => {
  const { t } = useTranslation(['events', 'common']);
  
  const { openExternalUrl } = useExternalLink();
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [localAllowPublicJoin, setLocalAllowPublicJoin] = useState(allowPublicJoin);

  const inviteLink = `${getAppBaseUrl()}/events/join/${inviteCode}`;

  const handleCopyToClipboard = async () => {
    const copied = await copyToClipboard(inviteLink);
    if (copied) {
      toast({
        title: t('common:actions.copied'),
        description: t('events:invite.linkCopied'),
      });
    }
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

  const handleNativeShare = async () => {
    const message = t('events:invite.joinMessage', { title: eventTitle });
    try {
      if (navigator.share) {
        await navigator.share({ title: eventTitle, text: message, url: inviteLink });
        return;
      }
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
      console.warn('Share failed:', error);
    }
    // Fallback to clipboard
    try {
      const copied = await copyToClipboard(inviteLink);
      if (copied) {
        toast({ title: t('common:actions.copied'), description: t('events:invite.linkCopied') });
      } else {
        toast({ title: t('common:errors.generic', 'Error'), description: t('events:invite.shareFailed', 'Could not share link'), variant: 'destructive' });
      }
    } catch {
      toast({ title: t('common:errors.generic', 'Error'), description: t('events:invite.shareFailed', 'Could not share link'), variant: 'destructive' });
    }
  };

  const shareViaWhatsApp = async () => {
    const message = t('events:invite.joinMessage', { title: eventTitle }) + ' ' + inviteLink;
    if (Capacitor.isNativePlatform()) {
      window.location.href = `whatsapp://send?text=${encodeURIComponent(message)}`;
    } else {
      await openExternalUrl(`https://wa.me/?text=${encodeURIComponent(message)}`);
    }
  };

  const shareViaSMS = () => {
    const message = t('events:invite.joinMessage', { title: eventTitle }) + ' ' + inviteLink;
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
        
        {isOrganizer && (
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
        )}
      </div>

      <div className="flex gap-2">
        <Button
          size="sm"
          variant="outline"
          className="h-9 flex-1"
          onClick={handleCopyToClipboard}
        >
          <Copy className="h-4 w-4 mr-2" />
          {t('common:actions.copy', { defaultValue: 'Copy' })}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" className="h-9 flex-1">
              <Share2 className="h-4 w-4 mr-2" />
              {t('common:actions.share', { defaultValue: 'Share' })}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={handleNativeShare}>
              <Upload className="h-4 w-4 mr-2" />
              {t('common:actions.share', { defaultValue: 'Share' })}
            </DropdownMenuItem>
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
