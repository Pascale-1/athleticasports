import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trophy, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { cn } from "@/lib/utils";

interface QuickAction {
  label: string;
  icon: React.ReactNode;
  href: string;
  variant?: "default" | "outline";
}

export const QuickActions = () => {
  const navigate = useNavigate();

  const actions: QuickAction[] = [
    {
      label: "Create Team",
      icon: <Users className="h-4 w-4" />,
      href: "/teams/create",
      variant: "default",
    },
    {
      label: "Find Partners",
      icon: <UserPlus className="h-4 w-4" />,
      href: "/users",
      variant: "outline",
    },
    {
      label: "Join Challenge",
      icon: <Trophy className="h-4 w-4" />,
      href: "/teams",
      variant: "outline",
    },
    {
      label: "Explore Teams",
      icon: <Compass className="h-4 w-4" />,
      href: "/teams",
      variant: "outline",
    },
  ];

  return (
    <div className="relative">
      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory scrollbar-hide">
        {actions.map((action, index) => (
          <Button
            key={index}
            variant={action.variant}
            size="sm"
            onClick={() => navigate(action.href)}
            className="flex items-center gap-2 whitespace-nowrap snap-start transition-transform active:scale-95"
          >
            {action.icon}
            <span className="font-medium">{action.label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
