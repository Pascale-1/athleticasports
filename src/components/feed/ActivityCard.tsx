import { memo } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Trophy } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";
import { formatRelativeDate } from "@/lib/dateUtils";

interface ActivityCardProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  actionType: string;
  timeAgo: string;
  metadata?: Record<string, any>;
  achievements?: string[];
  likes?: number;
  comments?: number;
  imageUrl?: string;
  createdAt?: string;
}

export const ActivityCard = memo(({
  username,
  displayName,
  avatarUrl,
  actionType,
  timeAgo,
  metadata,
  achievements,
  imageUrl,
  createdAt,
}: ActivityCardProps) => {
  const { t } = useTranslation('common');

  // Translate description with proper localization
  const getTranslatedDescription = (): string => {
    switch (actionType) {
      case 'team_created':
        return t('activity.created', { name: metadata?.team_name || '' });
      case 'team_joined':
        return t('activity.joined', { name: metadata?.team_name || '' });
      case 'event_created':
        return metadata?.event_title || '';
      case 'event_rsvp':
        return t('activity.attendingEvent', { name: metadata?.event_title || '' });
      case 'activity_logged':
        const distanceStr = metadata?.distance ? ` - ${metadata.distance}km` : '';
        const durationStr = metadata?.duration ? ` • ${Math.round(metadata.duration / 60)}min` : '';
        return `${metadata?.title || ''}${distanceStr}${durationStr}`;
      default:
        return '';
    }
  };

  // Get activity type icon and label
  const getActivityInfo = () => {
    switch (actionType) {
      case 'team_created':
        return { emoji: '🏆', label: t('activity.createdTeam') };
      case 'team_joined':
        return { emoji: '🤝', label: t('activity.joinedTeam') };
      case 'event_created':
        const eventEmoji = metadata?.event_type === 'training' ? '🏋️' : 
                          metadata?.event_type === 'match' ? '⚽' : '👥';
        return { emoji: eventEmoji, label: t('activity.createdEvent') };
      case 'event_rsvp':
        return { emoji: '✓', label: t('activity.rsvp') };
      case 'activity_logged':
        return { emoji: '📊', label: t('activity.loggedActivity') };
      default:
        return { emoji: '📌', label: t('activity.title') };
    }
  };

  const translatedDescription = getTranslatedDescription();
  const activityInfo = getActivityInfo();
  const formattedTime = createdAt ? formatRelativeDate(createdAt) : timeAgo;

  return (
    <Card variant="default" className="overflow-hidden">
      {/* Header */}
      <div className="p-3 flex items-center gap-2.5">
        <Avatar className="h-9 w-9">
          <AvatarImage src={avatarUrl} loading="lazy" />
          <AvatarFallback className="text-xs bg-primary/10 text-primary font-medium">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span className="text-card-title font-semibold truncate max-w-[60%]">
              {displayName || username}
            </span>
            <span className="text-caption text-muted-foreground">·</span>
            <span className="text-caption text-muted-foreground shrink-0">
              {formattedTime}
            </span>
          </div>
          <div className="flex items-center gap-1 text-caption text-muted-foreground">
            <span>{activityInfo.emoji}</span>
            <span>{activityInfo.label}</span>
          </div>
        </div>
      </div>

      {/* Image */}
      {imageUrl && (
        <div className="relative aspect-[16/9] bg-muted">
          <img 
            src={imageUrl} 
            alt="Activity" 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      )}

      {/* Quoted Description */}
      {translatedDescription && (
        <div className="px-3 py-2 border-l-2 border-primary/30 mx-3 bg-muted/30 rounded-r">
          <p className="text-body-sm italic text-foreground/80">
            "{translatedDescription}"
          </p>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="px-3 py-2 flex flex-wrap gap-1.5">
          {achievements.map((achievement, index) => (
            <Badge
              key={index}
              variant="secondary"
              size="sm"
              className="gap-1"
            >
              <Trophy className="h-2.5 w-2.5" />
              {achievement}
            </Badge>
          ))}
        </div>
      )}

    </Card>
  );
});
ActivityCard.displayName = "ActivityCard";
