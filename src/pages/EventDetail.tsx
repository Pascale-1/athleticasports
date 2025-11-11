import { useParams, useNavigate } from "react-router-dom";
import { PageContainer } from "@/components/mobile/PageContainer";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

const EventDetail = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();

  return (
    <PageContainer>
      <div className="space-y-6">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={() => navigate("/events")}
          className="mb-4"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Button>

        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold">Event Detail</h1>
          <p className="text-sm text-muted-foreground">Event ID: {eventId}</p>
          <p className="text-sm text-muted-foreground mt-4">
            Event detail page coming soon...
          </p>
        </div>
      </div>
    </PageContainer>
  );
};

export default EventDetail;
