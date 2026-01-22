import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarPlus, ChevronDown, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
  generateOffice365Url,
  downloadICS,
  type CalendarEvent,
} from "@/lib/calendarExport";
import { useToast } from "@/hooks/use-toast";

interface AddToCalendarButtonProps {
  event: {
    title: string;
    description?: string | null;
    location?: string | null;
    start_time: string;
    end_time: string;
  };
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const AddToCalendarButton = ({
  event,
  variant = "outline",
  size = "sm",
}: AddToCalendarButtonProps) => {
  const { t } = useTranslation("events");
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);

  const calendarEvent: CalendarEvent = {
    title: event.title,
    description: event.description || undefined,
    location: event.location || undefined,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
  };

  const handleGoogleCalendar = () => {
    window.open(generateGoogleCalendarUrl(calendarEvent), "_blank");
    setIsOpen(false);
  };

  const handleOutlook = () => {
    window.open(generateOutlookUrl(calendarEvent), "_blank");
    setIsOpen(false);
  };

  const handleOffice365 = () => {
    window.open(generateOffice365Url(calendarEvent), "_blank");
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    downloadICS(calendarEvent);
    toast({
      title: t("calendar.downloaded"),
      description: t("calendar.downloadedDesc"),
    });
    setIsOpen(false);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          <span className="hidden sm:inline">{t("calendar.addToCalendar")}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleGoogleCalendar} className="gap-2 cursor-pointer">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M19.6 3.5H4.4C3.1 3.5 2 4.6 2 5.9v12.2c0 1.3 1.1 2.4 2.4 2.4h15.2c1.3 0 2.4-1.1 2.4-2.4V5.9c0-1.3-1.1-2.4-2.4-2.4zM4.4 5.5h15.2c.2 0 .4.2.4.4v1.6H4V5.9c0-.2.2-.4.4-.4zM19.6 18.5H4.4c-.2 0-.4-.2-.4-.4V9.5h16v8.6c0 .2-.2.4-.4.4z" />
          </svg>
          Google Calendar
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOutlook} className="gap-2 cursor-pointer">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.5 3H8c-.8 0-1.5.7-1.5 1.5V6H4.8l-2.2.6v10.8l2.2.6h1.7v1.5c0 .8.7 1.5 1.5 1.5h13.5c.8 0 1.5-.7 1.5-1.5v-15c0-.8-.7-1.5-1.5-1.5zM6.5 15.2L3.8 14V8.8l2.7-.8v7.2zm14-1.7c0 .3-.2.5-.5.5H8.5V6h12v7.5z" />
          </svg>
          Outlook.com
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleOffice365} className="gap-2 cursor-pointer">
          <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
            <path d="M21.5 3H8c-.8 0-1.5.7-1.5 1.5V6H4.8l-2.2.6v10.8l2.2.6h1.7v1.5c0 .8.7 1.5 1.5 1.5h13.5c.8 0 1.5-.7 1.5-1.5v-15c0-.8-.7-1.5-1.5-1.5zM6.5 15.2L3.8 14V8.8l2.7-.8v7.2zm14-1.7c0 .3-.2.5-.5.5H8.5V6h12v7.5z" />
          </svg>
          Office 365
          <ExternalLink className="h-3 w-3 ml-auto opacity-50" />
        </DropdownMenuItem>
        <DropdownMenuItem onClick={handleDownloadICS} className="gap-2 cursor-pointer">
          <Download className="h-4 w-4" />
          {t("calendar.downloadICS")}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
