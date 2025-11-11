import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { FeaturedTeamCard } from "./FeaturedTeamCard";
import { Team } from "@/lib/teams";

interface TeamCarouselProps {
  teams: Team[];
  memberCounts: Record<string, number>;
  myTeamIds: string[];
}

export const TeamCarousel = ({ teams, memberCounts, myTeamIds }: TeamCarouselProps) => {
  if (teams.length === 0) return null;

  return (
    <Carousel
      opts={{
        align: "start",
        loop: false,
      }}
      className="w-full"
    >
      <CarouselContent className="-ml-2 md:-ml-4">
        {teams.map((team) => (
          <CarouselItem 
            key={team.id} 
            className="pl-2 md:pl-4 basis-[280px] md:basis-[320px]"
          >
            <FeaturedTeamCard
              team={team}
              memberCount={memberCounts[team.id] || 0}
              isMember={myTeamIds.includes(team.id)}
            />
          </CarouselItem>
        ))}
      </CarouselContent>
      <CarouselPrevious className="hidden md:flex -left-4" />
      <CarouselNext className="hidden md:flex -right-4" />
    </Carousel>
  );
};
