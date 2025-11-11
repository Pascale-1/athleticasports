import { Card, CardContent } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users as UsersIcon } from "lucide-react";
import { FollowButton } from "@/components/FollowButton";
import { useFollowers } from "@/hooks/useFollowers";
import { AnimatedCard } from "@/components/animations/AnimatedCard";

interface Profile {
  id: string;
  user_id: string;
  username: string;
  display_name: string | null;
  avatar_url: string | null;
  bio: string | null;
  primary_sport: string | null;
  created_at: string;
  roles: string[];
}

interface PeopleTabProps {
  profiles: Profile[];
  activeSport: string;
}

export const PeopleTab = ({ profiles, activeSport }: PeopleTabProps) => {
  const filteredProfiles = profiles.filter(profile => 
    activeSport === "All" || profile.primary_sport === activeSport
  );

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredProfiles.map((profile, index) => {
        const UserCard = () => {
          const { followerCount } = useFollowers(profile.user_id);
          
          return (
            <AnimatedCard key={profile.id} delay={index * 0.05} hover={false}>
              <Card className="hover-scale">
                <CardContent className="pt-4 sm:pt-6 p-3 sm:p-6">
                  <div className="flex flex-col items-center text-center space-y-3 sm:space-y-4">
                    <Avatar className="h-16 w-16 md:h-20 md:w-20">
                      <AvatarImage src={profile.avatar_url || undefined} />
                      <AvatarFallback className="text-lg md:text-xl">
                        {profile.username.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                    
                    <div className="space-y-1 w-full">
                      <h3 className="font-semibold text-base sm:text-lg truncate">@{profile.username}</h3>
                      {profile.display_name && (
                        <p className="text-xs sm:text-sm text-muted-foreground truncate">{profile.display_name}</p>
                      )}
                      <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground pt-1">
                        <UsersIcon className="h-3 w-3" />
                        <span>{followerCount} {followerCount === 1 ? 'follower' : 'followers'}</span>
                      </div>
                    </div>

                    {profile.bio && (
                      <p className="text-sm text-muted-foreground line-clamp-2">{profile.bio}</p>
                    )}

                    {profile.primary_sport && (
                      <Badge variant="secondary">{profile.primary_sport}</Badge>
                    )}

                    {profile.roles.length > 0 && (
                      <div className="flex gap-2 flex-wrap justify-center">
                        {profile.roles.map(role => (
                          <Badge key={role} variant={role === 'admin' ? 'default' : 'outline'}>
                            {role}
                          </Badge>
                        ))}
                      </div>
                    )}

                    <div className="flex flex-col gap-2 w-full">
                      <FollowButton userId={profile.user_id} username={profile.username} />
                      <p className="text-xs text-muted-foreground">
                        Joined {new Date(profile.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </AnimatedCard>
          );
        };
        
        return <UserCard key={profile.id} />;
      })}
    </div>
  );
};
