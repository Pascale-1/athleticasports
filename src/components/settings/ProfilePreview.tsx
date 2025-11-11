import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ExternalLink } from "lucide-react";

interface ProfilePreviewProps {
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  primarySport: string | null;
}

export const ProfilePreview = ({ 
  username, 
  displayName, 
  avatarUrl, 
  bio, 
  primarySport 
}: ProfilePreviewProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" className="w-full" size="lg">
          <ExternalLink className="mr-2 h-4 w-4" />
          Preview Profile
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Profile Preview</DialogTitle>
        </DialogHeader>
        <Card className="border-0 shadow-none">
          <div className="space-y-4 p-4">
            {/* Avatar & Name */}
            <div className="flex flex-col items-center text-center space-y-3">
              <Avatar size="2xl" ring="coral">
                <AvatarImage src={avatarUrl || undefined} />
                <AvatarFallback className="text-heading-1 bg-primary/10 text-primary">
                  {username.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-heading-2 font-bold">
                  {displayName || username}
                </h2>
                <p className="text-body text-muted-foreground">@{username}</p>
              </div>
            </div>

            {/* Sport Badge */}
            {primarySport && (
              <div className="flex justify-center">
                <Badge variant="secondary" className="text-body">
                  {primarySport}
                </Badge>
              </div>
            )}

            {/* Bio */}
            {bio && (
              <div className="pt-2 border-t">
                <p className="text-body text-center text-muted-foreground leading-relaxed">
                  {bio}
                </p>
              </div>
            )}

            {/* Preview Note */}
            <div className="pt-2 border-t">
              <p className="text-caption text-center text-muted-foreground">
                This is how your profile appears to other athletes
              </p>
            </div>
          </div>
        </Card>
      </DialogContent>
    </Dialog>
  );
};
