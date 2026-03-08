import { useState } from "react";
import { useTranslation } from "react-i18next";
import { CalendarPlus, ChevronDown, ExternalLink, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  generateGoogleCalendarUrl,
  generateOutlookUrl,
  generateOffice365Url,
  generateICSFile,
  downloadICS,
  type CalendarEvent,
} from "@/lib/calendarExport";
import { toast } from "sonner";
import { useExternalLink } from "@/hooks/useExternalLink";
import { Capacitor } from "@capacitor/core";

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
  
  const { openExternalUrl } = useExternalLink();
  const [isOpen, setIsOpen] = useState(false);
  const isNative = Capacitor.isNativePlatform();

  const calendarEvent: CalendarEvent = {
    title: event.title,
    description: event.description || undefined,
    location: event.location || undefined,
    start: new Date(event.start_time),
    end: new Date(event.end_time),
  };

  const handleNativeCalendar = async () => {
    try {
      const icsContent = generateICSFile(calendarEvent);
      const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
      const file = new File([blob], `${calendarEvent.title.replace(/[^a-z0-9]/gi, '_')}.ics`, {
        type: 'text/calendar',
      });

      if (navigator.share && navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: calendarEvent.title });
      } else {
        // Fallback: download the file which triggers native calendar on most devices
        downloadICS(calendarEvent);
      }
      toast.success(t("calendar.downloaded"), { description: t("calendar.downloadedDesc") });
    } catch (error) {
      if ((error as DOMException)?.name === 'AbortError') return;
      // Fallback to download
      downloadICS(calendarEvent);
      toast.success(t("calendar.downloaded"), { description: t("calendar.downloadedDesc") });
    }
    setIsOpen(false);
  };

  const handleDownloadICS = () => {
    downloadICS(calendarEvent);
    toast.success(t("calendar.downloaded"), { description: t("calendar.downloadedDesc") });
    setIsOpen(false);
  };

  const handleGoogleCalendar = async () => {
    await openExternalUrl(generateGoogleCalendarUrl(calendarEvent));
    setIsOpen(false);
  };

  const handleOutlook = async () => {
    await openExternalUrl(generateOutlookUrl(calendarEvent));
    setIsOpen(false);
  };

  const handleOffice365 = async () => {
    await openExternalUrl(generateOffice365Url(calendarEvent));
    setIsOpen(false);
  };

  // On native: single button that shares/downloads ICS → triggers native calendar picker
  if (isNative) {
    return (
      <Button variant={variant} size={size} className="gap-2" onClick={handleNativeCalendar}>
        <CalendarPlus className="h-4 w-4" />
        <span>{t("calendar.addToCalendar")}</span>
      </Button>
    );
  }

  // On web: dropdown with all calendar provider options
  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <CalendarPlus className="h-4 w-4" />
          <span>{t("calendar.addToCalendar")}</span>
          <ChevronDown className="h-3 w-3" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuItem onClick={handleDownloadICS} className="gap-2 cursor-pointer">
          <Download className="h-4 w-4" />
          {t("calendar.downloadICS")}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
