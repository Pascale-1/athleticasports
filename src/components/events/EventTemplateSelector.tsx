import { useTranslation } from "react-i18next";
import { Zap, Clock, Dumbbell, Swords, Users, Plus, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import {
  useEventTemplates,
  EventTemplate,
  PRESET_TEMPLATES,
} from "@/hooks/useEventTemplates";
import { cn } from "@/lib/utils";
import { EventType } from "@/lib/eventConfig";

interface EventTemplateSelectorProps {
  teamId?: string | null;
  onSelectTemplate: (template: Partial<EventTemplate>) => void;
  onSaveAsTemplate?: () => void;
  className?: string;
}

const TYPE_ICONS: Record<EventType, React.ReactNode> = {
  training: <Dumbbell className="h-4 w-4" />,
  match: <Swords className="h-4 w-4" />,
  meetup: <Users className="h-4 w-4" />,
};

const TYPE_COLORS: Record<EventType, string> = {
  training: "bg-blue-500/10 text-blue-600 border-blue-500/20",
  match: "bg-amber-500/10 text-amber-600 border-amber-500/20",
  meetup: "bg-green-500/10 text-green-600 border-green-500/20",
};

export const EventTemplateSelector = ({
  teamId,
  onSelectTemplate,
  onSaveAsTemplate,
  className,
}: EventTemplateSelectorProps) => {
  const { t } = useTranslation("events");
  const { templates, loading, deleteTemplate } = useEventTemplates(teamId);

  // Combine preset templates with user templates
  const presetTemplatesWithMeta = PRESET_TEMPLATES.map((template, index) => ({
    ...template,
    id: `preset-${index}`,
    name: template.title,
    isPreset: true,
  }));

  const handleSelectPreset = (preset: typeof presetTemplatesWithMeta[0]) => {
    onSelectTemplate({
      type: preset.type,
      title: preset.title,
      description: preset.description || null,
      location: preset.location || null,
      default_time: preset.default_time || null,
      default_duration: preset.default_duration || null,
      max_participants: preset.max_participants || null,
      is_public: preset.is_public || false,
      match_format: preset.match_format || null,
      meetup_category: preset.meetup_category || null,
    });
  };

  const handleSelectUserTemplate = (template: EventTemplate) => {
    onSelectTemplate(template);
  };

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Zap className="h-4 w-4 text-primary" />
          <span className="text-sm font-medium">{t("templates.quickStart")}</span>
        </div>
        {onSaveAsTemplate && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={onSaveAsTemplate}
            className="h-7 text-xs gap-1"
          >
            <Plus className="h-3 w-3" />
            {t("templates.saveAsTemplate")}
          </Button>
        )}
      </div>

      <ScrollArea className="w-full whitespace-nowrap">
        <div className="flex gap-2 pb-2">
          {/* Preset Templates */}
          {presetTemplatesWithMeta.map((preset) => (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                "flex flex-col items-start gap-1.5 p-3 rounded-lg border min-w-[140px]",
                "hover:bg-muted/50 transition-colors text-left",
                TYPE_COLORS[preset.type]
              )}
            >
              <div className="flex items-center gap-1.5">
                {TYPE_ICONS[preset.type]}
                <span className="text-xs font-medium">{preset.name}</span>
              </div>
              {preset.default_time && (
                <div className="flex items-center gap-1 text-xs opacity-70">
                  <Clock className="h-3 w-3" />
                  {preset.default_time}
                </div>
              )}
            </button>
          ))}

          {/* User Templates */}
          {templates.map((template) => (
            <div
              key={template.id}
              className={cn(
                "relative flex flex-col items-start gap-1.5 p-3 rounded-lg border min-w-[140px]",
                "hover:bg-muted/50 transition-colors",
                TYPE_COLORS[template.type]
              )}
            >
              <button
                type="button"
                onClick={() => handleSelectUserTemplate(template)}
                className="w-full text-left"
              >
                <div className="flex items-center gap-1.5">
                  {TYPE_ICONS[template.type]}
                  <span className="text-xs font-medium truncate max-w-[100px]">
                    {template.name}
                  </span>
                </div>
                {template.default_time && (
                  <div className="flex items-center gap-1 text-xs opacity-70 mt-1">
                    <Clock className="h-3 w-3" />
                    {template.default_time}
                  </div>
                )}
              </button>
              <button
                type="button"
                onClick={() => deleteTemplate(template.id)}
                className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-background border flex items-center justify-center hover:bg-destructive hover:text-destructive-foreground transition-colors"
              >
                <X className="h-3 w-3" />
              </button>
              <Badge
                variant="outline"
                className="absolute bottom-1 right-1 text-[10px] px-1 py-0"
              >
                {t("templates.custom")}
              </Badge>
            </div>
          ))}

          {loading && (
            <div className="flex items-center justify-center min-w-[100px] p-3">
              <div className="h-4 w-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
          )}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
};
