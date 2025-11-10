import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Heart, MessageCircle, Trophy, Clock } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useState } from "react";
import { cn } from "@/lib/utils";

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
}

export const ActivityCard = ({
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
}: ActivityCardProps) => {
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

  return (
    <Card className="overflow-hidden hover-lift transition-all duration-200 active:scale-[0.98]">
      {/* Header */}
      <div className="p-4 flex items-center gap-3">
        <Avatar className="h-10 w-10">
          <AvatarImage src={avatarUrl} />
          <AvatarFallback className="text-sm bg-gradient-to-br from-primary to-primary-dark text-primary-foreground">
            {username.substring(0, 2).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">
            {displayName || username}
          </p>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <Trophy className="h-3 w-3" />
            <span>{activityType}</span>
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
          <p className="text-sm leading-relaxed">{description}</p>
        </div>
      )}

      {/* Achievements */}
      {achievements && achievements.length > 0 && (
        <div className="px-4 pb-3 flex flex-wrap gap-2">
          {achievements.map((achievement, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-2 py-1 rounded-full bg-gradient-to-r from-accent/10 to-teal/10 text-xs font-medium text-accent"
            >
              <Trophy className="h-3 w-3" />
              {achievement}
            </span>
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="px-4 py-3 border-t border-border/50 flex items-center gap-4">
        <button
          onClick={handleLike}
          className={cn(
            "flex items-center gap-2 text-sm font-medium transition-all duration-200 active:scale-95",
            isLiked ? "text-destructive" : "text-muted-foreground hover:text-foreground"
          )}
        >
          <Heart className={cn("h-5 w-5", isLiked && "fill-current")} />
          <span>{likeCount}</span>
        </button>
        <button className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors active:scale-95">
          <MessageCircle className="h-5 w-5" />
          <span>{comments}</span>
        </button>
      </div>
    </Card>
  );
};
