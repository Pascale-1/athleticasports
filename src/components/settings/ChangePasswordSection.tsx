import { useState } from "react";
import { useTranslation } from "react-i18next";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { KeyRound } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAppBaseUrl } from "@/lib/appUrl";

interface ChangePasswordSectionProps {
  email: string;
}

export const ChangePasswordSection = ({ email }: ChangePasswordSectionProps) => {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleChangePassword = async () => {
    if (!email) return;
    setLoading(true);
    try {
      const response = await supabase.functions.invoke('send-password-reset', {
        body: { email, redirectTo: `${getAppBaseUrl()}/reset-password` },
      });
      if (response.error) throw response.error;
      toast({
        title: t('settings.changePasswordSuccess'),
        description: t('settings.changePasswordSuccessDesc'),
      });
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: t('errors.generic'),
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardContent className="pt-6 space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <KeyRound className="h-4 w-4" />
            {t('settings.changePassword')}
          </Label>
          <p className="text-sm text-muted-foreground">
            {t('settings.changePasswordDesc')}
          </p>
          <Button
            variant="outline"
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full"
          >
            {t('settings.changePassword')}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
