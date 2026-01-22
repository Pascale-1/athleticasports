import { useTranslation } from "react-i18next";
import { LogOut, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useLogout } from "@/hooks/useLogout";

interface LogoutButtonProps {
  variant?: "header" | "inline";
}

export function LogoutButton({ variant = "header" }: LogoutButtonProps) {
  const { t } = useTranslation("common");
  const { logout } = useLogout();

  if (variant === "header") {
    return (
      <Button
        variant="ghost"
        size="sm"
        onClick={logout}
        className="text-destructive hover:text-destructive hover:bg-destructive/10 font-semibold"
      >
        {t("profile.logout")}
        <ChevronRight className="h-4 w-4 ml-1" />
      </Button>
    );
  }

  return (
    <Button
      variant="outline"
      onClick={logout}
      className="w-full justify-start text-destructive border-destructive/30 hover:bg-destructive/10 hover:text-destructive"
    >
      <LogOut className="h-4 w-4 mr-2" />
      {t("profile.logout")}
    </Button>
  );
}
