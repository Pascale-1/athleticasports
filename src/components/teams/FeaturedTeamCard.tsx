import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Users, Plus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Team } from "@/lib/teams";
import { motion } from "framer-motion";

interface FeaturedTeamCardProps {
  team: Team;
  memberCount: number;
  isMember: boolean;
}

export const FeaturedTeamCard = ({ team, memberCount, isMember }: FeaturedTeamCardProps) => {
  const navigate = useNavigate();

  return (
    <motion.div
      whileHover={{ y: -8, transition: { duration: 0.2 } }}
      whileTap={{ scale: 0.98 }}
    >
      <Card 
        className="relative overflow-hidden cursor-pointer group transition-shadow hover:shadow-xl w-full max-w-full"
        onClick={() => navigate(`/teams/${team.id}`)}
      >
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent z-10" />
        <div className="relative z-20 p-4 h-full flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <motion.div
              whileHover={{ scale: 1.1 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <Avatar className="h-12 w-12 border-2 border-background">
                <AvatarImage src={team.avatar_url || ""} />
                <AvatarFallback className="text-base">
                  {team.name.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </motion.div>
            {team.sport && (
              <Badge variant="secondary" className="text-xs px-2 py-0.5">
                {team.sport}
              </Badge>
            )}
          </div>
          
          <div className="min-w-0 w-full">
            <h3 className="font-bold text-base mb-1 break-words hyphens-auto max-w-full">{team.name}</h3>
            <div className="flex items-center gap-2 text-xs text-muted-foreground mb-3 flex-wrap">
              <Users className="h-3.5 w-3.5" />
              <span>{memberCount} {memberCount === 1 ? 'member' : 'members'}</span>
            </div>
            
            {!isMember && (
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button 
                  size="sm" 
                  className="w-full min-h-[44px]"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/teams/${team.id}`);
                  }}
                >
                  <Plus className="h-4 w-4 mr-1 shrink-0" />
                  <span className="break-words">Join Team</span>
                </Button>
              </motion.div>
            )}
            {isMember && (
              <Badge variant="default" className="w-full justify-center py-2">
                Member
              </Badge>
            )}
          </div>
        </div>
      </Card>
    </motion.div>
  );
};
