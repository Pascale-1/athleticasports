import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useTranslation } from "react-i18next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { getSportsForDropdown, getFeaturedSports, getRegularSports } from "@/lib/sports";

const formSchema = z.object({
  name: z.string().min(1, "Team name is required").max(50),
  sport: z.string().min(1, "Sport is required"),
  description: z.string().max(200).optional(),
});

type FormData = z.infer<typeof formSchema>;

interface QuickTeamCreateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onTeamCreated: (teamId: string, teamName: string, teamLogo?: string) => void;
  defaultSport?: string;
}

export const QuickTeamCreateDialog = ({
  open,
  onOpenChange,
  onTeamCreated,
  defaultSport,
}: QuickTeamCreateDialogProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();
  const { i18n, t } = useTranslation();
  const lang = (i18n.language?.split('-')[0] || 'fr') as 'en' | 'fr';
  
  const featuredSports = getFeaturedSports();
  const regularSports = getRegularSports();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      sport: defaultSport || "",
      description: "",
    },
  });

  const handleSubmit = async (values: FormData) => {
    try {
      setIsSubmitting(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const { data: team, error: teamError } = await supabase
        .from("teams")
        .insert({
          name: values.name,
          sport: values.sport,
          description: values.description || null,
          is_private: false,
          created_by: user.id,
        })
        .select()
        .single();

      if (teamError) throw teamError;

      toast({
        title: t('teams.createTeam'),
        description: `${values.name} ${lang === 'fr' ? 'a été créée avec succès.' : 'has been created successfully.'}`,
      });

      onTeamCreated(team.id, team.name, team.avatar_url || undefined);
      form.reset();
    } catch (error: any) {
      console.error("Error creating team:", error);
      toast({
        title: t('errors.generic'),
        description: error.message || "Failed to create team",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>{t('teams.createTeam')}</DialogTitle>
          <DialogDescription>
            {t('teams.quickCreate.description')}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('teams.form.name')}</FormLabel>
                  <FormControl>
                    <Input placeholder={lang === 'fr' ? "ex: FC Warriors" : "e.g., Warriors FC"} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="sport"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('teams.form.sport')}</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t('teams.form.sportPlaceholder')} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {/* Featured sports first */}
                      <SelectGroup>
                        <SelectLabel>{lang === 'fr' ? '⭐ Populaires' : '⭐ Popular'}</SelectLabel>
                        {featuredSports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.emoji} {sport.label[lang]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                      {/* Other sports */}
                      <SelectGroup>
                        <SelectLabel>{lang === 'fr' ? 'Autres sports' : 'Other sports'}</SelectLabel>
                        {regularSports.map((sport) => (
                          <SelectItem key={sport.id} value={sport.id}>
                            {sport.emoji} {sport.label[lang]}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t('teams.form.description')}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={lang === 'fr' ? "Brève description de l'équipe" : "Brief team description"}
                      className="resize-none"
                      maxLength={200}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isSubmitting}
              >
                {t('actions.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting} className="flex-1">
                {isSubmitting ? t('actions.loading') : t('teams.createTeam')}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
