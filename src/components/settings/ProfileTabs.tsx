import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent } from "@/components/ui/card";
import { RecentActivities } from "./RecentActivities";
import { Trophy, Activity, User, Mail, Calendar } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { SportSelector } from "./SportSelector";

interface ProfileTabsProps {
  profile: any;
  email: string;
  stats: {
    totalActivities: number;
    totalDistance: number;
    totalDuration: number;
  };
  onEditField: (field: string, value: string) => void;
  onSaveField: () => void;
  editingField: string | null;
  setEditingField: (field: string | null) => void;
  tempValues: any;
  setTempValues: (values: any) => void;
}

export const ProfileTabs = ({
  profile,
  email,
  stats,
  onEditField,
  onSaveField,
  editingField,
  setEditingField,
  tempValues,
  setTempValues,
}: ProfileTabsProps) => {
  return (
    <Tabs defaultValue="overview" className="w-full">
      <TabsList className="grid w-full grid-cols-3">
        <TabsTrigger value="overview">Overview</TabsTrigger>
        <TabsTrigger value="activity">Activity</TabsTrigger>
        <TabsTrigger value="about">About</TabsTrigger>
      </TabsList>

      <TabsContent value="overview" className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Activity className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalActivities}</p>
                  <p className="text-sm text-muted-foreground">Activities</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Trophy className="h-8 w-8 text-primary" />
                <div>
                  <p className="text-2xl font-bold">{stats.totalDistance.toFixed(1)} km</p>
                  <p className="text-sm text-muted-foreground">Distance</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardContent className="pt-6 space-y-4">
            <h3 className="font-semibold text-lg">Quick Info</h3>
            
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <Mail className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Email:</span>
                <span className="text-sm">{email}</span>
              </div>

              {profile?.primary_sport && (
                <div className="flex items-center gap-3">
                  <Trophy className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Primary Sport:</span>
                  <Badge variant="secondary">{profile.primary_sport}</Badge>
                </div>
              )}

              <div className="flex items-center gap-3">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">Member since:</span>
                <span className="text-sm">
                  {new Date(profile?.created_at).toLocaleDateString('en-US', {
                    month: 'long',
                    year: 'numeric',
                  })}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="activity">
        <RecentActivities />
      </TabsContent>

      <TabsContent value="about" className="space-y-4">
        <Card>
          <CardContent className="pt-6 space-y-4">
            <div className="space-y-2">
              <Label>Full Name</Label>
              {editingField === 'fullName' ? (
                <div className="flex gap-2">
                  <Input
                    value={tempValues.fullName}
                    onChange={(e) => setTempValues({ ...tempValues, fullName: e.target.value })}
                  />
                  <Button onClick={onSaveField} size="sm">Save</Button>
                  <Button onClick={() => setEditingField(null)} size="sm" variant="outline">Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.full_name || 'Not set'}</p>
                  <Button
                    onClick={() => {
                      setEditingField('fullName');
                      setTempValues({ ...tempValues, fullName: profile?.full_name || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Display Name</Label>
              {editingField === 'displayName' ? (
                <div className="flex gap-2">
                  <Input
                    value={tempValues.displayName}
                    onChange={(e) => setTempValues({ ...tempValues, displayName: e.target.value })}
                  />
                  <Button onClick={onSaveField} size="sm">Save</Button>
                  <Button onClick={() => setEditingField(null)} size="sm" variant="outline">Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.display_name || 'Not set'}</p>
                  <Button
                    onClick={() => {
                      setEditingField('displayName');
                      setTempValues({ ...tempValues, displayName: profile?.display_name || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Primary Sport</Label>
              {editingField === 'primarySport' ? (
                <div className="space-y-2">
                  <SportSelector
                    value={tempValues.primarySport}
                    onChange={(value) => setTempValues({ ...tempValues, primarySport: value })}
                  />
                  <div className="flex gap-2">
                    <Button onClick={onSaveField} size="sm">Save</Button>
                    <Button onClick={() => setEditingField(null)} size="sm" variant="outline">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.primary_sport || 'Not set'}</p>
                  <Button
                    onClick={() => {
                      setEditingField('primarySport');
                      setTempValues({ ...tempValues, primarySport: profile?.primary_sport || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Team/Club</Label>
              {editingField === 'teamName' ? (
                <div className="flex gap-2">
                  <Input
                    value={tempValues.teamName}
                    onChange={(e) => setTempValues({ ...tempValues, teamName: e.target.value })}
                  />
                  <Button onClick={onSaveField} size="sm">Save</Button>
                  <Button onClick={() => setEditingField(null)} size="sm" variant="outline">Cancel</Button>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <p className="text-sm">{profile?.team_name || 'Not set'}</p>
                  <Button
                    onClick={() => {
                      setEditingField('teamName');
                      setTempValues({ ...tempValues, teamName: profile?.team_name || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label>Bio</Label>
              {editingField === 'bio' ? (
                <div className="space-y-2">
                  <Textarea
                    value={tempValues.bio}
                    onChange={(e) => setTempValues({ ...tempValues, bio: e.target.value })}
                    rows={4}
                  />
                  <div className="flex gap-2">
                    <Button onClick={onSaveField} size="sm">Save</Button>
                    <Button onClick={() => setEditingField(null)} size="sm" variant="outline">Cancel</Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-sm">{profile?.bio || 'Not set'}</p>
                  <Button
                    onClick={() => {
                      setEditingField('bio');
                      setTempValues({ ...tempValues, bio: profile?.bio || '' });
                    }}
                    size="sm"
                    variant="ghost"
                  >
                    Edit
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  );
};
