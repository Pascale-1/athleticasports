import { memo, useState } from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Trophy, Clock, Users, UserPlus, Calendar, Check, Activity as ActivityIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

interface ActivityCardProps {
  username: string;
  displayName?: string;
  avatarUrl?: string;
  activityType: string;
  timeAgo: string;
  description?: string;
  achievements?: string[];
  likes?: number;
  comments?: number;
  imageUrl?: string;
  actionIcon?: 'users' | 'user-plus' | 'calendar' | 'check' | 'activity';
}

export const ActivityCard = memo(({
  username,
  displayName,
  avatarUrl,
  activityType,
  timeAgo,
  description,
  achievements,
  likes = 0,
  comments = 0,
  imageUrl,
  actionIcon = 'activity',
}: ActivityCardProps) => {
  const { t } = useTranslation('common');
  const [isLiked, setIsLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(likes);

  const handleLike = () => {
    if (isLiked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setIsLiked(!isLiked);
  };

  const getActionIcon = () => {
    const iconClass = "h-4 w-4";
    switch (actionIcon) {
      case 'users':
        return <Users className={iconClass} />;
      case 'user-plus':
        return <UserPlus className={iconClass} />;
      case 'calendar':
        return <Calendar className={iconClass} />;
      case 'check':
        return <Check className={iconClass} />;
      default:
        return <Trophy className={iconClass} />;
    }
  };

  // Translate activity type
  const getTranslatedActivityType = (type: string) => {
    const typeMap: Record<string, string> = {
      'Created Team': t('activity.createdTeam'),
      'Joined Team': t('activity.joinedTeam'),
      'Created Event': t('activity.createdEvent'),
      'RSVP': t('activity.rsvp'),
      'Attending': t('activity.attending'),
      'Activity': t('activity.title'),
    };
    return typeMap[type] || type;
  };

  return (
    <Card className="overflow-hidden hover-lift transition-all duration-200 active:scale-[0.98] w-full max-w-full min-w-0">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Avatar size="md">
          <AvatarImage src={avatarUrl} loading="lazy" />
          <AvatarFallback className="text-body bg-primary/10 text-primary">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0 overflow-hidden">
          <p className="text-body-large font-semibold break-words max-w-full">
            {displayName || username}
          </p>
          <div className="flex items-center gap-2 text-caption text-muted-foreground flex-wrap">
            {getActionIcon()}
            <span>{getTranslatedActivityType(activityType)}</span>
            <span>•</span>
            <Clock className="h-3 w-3" />
            <span>{timeAgo}</span>
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

      {/* Content */}
      {description && (
        <div className="px-4 py-3">
          <p className="text-body leading-relaxed break-words hyphens-auto max-w-full">{description}</p>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {achievements.map((achievement, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-primary/10 text-caption font-medium text-primary"
            >
              <Trophy className="h-3 w-3" />
              {achievement}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border/50 flex items-center gap-6">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 text-body font-medium transition-all duration-200 active:scale-95 min-h-[44px] min-w-[44px] -m-2 p-2",
            isLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
          )}
          aria-label={isLiked ? "Unlike" : "Like"}
        >
          <Heart className={cn("h-5 w-5 transition-transform", isLiked && "fill-current scale-110")} />
          <span>{likeCount}</span>
        </button>
        <button 
          className="flex items-center gap-2 text-body font-medium text-muted-foreground hover:text-foreground transition-colors active:scale-95 min-h-[44px] min-w-[44px] -m-2 p-2"
          aria-label="Comment"
        >
          <MessageCircle className="h-5 w-5" />
          <span>{comments}</span>
        </button>
      </div>
    </Card>
  );
});
ActivityCard.displayName = "ActivityCard";