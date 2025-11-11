import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";

interface TeamAboutSectionProps {
  description: string | null;
  maxLines?: number;
}

export const TeamAboutSection = ({ description, maxLines = 3 }: TeamAboutSectionProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  if (!description) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          <p className="text-caption">No description available</p>
        </CardContent>
      </Card>
    );
  }

  const needsExpansion = description.split('\n').length > maxLines || description.length > 200;

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-body-large font-semibold mb-2">About</h3>
        <p className={`text-body text-muted-foreground whitespace-pre-wrap ${
          !isExpanded && needsExpansion ? `line-clamp-${maxLines}` : ''
        }`}>
          {description}
        </p>
        {needsExpansion && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-primary"
          >
            {isExpanded ? (
              <>Show less <ChevronUp className="h-4 w-4 ml-1" /></>
            ) : (
              <>Read more <ChevronDown className="h-4 w-4 ml-1" /></>
            )}
          </Button>
        )}
      </CardContent>
    </Card>
  );
};
