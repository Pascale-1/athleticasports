import { ReactNode } from "react";
import { Drawer } from "vaul";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SlidersHorizontal, X } from "lucide-react";

interface FilterSheetProps {
  activeCount: number;
  onApply: () => void;
  onReset?: () => void;
  children: ReactNode;
  trigger?: ReactNode;
}

export const FilterSheet = ({ 
  activeCount, 
  onApply, 
  onReset,
  children,
  trigger 
}: FilterSheetProps) => {
  return (
    <Drawer.Root>
      <Drawer.Trigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="relative">
            <SlidersHorizontal className="h-4 w-4 mr-2" />
            Filters
            {activeCount > 0 && (
              <Badge 
                variant="default" 
                className="ml-2 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
              >
                {activeCount}
              </Badge>
            )}
          </Button>
        )}
      </Drawer.Trigger>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50" />
        <Drawer.Content className="fixed bottom-0 left-0 right-0 z-50 flex flex-col rounded-t-[10px] bg-background border-t">
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-muted my-4" />
          <div className="flex items-center justify-between px-4 pb-4">
            <Drawer.Title className="text-lg font-semibold">
              Filters
            </Drawer.Title>
            <Drawer.Close asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </Drawer.Close>
          </div>
          <div className="px-4 pb-8 overflow-y-auto max-h-[70vh]">
            {children}
          </div>
          <div className="sticky bottom-0 p-4 border-t bg-background flex gap-2">
            {onReset && activeCount > 0 && (
              <Button 
                variant="outline" 
                onClick={onReset}
                className="flex-1"
              >
                Reset
              </Button>
            )}
            <Drawer.Close asChild>
              <Button 
                onClick={onApply}
                className="flex-1"
              >
                Apply Filters
              </Button>
            </Drawer.Close>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
};
