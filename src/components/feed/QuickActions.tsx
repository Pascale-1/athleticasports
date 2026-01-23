import { Button } from "@/components/ui/button";
import { Users, UserPlus, Trophy, Compass } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";

interface QuickAction {
  labelKey: string;
  icon: React.ReactNode;
  href: string;
  variant?: "default" | "outline";
}

export const QuickActions = () => {
  const navigate = useNavigate();
  const { t } = useTranslation('common');

  const actions: QuickAction[] = [
    {
      labelKey: "quickActions.createTeam",
      icon: <Users className="h-4 w-4" />,
      href: "/teams/create",
      variant: "default",
    },
    {
      labelKey: "quickActions.findPartners",
      icon: <UserPlus className="h-4 w-4" />,
      href: "/users",
      variant: "outline",
    },
    {
      labelKey: "quickActions.joinChallenge",
      icon: <Trophy className="h-4 w-4" />,
      href: "/teams",
      variant: "outline",
    },
    {
      labelKey: "quickActions.exploreTeams",
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
            <span className="font-medium">{t(action.labelKey)}</span>
          </Button>
        ))}
      </div>
    </div>
  );
};
